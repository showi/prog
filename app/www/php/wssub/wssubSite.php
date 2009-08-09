<?php
/**
 * @author sho
 *
 */
abstract class wssubSite extends wssubMother {
    protected $prefix_url = null;
    protected $search_url = null;
    protected $search_id_url = null;
    protected $download_id_url = null;
    protected $name = null;
    protected $url = null;
    protected $request = null;
    protected static $data_store = null;
  
    public function __construct($parent) {
        parent::__construct($parent);
        $this->prefix_url = null;
        $this->search_url = null;
        $this->search_id_url = null;
        $this->download_id_url = null;
        $this->name = null;
        $this->url = null;
        $this->request = null;
        self::$data_store = array();
        $this->log_array = array();
    }
      
    public function set_request($val) {
        $this->request = $val;
    }
    
    public function get_request (){
        return $this->request;
    }
    
    public function set_name($val) {
        $this->name = $val;
    }
    
    public function get_name (){
        return $this->name;
    }
    
    public function set_url($val) {
        $this->url = $val;
    }
    
    public function get_url (){
        return $this->url;
    }
    
    public function set_prefix_url($val) {
        $this->prefix_url = $val;
    }

    public function get_prefix_url() {
        return $this->prefix_url;
    }

    public function set_download_id_url($val) {
        $this->download_id_url = $val;
    }

    public function get_download_id_url() {
        return $this->download_id;
    }

    public function set_search_id_url($val) {
        $this->search_id_url = $val;
    }

    public function set_search_url($val) {
        $this->search_url = $val;
    }

    public function get_search_url($name) {
        if (!$name) {
            $this->log("get_search_url: no name", 'error');
            return null;
        }
        if (!$this->search_url) {
            $this->log("get_search_url: search_url is null", 'error');
            return null;
        }
        return preg_replace("/%search%/", $name, $this->search_url);
    }

    public function get_search_id_url($id) {
        if (!$id) {
            $this->log("get_search_id_url: no id", 'error');
            return null;
        }
        if (!$this->search_id_url) {
            $this->log("get_search_id_url: no search_id_url", 'error');
            return null;
        }
        return preg_replace("/%id%/", $id, $this->search_id_url);
    }

    public function get_data_store() {
        return self::$data_store;
    }

    public function add_tvshow($show) {
        if (!$show) {
            $this->log("add_tvshow() no show");
            return 0;
        }
        if (!($show instanceof wssubTvShow)) {
            $this->log("add_tvshow() show isn't an instance of wssubTvShow");
            return 0;
        }
        array_push(self::$data_store, $show);
            $this->log("add_tvshow() data_store length:" + sizeof($this->get_data_store()));
        return 1;
    }

    public function to_html() {
        $w = new XMLWriter();
        $w->openMemory();
        $w->startElement('html');
        $w->startElement('head');
        $w->writeElement('title' , 'wssubSite:' . $this->name);
        $w->endElement();
        $w->writeRaw('<link rel="stylesheet" type="text/css" href="css/wssubSite.css"></link>');
        $w->startElement('body');
        $w->startElement('div');
        $w->writeAttribute('class', 'show_container');
        $str = "";
        //usort(self::$data_store, 'wssub_cmp_name');
        foreach($this->get_data_store() as $show) {
            if (!$show) {
                $this->log("to_html: no show", 'warn');
                continue;
            }
            $str .= $show->to_html($this);
        }
        $w->writeRaw($str);
        $w->endElement();
        $w->startElement('div');
        $w->writeAttribute('class', 'log_container');
        $w->writeElement('p', ':: Log ::');
        $array = $this->get_log_array();
        if (sizeof($array) > 1) {
            $str = "";
            foreach($array as $log) {
                if (!$log) {
                    continue;
                }
                $str .= $log->to_html($this);
            }
            $w->writeRaw($str);
        }
        $w->endElement(); // div
        $w->endElement(); // body
        $w->endElement(); // html
        return $w->flush();
    }

    public function load($url) {
        if (!$url) {
            $this->log("load() no url", 'error');
            return null;
        }
        $cache = new wssubCache(null);
        if ($cache->add($url)) {
            $this->log("load() url added to cache: $url");
        }
        if ($nurl = $cache->get_cache_url($url)) {
            $url = $nurl;
        }
        $this->log("load() LOADING url: $url");
        $doc = new DOMDocument();
        $doc->validateOnParse = true;
        if (!@$doc->loadHTMLFile($url)) {
            $this->log("load() Cannot load file $url", 'error');
            return null;
        }
        return $doc;
    }
    
    public function get_url_season_id($show_id, $season_id) {
    
    } 
    abstract public function search($request);
    abstract public function search_season($request);
    abstract public function search_show($request);   
}