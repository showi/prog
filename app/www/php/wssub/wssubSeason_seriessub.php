<?php

class wssubSeason_seriessub extends wssubSeason {

    public function __construct($parent) {
        parent::__construct($parent);
    }

    public function load() {
        if (!$this->get_href()) {
            $this->log("load() No href", 'error');
            return false;
        }
        $parent = $this->get_top_parent();
        $this->log("load() Parsing season " . $this->get_num() . " (" . $this->get_href() . ")", 'error');
        $doc = $parent->load($this->get_href());
        if (!$doc) {
            $this->log("load() Cannot load url " . $this->get_href(), 'error');
            return false;
        }
        $elmsTd = getElementsByClassName($doc, 'td', 'gst_fichier');
        if ($elmsTd->length < 1) {
            $this->log("load() No elements td with classname gst_fichier", 'error');
            return false;
        }
        foreach($elmsTd as $td) {
            $elmsImg = $td->getElementsByTagName('img');
            if ($elmsImg->length < 1) {
                $this->log("load() No img element", 'error');
                continue;
            }
            $src = $elmsImg->item(0)->getAttribute('src');
            if (!$src) {
                $this->log("load() Img without src", 'error');
                continue;
            }
            //$this->log("src: " .$src);
            if (preg_match("/^.*rep\.png$/i", $src)) {
                $this->log("load() Foler zap", 'info');
                continue;
            }
            $elmsA = $td->getElementsByTagName('a');
            if ($elmsA->length < 1) {
                $this->log("load() Img without src", 'error');
                continue;
            }
            $name = $elmsA->item(0)->textContent;
            $href = $elmsA->item(0)->getAttribute('href');
            if (!$name || !$href) {
                $this->log("load() No name or href", 'error');
                continue;
            }
            $episode = new wssubEpisode_seriessub($this);
            $episode->load_content($name, $href);
            $this->add_episode($episode);
        }
        return true;
    }

}