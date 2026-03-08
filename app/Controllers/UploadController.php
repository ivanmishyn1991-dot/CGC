<?php

namespace App\Controllers;

use App\Core\RateLimiter;
use Flight as F;

class UploadController extends Controller
{
    // Директория для загрузки файлов
    private const UPLOAD_DIR = __DIR__ . '/../../public/uploads/photos/';
    
    // Разрешенные типы файлов
    private const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    
    // Максимальный размер файла (10MB)
    private const MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    // Максимальное количество файлов за раз
    private const MAX_FILES = 10;

    /**
     * Загрузка нескольких файлов через AJAX
     */
    public function upload(): void
    {
        // Rate limiting: 20 uploads per minute
        $rateCheck = RateLimiter::check('upload', 20, 60);
        if (!$rateCheck['allowed']) {
            $this->jsonError('Too many uploads. Please wait.', 429);
            return;
        }
        
        // Проверяем метод
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonError('Method not allowed', 405);
            return;
        }

        // Проверяем наличие файлов
        if (empty($_FILES['photos'])) {
            $this->jsonError('No files uploaded', 400);
            return;
        }

        // Создаем директорию если не существует
        if (!is_dir(self::UPLOAD_DIR)) {
            mkdir(self::UPLOAD_DIR, 0755, true);
        }

        $files = $_FILES['photos'];
        $uploadedFiles = [];
        $errors = [];

        // Нормализуем массив файлов (PHP отдает их в странном формате при multiple)
        $fileCount = is_array($files['name']) ? count($files['name']) : 1;
        
        // Проверка на максимальное количество файлов
        if ($fileCount > self::MAX_FILES) {
            $this->jsonError('Too many files. Maximum ' . self::MAX_FILES . ' allowed', 400);
            return;
        }

        for ($i = 0; $i < $fileCount; $i++) {
            $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
            $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];
            $size = is_array($files['size']) ? $files['size'][$i] : $files['size'];
            $type = is_array($files['type']) ? $files['type'][$i] : $files['type'];

            // Пропускаем пустые слоты
            if (empty($name) || $error === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            // Проверка на ошибки загрузки
            if ($error !== UPLOAD_ERR_OK) {
                $errors[] = "Error uploading file: {$name}";
                continue;
            }

            // Проверка размера
            if ($size > self::MAX_FILE_SIZE) {
                $errors[] = "File too large: {$name} (max 10MB)";
                continue;
            }

            // Проверка типа файла
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $tmpName);
            finfo_close($finfo);

            if (!in_array($mimeType, self::ALLOWED_TYPES)) {
                $errors[] = "Invalid file type: {$name}. Only JPG, PNG, WebP allowed";
                continue;
            }

            // Генерируем уникальное имя файла
            $extension = $this->getExtension($mimeType);
            $newFileName = $this->generateFileName($extension);
            $targetPath = self::UPLOAD_DIR . $newFileName;

            // Перемещаем файл
            if (move_uploaded_file($tmpName, $targetPath)) {
                $uploadedFiles[] = [
                    'name' => $newFileName,
                    'originalName' => $name,
                    'url' => '/uploads/photos/' . $newFileName,
                    'size' => $size
                ];
            } else {
                $errors[] = "Failed to save file: {$name}";
            }
        }

        // Возвращаем результат
        F::json([
            'success' => count($uploadedFiles) > 0,
            'uploaded' => $uploadedFiles,
            'errors' => $errors,
            'count' => count($uploadedFiles)
        ]);
    }

    /**
     * Удаление файла
     */
    public function delete(): void
    {
        $data = F::request()->data->getData();
        $fileName = $data['filename'] ?? '';

        if (empty($fileName)) {
            $this->jsonError('Filename required', 400);
            return;
        }

        // Безопасность: только имя файла, без путей
        $fileName = basename($fileName);
        $filePath = self::UPLOAD_DIR . $fileName;

        if (file_exists($filePath) && is_file($filePath)) {
            if (unlink($filePath)) {
                F::json(['success' => true, 'message' => 'File deleted']);
            } else {
                $this->jsonError('Failed to delete file', 500);
            }
        } else {
            $this->jsonError('File not found', 404);
        }
    }

    /**
     * Генерация уникального имени файла
     */
    private function generateFileName(string $extension): string
    {
        $date = date('Ymd');
        $unique = bin2hex(random_bytes(8));
        return "photo_{$date}_{$unique}.{$extension}";
    }

    /**
     * Получение расширения по MIME типу
     */
    private function getExtension(string $mimeType): string
    {
        return match($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/heic', 'image/heif' => 'heic',
            default => 'jpg'
        };
    }

    /**
     * Отправка JSON ошибки
     */
    private function jsonError(string $message, int $code = 400): void
    {
        F::response()->status($code);
        F::json(['success' => false, 'error' => $message]);
    }
}
