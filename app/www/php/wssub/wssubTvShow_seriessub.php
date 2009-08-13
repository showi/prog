<?php

class wssubTvShow_seriessub extends wssubTvShow {
    public function __construct($parent) {
        parent::__construct($parent);
    }

    public function load() {
        if (!$this->get_href()) {
            $this->log("load() No href", 'error');
            return false;
        }
        $parent = $this->get_top_parent();
        $this->log("load() href: " . $this->get_href(), 'info');
        $doc = $parent->load($this->get_href());
        if (!$doc) {
            $this->log("load() Cannot load url " . $this->get_href(), 'error');
            return false;
        }
        $elmsTd = getElementsByClassName($doc, 'td', 'gst_fichier', false);
        if ($elmsTd->length < 1) {
            $this->log("load() Cannot found td element with gst_fichier class name", 'error');
            return false;
        }
        foreach($elmsTd as $td) {
            $elmsImg = $td->getElementsByTagName('img');
            if ($elmsImg->length < 1) {
                $this->log("load() Cannot found img element", 'error');
                continue;
            }
            if (!$elmsImg->item(0)->hasAttributes() || ($elmsImg->item(0)->getAttribute('alt') == 'puce')) {
                $this->log("load() puce element, zap", 'info');
                continue;
            }
            $elmsA = $td->getElementsByTagName('a');
            if ($elmsA->length < 1) {
                $this->log("load() Cannot found link to season", 'error');
                continue;
            }
            $href = $elmsA->item(0)->getAttribute('href');
            $num = strtolower(trim($elmsA->item(0)->textContent));
            if (preg_match("/^saison\s*(\d+)$/", $num, $matches)) {
                $num = $matches[1] + 0;
            }
            if (!$num || !$href) {
                   $this->log("load() No num or href", 'error');
            }
            $this->log("load() Found season $num ($href)", 'info');
            $season = new wssubSeason_seriessub($this);
            $season->set_num($num);
            $season->set_href($href);
            $season->load();
            $this->add_season($season);
        }

        return true;
        //
        //         if (!$season_num) {
        //                continue;
        //            }
        //            $season = new wssubSeason_tvsubtitles($this);
        //            $season->set_num($season_num);
        //            $season->load_content($doc, $subcontent);
        //            $this->add_season($season);
        //        }

    }
}
