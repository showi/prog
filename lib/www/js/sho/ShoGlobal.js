/* GLOBAL VARIABLES */
var GSHO;
var GSHO_OBJSHOP = new Array();

var GSHO_QUEUE_EVENTS = new Object();
GSHO_QUEUE_EVENTS.normal = new Array();
GSHO_QUEUE_EVENTS.load = new Array();

var GSHO_WINMOVE = null;
//var GSHO_NODES = new Array();

var GREG_WIDGETMAIN = /widgetMain_\d+/;

var GREG_TPL_WIDGET_ID = new RegExp("%WIDGET_ID%", "gi");

//function is_defined(input) {
//	if (typeof(input) != 'undefined') {
//		return true;
//	}
//	return false;
//}


function isUndefined(object) {
	return typeof object === 'undefined';
}

function isDefined(object) {
	return !isUndefined(object);
}

function isFunction (object) {
	return typeof object === 'function';
}

function isArray(object){
	return typeof(object) === 'object' && (object instanceof Array);
}

function isObject(object){
	return typeof(object) === 'object';
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

var GSHO_MAXXHR = 3;
var GSHO_NUMXHR = 0;

function ShoFunc_xhr_inc() {
	GSHO_NUMXHR++;
}

function ShoFunc_xhr_dec() {
	if (GSHO_NUMXHR > 0)
		GSHO_NUMXHR--;
}

function ShoFunc_dequeue(type) {
	if (!type) {
		GSHO.log({f: 'ShoFun_dequeue', t: 'e', m: 'No type '});
		return undefined;
	}
	var queue = GSHO_QUEUE_EVENTS[type];
	if (!isArray(queue)) {
		GSHO.log({f: 'ShoFun_dequeue', t: 'e', m: 'Invalid queue type ' + type});
		return undefined;
	}
	var len = queue.length;
	if (len < 1) {
		return undefined;
	}
	//var event = GSHO_QUEUE_EVENTS[type][len - 1];
	var event = queue.pop();
	return event;
}

function ShoFunc_can_dequeue_load() {
	//GSHO.log({f: 'ShoFunc_can_dequeue_load', t: 'e', m: "Can dequeue load " + GSHO_NUMXHR + '/' + GSHO_MAXXHR});
	if (GSHO_MAXXHR <= GSHO_NUMXHR) {
		return false;
	}
	return true;
}

function __callback_queue_event(time) {
	var count = 0;
	var event = undefined;
	if (ShoFunc_can_dequeue_load()) {
		while(GSHO_NUMXHR < GSHO_MAXXHR && isDefined(event = ShoFunc_dequeue('load'))) {
			var myFunc = event.target[event.name];
			if (isFunction(myFunc)) {
				count++;
				ShoFunc_xhr_inc();
				event.target[event.name]();
			} else {
				GSHO.log({f: ' __callback_queue_event', t: 'e', m: "Invalid event '"+event.name+"'" });
			}
		}
	}
	var newTime = time;
	if (count == GSHO_MAXXHR) {
		newTime += 100;
	}
	event = ShoFunc_dequeue('normal');
	if (event) {
		var myFunc = event.target[event.name];
		if (isFunction(myFunc)) {
			//GSHO.log({f: '__callback_queue_event', t: 'w', msg: 'Executing event ' + event.name });
			count++;
			event.target[event.name]();
		} else {
			GSHO.log({f: ' __callback_queue_event', t: 'w', m: "Invalid event '"+event.name+"'" });
		}
	}
	if (count == 0) {
		newTime+= 250;
	}
	setTimeout('__callback_queue_event('+time+')', newTime);
	return 0;
}

//function __callback_watch_log(p_time) {
//	return;
//	GSHO.static_get('log').show();
//	var time = 500;
//	setTimeout('__callback_watch_log('+time+')', time);
//	return 0;
//}

var GSHO_MOUSE = new Object();
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
		return false;
	}
	elm.style.cursor = curstype; 
	return true;
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
		return false;
	}
	var elm = document.getElementById(id);
	if (elm == undefined) {
		this.log("Main, winMove cannot find element with id '"+id+"'");
		return false;
	}
	GSHO.log("winStop(" + id + ")");
	GSHO_WINMOVE.style.zIndex--;
	GSHO_WINMOVE = null;
	return false;
}

