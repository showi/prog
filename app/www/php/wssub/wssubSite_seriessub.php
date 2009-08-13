<?php
class wssubSite_seriessub extends wssubSite {

    public function __construct($parent) {
        parent::__construct($parent);
        $this->set_prefix_url("http://www.seriessub.com/");
        //        $this->set_search_url("http://www.tvsubtitles.net/search.php?q=%search%");
        //        $this->set_search_id_url("http://www.tvsubtitles.net/tvshow-%id%.html");
        //        $this->set_download_id_url("http://www.tvsubtitles.net/download-%id%.html");
        //        $this->set_name("tvsubtitles.net");
        //        $this->set_url("http://www.tvsubtitles.net/");
    }

    public function search($request) {
        if (!$request) {
            $this->log('search() No request', 'error');
            return false;
        }
        if (!$request->get('search')) {
            $this->log("search() No search!", 'error');
            return false;
        }
        $doc = $this->load($this->get_prefix_url() . '/sous-titres');
        if (!$doc) {
            $this->log("Cannot load subtitles index", 'error');
            return false;
        }
        $elmsTd = getElementsByClassName($doc, 'td', 'gst_name', false);
        if ($elmsTd->length < 1) {
            $this->log("Cannot find sub (td:class gst_name)");
            return false;
        }
        foreach($elmsTd as $td) {
            $name = strtolower(trim($td->textContent));
            $search = $request->get('search');
            if (preg_match("/^$search.*$/i", $name)) {
                $this->log("found show: " . $name, 'info');
                $elmsDiv = $td->getElementsByTagName('div');
                if ($elmsDiv->length < 1) {
                    continue;
                }
                $elmsA = $elmsDiv->item(0)->getElementsByTagName('a');
                if ($elmsA->length < 1) {
                    continue;
                }
                $href = $elmsA->item(0)->getAttribute('href');
            
                $show = new wssubTvShow_seriessub($this);
                $show->set_name($name); 
                $show->set_href($href);
                $show->load();        
                $this->add_tvshow($show);
            }
        }
        
        return true;
   }

    public function search_season($request) {
        return false;
    }

    public function search_show($request) {
        return false;
    }
}