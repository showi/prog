<?php

interface CKDB_viewer {
	function view(&$str);
}

function CKDBnodeFactory_type($type, &$obj){
	$className = 'CKDBNODE_$type.php';
	if (!file_exists("node/$className")) {
		//print "Create CKDB_node<br>\n";
		$obj = new CKDB_node(null);
		return;
	}
	//print "Create $className node<br>\n";
	include_once("node/$className");
	$obj = new $className();
}

class CKDB_genID {
	protected static $id = 0;
	public function getNewID() {
		return self::$id++;
	}
}

class CKDB_node {
	public static $node_db_backend = null;
	public static $DBH = null;
	public static $node_db_path = null;
	public static $node_viewer;
	private  $node_parent_id = NULL;
	private $node_parent;
	private $node_id = NULL;
	private $node_name = NULL;
	private $node_type = "basic";
	private $node_childs = array();
	private $_isLoaded = false;

	/*! Constructor */
	function __construct ($id) {
		$this->_init();
		//		if (!isset($id)) {
		//		 $id = CKDB_genID::getNewID();
		//		}
		if (isset($parent)) {
			$this->setNodeParent($parent);
		}
		$this->setId($id);
	}
	public function is_valid() {
		$valid = true;
		if ($this->node_id < 1) {
			$valid = false;
		}
		return $valid;
	}
	public function getIsLoaded() {
		return $this->_isLoaded;
	}
	protected function setLoaded($isLoaded) {
		$this->_isLoaded = $isLoaded;
	}
	public function set_node_id($node_id) {
		$this->node_id = $node_id;
	}
	public function get_node_id() {
		return $this->node_id;
	}
	public function set_node_name($node_name) {
		$this->node_name = $node_name;
	}
	public function get_node_name() {
		return $this->node_name;
	}
	public function set_node_type($node_type) {
		$this->node_type = $node_type;
	}
	public function get_node_type() {
		return $this->node_type;
	}
	public function set_node_parent_id($node_parent_id) {
		$this->node_parent_id = $node_parent_id;
	}
	public function get_node_parent_id() {
		return $this->node_parent_id;
	}
	public function get_node_childs_id() {
		return $this->node_childs_id;
	}
	public function set_node_childs_id($node_childs_id) {
		$this->node_childs_id = $node_childs_id;
	}
	public function rdelete() {
		$childs = $this->get_childs();
		if (!count($childs)) {
			return;
		}
		foreach($childs as $k => $obj) {
			$obj->rdelete();
			$this->node_childs[$k] = null;
		}
	}

	public static function db_open() {
		if (is_null(self::$DBH)) {
			//print("Opening " . self::$node_db_backend . ':' . self::$node_db_path . "<br>");
			self::$DBH = new PDO(self::$node_db_backend . ':' . self::$node_db_path);
			if (is_null(self::$DBH)) {
				$this->quit("Cannot connect to database("
				. self::$node_db_backend . ':' . self::$node_db_path
				. ")\n\t");
				return 0;
			}
		}
		return 1;
	}

	public static function db_close() {
		if (!is_null(self::$DBH)) {
			//print("Closing database");
			//$this->DBH->
			self::$DBH = null;
		}
	}

	/* init */
	protected function _init() {
		$this->setIdParent(null);
		$this->setId(null);
		$this->setName(null);
	}

	/* setters */
	private function setIdParent($id_parent) {
		$this->node_parent_id = $id_parent;
	}
	protected function setParent($parent) {
		if (!is_object($parent)) {
			return 0;
		}
		//print("tada<br>\n");
		$this->node_parent = $parent;
		$this->setIdParent($parent->getID());
		//print "Node[".$this->getId()."] set parent: " . $this->getParent()->getId() . "<br>\n";
		return 1;
	}

	public function setId($id_node) {
		$this->node_id = $id_node;
	}

	public function setName($name) {
		$this->node_name = $name;
	}

	public function setType($type) {
		$this->node_type = $type;
	}

	public function setViewer($viewer) {
		self::$node_viewer = $viewer;
	}

	public function setDbBackend($type) {
		self::$node_db_backend = $type;
	}

	public function setDbPath($path) {
		self::$node_db_path = $path;
	}

	/* getters */
	public function getIdParent() {
		return $this->node_parent_id;
	}

	public function getId(){
		return $this->node_id;
	}

	public function getName() {
		return $this->node_name;
	}

	public function getType() {
		return $this->node_type;
	}

	public function getIdNode() {
		return $this->node_id;
	}

	protected function getParent() {
		return $this->node_parent;
	}
	public function add_child($node){
		//print "add child: " . $node->getId() . "<br>\n";
		//print "Child number: " . count($this->node_childs) . "<br>\n";
		array_push($this->node_childs, $node);
		//print "Child number: " . count($this->node_childs) . "<br>\n";
		$node->setParent($this);
		//$node = null;
	}

	public function get_node_childs() {
		if(!count($this->node_childs)) {
			return null;
		}
		return $this->node_childs;
	}

	public function getChildByID($id) {
		foreach($this->get_childs() as $n) {
			if (is_object($n) && $n->getId() == $id) {
				//$n->toString();
				return $n;
			}
		}
		return null;
	}

