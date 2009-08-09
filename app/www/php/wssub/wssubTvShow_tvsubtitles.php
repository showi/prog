<?php

class wssubTvShow_tvsubtitles extends wssubTvShow{
    public function __construct($parent) {
        parent::__construct($parent);
    }

    protected function parse_seasons($elm) {
        if (!$elm) {
            $this->log("parse_seasons() No element", 'error');
            return null;
        }
        $a_font = $elm->getElementsByTagName('font');
        $season = $a_font->item(0);
        if (!$season) {
            $this->log("parse_seasons() Do not found active season", 'error');
            return null;
        }
        $matches = null;
        if (!preg_match("/^\s*Season\s*(\d+)\s*$/i", $season->textContent, $matches)) {
            $this->log("parse_seasons() No matching season", 'error');
            return null;
        }
        return $matches[1];
    }

    public function load() {
        $parent = $this->get_top_parent();
        $show_id = $this->get_id();
        $this->log("load: Top parent name: " . $parent->get_name(), 'info');
        $this->log("load: Loading show id: " . $this->get_id(), 'info');
        $a_se = array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        if ($parent->get_request()->get('season')) {
            $a_se = array($parent->get_request()->get('season'));
        }
        foreach($a_se as $season_id) {
            $url =  "http://www.tvsubtitles.net/tvshow-$show_id-$season_id.html";
            $this->log("load: Search for season: $show_id - $season_id ($url)", 'info');
            $doc = $parent->load($url);
            if (!$doc) {
                $this->log("load() Cannot load url $url", 'error');
                continue;
            }
            $body = getElementsByClassName($doc, 'div', 'left_articles', true);
            //$body = $doc->getElementsByTagName('left_articles');
            if ($body->length == 0) {
                $this->log("load() No left_articles in document", 'error');
                continue;
            }
            //$this->log("load() left_articles: " . $body->item(0)->textContent, 'info');
            $body = $body->item(0)->childNodes->item(0);
            $subcontent = null;
            $season_num = null;
            foreach($body->childNodes as $elm) {
                if (!isset($elm->tagName)) {
                    continue;
                }
                switch($elm->tagName) {
                    case 'h2':
                        $this->log("Title: " . $elm->textContent, 'parse');
                        $this->set_name($elm->textContent);
                        break;
                    case 'p':
                        $season_num = $this->parse_seasons($elm);
                        $this->log("Seasons list,  active one, $season_num", 'parse');
                        break;
                    case 'table':
                        $this->log("sous contenu: " . $elm->textContent, 'parse');
                        $subcontent = $elm;
                        break;
                    case 'img':
                        if ($elm->hasAttribute('class') && ($elm->getAttribute('class') == 'thumbnail1')){
                            $this->log("cover: " . $elm->getAttribute('src'), 'parse');
                            $this->set_img($elm->getAttribute('src'));
                        }
                        break;
                    default:
                        $this->log("Unknow elm: " . $elm->textContent, 'parse');
                        break;

                }
            }
            if (!$season_num) {
                continue;
            }
            $season = new wssubSeason_tvsubtitles($this);
            $season->set_num($season_num);
            $season->load_content($subcontent);
            $this->add_season($season);
        }

    }
}
