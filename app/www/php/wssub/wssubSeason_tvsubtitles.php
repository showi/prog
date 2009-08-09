<?php

class wssubSeason_tvsubtitles extends wssubSeason {

    public function __construct($parent) {
        parent::__construct($parent);
    }
    
    public function load_content($content) {
        $parent = $this->get_top_parent();
        $this->log("load_content() Searching content for season number " .$this->get_num());
        $this->log("load_content() content: " . $content->textContent);
    }
}