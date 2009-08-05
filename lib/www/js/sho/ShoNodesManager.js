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

multi_load: function(tabid) {
	if (!isArray(tabid)) {
		this.log({f:'multi_load', t:'e', m:'parameter is not an array'});
		return undefined;
	}
	var okid = new Array();
	var len = tabid.length;
	var i;
	//this.log({f:'multi_load', t:'e', m:':)'});
	for(i = 0; i < len; i++) {
		var node = gshoNodesManager.get_node_by_id(tabid[i]);
		if (!node) {
			continue;
		}
		if (!node.node_id) {
			continue;
		}
		if (node.is_loaded()) {
			//this.log({f:'load', t:'i', m:"Node with node_id: " + this.get('node_id') + 'already loaded.'});
			node.notify('sho:refresh');
			continue;
		}
		if (node.get('node_status') == 1) {
			//this.log({f: 'load', t:'i', m:"Node with node_id: " + this.get('node_id') + ' is loading!'});
			node.notify('sho:refresh');
			continue;
		}
		okid.push(node);
		node.set('node_status', 1);
	}
	len = okid.length;
	var list = "";
	for(i = 0; i < len; i++) {
		list += okid[i].node_id;
		if ((i + 1) < len) {
			list += ',';
		}
	}
	if (!list) {
		this.log({f: 'multi_load', t:'i', m:"Invalid request"});
		return false;
	}
	GSHO_XHR.inc();
	new Ajax.Request(GSHO_URL_AJAX + list, {
		method:'get',
		onSuccess: function(transport){
			GSHO_XHR.dec();
			var res = transport.responseText;
			if (!res) {
				GSHO.log({f:'load:Ajax.Request', t:'e', m:"AJAX get empty response"});
				return false;
			}
			res = res.evalJSON();
			if (!res.status) {
				GSHO.log({f:'load:Ajax.Request', t:'e', m:"ShoNode::Ajax request, false status!"});
				return false;
			}
			var len = res.nodes.length;
			var i = 0;
			for(i = 0; i < len; i++) {
				var node_id = res.nodes[i].data.node_id;
				GSHO.log({f:'load:Ajax.Request', t:'w', m:"load node_id " + node_id});
				if (!node_id) {
					continue;
				}
				var node = gshoNodesManager.get_node_by_id(node_id);
				node.load_data(res.nodes[i]);
			}
			return false;
		},
		onFailure: function(transport){ 
			GSHO_XHR.dec();
			GSHO.log({f:'load:Ajax.Request', t:'e', m: "ShoNode::Ajax request, something went wrong...!"});
			alert('Something went wrong...');
			return false;
		}
	});
	return 1;
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
	if (!entry.__authorized) {
		return undefined;
	}
	if (!entry.__authorized[p.key]) {
		this.log({f: 'get_behavior', t: 'w', m: 'Invalid key: ' + p.key});
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
		node.add_observer(args.elm, args.elm.id, 'sho:refresh');
	}
	/*
	 * We need a loaded node
	 */
	if (!node.is_loaded()) { /* Not loaded so load it */
		node.__queue_event('sho:load', node);
	}
	/*
	 * Notify all registered observer that a sho_update happened
	 */
	node.notify('sho:refresh');
	return node;
}
}); // End of ShoNodesManager Class