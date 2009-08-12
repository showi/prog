<?php

class wssubCacheURL {
    private $hash;
    private $url;
    private $update_on;

    public function __construct( $url) {
        $this->hash      = null;
        $this->url       = null;
        $this->update_on = null;
        if (isset($url)) {
            $this->set_url($url);
        }
    }

    public function get_hash() {
        return $this->hash;
    }
    protected function set_hash($value) {
        $this->hash = $value;
    }

    public function get_url() {
        return $this->url;
    }
    protected function set_url($value) {
        $this->url = $value;
        $this->hash = hash('md5', $value);
        $this->update_on = time();
    }

    public function get_update_on() {
        return $this->update_on;
    }
    protected function set_update_on($value) {
        $this->update_on = $value;
    }

    public function to_string() {
        return  "wssubCacheURL: (" . $this->hash . ") " . $this->url . "\n";
    }
    public function to_htm() {
        return '<div class="wssubCacheURL">' . $str . "<div>";
    }
}

class wssubCache extends wssubMother{
    protected static $path = null;
    protected static $cache = null;

    public function __construct($parent) {
        parent::__construct($parent);
        if (!isset(self::$cache)) {
            self::$cache = array();
        }
        self::$path = "/tmp/wssub";
    }
    public function cache_path_exists(){
        if (!self::$path) {
            return false;
        }
        if (!file_exists(self::$path)) {
            return false;
        }
        if (!is_writable(self::$path)) {
            return false;
        }
        return true;
    }
    public function cache_path_from_url($url) {
        if (!$url) {
            $this->log("cache_path_from_url() No url", 'error');
            return false;
        }
        return  self::$path . "/" . $url->get_hash() . ".wsc";
    }

    public function exists($url) {
        if (!$url) {
            $this->log("exists: no url", 'error');
            return false;
        }
        $file = $this->cache_path_from_url($url);
        if (!file_exists($file)) {
            $this->log("exists() File not in cache: $file", 'info');
            return false;
        }
        //$this->log("exists() File in cache: $file", 'info');
        return true;
    }

    public function is_cacheable($url) {
        if (!$url) {
            $this->log("is cacheable() no url", 'error');
            return false;
        }
//        if (preg_match('/[?=]/', $url->get_url())) { // Don't cache query with paramater
//            $this->log("is_cacheable: url with query paramater " . $url->get_url(), 'warn');
//            return false;
//        }

        
        $this->log("is_cacheable() !!!!!!!!!!!!!!!!!!!!!!!!!!! ALWAYS TRUE", 'warn');
        return true;
        if(!preg_match('/^http:\/\/www\.tvsubtitles\.net\/[\d\w\.-]+$/', $url->get_url())) {
            $this->log("is_cacheable() invalid url " . $url->get_url(), 'warn');
            return false;
        }
        return true;
    }

    protected function add_cache($url) {
        if (!$this->cache_path_exists()) {
            $this->log("add_cache() Invalid cache directory or not set", 'error');
            return false;
        }
        ini_set('user_agent', "PHP\r\nX-MyCustomHeader: Foo");
        //ini_set('referer: http://');
        $file = $this->cache_path_from_url($url);
        if (!$file) {
            $this->log("add_cache() no file cache", 'error');
            return false;
        }
        $wp = fopen($file, 'wb');
        if (!$wp) {
            $this->log("add_cache() Cannot open file " . $file, 'error');
            return false;
        }
        $fp = fopen($url->get_url(), 'rb');
        if (!$fp) {
            $this->log("add_cache() Cannot open url: " . $url->get_url(), 'error');
            fclose($wp);
            return false;
        }
        $this->log("add_cache() Copying url: " . $url->get_url() . " to $file", 'error');
        $buffer = null;
        while (!feof($fp)) {
            //$buffer .= fgets($socket, 4096);
            fwrite($wp, fgets($fp, 4096), 4096);
        }
        fclose($fp);
        fclose($wp);
        return true;
    }

    public function get_cache_url($url) {
     if (!$url) {
            $this->log("get_cache_url() no url to the cache!", 'error');
            return null;
        }
        if (!($url instanceof wssubCacheUrl)) {
            $url = new wssubCacheUrl($url);
        }
        if (!$this->exists($url)) {
            $this->log("get_cache_url() url not in cache " . $url->get_url(), 'error');
            return null;
        }
        return $this->cache_path_from_url($url);
    }
    
    public function get($url) {
        if (!$url) {
            $this->log("get() no url to the cache!", 'error');
            return null;
        }
        if (!($url instanceof wssubCacheUrl)) {
            $url = new wssubCacheUrl($url);
        }
        if ($this->exists($url)) {
            $this->log("get() Url " . $url->get_url() . " already cached", 'warn');
            return null;
        }
        $file = $this->cache_path_from_url($url);
        if (!$file) {
            $this->log("add_cache() no file cache", 'error');
            return null;
        }
        $fp = fopen($file, 'rb');
        if (!$fp) {
            $this->log("get() Cannot open file $file", 'error');
            return null;
        }
        $buffer = null;
        while (!feof($fp)) {
            $buffer = fgets($fp, 4096);
        }
        fclose($fp);
        return $buffer;
    }
    
    public function add($url) {
        if (!$url) {
            $this->log("add() no url to the cache!", 'error');
            return false;
        }
        if (!($url instanceof wssubCacheUrl)) {
            $url = new wssubCacheUrl($url);
        }
        if (!$this->is_cacheable($url)) {
            $this->log("add() Url " . $url->get_url() . " is not cacheable", 'warn');
            return false;
        }
        if ($this->exists($url)) {
            $this->log("add() Url " . $url->get_url() . " already cached", 'warn');
            return false;
        }
        return $this->add_cache($url);
    }


}