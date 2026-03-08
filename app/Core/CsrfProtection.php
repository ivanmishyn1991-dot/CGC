<?php

namespace App\Core;

/**
 * Simple CSRF Protection
 * Generates and validates CSRF tokens stored in cookies
 */
class CsrfProtection
{
    private const TOKEN_NAME = 'csrf_token';
    private const COOKIE_NAME = 'csrf_cookie';
    private const TOKEN_LENGTH = 32;
    private const TOKEN_LIFETIME = 3600; // 1 hour
    
    /**
     * Generate a new CSRF token
     */
    public static function generateToken(): string
    {
        $token = bin2hex(random_bytes(self::TOKEN_LENGTH));
        
        // Store in cookie (httponly for security)
        setcookie(
            self::COOKIE_NAME,
            $token,
            [
                'expires' => time() + self::TOKEN_LIFETIME,
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Strict'
            ]
        );
        
        return $token;
    }
    
    /**
     * Get current token or generate new one
     */
    public static function getToken(): string
    {
        if (isset($_COOKIE[self::COOKIE_NAME]) && !empty($_COOKIE[self::COOKIE_NAME])) {
            return $_COOKIE[self::COOKIE_NAME];
        }
        
        return self::generateToken();
    }
    
    /**
     * Validate CSRF token from request
     */
    public static function validateToken(?string $requestToken): bool
    {
        if (empty($requestToken)) {
            return false;
        }
        
        $cookieToken = $_COOKIE[self::COOKIE_NAME] ?? '';
        
        if (empty($cookieToken)) {
            return false;
        }
        
        // Use hash_equals to prevent timing attacks
        return hash_equals($cookieToken, $requestToken);
    }
    
    /**
     * Get HTML hidden input field
     */
    public static function getHiddenInput(): string
    {
        $token = self::getToken();
        return '<input type="hidden" name="' . self::TOKEN_NAME . '" value="' . htmlspecialchars($token) . '">';
    }
    
    /**
     * Get token name for forms
     */
    public static function getTokenName(): string
    {
        return self::TOKEN_NAME;
    }
}
