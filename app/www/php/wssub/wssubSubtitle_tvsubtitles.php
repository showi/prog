<?php

class wssubSubtitle_tvsubtitles extends wssubSubtitle {
    public function __construct($parent) {
        parent::__construct($parent);
    }
    
    public function load() {
        $parent = $this->get_top_parent();
        if (!$this->get_url()) {
            $this->log("load() no url", 'error');
            return false;
        }
        $doc = $parent->load($parent->get_prefix_url() . $this->get_url());
        if (!isset($doc)) {
            $this->log("load() Cannot load url '$url'", 'error');
            return false;
        }
        $left = getElementsByClassName($doc, 'div', 'left_articles', true);
        if ($left->length < 1) {
           $this->log("load() No left_articles", 'error');
            return false;
        }
        $rootElm = $left->item(0)->firstChild;
        foreach($rootElm->childNodes as $c) {
            if ($c->nodeType == 3) { // text node
                continue;
            }
            $this->log("load()" . $c->tagName . ' - ' .$c->textContent , 'info');
            if ($c->tagName == 'p' && $c->getAttribute('class') == 'description') {
                $this->log("load() description: " . $c->textContent , 'error');
                foreach($c->childNodes as $dc) {
                    if (!$dc || !isset($dc->tagType)) {
                        continue;
                    }
                    if ($dc->tagType == 3 || $dc->tagName != "img") {
                        continue;
                    }
                    $lang = get_mini_lang($dc->getAttribute('alt'));
                    $this->log("load() lang: " . $lang , 'parse');
                }
            }
        }
        return true;
    }
}