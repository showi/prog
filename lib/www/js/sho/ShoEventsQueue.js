var ShoEvent = Class.create();
ShoEvent.prototype = Object.extend(new ShoObject(), {
	/***************
	 * Constructor *
	 ***************/
	initialize: function() {
	this.__init('ShoEvent');
	//this.set('__class_name', 'ShoEvent');
	this.__add_property('name');
	this.__add_property('args');
	this.__add_property('target');
},	

is_valid_name: function(p_name) {
	var name = this.get('name');
	if (p_name) {
		name = p_name;
	}
	var n = this.frag_name(this.name);
	if (!n) {
		return false;
	}
	var regName = /^sho:(onclick|refresh|load)$/;
	if (name.match(regName)) {
		return true;
	}
	return false;
},

is_valid: function () {
	if (!this.is_valid_name()) {
		this.log({f: 'is_valid', t: 'w', m:'Invalid name:! ' + this.get('name')});
		return false;
	}
	var n = this.frag_name(this.name);
	if (!isObject(this.target)) {
		this.log({f: 'is_valid', t: 'w', m:'Invalid target!'});
		return false;
	} else if (!isFunction(this.target[n.func])) {
		this.log({f: 'is_valid', t: 'w', m:'Invalid function!'});
		return false;
	}
	return true;
},

frag_name: function(name) {
	var f = name.split(':');
	if (!f[1]) {
		this.log({f: 'frag_name', t: 'w', m:'Invalid event name ' + this.get('name')});
		return undefined;
	}
	var e = new Object();
	e.cat = f[0];
	e.func = f[1];
	return e;
},

get_function: function () {
	if (!this.is_valid()) {
		this.log({f: 'get function', t: 'w', m:'Cannot get function without valid event ' + this.get('name')});
		return false;
	}		
	var n = this.frag_name(this.name);
	return this.target[n.func];
}


}); // End of ShoEvent

var ShoEventsQueue =  Class.create();
ShoEventsQueue.prototype = Object.extend(new ShoObject(), {
	/***************
	 * Constructor *
	 ***************/
	initialize: function() {
	this.__init();
	this.set('__class_name', 'ShoEventsQueue');
	this.__add_property('queues');
	this.set_('queue', new Object());
},

queue_exist: function(name) {
	if (isArray(this.get('queues')[name]))  {
		return 1;
	}
	return 0;
},

add_queue: function(name) {
	if (!name) {
		this.log({f: 'add_queue', t: 'e', m:'Cannot add queue without name'});
		return 0;
	}
	if (this.queue_exist(name))  {
		this.log({f: 'add_queue', t: 'w', m:'Queue named '+name+' already exist!'});
		return 0;
	}
	this.get('queues')[name] = new Array();
	return 1;
},


push: function(qname, event) {
	if (!qname) {
		this.log({f: 'push', t: 'e', m: 'Cannot push without queue name parameter'});
		return 0;
	}
	if (!this.queue_exist(qname)) {
		this.log({f: 'push', t: 'e', m: 'Queue named ' + qname + ' doesn\'t exist'});
		return 0;
	}
	if (!event) {
		this.log({f: 'push', t: 'e', m: 'Cannot push without event parameter'});
		return 0;		
	}
	if (!event.is_valid()) {
		this.log({f: 'push', t: 'e', m: 'Invalid event'});
		return 0;		
	}
	this.get('queues').push(event);
	return 1;
}

}); // End of ShoEventsQueue