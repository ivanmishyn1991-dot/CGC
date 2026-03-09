<?php

date_default_timezone_set('America/Vancouver');
require __DIR__.'/../bootstrap/app.php';

Flight::route('/', ['App\Controllers\MainController', 'index']);

Flight::route('/cities/@city', ['App\Controllers\MainController', 'cityPage']);

Flight::route('/test', ['App\Controllers\MainController', 'test']);

Flight::route('POST /applications', ['App\Controllers\ApplicationController', 'create']);

Flight::route('POST /quick-quote', ['App\Controllers\ApplicationController', 'quickQuote']);

Flight::route('POST /upload/photos', ['App\Controllers\UploadController', 'upload']);
Flight::route('DELETE /upload/photos', ['App\Controllers\UploadController', 'delete']);

Flight::route('GET /admin/login', ['App\Controllers\Dashboard\AuthController', 'enter']);

Flight::route('POST /admin/login', ['App\Controllers\Dashboard\AuthController', 'login']);

Flight::route('GET /admin/pages/create', ['App\Controllers\Dashboard\PageController', 'create']);

Flight::route('GET /admin/applications/', ['App\Controllers\Dashboard\ApplicationController', 'index']);

Flight::route('GET /admin/applications/@id:[0-9]+', ['App\Controllers\Dashboard\ApplicationController', 'show']);

Flight::route('DELETE /admin/applications/@id:[0-9]+', ['App\Controllers\Dashboard\ApplicationController', 'delete']);

Flight::route('/*', ['App\Controllers\MainController', 'page'], true);

Flight::start();
