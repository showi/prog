<?php
class wssubMother {
    private $log_on = true;
    private static $log_array = null;
    public function __construct() {
        if (self::$log_array == null) {
            self::$log_array = array();
        }
    }
    public function log($msg, $type = 'info') {
        if (!$this->log_on)
        return;
        array_push(self::$log_array, new wssubLogMessage($msg, get_class($this), $type));
    }
    public function get_log_array() {
        if (!$this->log_on)
        return;
        return self::$log_array;
    }
    public function log_flush() {
        self::$log_array = null;
    }
}