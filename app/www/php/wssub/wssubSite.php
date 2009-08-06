<?php

/**
 * @author sho
 *
 */
class wssubSeasons {
	/**
	 * @var unknown_type
	 */
	public $id;
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
		$this->id = null;
		$this->episodes = null;
		$this->episodes = array();
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
		$this->seasons = new wssubSeasons();
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
	public function toHTML() {
		$str = "";
		foreach($this->get_data_store() as $show) {
			if (!$show) {
				continue;
			}
			$str .= '<p class="tvshow" style="width: 100%; background-color: black; color: white; display: block; border-size: 1px; border-color: white">';
			$str .= '<div class="name"><a href="'.$this->prefix_url . $show->get_href() . '">' . $show->get_name() . "[id:".$show->get_id()."]</a></div>";
			$str .= '<div>';
			foreach ($show->get_languages() as $lang) {
				$str .= '<img class="lang" src="'.$this->prefix_url.'/images/flags/' . $lang['alt'] . '.gif" alt="' . $lang['alt'] . '"></img>|';
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