function toHTM(str) {
	var reg;
	reg = /\n/g;
	str = str.replace(reg, "<br>\n", 'g');
	reg = /\s+/g;
	str = str.replace(reg,'&nbsp;');
	return str;
}

function ShoFunc_node_type_frag(type) {
	if (isUndefined(type)) {
		GSHO.log({t: 'e', f: 'ShoFunc_node_type_frag', m: 'Undefined type'});
	}
	var reg = /^.*:.*$/;
	if (!type.match(reg)) {
		GSHO.log({t: 'e', f: 'ShoFunc_node_type_frag', m: 'Do not match type pattern <type:subtype>, ' + type});
	}
	var mt = type.split(':');
	var t = new Object();
	t.node_type = mt[0];
	t.node_subtype = mt[1];
	return t;
}

function ShoElementBubble_mouseover(event, p) {
	Event.stop(event);
	var elm = $(Event.element(event));
	if (!elm) {
		GSHO.log({f: 'DOMID: ' + p.dom_id, t: 'e', m: ' No event element!'});
		return false;
	}
	var rootElm = elm.sho_elm_get_root();
	var txt = "";
	if (rootElm) {
		var node = gshoNodesManager.getNodeById(rootElm.getAttribute('sho_node_id'));
		if (node) {
			txt = toHTM(node.to_string());
		}
	}  else {
		txt = p.txt;
	}
	if (!txt) {
		return false;
	}
	var pad = new Object();
	pad.x = 5;
	pad.y = 5;
	var dim = document.viewport.getDimensions();
	//console.log(dim);
	var bubble = $(p.bubble_id);
	bubble.update(txt);
	bubble.style.display = 'block';
	var pos = new Object();
	var bdim = bubble.getDimensions();
	//console.log(bdim);
	pos.x = event.pointerX() + pad.x;
	pos.y = event.pointerY() + pad.y;
	if ((pos.y + bdim.height) > dim.height) {
		pos.y = event.pointerY() - pad.y - bdim.height;
	}
	if ((pos.x + bdim.width) > dim.width) {
		pos.x = event.pointerX() - pad.x - bdim.width;
	}
	bubble.style.left = pos.x;
	bubble.style.top =  pos.y
	bubble.style.visibility = 'visible';
	return false;
}



function ShoElementBubble_mouseout(event, p) {
	Event.stop(event);
	var elm = Event.element(event);
	if (!elm) {
		GSHO.log({f: 'DOMID: ' + p.dom_id, t: 'e', m: ' No event element!'});
		return false;
	}
	var bubble = $(p.bubble_id);
	bubble.style.visibility = 'hidden';
	//bubble.hide();
	bubble.update('');
	return false;		
}

function ShoElement_createBubble(p) {
	if (!p) {
		GSHO.log({f: 'ShoElement_createBubble', t: 'e', m: ' No parameters!'});
		return false;
	}
	if (!p.dom_id && !p.elm) {
		GSHO.log({f: 'ShoElement_createBubble', t: 'e', m: ' No dom_id parameter!'});
		return false;
	}
	if (!p.bubble_id) {
		GSHO.log({f: 'ShoElement_createBubble', t: 'e', m: ' No bubble_id parameter!'});
		return false;
	}
	var elm = p.elm || $(p.dom_id);
	if (!elm) {
		GSHO.log({f: 'ShoElement_createBubble', t: 'e', m: ' No dom element with dom_id: ' + p.dom_id});
		return false;
	}
	elm.observe('mouseover', function(event){ ShoElementBubble_mouseover(event, p)});
	elm.observe('mouseout', function(event){  ShoElementBubble_mouseout(event, p)});
	return true;
}
function __helper_init() {
	GSHO = new ShoObject();
	//__callback_watch_log(1000);
}
