<?php

namespace App\Controllers;

use App\Core\CsrfProtection;
use App\Core\RateLimiter;
use App\Entities\Application;
use App\Services\TelegramSenderService;
use Flight as F;

class ApplicationController extends Controller
{
    private const UPLOAD_DIR = __DIR__ . '/../../public/uploads/photos/';

    public function create(): void
    {
        // Rate limiting: 5 requests per minute
        $rateCheck = RateLimiter::check('quote_form', 5, 60);
        if (!$rateCheck['allowed']) {
            F::response()->status(429);
            F::json([
                'success' => false, 
                'error' => 'Too many requests. Please wait ' . $rateCheck['retry_after'] . ' seconds.'
            ]);
            return;
        }
        
        $data = F::request()->data->getData();

        // CSRF validation
        $csrfToken = $data['csrf_token'] ?? '';
        if (!CsrfProtection::validateToken($csrfToken)) {
            F::response()->status(403);
            F::json(['success' => false, 'error' => 'Invalid security token. Please refresh the page and try again.']);
            return;
        }

        // Валидация обязательных полей
        $name = trim($data['name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $city = trim($data['city'] ?? '');
        
        if (empty($name) || empty($phone) || empty($city)) {
            F::response()->status(400);
            F::json(['success' => false, 'error' => 'Name, phone and city are required']);
            return;
        }
        
        // Проверка формата телефона
        $phoneDigits = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phoneDigits) < 10) {
            F::response()->status(400);
            F::json(['success' => false, 'error' => 'Invalid phone number']);
            return;
        }
        
        // Валидация email если указан
        $email = trim($data['email'] ?? '');
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            F::response()->status(400);
            F::json(['success' => false, 'error' => 'Invalid email format']);
            return;
        }

        // Получаем загруженные фото из JSON
        $uploadedPhotos = [];
        if (!empty($data['uploaded_photos'])) {
            $photosData = json_decode($data['uploaded_photos'], true);
            if (is_array($photosData)) {
                $uploadedPhotos = $photosData;
            }
        }

        $application = new Application();
        $application
            ->setName($name)
            ->setEmail($email)
            ->setPhone($phone)
            ->setCity($city)
            ->setMessage($data['message'] ?? '')
            ->setContactConsent($data['consent_contact_all'] ?? false);

        // Сохраняем список фото в заявке (если есть такое поле в Entity)
        if (!empty($uploadedPhotos) && method_exists($application, 'setImages')) {
            $application->setImages(json_encode($uploadedPhotos));
        }

        F::em()->persist($application);
        F::em()->flush();

        // Формируем сообщение для Telegram
        $message = $this->view
            ->assign('application', $application)
            ->render('applications/tg_notification.twig');

        $tg = new TelegramSenderService();
        $token = $_ENV['TG_TOKEN'] ?? '';
        $channel = $_ENV['TG_CHANNEL'] ?? '';

        // Отправляем текстовое сообщение
        $tg->send($channel, $message, $token);

        // Отправляем фотографии если есть
        if (!empty($uploadedPhotos)) {
            $photoPaths = [];
            foreach ($uploadedPhotos as $photo) {
                $photoPath = self::UPLOAD_DIR . basename($photo['name']);
                if (file_exists($photoPath)) {
                    $photoPaths[] = $photoPath;
                }
            }

            if (!empty($photoPaths)) {
                // Формируем caption для фото
                $photoCaption = "📷 <b>Фото к заявке #{$application->getId()}</b>\n";
                $photoCaption .= "👤 {$application->getName()}\n";
                $photoCaption .= "📍 {$application->getCity()}";

                // Отправляем фото (одно или группу)
                $tg->sendMediaGroup($channel, $photoPaths, $photoCaption, $token);
            }
        }

        F::json(['success' => true]);
    }

    /**
     * Quick Quote - заявка на обратный звонок
     */
    public function quickQuote(): void
    {
        // Rate limiting: 5 requests per minute
        $rateCheck = RateLimiter::check('quick_quote', 5, 60);
        if (!$rateCheck['allowed']) {
            F::response()->status(429);
            F::json([
                'success' => false,
                'error' => 'Too many requests. Please wait ' . $rateCheck['retry_after'] . ' seconds.'
            ]);
            return;
        }
        
        $data = F::request()->data->getData();
        
        // CSRF validation
        $csrfToken = $data['csrf_token'] ?? '';
        if (!CsrfProtection::validateToken($csrfToken)) {
            F::response()->status(403);
            F::json(['success' => false, 'error' => 'Invalid security token. Please refresh the page.']);
            return;
        }
        
        $phone = trim($data['phone'] ?? '');
        
        // Валидация телефона
        if (empty($phone)) {
            F::response()->status(400);
            F::json(['success' => false, 'error' => 'Phone is required']);
            return;
        }
        
        // Проверка формата телефона (минимум 10 цифр)
        $phoneDigits = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phoneDigits) < 10) {
            F::response()->status(400);
            F::json(['success' => false, 'error' => 'Invalid phone number']);
            return;
        }
        
        // Sanitize phone for display
        $phoneSafe = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
        
        // Формируем сообщение для Telegram с подписью "заявка на обратный звонок"
        $message = "📞 <b>Заявка на обратный звонок</b>\n\n";
        $message .= "📱 Телефон: <code>{$phoneSafe}</code>\n";
        $message .= "🕐 Время: " . date('d.m.Y H:i:s');
        
        $tg = new TelegramSenderService();
        $token = $_ENV['TG_TOKEN'] ?? '';
        $channel = $_ENV['TG_CHANNEL'] ?? '';
        
        // Отправляем в Telegram
        $tg->send($channel, $message, $token);
        
        F::json(['success' => true]);
    }
}
