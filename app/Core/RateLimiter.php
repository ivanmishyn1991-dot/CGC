<?php

namespace App\Core;

/**
 * Simple file-based Rate Limiter
 * Limits requests per IP address
 */
class RateLimiter
{
    private const CACHE_DIR = __DIR__ . '/../../storage/rate_limit/';
    private const DEFAULT_LIMIT = 5;      // requests
    private const DEFAULT_WINDOW = 60;    // seconds
    
    /**
     * Check if request is allowed
     * 
     * @param string $action Action identifier (e.g., 'quote', 'upload')
     * @param int $limit Max requests allowed
     * @param int $window Time window in seconds
     * @return array ['allowed' => bool, 'remaining' => int, 'reset' => int]
     */
    public static function check(
        string $action = 'default',
        int $limit = self::DEFAULT_LIMIT,
        int $window = self::DEFAULT_WINDOW
    ): array {
        $ip = self::getClientIp();
        $key = md5($ip . '_' . $action);
        $file = self::CACHE_DIR . $key . '.json';
        
        // Ensure cache directory exists
        if (!is_dir(self::CACHE_DIR)) {
            mkdir(self::CACHE_DIR, 0755, true);
        }
        
        $now = time();
        $data = ['requests' => [], 'first_request' => $now];
        
        // Read existing data
        if (file_exists($file)) {
            $content = file_get_contents($file);
            $data = json_decode($content, true) ?: $data;
        }
        
        // Clean old requests outside window
        $data['requests'] = array_filter($data['requests'], function($timestamp) use ($now, $window) {
            return ($now - $timestamp) < $window;
        });
        
        // Reset first_request if all requests expired
        if (empty($data['requests'])) {
            $data['first_request'] = $now;
        }
        
        $requestCount = count($data['requests']);
        $remaining = max(0, $limit - $requestCount);
        $resetTime = ($data['first_request'] ?? $now) + $window;
        
        // Check if limit exceeded
        if ($requestCount >= $limit) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset' => $resetTime,
                'retry_after' => $resetTime - $now
            ];
        }
        
        // Add current request
        $data['requests'][] = $now;
        
        // Save data
        file_put_contents($file, json_encode($data), LOCK_EX);
        
        return [
            'allowed' => true,
            'remaining' => $remaining - 1,
            'reset' => $resetTime,
            'retry_after' => 0
        ];
    }
    
    /**
     * Quick check - returns true if allowed, false if blocked
     */
    public static function isAllowed(
        string $action = 'default',
        int $limit = self::DEFAULT_LIMIT,
        int $window = self::DEFAULT_WINDOW
    ): bool {
        return self::check($action, $limit, $window)['allowed'];
    }
    
    /**
     * Get client IP address
     */
    private static function getClientIp(): string
    {
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Proxy
            'HTTP_X_REAL_IP',            // Nginx
            'REMOTE_ADDR'                // Default
        ];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                // Handle comma-separated list (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return '0.0.0.0';
    }
    
    /**
     * Clean up old rate limit files (run periodically)
     */
    public static function cleanup(int $maxAge = 3600): void
    {
        if (!is_dir(self::CACHE_DIR)) return;
        
        $files = glob(self::CACHE_DIR . '*.json');
        $now = time();
        
        foreach ($files as $file) {
            if (($now - filemtime($file)) > $maxAge) {
                @unlink($file);
            }
        }
    }
}
