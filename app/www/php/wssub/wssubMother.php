<?php
class wssubMother {
    private $parent = null;
    private $log_on = true;
    private static $log_array = null;
    
    public function __construct($parent) {
        $this->set_parent($parent);
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
    
    public function get_parent() {
        return $this->parent;
    }
    public function set_parent($parent) {
        $this->parent = $parent;
    }
    
    public function get_top_parent() {
        $o = $this;
        while($o->parent) {
            $o = $o->parent;
        }
        return $o;
    }
}