<?php
include_once('wssubSite.php');

/**
 * @author sho
 *
 */

class wssubSite_tvsubtitles extends wssubSite {
	
	/**
	 * @return unknown_type
	 */
	public function __construct() {
		parent::__construct();
		$this->set_prefix_url("http://www.tvsubtitles.net/");
		$this->set_search_url("http://www.tvsubtitles.net/search.php?q=%search%");
		$this->set_search_id_url("http://www.tvsubtitles.net/tvshow-%id%.html");
		$this->set_download_id_url("http://www.tvsubtitles.net/download-%id%.html");
		
		//$this->data_store = array();
	}

	/**
	 *
	 */
	/**
	 *
	 */
	public function node_get_search_result($doc) {
		if (!$doc) {
			exit("no doc!");
			return null;
		}
		$content = $doc->getElementById("content");
		if (!$content) {
			exit ("no 'content' id");
		}
		$list = $doc->getElementsByTagName("div");
		for($i = 0; $i < $list->length; $i++) {
			$item = $list->item($i);
			if (is_null($item)) {
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
					return $item;
				}
			}
		}
		return null;
	}
	/**
	 *
	 */
	/**
	 *
	 */
	public function node_get_search_id_result($doc) { /// PAS CODERRRRRRRRRRR 
		if (!$doc) {
			exit("no doc!");
			return null;
		}
		$content = $doc->getElementById("content");
		if (!$content) {
			exit ("no 'content' id");
		}
		$list = $content->getElementsByTagName("div");
		for($i = 0; $i < $list->length; $i++) {
			$item = $list->item($i);
			if (is_null($item)) {
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
					return $item;
				}
			}
		}
		return null;
	}
	
	
	/**
	 *
	 */
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
		$doc = new DOMDocument();
		$doc->validateOnParse = true;
		if (!@$doc->loadHTMLFile($url)) {
			print("Cannot load file $url");
			return null;
		}
		return $doc;
	}
	
	/**
	 *
	 */
	/**
	 *
	 */
	public function load($name) {
		if (!$name) {
			exit("no name!");
			return null;
		}
		$url = $this->get_search_url($name);
		if (!$url) {
			return null;
		}
		$doc = new DOMDocument();
		$doc->validateOnParse = true;
		if (!@$doc->loadHTMLFile($url)) {
			print("Cannot load file $url");
			return null;
		}
		return $doc;
	}
	
	/**
	 *
	 */
	/**
	 *
	 */
	public function build_data_store($root_node) {
		foreach($root_node->getElementsByTagName("li") as $tagLi) {
			if (is_null($tagLi)) {
				continue;
			}
			$show = new wssubTvShow();
			$a = $tagLi->getElementsByTagName("a");
			if (!is_null($a->item(0))) {
				if ($a->item(0)->hasAttributes()) {
					$show->set_href($a->item(0)->attributes->getNamedItem('href')->nodeValue);
					$show->set_id($this->extract_id($show->get_href(), $matches));
				}
				$show->set_name($a->item(0)->textContent);
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
		
		$body = $doc->getElementsByTagName("body");
		print dom_dump($body );
		//$body = $body->item(0);
		$tab = $doc->getElementById("table5");
	
		print "chargement dok sub: $url doc: $tab<br>";
		if (!$tab) {
			return 0;
		}
		print "chargement dok éé sub: $url<br>";
		foreach($tab->getElementsByTagName("tr") as $tr) {
			print "nv: " . $tr->textContent . "<br>";
		}
		print "chargement ok sub: $url<br>";
	}
	/**
	 *
	 */
	public function get_sub($show, $season, $num) {
		$id = $show->get_id();
		$url = "http://www.tvsubtitles.net/tvshow-$id-$season.html";
		//$url = "data/www.tvsubtitles.net/tvshow-13-1.html";
		print "url: $url<br>";
		$doc = $this->load($url);
		if (is_null($doc) || !$doc) {
			return 0;
		}
		print "get_sub_parse_doc<br>";
		$this->get_sub_parse_doc($doc);
		return 1;
	}
	
	/**
	 *
	 */
	public function search($name) {
		if (!$name) {
			exit("no name!");
			return 0;
		}
		$doc = $this->load($name);
		if (is_null($doc)) {
			return 0;
		}
		$node = $this->node_get_search_result($doc);
		if (is_null($node)) {
			return 0;
		}
		if (!$this->build_data_store($node)) {
			return 0;
		}
		return 1;
	}
	
	/**
	 *
	 */
	public function search_seasons() {
		$ds = $this->get_data_store();
		if (!$ds) {
			return 0;
		}
		if (sizeof($ds) < 1) {
			return 0;
		}
		foreach($ds as $s) {
			$id = $s->get_id();
			if (is_null($id)) {
				continue;
			}
			$url = $this->get_search_id_url($id);
			if (!$url) {
				continue;
			}
			if (!$url) {
				continue;
			}
			$url = "data/www.tvsubtitles.net/tvshow-13.html";
			print "Load id: $id ($url)<br>";
			$doc = $this->load($url);
			if (!$doc) {
				print "Cannot get url: $url<br>";
			}		
			if (is_null($doc)) {
				return 0;
			}
			$node = $this->node_get_search_id_result($doc);
			//print_r($doc);
		}
 	}
	
	/**
	 * 
	 */
	/**
	 *
	 */
	public function extract_id($txt, &$matches = null) {
		if (!$txt) {
			return null;
		}
		$matches = null;
		if (!preg_match("/^.*\/tvshow-(\d+)\.html$/", $txt, $matches)) {
			return null;
		}
		return $matches[1];
	}

}