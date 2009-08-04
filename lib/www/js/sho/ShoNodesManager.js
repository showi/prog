var ShoNodesManager =  Class.create();
ShoNodesManager.prototype = Object.extend(new ShoObject(), {
/***************
 * Constructor *
 ***************/
initialize: function() {
	this.__init();
	this.__add_property('nodeStore');
	this.__add_property('autoStore');
	this.__add_property('nodeBehavior');
	this.set('nodeStore', new Array());
	this.set('autoStore', new Object());
	this.set('nodeBehavior', new Object());
	this.set('__class_name', 'ShoNodesManager');
},

/***************
 * get_node_by_id *
 ***************/
get_node_by_id: function (id) {
	if (!id) {
		this.log({f: 'get_node_by_id', t: 'w', m: 'Cannot get node without id'});
		return undefined;
	}
	var node = this.get('nodeStore')[id];
	if (!isObject(node)) {
		//this.log({f: 'get_node_by_id', t: 'e', m: 'No node in store with id: ' + id});
		return undefined;
	}
	return node;
},

/******************
 * __add_behavior *
 ******************/
__add_behavior: function(entry, p) {
	if (!entry) {
		this.log({f: '__add_behavior', t: 'e', m: 'No entry!' });
		return false;
	}
	if (!p.key) {
		return false;
	}
	if (!entry.__authorized) {
		entry.__authorized = new Array();
	}
	this.log({f: 'add_behavior', t: 'w', m: "Add " + p.node_type + ':' + p.node_subtype + ', key: ' + p.key});
	this.log({f: 'add_behavior', t: 'i', m: 'Value: '  + p.value});
	entry.__authorized[p.key] = 1;
	entry[p.key] = p.value;
	return true;
},

/****************
 * add_behavior *
 ****************/
add_behavior: function (p) {
	if (!p) {
		this.log({f: 'add_behavior', t: 'e', m: 'No argument!' });
		return false;
	}
	if (!p.node_type && !p.node_subtype) {
		this.log({f: 'add_behavior', t: 'e', m: 'Bad arguments!' });
		return false;
	}
	if (!isArray(this.nodeBehavior[p.node_type])) {
		this.nodeBehavior[p.node_type] = new Array();
	}
	if (!p.node_subtype) {
		return this.__add_behavior(this.nodeBehavior[p.node_type], p);	
	}
	if (!isArray(this.nodeBehavior[p.node_type][p.node_subtype])) {
		this.nodeBehavior[p.node_type][p.node_subtype] = new Array();
	}
	return this.__add_behavior(this.nodeBehavior[p.node_type][p.node_subtype], p);
},

get_behavior: function(p) {
	if (!p.node_type && !p.key) {
		this.log({f: 'get_behavior', t: 'e', m: 'Need node_type and key as parameter' });
		return undefined;
	}
	var entry = this.nodeBehavior[p.node_type];
	if (!entry) {
		return undefined;
	}
	if (p.node_subtype) {
		entry = this.nodeBehavior[p.node_type][p.node_subtype];
	}
	if (!entry) {
		return undefined;
	}
	this.log({f: 'get_behavior', t: 'w', m: 'get_behavior('+p.node_type+', '+p.node_subtype+'): ' + p.key });
	if (!entry.__authorized) {
		return undefined;
	}
	if (!entry.__authorized[p.key]) {
		this.log({f: 'get_behavior', t: 'e', m: 'Invalid key: ' + p.key});
		return undefined;
	}
	if (entry[p.key]) {
		return entry[p.key];
	}
	return undefined;
},

is_autoloaded: function(p) {
	if (!p.node_type) {
		this.log({f: 'is_autoloaded', t: 'e', m: 'Need node_type as parameter' });
		return false;
	}
	p.key = 'autoload';
	return this.get_behavior(p); 
},

add_node: function(args) {
	/*
	 * Checking paramaters
	 */
	if (isUndefined(args.node_id)) {
		this.log({f: 'add_node', t: 'e', m: 'ShoElement_create_gnode, no args.node_id!'});
		return undefined;
	}
//	if (isUndefined(args.elm)) {
//		this.log({f: 'add_node', t: 'w', m: 'ShoElement_create_gnode, no args.elm! ... install event by yourself'});
//		return undefined;
//	}
	var node = this.get_node_by_id(args.node_id); 
	if (!node) {
		this.log({f: 'add_node', t:'i', m:'node with node_id: ' + args.node_id + ' created'});
		this.get('nodeStore')[args.node_id] = new ShoNode(args.node_id);
		node = this.get_node_by_id(args.node_id);
	}
	/*
	 * Add calling element to global node observer's list
	 */
	if (isObject(args.elm)) {
		node.add_observer(args.elm, args.elm.id, 'sho_update');
	}
	/*
	 * We need a loaded node
	 */
	if (!node.is_loaded()) { /* Not loaded so load it */
		node.__queue_event('load', node);
	}
	/*
	 * Notify all registered observer that a sho_update happened
	 */
	node.notify('sho_update');
	return node;
}
}); // End of ShoNodesManager Class