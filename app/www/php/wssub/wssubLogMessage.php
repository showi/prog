<?php
class wssubLogMessage {
    public $msg;
    public $type;
    public $class;
    public function __construct($msg, $class, $type = 'info') {
        $this->set_msg($msg);
        $this->set_type($type);
        $this->set_class($class);
    }
    public function set_msg($value) {
        $this->msg = $value;
    }
    public function get_msg() {
        return $this->msg;
    }
    public function set_class($value) {
        $this->class = $value;
    }
    public function get_class() {
        return $this->class;
    }
    public function set_type($value) {
        $this->type = $value;
    }
    public function get_type() {
        return $this->type;
    }
    public function to_html($parent) {
        $w = new XMLWriter();
        $w->openMemory();
        $w->startElement('div');
        $w->writeAttribute('class', 'log_message');
        $w->startElement('div');
        $w->writeAttribute('class', 'log_message_' . $this->type);
        $w->writeRaw('<div class="log_class">' . $this->class . '</div>::<div class="log_msg">' . $this->msg . '</div>');
        $w->endElement();
        $w->endElement();
        return $w->flush();
    }
}