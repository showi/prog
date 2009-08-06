<?php
include_once('wssubSite_tvsubtitles.php');
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
$file = "data/www.tvsubtitles.net/search.php.html";
$prefix_url = "http://www.tvsubtitles.net/";
if ($_REQUEST['search']) {
	if (!preg_match("/^[\w\d_\(\) -]+$/", $_REQUEST['search'], $matches)) {
		exit("{'status': false}");
	}
	if (!preg_match("/^(\d+)$/", $_REQUEST['s'], $matches_season)) {
		exit("{'status': false}");
	}
	if (!preg_match("/(\d+)$/", $_REQUEST['n'], $matches_number)) {
		exit("{'status': false}");
	}
	$file = "http://www.tvsubtitles.net/search.php?q=".$_REQUEST['search'];
}
$s = new wssubSite_tvsubtitles();
$s->search_url = $file; // LOCAL LOCAL
$str = "";
if (!$s->search($_REQUEST['search'])) {
	exit('search fail');
}
$ds = $s->get_data_store();
$show = $ds[0];
$s->get_sub($show, $matches_season[1], $matches_number[1]);
//$s->search_seasons();
print $s->to_html();
exit(0);

//print_r($tvshow_list);