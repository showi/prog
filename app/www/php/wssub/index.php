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

function wssub_cmp_name($p_a, $p_b)
{
    $a = $p_a->get_name();
    $b = $p_b->get_name();
    $cmp = strcmp($a, $b);
    if ($cmp == 0) {
        return 0;
    }
    return ($cmp < 0) ? -1 : 1;
}

function wssub_cmp_num($p_a, $p_b)
{
    $a = $p_a->get_num();
    $b = $p_b->get_num();
    if ($a == $b) {
        return 0;
    }
    return ($a < $b) ? -1 : 1;
}

function getElementsByClassName($doc, $elm_name, $class_name, $first_only = false) {
    if (!$doc) {
        print "getElementsByClassName: no document!";
        exit(1);
    } else if (!$elm_name) {
        print "getElementsByClassName: no element name!";
        exit(1);
    } else if (!$class_name) {
        print "getElementsByClassName: no class name!";
        exit(1);
    }
    $a_elm = $doc->getElementsByTagName($elm_name);
    if ($a_elm->length == 0) {
        //print "getElementsByClassName: no element named $elm_name in doc";
        return $a_elm;
    }
    $ndoc = new DOMDocument();
    $ndoc->loadXML('<div></div>');
    for($i = 0; $i < $a_elm->length; $i++) {
        $item = $a_elm->item($i);
        if ($item->hasAttribute('class') && ($item->getAttribute('class') == $class_name)) {
            $node = $ndoc->importNode($item, true);
            $ndoc->documentElement->appendChild($node);
            if ($first_only) {
                return $ndoc->getElementsByTagName($elm_name);
            }
        }
    }
    return $ndoc->getElementsByTagName($elm_name);
}
/********
 * MAIN *
 ********/
$s = new wssubSite_tvsubtitles(null);
$request = new wssubRequest(null);
$s->set_request($request);
if (!$request->set_http_request($_REQUEST)) {
    $request->log("format: s=name&se=1&l=en|br");
    print $s->to_html();
    exit(0);
}
if (!isset($_REQUEST['s']) || isset($_REQUEST['search'])) {
    $request->log("format: s=name&se=1");
    print $s->to_html();
    exit(0);
}
$str = "";
if (!$s->search($request)) {
    $s->log('SEARCH: ' . $request->get('search') . " fail", 'error');
} else {
    $s->search_show($request);
    //    $ds = $s->get_data_store();
    //    if (sizeof($ds) < 1) {
    //        $s->log('Search return no result!', 'warn');
    //    } else {
    //        $show = $ds[0];
    //        $s->get_sub($show, $request);
    //    }
    }
    print $s->to_html();
    exit(0);

    //print_r($tvshow_list);