<?php
class wssubTvShow extends wssubMother{
	private $id;
	private $name;
	private $href;
	private $languages;
	private $seasons;

	public function __construct() {
		parent::__construct();
		$this->id = null;
		$this->name = null;
		$this->href = null;
		$this->languages = array();
		$this->seasons =  array();
	}

	public function get_name() {
		return $this->name;
	}
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
		if (!($season instanceof wssubSeason)) {
			exit('$season parameter isn\'t instance of wssubSeason');
		}
		array_push($this->seasons, $season);
	}

	public function get_href() {
		return $this->href;
	}

	public function set_href($value) {
		$this->href = $value;
	}

	public function get_languages() {
		return $this->languages;
	}
	public function set_id($value) {
		$this->id = $value;
	}
	public function get_id() {
		return $this->id;
	}
	public function add_language($lang) {
		array_push($this->languages, $lang);
	}

	public function to_html($parent) {
		$w = new XMLWriter();
		$w->openMemory();
		$w->startElement('div');
		$w->writeAttribute('class', 'show');
		$w->startElement('a');
		$w->writeAttribute('class', 'name');
		$w->writeAttribute('href', $parent->get_prefix_url() . $this->get_href());
		$w->text($this->get_name());
		$w->endElement();
		$str = "";
		$w->startElement('div');
		$w->writeAttribute('class', 'season_container');
		foreach($this->get_seasons() as $season) {
			if (!$season) {	
				$this->log('to_html: "empty season', 'warn');
			}
			$str .= $season->to_html($parent);
		}
		$w->writeRaw($str);
		$w->endElement();
		$w->endElement();
		return $w->flush();
	}
}
