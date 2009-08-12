<?php

class wssubSeason_tvsubtitles extends wssubSeason {

    public function __construct($parent) {
        parent::__construct($parent);
    }
    
    public function load_content($doc, $content) {
        $parent = $this->get_top_parent();
        $this->log("load_content() Searching content for season number " .$this->get_num());
        $this->log("load_content() content: " . $content->textContent);
        $table = $doc->getElementById('table5');
        if (!isset($table)) {
            $this->log("load_content() No table with id 'table5'", 'error');
            return false;
        }
       // $tbody = $table->getElementsByTagName('tbody');
        $trElms = $table->getElementsByTagName('tr');
        if (!isset($trElms)) {
            $this->log("load_content() No tr element in table5'", 'error');
            return false;
        }
        foreach($trElms as $tr) {
            if (!$tr->hasAttribute('bgcolor') && !$tr->hasAttribute('align')) {
                continue;
            }
            $this->log("Found Episode", 'info');
            $ep = new wssubEpisode_tvsubtitles($this);
            $ep->load_content($doc, $tr);
            if ($ep->get_num()) {
                $this->add_episode($ep);
            }
        }
        return true;
    }
}