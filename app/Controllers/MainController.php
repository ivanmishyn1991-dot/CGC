<?php

namespace App\Controllers;

class MainController extends Controller
{
    public function index() : void
    {
        $this->view->display('landing/main.html.twig');
    }

    public function quotePage() : void
    {
        $this->view->display('landing/quote.html.twig');
    }

    public function page($route) : bool
    {
        $file = current(explode('?', $route->splat, 2));
        $template = "landing/$file.html.twig";
        $templateDir = __DIR__."/../../resources/templates/";
        if (file_exists($templateDir.$template)) {
            $this->view->display($template);
            return false;
        }
        return true;
    }

    public function cityPage($city) : bool
    {
        $cities = [

        ];

        if (in_array($city, $cities)) {
            $this->view->display("landing/{$city}.html.twig");
            return false;
        } else {
            return true;
        }
    }
}
