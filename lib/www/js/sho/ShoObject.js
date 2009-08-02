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
},

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
__init: function() {
	this.__allowed_properties = new Array();
	this.__add_property('__class_name');
	this.__add_property('__id');
	this.__add_property('__notify');
	this.set('__notify', new Object());
	this.set('__id', this.__genid.get('ShoObject'));
	this.genid++;
	this.set('__class_name', 'ShoObject');
	this.log({type: 'info', msg: "Create new ShoObject with id: " + this.get('__id')});
	gsho_shop_add(this);	
},

/**********************************************************************************
 * Remove object from the shop, but javascript OO don't have destructor... boring *
 **********************************************************************************/
destruct: function() {
	GSHO_OBJSHOP[this.get('__id')] = null;
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
	this[name] = null;
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
	this.log({type: 'info', msg: "add observer: domId" + domID + ', event: ' + event_name});
	if (typeof obj == 'undefined') {
		this.log({type: 'info', msg: 'add_observer: Cannot add observer without watcher object!'});
		return 0;
	}
	if (typeof this.get('__notify')[event_name] == 'undefined') {
		this.get('__notify')[event_name] = new Array();
	}
	for (i = 0; i <  this.get('__notify')[event_name].length; i++) {
		if (obj.id == this.get('__notify')[event_name][i].id) {
			this.log({type: 'info', msg: 'Event already registered'});
			return 0;
		}
	}
	this.get('__notify')[event_name].push(obj);
	return 1;
},

/************************************************************
 * Notify dom element of event registered with add_observer *
 ************************************************************/
notify: function(event_name) {
	var i = 0;
	for(i = 0; i < this.get('__notify')[event_name].length; i++) {
		var obj = this.get('__notify')[event_name][i];
		if(!obj) {
			continue;
		}
		this.log({type: 'info', msg: 'notify['+event_name+'] ' + obj.id } );
		this.__queue_event(event_name, obj);
	}
},

/******************
 *  Queuing event *
 ******************/
__queue_event: function(event_name, obj) {
	var e = new Object();
	e.name = event_name;
	e.target = obj;
	GSHO_QUEUE_EVENTS.push(e);
},

/*********************** 
 * redirect to firebug *
 ***********************/
log: function (args) {
	if (!is_defined(window.console)) {
		return 0;
	}		
	if (!args) {
		alert("log need log argument");
		return 0;
	}
	if (!is_defined(args.msg)) {
		var txt = args;
		args = new Object();
		args.msg = txt;
		args.type = 'echo';
	}
	if (!is_defined(args.type)) {
		args.type = 'echo';
	}
	if (!args.msg) {
		alert("log need log argument args.msg");
		return 0;
	}
	args.msg = this.get('__class_name') + ': ' + args.msg;
	if (args.type == 'error') {
		console.trace();
		console.error(args.msg);
	} else if (args.type == 'info') {
		console.info(args.msg);
	} else {
		console.log(args.msg)
	}
	return 1;
},

/********************** 
 * Get property value *
 **********************/
get: function(name) {
	if (!this.is_allowed_property) {
		this.log({type: 'error', msg: "get, '"+name+"' is not a valid property"});
		return 0;
	}
	if (this[name]) {
		return this[name];
	}
	return null;
},

/**********************
 * Set property value *
 ***********************/
set:function(name, value) {
	if (!this.is_allowed_property(name)) {
		var msg = "[set] Invalid properties '"+name+"' \nobject["+this.get('_class_name')+"]";
		this.log({type: 'error', 'msg': msg});
		return 0;
	}
	this[name] = value;
	return 1;
},

}; // end of ShoObject