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

    public function areasPage() : void
    {
        $this->view->display('landing/areas.html.twig');
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
            'vancouver',
            'burnaby',
            'surrey',
            'richmond',
            'coquitlam',
            'langley',
            'delta',
            'new_westminster',
            'north_vancouver',
            'west_vancouver',
            'maple_ridge',
            'pitt_meadows',
            'port_coquitlam',
            'port_moody',
            'white_rock',
            'tsawwassen',
            'ladner'
        ];

        if (in_array($city, $cities)) {
            $this->view->display("landing/cities/{$city}.html.twig");
            return false;
        } else {
            return true;
        }
    }
}
