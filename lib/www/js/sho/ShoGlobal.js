/* GLOBAL VARIABLES */
var GSHO;
var GSHO_OBJSHOP = new Array();

var GSHO_QUEUE_EVENTS = new Object();
GSHO_QUEUE_EVENTS.normal = new Array();
GSHO_QUEUE_EVENTS.load = new Array();

var GSHO_WINMOVE = null;

var GREG_WIDGETMAIN = /widgetMain_\d+/;

var GREG_TPL_WIDGET_ID = new RegExp("%WIDGET_ID%", "gi");

//var GSHO_MAXXHR = 3;
//
//var GSHO_NUMXHR = 0;

var GSHO_XHR = new Object();
GSHO_XHR.count = 0;
GSHO_XHR.max = 2;
GSHO_XHR.inc = function() {
	this.count++;
}
GSHO_XHR.dec = function() {
	if (this.count > 0) {
		this.count--;
	}
}
GSHO_XHR.wait = function() {
	if (this.count >= this.max) {
		return true;
	}
	return false;
}

var gshoNodesManager = undefined;