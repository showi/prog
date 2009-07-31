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
/* Static variables */
__genid: new ShoGenNumber('ShoObject'),
__static_obj: new Array(),

/* Constructor */
initialize: function() { 
	this.__init();
},
__init: function() {
	// TODO: Don't forget to call base constructor for object who herit from ShoObject
	this.__allowed_properties = new Array();
	this.__add_property('__class_name');
	this.__add_property('__id');
	this.__add_property('__notify');
	this.set('__notify', new Object());
	// Set object unique id
	this.set('__id', this.__genid.get('ShoObject'));
	this.genid++;
	// Setting log object
	if (!this.__static_obj['log']) {
		this.__static_obj['log'] = new ShoLog('ShoID_LOG');
		this.log('Setting log object');
	}
	this.set('__class_name', 'ShoObject');
	this.log({type: 'error', msg: "Create new ShoObject with id: " + this.get('__id')});
	// Add object to the list of object
	sho_object_shop_add(this);	
},
/* Remove object from the shop, but javascript OO don't have destructor... boring */
destruct: function() {
	GSHO_OBJSHOP[this.get('__id')] = null;
},

/* get static thing ... ugly one */
static_get: function (name) {
	return 	this.__static_obj[name];
},

/* Register property for this object */
__add_property: function(name) {
	this.__allowed_properties[name] = 1;
	this[name] = null;
},

/* Added with add_property? */
is_allowed_property: function(name) {
	if (this.__allowed_properties[name])
		return 1;
	return 0;
},

/* Which object want to be notified of event */
add_observer: function(obj, domID, event_name) {
	this.log("Add observer for domID: " + domID + ', event: ' + event_name);
	if (typeof obj == 'undefined') {
		this.log({type: 'error', msg: 'Cannot add observer without watcher object!'});
		return 0;
	}
	if (typeof this.get('__notify')[event_name] == 'undefined') {
		this.get('__notify')[event_name] = new Array();
	}
	for (i = 0; i <  this.get('__notify')[event_name].length; i++) {
		if (obj.id == this.get('__notify')[event_name][i].id) {
			this.log({type: 'error', msg: 'Event already registered'});
			return 0;
		}
	}
	this.get('__notify')[event_name].push(obj);
	return 1;
},

/* Notify dom element of event registered with add_observer */
notify: function(event_name) {
	var i = 0;
	for(i = 0; i < this.get('__notify')[event_name].length; i++) {
		if(!this.get('__notify')[event_name][i]) {
			continue;
		}
		this.log('notify object :' + this.get('__notify')[event_name][i].id);
		this.__queue_event(event_name, this.get('__notify')[event_name][i]);
	}
},

/* Queuing even */
__queue_event: function(event_name, obj) {
	var e = new Object();
	e.name = event_name;
	e.obj = obj;
	GSHO_QUEUE_EVENTS.push(e);
},

/* Easy access to ShoLog object */
log: function (args) {
	//return;
	if (!args) {
		alert("log need log argument");
		return;
	}
	args = this.static_get('log').extract_args(args);
	if (!args.msg) {
		alert("log need log argument args.msg");
		return;
	}
	var n = new Object();
	n.msg = this.get('__class_name') + ': ' +args.msg;
	if (args.type) {
		n.type = args.type;
	}
	this.__static_obj.log.m(n);
},

/* Get property value */
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

/* Set property value */
set:function(name, value) {
	if (!this.is_allowed_property(name)) {
		var msg = "[set] Invalid properties '"+name+"' \nobject["+this.get('_class_name')+"]";
		alert(msg);
		return 0;
	}
	this[name] = value;
	return 1;
},

}; // end of ShoObject