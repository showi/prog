<?php 
include_once("HtmInclude.php");
include_once("/home/prog/lib/www/php/jsmin.php");
$i = new HtmInclude();
$i->addFile("/home/prog/lib/www/js/tk/prototype.js"); 
$i->addFile("/home/prog/lib/www/js/sho/ShoGlobal.js");
$i->addFile("/home/prog/lib/www/js/sho/ShoLog.js");
$i->addFile("/home/prog/lib/www/js/sho/ShoObject.js");
$i->addFile("/home/prog/lib/www/js/sho/ShoNode.js");
$i->addFile("/home/prog/lib/www/js/sho/ShoNodesManager.js");
$i->addFile("/home/prog/lib/www/js/sho/ShoWidgetFactory.js");
$i->addFile("/home/prog/lib/www/js/sho/ShoWidgetTree.js");

print $i->toString();
//code_compress($str);
// Output a minified version of example.js.
//print JSMin::minify($i->toString());
