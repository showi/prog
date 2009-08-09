<?php
/**
 * @author sho
 *
 */

class wssubSite_tvsubtitles extends wssubSite {

    public function __construct($parent) {
        parent::__construct($parent);
        $this->set_prefix_url("http://www.tvsubtitles.net/");
        $this->set_search_url("http://www.tvsubtitles.net/search.php?q=%search%");
        $this->set_search_id_url("http://www.tvsubtitles.net/tvshow-%id%.html");
        $this->set_download_id_url("http://www.tvsubtitles.net/download-%id%.html");
        $this->set_name("tvsubtitles.net");
        $this->set_url("http://www.tvsubtitles.net/");
    }

    protected function dom_get_main($doc) {
        if (!$doc) {
            $this->log("dom_get_main() no doc", "error");
            return null;
        }
        $content = $doc->getElementById("content");
        if (!$content) {
            $this->log("dom_get_main() no content id", "error");
            return null;
        }
        $list = $doc->getElementsByTagName("div");
        if (!$list) {
            $this->log("dom_get_main() no content id", "error");
            return null;
        }
        for($i = 0; $i < $list->length; $i++) {
            $item = $list->item($i);
            if (is_null($item)) {
                $this->log("dom_get_main() no item", "error");
                continue;
            }
            if (!$item->hasAttributes()) {
                continue;
            }
            foreach ($item->attributes as $attrName => $attrNode) {
                if ($attrName != "class") {
                    continue;
                }
                if ($attrNode->textContent == 'left_articles') {
                    $this->log("dom_get_main() dom element left_articles found.", "parse");
                    return $item;
                }
            }
        }
        return null;
    }

    /**
     *
     */
    public function load_id($id) {
        if (!$id) {
            exit("no id!");
            return null;
        }
        $url = $this->get_search_url($name);
        if (!$url) {
            return null;
        }

    }

    public function build_data_store($root_node) {
        foreach($root_node->getElementsByTagName("li") as $tagLi) {
            if (is_null($tagLi)) {
                continue;
            }
            $this->log("build_data_store() li: " . $tagLi->textContent, 'parse');
            $show = new wssubTvShow_tvsubtitles($this);
            $a = $tagLi->getElementsByTagName("a");
            if (!is_null($a->item(0))) {
                if ($a->item(0)->hasAttributes()) {
                    $show->set_href($a->item(0)->attributes->getNamedItem('href')->nodeValue);
                    $show->set_id($this->extract_id($show->get_href(), $matches));
                }
                $show->set_name($a->item(0)->textContent);
                $this->log("build_data_store() a: name: " . $show->get_name(), 'parse');
                $this->log("build_data_store() a: href: " . $show->get_href(), 'parse');
                $this->log("build_data_store() a: id: " . $show->get_id(), 'parse');
            }
            foreach($tagLi->getElementsByTagName("img") as $tagImg) {
                if (is_null($tagImg)) {
                    continue;
                }
                if ($tagImg->hasAttributes()) {
                    $attributes = array('src', 'alt');
                    $img = array();
                    foreach($attributes as $k) {
                        $img[$k] = $tagImg->attributes->getNamedItem($k)->nodeValue;
                    }
                    $show->add_language($img);
                }
            }
            $this->add_tvshow($show);
        }
        return 1;
    }


    public function get_sub_parse_doc($doc) {
        if (!$doc) {
            $this->log("get_sub_parse_doc() No doc", 'error');
            return 0;
        }
        $tab = $doc->getElementById("table5");
        if (!$tab) {
            $this->log("get_sub_parse_doc() No tab element", 'error');
            return 0;
        }
        $tdArray = array(
        0 => null,
        1 => 'num',
        2 => 'title',
        3 => 'amount',
        4 => 'subtitles'
        );
        $list = array();
        foreach($tab->getElementsByTagName("tr") as $tr) {
            $ep = new wssubEpisode();
            $count = 0;
            foreach($tr->getElementsByTagName("td") as $td) {
                $count++;
                if (!$tdArray[$count]) {
                    continue;
                }
                if ($tdArray[$count] == 'num') {
                    $ep->set_num($td->textContent);
                }
                if ($tdArray[$count] == 'title') {
                    $ep->set_title($td->textContent);
                }
                if ($tdArray[$count] == 'num') {
                    $ep->set_num($this->extract_episode_number($td->textContent));
                }
                if ($tdArray[$count] == 'subtitles') {
                    foreach($td->getElementsByTagName('a') as $a) {
                        $sub = new wssubSubtitle();
                        $sub->set_id($this->extract_subtitle_id($a->getAttribute('href')));
                        $img_pool = $a->getElementsByTagName('img');
                        if (!$img_pool) {
                            exit("No tag img for subtitle<br>");
                        }
                        $img = $img_pool->item(0);
                        if (!$img) {
                            exit("No image for subtitle<br>");
                        }
                        if ($img->hasAttribute('alt')) {
                            $sub->set_lang($img->getAttribute('alt'));
                        }
                        $ep->add_sub($sub);
                    }
                }
            }
            array_push($list, $ep);
        }
        return $list;
    }
    /**
     *
     */
    public function get_sub($show, $request) {
        if (!$show || !($show instanceof wssubTvShow)) {
            $this->log("get_sub() invalid show", 'error');
            return 0;
        }
        if (!$request || !($request instanceof wssubRequest)) {
            $this->log("get_sub() invalid request", 'error');
            return 0;
        }
        $id = $show->get_id();
        if (is_null($id)) {
            $this->log("get_sub() no id", 'error');
            return 0;
        }
        $num_season = $request->get('season');
        if (is_null($num_season)) {
            $this->log("get_sub() no num_season", 'error');
            return 0;
        }
        $url = "http://www.tvsubtitles.net/tvshow-$id-$num_season.html";
        $doc = $this->load($url);
        if (!$doc) {
            $this->log('get_sub() no doc', 'error');
            return 0;
        }
        $season = new wssubSeason();
        $season->set_num($num_season);
        $list = $this->get_sub_parse_doc($doc);
        if (!$list) {
            $this->log('get_sub() Cannot parse doc', 'error');
            return 0;
        }
        foreach($list as $ep) {
            $season->add_episode($ep);
        }
        $show->add_season($season);
        return 1;
    }

