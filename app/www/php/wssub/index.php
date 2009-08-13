<?php
function __autoload($class_name) {
    require_once $class_name . '.php';
}

$GWSSUB_LOG = true;

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

function get_mini_lang($lang) {
    if (!$lang) {
        print "get_mini_lang() no lang";
        return null;
    }
    $lang = trim(strtolower($lang));
    if (strlen($lang) < 3) {
        return $lang;
    }
    return $lang; // NEED ISO 3166 Code :)
    return substr($lang, 0, 2);
}

function wssub_log($msg) {
    global $GWSSUB_LOG;
    if (!$GWSSUB_LOG) {
        return;
    }
    print "$msg<br>\n";
}

/********
 * MAIN *
 ********/
$request = new wssubRequest(null);
if (!$request->set_http_request($_REQUEST)) {
    wssub_log("format: s=name&se=1&l=en|br");
    //print $s->to_html();
    exit(0);
}
if (!isset($_REQUEST['s']) || isset($_REQUEST['search'])) {
    $request->log("format: s=name&se=1");
    print $s->to_html();
    exit(0);
}

$site_pool = array('tvsubtitles', 'seriessub');
//$site_pool = array('seriessub');
$out = "";
foreach ($site_pool as $site) {
    $class = "wssubSite_$site";
    wssub_log("Trying to load $site");
    if (!file_exists("$class.php")) {
        wssub_log("No class $class");
        continue;
    }
    $s = new $class(null);
//    if (!$s->is_reachable()) {
//        wssub_log("Site $site down");
//        continue;
//    }
    $s->set_request($request);
    if (!$s->search($request)) {
        $s->log('SEARCH: ' . $request->get('search') . " fail", 'error');
    } else {
        $s->search_show($request);
    }
    $out .= $s->to_html();
}
print $out;
exit(0);

//print_r($tvshow_list);