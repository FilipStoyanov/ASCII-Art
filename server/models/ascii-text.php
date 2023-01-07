<?php
 class AsciiText {
    private $text;

    public function __construct($text) {
        $this->text = $text;
    }

    public function getText () {
        return $this->text;
    }
}
?>