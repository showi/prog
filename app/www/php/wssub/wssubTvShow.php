<?php
abstract class wssubTvShow extends wssubMother{
    protected $id;
    protected $name;
    protected $href;
    protected $languages;
    protected $seasons;
    protected $img;

    public function __construct($parent) {
        parent::__construct($parent);
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
        $this->name = strtolower($value);
    }
    public function get_img() {
        return $this->img;
    }
    public function set_img($value) {
        $this->img = $value;
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
        $this->id = 0 + $value;
    }
    public function get_id() {
        return $this->id;
    }

    /* ??? */
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
        $img = null;
        if ($img = $this->get_img()) {
            $w->startElement('img');
            $w->writeAttribute('src', $parent->get_prefix_url() . $img);
            $w->writeAttribute('alt', $this->get_name());
            $w->endElement();
        }
        $str = "";
        $w->startElement('div');
        $w->writeAttribute('class', 'season_container');
        usort($this->seasons, 'wssub_cmp_num');
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
    abstract public function load();
}