    protected function load_page_search($name) {
        if (!$name) {
            exit("no name!");
            return null;
        }
        $url = $this->get_search_url($name);
        if (!$url) {
            return null;
        }
        return $this->load($url);
    }
    
    public function search_season($request) { /// WARNNNNNN PAS CODE ////
        $this->log("search_season() not codes", 'error');
    
        if (!is_array(self::$data_store)) {
            $this->log("search_season() No data", 'error');
            return 0;
        } 
        foreach(self::$data_store as $s) {
            $this->log("search_season() Found season " . $s->get_name(), 'info');
        }
    }
    
    public function search_show($p_request) {
        $request = $p_request;
        if (is_null($request) || !($request instanceof wssubRequest)) {
            $request = $this->get_request();
        }
        if (is_null($this->get_request())) {
            $this->log("search_show() request not set (no search() before!!!)", 'error');
            return 0;
        }
        if (!is_array(self::$data_store)) {
            $this->log("search_show() data_store's not an array", 'error');
            return 0;
        } 
        if (sizeof(self::$data_store) < 1) {
            $this->log("search_show() No data in data_store", 'error');
            return 0;
        } 
        $sel_show = null;
        //usort(self::$data_store, 'wssub_cmp_name');
        foreach(self::$data_store as $s) {
            if ($request->get('search') == $s->get_name()) {
                 $sel_show = $s;   
                 break;
            }
        }
        if (is_null($sel_show)) {
            $sel_show = self::$data_store[0];
        }
        $this->log("search_show() Selecting show " . $s->get_name(), 'info');
        $sel_show->load();
    }
    
    public function search($request) {
        if (!$request) {
            $this->log("search() No request!", 'error');
            return 0;
        }
        if (!$request->get('search')) {
            $this->log("search() No search!", 'error');
            return 0;
        }
        $doc = $this->load_page_search(htmlentities($request->get('search')));
        if (is_null($doc)) {
            $this->log("search() No doc", 'error');
            return 0;
        }
        $node = $this->dom_get_main($doc);
        if (is_null($node)) {
            $this->log("search() no node!", 'error');
            return 0;
        }
        if (!$this->build_data_store($node)) {
            $this->log("search() cannot build data store", 'error');
            return 0;
        }
        return 1;
    }

    /**
     *
     */
    public function extract_subtitle_id($txt, &$matches = null) {
        if (!$txt) {
            return null;
        }
        //print "extract sub id: " . $txt . "<br>";
        $matches = null;
        preg_match("/^.*subtitle-(\d+)\.html$/", $txt, $matches);
        if (!$matches || !isset($matches[1])) {
            if (!preg_match("/^.*subtitle-(\d+)-(\d+)-(\w+)\.html$/", $txt, $matches)) {
                $this->log("extract_subtitle_id() invalid sub id $txt, cannot extract (/^.*episode-(\d+)-(\w+)\.html format???)", 'error');
                return null;
            }
        }

        return $matches[1];
    }
    /**
     *
     */
    public function extract_id($txt, &$matches = null) {
        if (!$txt) {
            $this->log("extract_id() no txt", 'error');
            return null;
        }
        $matches = null;
        if (!preg_match("/^.*tvshow-(\d+)\.html$/", $txt, $matches)) {
            $this->log("extract_id() no match for $txt", 'error');
            return null;
        }
        return $matches[1];
    }

    public function extract_episode_number ($txt, &$matches = null) {
        if (!$txt) {
            $this->log("extract_episode_number() no txt", 'error');
            return null;
        }
        $matches = null;
        if (!preg_match("/^\s*(\d+)\s*x(\d+)\s*$/", $txt, $matches)) {
            $this->log("extract_episode_number() no match for $txt", 'error');
            return null;
        }
        return $matches[2];
    }

}