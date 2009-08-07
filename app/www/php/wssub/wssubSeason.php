<?php
include_once("wssubMother.php");
/**
 * @author sho
 *
 */
function wssub_cmp_season($p_a, $p_b)
{
    $a = $p_a->get_num();
    $b = $p_b->get_num();
    if ($a == $b) {
        return 0;
    }
    return ($a < $b) ? -1 : 1;
}

class wssubSeason extends wssubMother {
    public $num;
    public $episodes;
    public $max_episode;

    public function __construct() {
        parent::__construct();
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
    public function to_html($parent) {
        $w = new XMLWriter();
        $w->openMemory();
        $w->startElement('div');
        $w->writeAttribute('class', 'season');
        $w->startElement('div');
        $w->writeAttribute('class', 'season_name');
        $w->text("Saison " . $this->get_num());
        $w->endElement();
        $w->startElement('div');
        $w->writeAttribute('class', 'episode_container');
        $str = "";
        usort($this->episodes, 'wssub_cmp_season');
        foreach($this->episodes as $ep) {
            if (!$ep->get_num()) {
                $this->log("Bad ep with no number: " . $ep->to_string(), 'warn');
                continue;
            }
            $str .= $ep->to_html($parent);
        }
        $w->writeRaw($str);
        $w->endElement();
        $w->endElement();
        return $w->flush();
    }
}