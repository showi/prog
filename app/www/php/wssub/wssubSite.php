<?php

class wssubSubtitle {
	/**
	 * @var unknown_type
	 */
	public $lang;
	public $id;
	
	public function __construct() {
		$this->lang = null;
		$this->id = null;
	}
	
	public function set_id($value) {
		$this->id = $value;
	}
	public function get_id() {
		return $this->id;
	}
	public function set_lang($value) {
		$this->lang = $value;
	}
	public function get_lang() {
		return $this->lang;
	}	
	public function to_string() {
		return ("sub: " . $this->get_lang() . " id: " . $this->get_id());
	}
}

/**
 * @author sho
 *
 */
class wssubEpisode {
	/**
	 * @var unknown_type
	 */
	private $num;
	private $title;
	private $subtitles;
	/**
	 * @return unknown_type
	 */
	public function __construct() {
		$this->num = null;
		$this->title = null;
		$this->subtitles = array();
	}
	public function set_num($value) {
		$this->num = $value;
	}
	public function get_num() {
		return $this->num;
	}	
	public function set_title($value) {
		$this->title = $value;
	}
	public function get_title() {
		return $this->title;
	}	
	public function add_sub($sub) {
		if (!$sub) {
			exit("no sub!");
		}
		array_push($this->subtitles, $sub);
	}
	public function to_string() {
		$str = "Episode " . $this->get_num() . " - " . $this->get_title() . "<br>";
		if (sizeof($this->subtitles) > 0) {
			foreach($this->subtitles as $sub) {
				$str .= "&nbsp;-> " . $sub->to_string() . "<br>";
			}
		}
		return $str;
	}
	public function to_html() {
		$str = "<div>Episode " . $this->get_num() . " - " . $this->get_title() . "<br>";
		if (sizeof($this->subtitles) > 0) {
			foreach($this->subtitles as $sub) {
				$str .= '<a href="http://www.tvsubtitles.net/download-'.$sub->get_id().'.html">';
				$str .= '<img alt="'.$sub->get_lang().'" src="http://www.tvsubtitles.net/images/flags/'.$sub->get_lang().'.gif">';
				$str .= '</a>';
			}
		}
		$str .= "</div>";
		return $str;
	}	

}
/**
 * @author sho
 *
 */
class wssubSeason {
	/**
	 * @var unknown_type
	 */
	public $num;
	/**
	 * @var unknown_type
	 */
	public $episodes;
	/**
	 * @var unknown_type
	 */
	public $max_episode;

	/**
	 * @return unknown_type
	 */
	public function __construct() {
		$this->num = null;
		$this->episodes = array();
	}
	
	public function set_num($value) {
		$this->num = $value;
	}
	public function get_num() {
		return $this->num;
	}
	public function get_episodes() {
		return $this->episodes;
	}
	
	public function add_episode($episode) {
		if (!$episode) {
			exit("No episode");
		}
		array_push($this->episodes, $episode);
	}
	
	public function to_string() {
		$str = "Saison " . $this->get_num() . " len: " . sizeof($this->episodes) . "<br>";
		foreach($this->episodes as $i => $ep) {
			$str .= $ep->to_string();
		}
		return $str;
	}
	public function to_html() {
		$str = '<div><p style="font-color: red">Saison ' . $this->get_num() . "</p>";
		foreach($this->episodes as $ep) {
			if (!$ep->get_num()) {
				continue;
			}
			$str .= '<div style="display: inline; background-color: black">' . $ep->to_html() . "</div>";
		}
		$str .= "</div>";
		return $str;
	}
}
/**
 * @author sho
 *
 */
class wssubTvShow {
	/**
	 * @var unknown_type
	 */
	private $id;
	/**
	 * @var unknown_type
	 */
	private $name;
	/**
	 * @var unknown_type
	 */
	private $href;
	/**
	 * @var unknown_type
	 */
	private $languages;
	/**
	 * @var unknown_type
	 */
	private $seasons;