	public function getChildsByType($type, &$array) {
		$array = array();
		$count = 0;
		foreach($this->get_childs() as $n) {
			if (is_object($n) && $n->getType() == $type) {
				//$n->toString();
				array_push($array, $n);
				$count++;
			}
		}
		return count;
	}

	/**
	 * @param $func
	 * @return unknown_type
	 */
	public function goPreDown($func) {
		$func($this);
		if (!count($this->get_childs())) {
			return;
		}
		foreach ($this->get_childs() as $n) {
			if (is_object($n)) {
				$str .= $n->goPreDown($func);
			}
		}
	}
	public function goPostDown($func) {
		if (!count($this->get_childs())) {
			return;
		}
		foreach ($this->get_childs() as $n) {
			if (is_object($n)) {
				$str .= $n->goPostDown($func);
			}
		}
		$func($this);
	}

	public function toString(&$str, $level = 0) {
		//$spc = "";
		for ($i = 0; $i < $level; $i++) {
			$stc.="___";
		}
		$str .=
		$str . "[Node id= " . $this->getIdNode() . "]<br>\n".
		$str . "_*name      = " . $this->getName() . "<br>\n" .
		$str . "_*type      = " . $this->getType() . "<br>\n" .
		$str . "_*parent id = ";
		if (is_object($this->getParent())) {
			$str .= $this->getParent()->getId();
		}
		$str .= "<br>\n";
		if (($childs = $this->get_childs())) {
			foreach ($childs as $n) {
				$str .= "--child: " . $n->node_id . "<br>\n";
				if (is_object($n)) {
					$str .= $n->toString($str, $level+1);
				}
			}
		}
	}

	public function quit($msg) {
		print("<div style=\"color:red;\">Error: $msg</div>\n");
		$this->db_close();
		exit(256);
	}
	
	public function dbget_childs_of($id) {
		$query = "SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_parent_id = $id";
		//print "$query" . "<br>\n";
		$results = self::$DBH->query($query);
		return result;
	}
	
	public function set_from_db($d) {
		$this->set_node_id($d['node_id']);
		$this->set_node_type($d['node_type']);
		$this->set_node_name($d['node_name']);
		$this->set_node_id_parent($d['node_id_parent']);
	}
	
	public function dbget_id($id) {
		$query = "SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_id = $id";
		//print "$query" . "<br>\n";
		$results = self::$DBH->query($query);
		return $result;
	}

	public function dbload_childs($parent_id, $recurse = false) {
		$query = "SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_parent_id = $parent_id";
		//print "pof: $query" . "<br>\n";
		$results = self::$DBH->query($query);
		if (is_null($results)) {
			$this->quit("No result for query($query)");
			return 0;
		}
		foreach($results as $row) {
			$node = null;
			CKDBnodeFactory_type($row['node_type'], $node);
			$node->dbload_id($row['node_id']);
			//	print "NodeId[".$node->getId()."]<br>\n";
			//print "name:&nbsp;".$node->getName()."]<br>\n";
			$this->add_child($node);
		}
		return 1;
	}

	public function db_preLoad($id) {
		//print "node_id: " . $id. "<br>\n";
		if ($id < 1) {
			$this->quit("db_preload, invalid id");
			return 0;
		}
		$query = "SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_id = $id";
		///print $query . "<br>\n";
		//self::$DBH->beginTransaction();
		$results = self::$DBH->query($query);
		//self::$DBH->commit();
		$count = 0;
		foreach($results as $row) {
			$count++;
			foreach ($row as $key => $value) {
				if(!is_numeric($key)) {
					$meth = "set_$key";
					//print "$meth => $value<br>";
					$this->$meth($value);
				}
			}
		}
		if (!$count) {
			return 0;
		}
		$query = "SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_parent_id = $id";
		$results = null;
		$results = self::$DBH->query($query);
		//		self::$DBH->commit();
		if (is_null($results)) {
			$this->quit("No result for query($query)");
			return 0;
		}
		foreach($results as $row) {
			if(!$row) {
				continue;
			}
			$node = null;
			CKDBnodeFactory_type($row['node_type'], $node);
			$node->set_node_id($row['node_id']);
			$node->dbload_id($row['node_id']);
			if ($node->is_valid()) {
				$this->add_child($node);
			}
		}
		$this->setLoaded(true);
		return 1;
	}

	public function method_is_valid ($name) {
		$f = "(";
		$f .= "set_node_id|get_node_id";
		$f .= "|set_node_type|get_node_type";
		$f .= "|set_node_name|get_node_name";
		$f .= "|set_node_parent_id|get_node_parent_id";
		//$f .= "set_node_id|get_node_id";
		$f .= ")";
		if (preg_match($f, $name)) {
			return 1;
		}
		return 0;
	}

	public function dbload_id($id, $recurse = false) {
		$query = "SELECT node_id, node_parent_id, node_type, node_name FROM node WHERE node_id = $id";
		//print $query . "<br>\n";
		$results = self::$DBH->query($query);
		if (is_null($results)) {
			$this->quit("No result for query($query)");
			return 0;
		}
		foreach($results as $row) {
			foreach ($row as $key => $value) {
				if(!is_numeric($key)) {
					$this->$key = $value;
				}
			}
		}
		$this->dbload_childs($id, $recurse);
		return 1;
	}

}
