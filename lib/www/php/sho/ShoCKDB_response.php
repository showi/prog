<?php
class ShoCKDB_response {
	private static $DB;
	private $nodes = array();
	private $status = false;

	public function __construct($db) {
		if (!$db) {
			die("ShoCKDB_response need db argument in constructor");
		}
		self::_set_db($db);
	}

	private static function _set_db($db) {
		self::$DB = $db;
	}

	public function get_node($args) {
		if (!$args) {
			die ("Cannot get node without parameters");
		}
		if (!$args['node_id']) {
			die ("Cannot get node without node_id parameter");
		}
		$sth = self::$DB->query('node', array('node_id' => $args['node_id']));
		$data = $sth->fetch(PDO::FETCH_ASSOC);
		if (!$data) {
			//print("No node with id: " + $data['node_id']);
			//$this->status = false;
			return false;
		} 
		//$this->status = true;
		$node = array();
		//$node['status'] = true;
		$node['data'] = array();
		foreach($data as $k => $v) {
			$node['data'][$k] = $v;
		}
		$sth = self::$DB->query('childs', array('node_id' => $args['node_id']));
		$node['childs'] = array();
		while($data = $sth->fetch(PDO::FETCH_ASSOC)) {
			$childData = array(); 
					foreach($data as $k => $v) {
						$childData[$k] = $v;
					}
			if (sizeof($childData) > 0) {
				array_push($node['childs'], $childData);
			}
		}
		$sth = self::$DB->query('attributes', array('node_id' => $args['node_id']));
		$data = $sth->fetch(PDO::FETCH_ASSOC);
		if ($data) {
			$node['attributes'] = array(); 
			foreach($data as $k => $v) {
				$node['attributes'][$k] = $v;
			}
		}
		$this->status = true;
		array_push($this->nodes, $node);
		return true;	
	}
	
	public function to_json() {
		$response = array(
			'status' => $this->status,
			'nodes' => $this->nodes,
		);
		return json_encode($response);
	}
	
	public function to_string() {
		$str = "";
		foreach($this->nodes as $n) {
			$str .= "Node [" . $n['node_id'] . "<br>";
			foreach($n as $k => $v) {
				if ($k == 'attributes') {
					foreach($this->node[$k] as $aname => $avalue) {
						$str .= "&nbsp;&nbsp;Attribute: $aname, $avalue<br>";
					}
				} else {
					$str .= "$k: $v<br>";
				}
			}
		}
		return $str;
	}

}