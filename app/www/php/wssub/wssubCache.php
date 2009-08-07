<?php
class wssubCache extends wssubMother{
	private $data = null;
	public function __construct() {
		parent::__construct();
		$data = array();
	}
	
	public function add_url($url) {
		if (!$url) {
			print "Cannot add $url to the cache!";
			return 0;
		}
		
	}	
}