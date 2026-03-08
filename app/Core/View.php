<?php

namespace App\Core;

use Twig\Environment as Twig;
use Twig\Loader\FilesystemLoader;

class View
{
    private array $variables = [];

    private Twig $twig;

    public function __construct()
    {
        $loader = new FilesystemLoader(__DIR__.'/../../resources/templates');
        $this->twig = new Twig($loader, []);
        
        // Register custom extensions
        $this->twig->addExtension(new TwigExtensions());
    }

    public function assign(string $key, $value) : View
    {
        $this->variables[$key] = $value;
        return $this;
    }

    public function render(string $view, array $params = []) : string
    {
        if (!empty($this->variables)) {
            $params = array_merge($this->variables, $params);
        }

        try {
            return $this->twig->render($view, $params);
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
    }

    public function display(string $view, array $params = []) : void
    {
        echo $this->render($view, $params);
    }
}
