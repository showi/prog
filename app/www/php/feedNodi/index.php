<?php
$SHO_LIBPATH = "/home/prog/";
include_once($SHO_LIBPATH . "/lib/www/php/sho/CKDB_node.php");
include_once($SHO_LIBPATH . "/lib/www/php/sho/ShoCKDB_db.php");
include_once($SHO_LIBPATH . "/lib/www/php/sho/ShoCKDB_response.php");

function clean_request($req) {
	$rid = split(',', $req);
	$tab = array();
	$tin = array();
	if (sizeof($rid) > 0) {
		foreach($rid as $id) {
			//print "id: $id<br>";
			preg_replace("[^\d]", "", $id);
			if ($id) {
				if (!$tin[$id]) {
					array_push($tab, $id);
					$tin[$id] = 1;
				}
			}
		}
	} else {
		preg_replace("[^\d]", "", $req);
		if ($req) {
			if (!$tin[$id]) {
				array_push($tab, $req);
				$tin[$id] = 1;
			}

		}
	}
	return $tab;
}

if (!$_REQUEST['node_id']) {
	exit(1);
}
$matches = null;
if (!preg_match("/^([\d]{1,5},?){1,10}$/", $_REQUEST['node_id'], $matches)) {
	exit(1);
}

$tab = clean_request($_REQUEST['node_id']);
if (!$tab) {
	print "Empty tab<br>";
	exit(1);
}
ShoCKDB_db::$db_backend = 'sqlite';
ShoCKDB_db::$db_path = 'data/feedNodi.sl3';
$db = new ShoCKDB_db();
if  (!$db->open()) {
	print("Impossible d'ouvrir la db!<br>");
	exit(1);
}
$res = new ShoCKDB_response($db);

for($i = 0; $i < sizeof($tab); $i++) {
	//print "id: " . $tab[$i] . "<br>";
	$node_id = $tab[$i];
	if (!$res->get_node(array('node_id' => $node_id))) {
		print $res->to_json();
		exit(1);
	}
}
print $res->to_json();
exit(0);