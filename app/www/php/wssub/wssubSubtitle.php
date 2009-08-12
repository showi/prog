<?php
class wssubSubtitle extends wssubMother {

    /**
     * @var unknown_type
     */
    protected $lang;
    protected $id;
    protected $url;
    
    public function __construct($parent) {
        parent::__construct($parent);
        $this->lang = null;
        $this->id = null;
        $this->url = null;
    }
    public function set_url($value) {
        $this->url = $value;
    }
    public function get_url() {
        return $this->url;
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
    public function to_html($parent) {
        if (!$this->get_lang()) {
            $this->log("to_html() no lang", 'error');
            return null;
        }
        if (!$this->get_id()) {
            $this->log("to_html() no id", 'error');
            return null;
        }
        if (!$parent->get_request()->is_lang_ok($this->get_lang())) {
            return null;
        }
        $w = new XMLWriter();
        $w->openMemory();
        $w->startElement('div');
        $w->writeAttribute('class', 'subtitle');
        $w->startElement('a');
        $w->writeAttribute('class', 'subtitle_href');
        $w->writeAttribute('href', $parent->get_prefix_url().'/download-'.$this->get_id().'.html');
        $w->startElement('img');
        $w->writeAttribute('class', 'subtitle_lang');
        $w->writeAttribute('src', $parent->get_prefix_url().'/images/flags/'.$this->get_lang().'.gif');
        $w->endElement();
        $w->endElement();
        $w->endElement();
        return $w->flush();
    }
}