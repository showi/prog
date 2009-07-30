<?php
$SHO_LIBPATH = "/home/prog/";
include_once($SHO_LIBPATH . "/lib/www/php/sho/CKDB_node.php");

class CKDB_Protocol_Cresponse {
	protected $status = false;
	public function __construct() {

	}
	public function toJSON($p_node, &$str) {
		$data = array();
		//$data['identifier'] = "node_id";
		//$data['label'] = "node_name";
		$data['status'] = $this->status;
		if (!$this->status) {
			$str = json_encode($data);
			return true;
		}
		$node = array();
		$node['node_id'] = $p_node->get_node_id();
		$node['node_name'] = $p_node->get_node_name();
		$node['node_type'] = $p_node->get_node_type();
		$node['children'] = array();
		//$childs = $node->get_data('node_childs');
		if (is_array($p_node->get_node_childs())) {
			foreach($p_node->get_node_childs() as $i => $c) {
				$inf = array();
				$inf['$ref'] = array();
				$inf['$ref']['node_id'] = $c->get_node_id();
				$inf['$ref']['node_type'] = $c->get_node_type();
				$inf['$ref']['node_name'] = $c->get_node_name();
				if ($inf['$ref']) {
					array_push($node['children'], $inf);
				}
			}
		}
		$$node['node_parent_id'] = $p_node->get_node_parent_id();
		$data['items'] = array();
		array_push($data['items'], $node);
		$str = json_encode($data);
	}

	public function set_status($status) {
		if ($status) {
			$this->status = true;
		} else {
			$this->status = true;
		}
	}
}

/********
 * MAIN *
 ********/
$response = new CKDB_Protocol_Cresponse();
$matches = null;
if ($_REQUEST['node_id'] && preg_match("/^\d{1,5}$/", $_REQUEST['node_id'], $matches)) {
	CKDB_node::$node_db_backend = 'sqlite';
	CKDB_node::$node_db_path = 'data/feedNodi.sl3';
	$node = new CKDB_node(null);
	if (!$node->db_open()) {
		print '<div class="txtError" style="color: red">Cannot open database!</div>';
		return 0;
	}
	if($node->db_preLoad($_REQUEST['node_id']))  {
		$response->set_status(true);
		$node->db_close();
	}
}
$str = null;
$response->toJSON($node, $str);
print $str;

