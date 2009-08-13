<?php

class wssubEpisode_seriessub extends wssubEpisode {

    public function __construct($parent) {
        parent::__construct($parent);
    }

    public function extract_lang($name) {
        if (!$name) {
            $this->log("extract_lang() no name", 'error');
            return null;
        }
        if (preg_match("/^.*\.(vo|vf)\.(zip|rar)$/i", $name, $matches)) {
            return strtolower(trim($matches[1]));
        }
        return null;
    }
    public function extract_num($name) {
        if (!$name) {
            $this->log("extract_num() no name", 'error');
            return null;
        }
        if (preg_match("/^[^.]+\.(\d{3})\..*$/i", $name, $matches)) {
            return strtolower(trim($matches[1]));
        }
        return null;
    }

    public function load_content($name, $href) {
        if (!$name || !$href) {
            $this->log("load_content() no name or href", 'error');
            return false;
        }
        $parent = $this->get_top_parent();
        $lang = $this->extract_lang($name);
        if (!$lang)  {
            $this->log("Cannot extract lang from $name", 'error');
        } else {
            $this->log("lang: $lang", 'info');
        }
        $num = null;
        if (preg_match("/^[^\.]+\.s\d+.*$/i", $name)) {
            $this->log("All ep: $name ($href)", 'info');
            $num = -1;
        } else {
            $num = $this->extract_num($name);
            if (!$num)  {
                $this->log("Cannot extract num from $name", 'error');
                $num = -2;
            } else {
                $this->log("num: $num", 'info');
            }
            $this->log("$name ($href)", 'info');
        }
        $this->set_num($num);
        $this->set_url($href);
        $this->set_title($name);
        return true;
    }
}