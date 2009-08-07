<?php
function __autoload($class_name) {
    require_once $class_name . '.php';
}
function dom_dump($obj) {
	if ($classname = get_class($obj)) {
		$retval = "Instance of $classname, node list: \n";
		switch (true) {
			case ($obj instanceof DOMDocument):
				$retval .= "XPath: {$obj->getNodePath()}\n".$obj->saveXML($obj);
				break;
			case ($obj instanceof DOMElement):
				$retval .= "XPath: {$obj->getNodePath()}\n".$obj->ownerDocument->saveXML($obj);
				break;
			case ($obj instanceof DOMAttr):
				$retval .= "XPath: {$obj->getNodePath()}\n".$obj->ownerDocument->saveXML($obj);
				//$retval .= $obj->ownerDocument->saveXML($obj);
				break;
			case ($obj instanceof DOMNodeList):
				for ($i = 0; $i < $obj->length; $i++) {
					$retval .= "Item #$i, XPath: {$obj->item($i)->getNodePath()}<br>\n".
"{$obj->item($i)->ownerDocument->saveXML($obj->item($i))}<br>\n";
				}
				break;
			default:
				return "Instance of unknown class";
		}
	} else {
		return 'no elements...';
	}
	return htmlspecialchars($retval);
}
$matches = null;
$matches_season = null;
$matches_number = null;

$request = new wssubRequest();
$request->set_http_request($_REQUEST);

$s = new wssubSite_tvsubtitles();
if ($_REQUEST['s'] || $_REQUEST['search']) {
	$str = "";
	if (!$s->search($request)) {
		$s->log('SEARCH: ' . $request->get('search') . " fail", 'error');
		//exit(1);
	} else {
		$ds = $s->get_data_store();
		if (sizeof($ds) < 1) {
			$s->log('Search return no result!', 'warn');
		} else {
			$show = $ds[0];
			$s->get_sub($show, $request);
		}
	}

} else {
	$s->log('Empty request');
}
print $s->to_html();
exit(0);

//print_r($tvshow_list);