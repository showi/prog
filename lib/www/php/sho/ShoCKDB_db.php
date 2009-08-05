<?php
class ShoCKDB_db {
	public static $DBH = null;
	public static $db_backend = null;
	public static $db_path = null;
	
	function __construct() {
	
	}	
	
	public static function check_config() {
		if (!self::$db_backend) {
			return false;
		} else if (!self::$db_path) {
			return false;
		}
		return true;
	}
	
	public static function open() {
		if (!self::check_config()) {
			//print ("mauvaise configuration!<br>");
			return 0;
		}	
		if (!file_exists(self::$db_path)) {
			//print ("No database : " . self::$db_path . "<br>");
			return 0;
		}
		if (is_null(self::$DBH)) {
			self::$DBH = new PDO(self::$db_backend . ':' . self::$db_path);
			if (is_null(self::$DBH)) {
				$this->quit("Cannot connect to database("
				. self::$db_backend . ':' . self::$db_path
				. ")\n\t");
				return 0;
			}
		}
		return 1;
	}
	
	public static function close() {
		if (!is_null(self::$DBH)) {
			//print("Closing database<br>");
			self::$DBH = null;
		}	
	}
	
	public static function get_handle() {
		return self::$DBH;
	}
	
	public function query($name, $args) {
		if ($name == 'node') {
			return $this->_query_node($args);
		} if ($name == 'attributes') {
			return $this->_query_node_attributes($args);
		} if ($name == 'childs') {
			return $this->_query_node_childs($args);
		}  else {
			die("Invalid query: " + $name);
		}
	}
	
	private function _query_node_childs($args) {
		if (!$args['node_id']) {
			die("Cannot query node_childs without node_id");
			return null;
		}
		if ($args['node_id'] < 1) {
			die("Cannot query node_childs with negative node_id");
			return null;
		}
		//print ("Fetching attributes with id: " . $args['node_id'] . "<br>");
		$sth = self::$DBH->prepare(
			"SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_parent_id = " . $args['node_id']);
		$sth->execute();
		return $sth;
	}
	
	private function _query_node_attributes($args) {
		if (!$args['node_id']) {
			die("Cannot query attribute without node_id");
			return null;
		}
		if ($args['node_id'] < 1) {
			die("Cannot query attribute with negative node_id");
			return null;
		}
		//print ("Fetching attributes with id: " . $args['node_id'] . "<br>");
		$sth = self::$DBH->prepare(
			"SELECT id_attribute, node_id, name, value FROM node_attributes WHERE node_id = " . $args['node_id']);
		$sth->execute();
		return $sth;
	}
	
	private function _query_node($args) {
		if (!$args['node_id']) {
			die("Cannot query node without node_id");
			return null;
		}
		if ($args['node_id'] < 1) {
			die("Cannot query node with negative node_id");
			return null;
		}
		//print ("Fetching node with id: " . $args['node_id'] . "<br>");
		$sth = self::$DBH->prepare(
			"SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_id = " . $args['node_id']);
		$sth->execute();
		return $sth;
	}
}