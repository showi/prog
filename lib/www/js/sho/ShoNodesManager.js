var ShoNodesManager =  Class.create();
ShoNodesManager.prototype = Object.extend(new ShoObject(), {
/***************
 * Constructor *
 ***************/
initialize: function() {
	this.__init();
	this.__add_property('nodeStore');
	this.__add_property('autoStore');
	this.set('nodeStore', new Array());
	this.set('autoStore', new Object());
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

/**********
 * create *
 **********/
//create: function(data) {
//	if (!is_defined(data)) {
//		this.log({f: 'create', t: 'e', m: 'create, cannot create node without data'});
//		return undefined;
//	}
//	if (!data.node_id) {
//		this.log({f: 'create',  t: 'e', m: 'create, cannot create node witout data.node_id'});
//		return undefined;
//	}
//	if (!data.node_type) {
//		this.log({f: 'create', t: 'e', m: 'create, cannot create node witout data.node_type'});
//		return null;
//	}
//	var node = undefined;
//	if (data.node_type == 'people:entry') {
//		alert("node type");
//	} else {
//		node = new ShoNode(data.node_id);
//	}
//	return node;
//},

add_autoloaded: function (p) {
	if (!p.type && !p.subtype) {
		this.log({f: 'add_autoloaded', t: 'e', m: 'Bad arguments!' });
		return false;
	}
	if (!isArray(this.autoStore[type])) {
		this.autoStore[type] = new Array();
	}
	if (!subtype) {
		this.autoStore[type].autoload = true;
		this.autoStore[type][subtype].func = p.func;
		return true;
	}
	if (!isArray(this.autoStore[type][subtype])) {
		this.autoStore[type][subtype] = new Array();
	}
	this.autoStore[type][subtype].autoload = true;
	this.autoStore[type][subtype].func = p.func;
	return true;
},

is_autoloaded: function(p) {
	if (!p.node_type && !p.node_subtype) {
		this.log({f: 'is_autoloaded', t: 'e', m: 'Need node_type and node_subtype as parameter' });
		assert(p.node_type);
	}
	if (p.node_type == 'deep' && p.node_subtype == 'test') {
		return true;
	}
	if (p.node_type == 'people' && p.node_subtype == 'entry') {
		return true;
	}
	//people:entry
	return false;
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
		//this.log({f: 'add_node', t: 'i', m: 'ShoElement_create_gnode, create global node,  node_id: ' + args.node_id});
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
	this.log({f: 'add_node', t:'i', m:'node with node_id: ' + args.node_id + ' created'});
	/*
	 * Notify all registered observer that a sho_update happened
	 */
	node.notify('sho_update');
	return node;
}
}); // End of ShoNodesManager Class