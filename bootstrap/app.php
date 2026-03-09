<?php

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\ORMSetup;

require_once __DIR__."/../vendor/autoload.php";

$env = new Symfony\Component\Dotenv\Dotenv;
$env->load(__DIR__ . "/../.env");

$config = ORMSetup::createAttributeMetadataConfiguration(
    paths: [__DIR__ . '/../app/Entities'],
    isDevMode: false,
);

$connection = DriverManager::getConnection([
    'driver' => $_ENV['DB_CONNECTION'],
    'dbname' => $_ENV['DB_DATABASE'],
    'user' => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'host' => $_ENV['DB_HOST'],
    'charset' => 'utf8mb4',
]);

Flight::register('em', 'Doctrine\ORM\EntityManager', [$connection, $config]);

$em = Flight::em();