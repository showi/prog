function isUndefined(o) {
	return typeof o === 'undefined';
}

function isDefined(o) {
	return !isUndefined(o);
}

function isFunction (o) {
	return typeof o === 'function';
}

function isArray(o){
	return typeof(o) === 'object' && (o instanceof Array);
}

function isObject(o){
	return typeof(o) === 'object';
}


function is_null(o) {
	if (typeof(o) == 'undefined') {
		return true;
	}
	return false;
}

function trim (s) {
	return s.replace(/^\s+/g,'').replace(/\s+$/g,'');
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
	var bubble = $(p.bubble_id);
	bubble.update(txt);
	bubble.style.display = 'block';
	var pos = new Object();
	var bdim = bubble.getDimensions();
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
	bubble.style.Zindex = 2;
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
	bubble.style.Zindex = -1;
	bubble.style.visibility = 'hidden';
	//bubble.update('');
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
