/**********************
 * CLASS ShoGenNumber * 
 **********************/
var ShoGenNumber = Class.create();
ShoGenNumber.prototype = {
		__id: new Array(),
		initialize: function(id) {
},
/*******
 * get *
 *******/
get: function(id) {
	if (!this.__id[id]) {
		this.__id[id] = 1;
		return 0;
	}
	return this.__id[id]++;
}

}; // End of ShoGenNumber


/*******************
 * Class ShoObject * 
 *******************/
var ShoObject =  Class.create();
ShoObject.prototype = {
		__genid: new ShoGenNumber('ShoObject'),
		__static_obj: new Array(),

		/***************
		 * Constructor *
		 ***************/
		initialize: function() { 
	this.__init();
},

/**********
 * __init *
 **********/
__init: function(class_name) {
	this.__allowed_properties = new Array();
	this.__add_property('__class_name');
	this.__add_property('__id');
	this.__add_property('__notify');
	this.set('__notify', new Object());
	this.set('__id', this.__genid.get('ShoObject'));
	this.genid++;
	this.set('__class_name', class_name | 'ShoObject');
	this.log({f: '__init', t: 'i', m: "Create new "+class_name+" with id: " + this.get('__id')});
	//gsho_shop_add(this);	
},

/**********************************************************************************
 * Remove object from the shop, but javascript OO don't have destructor... boring *
 **********************************************************************************/
destruct: function() {
	GSHO_OBJSHOP[this.get('__id')] = undefined;
},

/*********************************
 * Get static thing ... ugly one *
 *********************************/
static_get: function (name) {
	return 	this.__static_obj[name];
},

/*************************************
 * Register property for this object *
 *************************************/
__add_property: function(name) {
	this.__allowed_properties[name] = 1;
	this[name] = undefined;
},

/**************************** 
 * Added with add_property? *
 ****************************/
is_allowed_property: function(name) {
	if (this.__allowed_properties[name])
		return 1;
	return 0;
},

/********************************************* 
 * Which object want to be notified of event *
 *********************************************/
add_observer: function(obj, domID, event_name) {
	if (!isObject(obj)) {
		this.log({f: 'add_observer', t: 'e', m: 'Cannot add observer without watcher object!'});
		return 0;
	}
	var event = new ShoEvent();
	n = event.frag_name(event_name);
	if (!n) {
		this.log({f: 'add_observer', t: 'e', m: 'Invalid event name: ' + event_name });
		return 0;
	}
	if (!isArray(this.get('__notify')[n.cat])) {
		this.get('__notify')[n.cat] = new Array();
	}
	if (!isArray(this.get('__notify')[n.cat][n.func])) {
		this.get('__notify')[n.cat][n.func] = new Array();
	}
	
	this.log('notify: ' + this.get('__notify')[event_name] );
	var len = this.get('__notify')[n.cat][n.func].length;
	var i = 0;
	for (i = 0; i <  len; i++) {
		if (obj.id == this.get('__notify')[n.cat][n.func][i].id) {
			return 0;
		}
	}
	//this.log({f: 'add_observer', t: 'i', m: "domId" + domID + ', event: ' + event_name});
	this.get('__notify')[n.cat][n.func].push(obj);
	return 1;
},

/************************************************************
 * Notify dom element of event registered with add_observer *
 ************************************************************/
notify: function(event_name) {
	var event = new ShoEvent();
	n = event.frag_name(event_name);
	if (!n) {
		this.log({f: 'notify', t: 'e', m: 'Invalid event name: ' + event_name });
		return 0;
	}
	if (!isArray(this.get('__notify')[n.cat])) {
		this.log({f: 'notify', t: 'e', m: 'This notify category doesn\'t  exist ' + n.cat});
		return 0;
	}
	if (!isArray(this.get('__notify')[n.cat][n.func])) {
		this.log({f: 'notify', t: 'e', m: 'This notify category:func doesn\'t  exist ' + n.cat + ' : ' + n.func});
		return 0;
	}
	//console.log('notify: ' + event_name);
	var len = this.get('__notify')[n.cat][n.func].length;
	var i = 0;
	for(i = 0; i < len; i++) {
		var obj = this.get('__notify')[n.cat][n.func][i];
		if(!obj) {
			continue;
		}
			this.log({f: 'notify', t: 'i', m: 'event name: '+event_name+', domElmID: ' + obj.id } );
		this.__queue_event(event_name, obj);	
	}
},

/******************
 *  Queuing event *
 ******************/
__queue_event: function(event_name, obj) {
	if (!event_name) {
		this.log({f: '__queue_event', t: 'e', m: 'no event name'});
		return false;
	}
	if (!isObject(obj)) {
		this.log({f: '__queue_event', t: 'e', m: 'Invalid object'});
		return false;
	}
	var e = new ShoEvent();
	e.set('name', event_name);
	e.set('target', obj);
//	if (e.name == 'sho:load') {
//		GSHO_QUEUE_EVENTS.load.push(e);
//	} else {
		GSHO_QUEUE_EVENTS.normal.push(e);
//	}
	return true;
},

/*********************** 
 * redirect to firebug *
 ***********************/
log: function (args) {
	//return 0;
	if (isUndefined(window.console)) {
		return 0;
	}		
	if (!args) {
		alert("log need log argument");
		return 0;
	}
	if(isDefined(args.m)) {
		args.msg = args.m;
	} 
	if (isDefined(args.t)) {
		args.type = args.t;
	}
	if (args.t != 'e') {
		return 0;
	}
	if (isUndefined(args.msg)) {
		var txt = args;
		args = new Object();
		args.msg = txt;
	}
	if (isUndefined(args.type)) {
		args.type = 'echo';
	}
	if (!args.msg) {
		alert("log need log argument args.msg");
		return 0;
	}
	var msg = "";
	var className = this.get('__class_name');
	if (!className) {
		className = "Unknow";
	}
//	if (this.__logLastClass != className) {
//		console.groupEnd();
//		console.group(className);
//	}
//	this.__logLastClass = className;
	msg += '{' + className + '}';
	if (args.f) {
		msg += ' [' + args.f + ']';
	}
	msg += ' ' + args.msg;
	if (args.type == 'e' || args.type == 'error') {
		//console.trace();
		console.error(msg);
	} else if (args.type == 'i' || args.type == 'info') {
		console.info(msg);
	} else if (args.type == 'w' || args.type == 'warn') {
		console.warn(msg);
	}else {
		console.log(msg)
	}
	return 1;
},

/********************** 
 * Get property value *
 **********************
 * /TODO get() --> MAY INTERFER WITH SOME PROTOTYPE FUNCTION, HAVE TO CHECK!
 */
get: function(name) {
	if (!this.is_allowed_property) {
		this.log({f: 'get', t: 'error', m: "get, '"+name+"' is not a valid property"});
		return 0;
	}
	return this[name];
},

/**********************
 * Set property value *
 ***********************/
set:function(name, value) {
	if (!this.is_allowed_property(name)) {
		var msg = "[set] Invalid properties '"+name+"' \nobject["+this.get('_class_name')+"]";
		this.log({f: 'set', t: 'error', 'm': msg});
		return 0;
	}
	this[name] = value;
	return this;
}

}; // end of ShoObject