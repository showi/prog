<?php

class wssubEpisode_tvsubtitles extends wssubEpisode {

    public function __construct($parent) {
        parent::__construct($parent);
    }

    public function set_num($value) {
        $num = $value;
        if (preg_match("/^\s*(\d+)\s*x\s*(\d+).*$/", $value, $matches)) {
            $num = $matches[2];
        }
        parent::set_num($num + 0);
    }
    
    public function set_title($value) {
        parent::set_title(strtolower($value));
    }
    
    public function load() {
        if (!$this->get_url())  {
          $this->log("load() No url to load episode info", 'error');
          return false;
        }
        $parent = $this->get_top_parent();
        $url = $parent->get_prefix_url() . $this->get_url();
        $doc = $parent->load($url);
        if (!isset($doc)) {
            $this->log("load() Cannot load url $url", 'error');
            return false;
        }
        $subsElm = $doc->getElementsByTagName('a');
        if (!isset($subsElm)) {
         $this->log("load() No subtitle link", 'error');
         return false;
        }
        foreach($subsElm as $a) {
            if (!$a->hasAttribute('class') || $a->getAttribute('class') != 'subtitle') {
                //$this->log('buh', 'buh');
                continue;
            }
            $sub = new wssubSubtitle_tvsubtitles($this);
            $sub->set_url($a->getAttribute('href'));
            if ($sub->load()) {
                $this->add_sub($sub);
            }
        }
        
        return true;
    }
    public function load_content($doc, $content) {
        $parent = $this->get_top_parent();
        $this->log("load_content() Searching content for episode" .$this->get_num());
        $this->log("load_content() content: " . $content->textContent);
        $inf = array("num", "name", "totalsub", "listsub");
        $i = 0;
        $url = null;
        foreach($content->childNodes as $c) {
            if (!isset($c)) {
                break;
            }
            if (!isset($c->tagName) || $c->tagName != 'td') {
                continue;
            }
            switch($i) {
                case 0:
                    $this->log("load_content() " . $inf[$i] . " " . $c->nodeValue, 'error');
                    if (!$c->textContent) {
                        return false;
                    }
                    $this->set_num($c->textContent);
                    break;
                case 1:
                    $this->log("load_content() " . $inf[$i] . " " . $c->nodeValue, 'error');
                    foreach($c->childNodes as $tc) {
                        if (!isset($tc->tagName) || ($tc->tagName != 'a')) {
                            continue;
                        }
                        $this->set_url($tc->getAttribute('href'));
                    }
                    $this->set_title($c->textContent);
                    break;
                case 2:
                    $this->log("load_content() " . $inf[$i] . " " . $c->nodeValue, 'error');
                    break;
                case 3:
                    $this->log("load_content() " . $inf[$i] . " " . $c->nodeValue, 'error');
                    break;
                default:
                    $this->log("load_content() unknow  " .$c->tagName . '-' . $c->textContent, 'error');
                    break;
            }
            $i++;
        }
        $this->load();
        return true;
    }
}