<?php


/**
 * @author sho
 *
 */
class wssubEpisode extends wssubMother{
    /**
     * @var unknown_type
     */
    private $num;
    private $title;
    private $subtitles;
    private $url; // maybe change it to href, we need consistency
    /**
     * @return unknown_type
     */
    public function __construct($parent) {
        parent::__construct($parent);
        $this->num = null;
        $this->title = null;
        $this->subtitles = array();
        $this->url = null;
    }
    public function set_url($value) {
        $this->url = $value;
    }
    public function get_url() {
        return $this->url;
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
    public function to_html($parent) {
        $w = new XMLWriter();
        $w->openMemory();
        $w->startElement('div');
        $w->writeAttribute('class', 'episode');
        $w->startElement('div');
        $w->writeAttribute('class', 'episode_number');
        $num = $this->get_num();
        if ($num == -1) {
            $num = "All";
        } else if ($num == -2) {
            $num = 'Nd';
        }
        $w->text($num);
        $w->endElement();
        $w->startElement('div');
        $w->writeAttribute('class', 'inline');
        $w->text(" - ");
        $w->endElement();
        $w->startElement('a');
        $w->writeAttribute('class', 'episode_title');
        $w->writeAttribute('href', $this->get_url());
        $w->text($this->get_title());
        $w->endElement();
        $w->startElement('div');
        $w->writeAttribute('class', 'subtitle_container');
        $str = "";
        if (sizeof($this->subtitles) > 0) {
            foreach($this->subtitles as $sub) {
                $str .= $sub->to_html($parent);
            }
        }
        $w->writeRaw($str);
        $w->endElement();
        $w->endElement();
        return $w->flush();
    }

}
