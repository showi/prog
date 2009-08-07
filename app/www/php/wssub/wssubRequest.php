<?php
class wssubRequest extends wssubMother {
	private $properties;
	private $allowed;
	
	public function __construct() {
		parent::__construct();
		$this->allowed = array('search', 'lang', 'episode', 'season');
	}
	
	public function is_allowed($name) {
		foreach($this->allowed as $k => $v) {
			if ($name == $v) {
				return true;
			}
		}
		return false;
	}

	public function set_episode($name, $value) {
		if (!preg_match("/^(\d{1,10})$/", $value, $matches)) {
			$this->log("set_episode() Invalid $name: $value", 'error');
			return;
		}
		$this->properties[$name] = $value;
		$this->log("set_episode() setting $name: " . $this->get($name), "info");
	}
	
	public function set_season($name, $value) {
		if (!preg_match("/^(\d{1,10})$/", $value, $matches)) {
			$this->log("set_season() Invalid $name: $value", 'error');
			return;
		}
		$this->properties[$name] = $value;
		$this->log("set_season() setting $name: " . $this->get($name), "info");
	}
	
	public function set_search($name, $value) {
		if (!preg_match("/^([\w\d_\(\) -]+)$/", $value, $matches)) {
			$this->log("set_search() Invalid $name: $value", 'error');
		}
		$this->properties[$name] = $value;
		$this->log("set_search() setting $name: " . $this->get($name), "info");
	}
	
	public function set_lang($name, $value) {
		if (!preg_match("/^(([\w]{2})(,?[\w]{2}){0,4})$/", $value , $matches)) {
			$this->log("set_lang() Invalid $name: $value", 'error');
			return;
		}
		$languages = split(',', $matches[1]);
		foreach($languages as $i => $lang) {
			if (!$lang)
				continue;
			$languages[$i] = strtolower(trim($lang));
			$this->log("set_lang() [$i] setting $name: " . $languages[$i], "info");
		}
		$this->properties[$name] = $languages;
	}
	
	public function set($name, $value) {
		if (!$this->is_allowed($name)) {
			$this->log('set: Invalid property $name', 'error');
			return false;
		}	
		$method = "set_".$name;
		if (!method_exists($this, $method)) {
			$this->log("set: Setting property without filtering: $name", 'warn');
			$this->properties[$name] = $value;
		} else {
			return $this->$method($name, $value);
		}
		return true;
	}
	public function get($name) {
		if (!$this->is_allowed($name)) {
			$this->log('get: Invalid property $name', 'error');
			return null;
		}	
		return $this->properties[$name];
	}
	
	public function set_http_request($http_request) {
		if (!$http_request) {
			$this->log('set_http_request() no request', 'error');
			return null;
		}
		$expand = array(
			's' => 'search', 
			'se' => 'season',
			'e' => 'episode',
			'l' => 'lang',
		);
		foreach($http_request as $hr_k => $hr_v) {
			foreach($expand as $k => $v) {
				if ($hr_k == $k) {
					$this->log("set_http_request() expanding variable $hr_k into $v", 'info');
					$http_request[$v] = $hr_v;
					unset($http_request[$hr_k]);
					$this->log("set_http_request() $v = " . $http_request[$v], "info");
				}
			}
		}		
		foreach($http_request as $k => $v) {
			if ($this->is_allowed($k)) {
				$this->set($k, $v);				
			} else {
				$this->log("set_http_request() invalid property $k", 'warn');
				unset($http_request[$k]);
			}
		}
	}
}