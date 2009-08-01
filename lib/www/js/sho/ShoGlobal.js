var GSHO_BASEURL = "";

/* GLOBAL VARIABLES */
var GSHO;
var GSHO_OBJSHOP = new Array();
var GSHO_QUEUE_EVENTS = new Array();
var GSHO_WINMOVE = null;
var GSHO_NODES = new Array();

var GREG_WIDGETMAIN = /widgetMain_\d+/;
var GSHO_URL_AJAX = GSHO_BASEURL + "/app/php/feedNodi/";
var GREG_TPL_WIDGET_ID = new RegExp("%WIDGET_ID%", "gi");

function is_defined(input) {
	if (typeof(input) != 'undefined') {
		return true;
	}
	return false;
}

function is_array(input){
	return typeof(input)=='object' && (input instanceof Array);
}

function is_object(input){
	return typeof(input)=='object';
}

function is_object(name, input){
	return typeof(input)=='object' && (input instanceof name);
}

function is_null(value) {
	if (typeof(value) == 'undefined') {
		return true;
	}
	return false;
}

function trim (myString) {
	return myString.replace(/^\s+/g,'').replace(/\s+$/g,'');
} 

function gsho_list(args) {
	var list = new Array();
	var i = 0;
	for(i = 0; i < GSHO_NODES.lenght; i++) {
		if (is_defined(args.node_id)) {
			if (GSHO_NODES[i].node_id != args.node_id) {
				continue;
			}
		}
		if (is_defined(args.node_name)) {
			if (GSHO_NODES[i].node_name != args.node_name) {
				continue;
			}
		}
		list.push(GSHO_NODES[i]);
	}
	return list;
}

function gsho_shop_add(obj) {
	GSHO_OBJSHOP[obj.get('__id') + 0] = obj; // convert to int hack ...
}

function sho_object_shop_list() {
	for(i = 0; i < GSHO_OBJSHOP.length; i++) {
		GSHO.log("Obj: " + GSHO_OBJSHOP[i].get('__id') + ', ' + GSHO_OBJSHOP[i].get('__class_name')+"\n");
	}
}

function __callback_queue_event(time) {
	if (GSHO_QUEUE_EVENTS.length < 1) {
		setTimeout('__callback_queue_event('+time+')', 500);
		return 0;
	}
	var event = GSHO_QUEUE_EVENTS[GSHO_QUEUE_EVENTS.length - 1];
	GSHO_QUEUE_EVENTS.pop();
	if (!event) {
		return 0;
	}
	if (typeof(event.target[event.name]) == "function") {
		event.target[event.name]();
		//obj.fire(obj.name);
	} else {
		GSHO.log("Invalid event '"+event.name+"'");
	}
	if (event.name == "load") {
		return __callback_queue_event(time);
	}
	setTimeout('__callback_queue_event('+time+')', time);
	return 0;
}

function __callback_watch_log(p_time) {
	return;
	GSHO.static_get('log').show();
	var time = 500;
	setTimeout('__callback_watch_log('+time+')', time);
	return 0;
}

GSHO_MOUSE = new Object();
GSHO_MOUSE.x = 0;
GSHO_MOUSE.y = 0;
GSHO_MOUSE.old_x = 0;
GSHO_MOUSE.old_y = 0;

GSHO_MOUSE.setX = function(x) {
	this.x = x;
};

GSHO_MOUSE.setY = function(y) {
	this.y = y;
};

GSHO_MOUSE.getX = function() {
	return this.x;
};

GSHO_MOUSE.getY = function() {
	return this.y;
};

function winevent_mousemove(event) {
	GSHO_MOUSE.setX(event.pageX);
	GSHO_MOUSE.setY(event.pageY);
}

//document.onmousemove = winevent_mousemove;

function find_base_class (node) {
	if (GREG_WIDGETMAIN.test(node.id)) {
		return node;
	} 	
	if (node.parentNode == null) {
		return null;
	}
	return find_base_class(node.parentNode);
}

function callback_win_move() {
	if (!GSHO_WINMOVE) {
		return;
	}
	GSHO_WINMOVE.style.left =  GSHO_MOUSE.getX() - 150;
	GSHO_WINMOVE.style.top =  GSHO_MOUSE.getY() - 16;
	setTimeout('callback_win_move()', 100);
}

function changeCursor(id, curstype) { 
	var elm = document.getElementById(id);
	if (!elm) {
		return;
	}
	elm.style.cursor = curstype; 
	return false;
}

function winMove(id) {
	if (GSHO_WINMOVE) {
		return false;
	}
	var elm = document.getElementById(id);
	if (elm == undefined) {
		GSHO.log("Main, winMove cannot find element with id '" + id + "'");
		return false;
	}
	GSHO_WINMOVE = find_base_class(elm);
	GSHO_WINMOVE.style.zIndex = 2;
	GSHO_WINMOVE.onmouseover = function () { changeCursor(id, 'pointer') };
	GSHO_WINMOVE.onmouseout = function() {changeCursor(id, 'default')};
	callback_win_move();
	return false;
}

function winStop(id) {
	if (!GSHO_WINMOVE) {
		return;
	}
	var elm = document.getElementById(id);
	if (elm == undefined) {
		this.log("Main, winMove cannot find element with id '"+id+"'");
		return false;
	}
	GSHO.log("winStop(" + id + ")");
	GSHO_WINMOVE.style.zIndex--;
	GSHO_WINMOVE = null;
	return 0;
}

function __helper_init() {
	GSHO = new ShoObject();
	GSHO.static_get('log').set_win_id('ShoID_LOG');
	__callback_watch_log(1000);
}