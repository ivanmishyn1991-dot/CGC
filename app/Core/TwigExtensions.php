<?php

namespace App\Core;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class TwigExtensions extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_work_photos', [$this, 'getWorkPhotos']),
            new TwigFunction('csrf_token', [$this, 'getCsrfToken']),
            new TwigFunction('csrf_field', [$this, 'getCsrfField'], ['is_safe' => ['html']]),
        ];
    }
    
    /**
     * Get CSRF token value
     */
    public function getCsrfToken(): string
    {
        return CsrfProtection::getToken();
    }
    
    /**
     * Get CSRF hidden input field HTML
     */
    public function getCsrfField(): string
    {
        return CsrfProtection::getHiddenInput();
    }

    /**
     * Get work photos from /public/assets/images/work-photos/ folder
     * Returns array of photo URLs, or fallback stock photos if folder is empty
     */
    public function getWorkPhotos(int $limit = 4): array
    {
        $photosDir = __DIR__ . '/../../public/assets/images/work-photos/';
        $webPath = '/assets/images/work-photos/';
        $photos = [];
        
        // Allowed extensions
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        if (is_dir($photosDir)) {
            $files = scandir($photosDir);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($ext, $allowedExtensions)) {
                    $photos[] = [
                        'url' => $webPath . $file,
                        'alt' => pathinfo($file, PATHINFO_FILENAME)
                    ];
                }
                
                if (count($photos) >= $limit) break;
            }
        }
        
        // If no local photos, return stock fallback
        if (empty($photos)) {
            return [
                ['url' => 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=600&q=80', 'alt' => 'Gutter cleaning before'],
                ['url' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', 'alt' => 'Gutter cleaning after'],
                ['url' => 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 'alt' => 'Pressure washing before'],
                ['url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', 'alt' => 'Pressure washing after'],
            ];
        }
        
        return $photos;
    }
}