	/**
	 * @return unknown_type
	 */
	public function __construct() {
		$this->id = null;
		$this->name = null;
		$this->href = null;
		$this->languages = array();
		$this->seasons =  array();
	}
	/**
	 *
	 */
	public function get_name() {
		return $this->name;
	}
	/**
	 *
	 */
	public function set_name($value) {
		$this->name = $value;
	}
	public function get_seasons() {
		return $this->seasons;
	}
	public function add_season($season) {
		if (!$season) {
			exit("No season");
		}
		array_push($this->seasons, $season);
	}
	/**
	 *
	 */
	public function get_href() {
		return $this->href;
	}
	/**
	 *
	 */
	public function set_href($value) {
		$this->href = $value;
	}
	/**
	 *
	 */
	public function get_languages() {
		return $this->languages;
	}
	/**
	 *
	 */
	public function set_id($value) {
		$this->id = $value;
	}
	/**
	 *
	 */
	public function get_id() {
		return $this->id;
	}
	/**
	 *
	 */
	public function add_language($lang) {
		array_push($this->languages, $lang);
	}
}

/**
 * @author sho
 *
 */
abstract class wssubSite {
	/**
	 * @var unknown_type
	 */
	public $prefix_url = "";
	/**
	 * @var unknown_type
	 */
	public $search_url = "";
	/**
	 * @var unknown_type
	 */
	public $search_id_url = "";
	/**
	 * @var unknown_type
	 */
	public $download_id_url = null;
	/**
	 * @var unknown_type
	 */
	private $data_store = null;

	/**
	 * @return unknown_type
	 */
	public function __construct() {
		$this->prefix_url = null;
		$this->search_url = null;
		$this->search_id_url = null;
		$this->download_id_url = null;
		$this->data_store = array();
	}

	/**
	 *
	 */
	public function set_prefix_url($val) {
		$this->prefix_url = $val;
	}
	/**
	 *
	 */
	public function get_prefix_url() {
		return $this->prefix_url;
	}
	/**
	 *
	 */
	public function set_download_id_url($val) {
		$this->download_id_url = $val;
	}
	/**
	 *
	 */
	public function get_download_id_url() {
		return $this->download_id;
	}
	/**
	 *
	 */
	public function set_search_id_url($val) {
		$this->search_id_url = $val;
	}

	/**
	 *
	 */
	public function set_search_url($val) {
		$this->search_url = $val;
	}

	/**
	 *
	 */
	public function get_data_store() {
		return $this->data_store;
	}
	/**
	 *
	 */
	public function add_tvshow($show) {
		if (!$show) {
			return 0;
		}
		if (!($show instanceof wssubTvShow)) {
			return 0;
		}
		array_push($this->data_store, $show);
		return 1;
	}
	/**
	 *
	 */
	/**
	 *
	 */
	public function get_search_url($name) {
		if (!$name) {
			return null;
		}
		if (!$this->search_url) {
			return null;
		}
		return preg_replace("/%search%/", $name, $this->search_url);
	}

	/**
	 *
	 */
	public function get_search_id_url($id) {
		if (!$id) {
			return null;
		}
		if (!$this->search_id_url) {
			return null;
		}
		return preg_replace("/%id%/", $id, $this->search_id_url);
	}
	/**
	 *
	 */
	public function to_html() {
		$str = "";
		foreach($this->get_data_store() as $show) {
			if (!$show) {
				continue;
			}
			$str .= '<p class="tvshow" style="width: 100%; background-color: black; color: white; display: block; border-size: 1px; border-color: white">';
			$str .= '<div class="name"><a href="'.$this->prefix_url . $show->get_href() . '">' . $show->get_name() . "[id:".$show->get_id()."]</a></div>";
			$str .= '<div>';
//			foreach ($show->get_languages() as $lang) {
//				$str .= '<img class="lang" src="'.$this->prefix_url.'/images/flags/' . $lang['alt'] . '.gif" alt="' . $lang['alt'] . '"></img>|';
//			}
			foreach($show->get_seasons() as $season) {
				$str .= $season->to_html();
			}
			$str .= '</div>';
			$str .= '</p>';
		}
		return $str;
	}
	/**
	 *
	 */
	abstract public function search($name);
	/**
	 *
	 */
	abstract public function search_seasons();
	/**
	 *
	 */
	abstract public function node_get_search_result($doc);

}