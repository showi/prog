<?php

class HtmInclude {
	private $__className = "HtmInclude";
	protected $path = null;
	protected $files_array = null;	

	function __construct() {
		$this->path = "";
		$this->files_array = array();
	}
	
	protected function log($msg) {
		print "$msg<br>\n";
	}
	
	public function addFile($file_path) {
		if (!file_exists($file_path)) {
			die($this->__className . ", Cannot add file '$file_path', file doesn't exist!");
		}
		foreach($this->files_array as $num => $file) {
			if ($file == $file_path) {
				$this->log("File already present: $file_path");			
				return 1;
			}
		}
		array_push($this->files_array, $file_path);
		return 1;
	}
	
	public function toString() {
		$str = "";
		foreach($this->files_array as $num => $file) {
			$str .= "\n" . file_get_contents($file);
		}
		return $str;
	}
}


function code_compress (&$str){
	preg_replace("/\s\s+/", ' ', $str);	
}