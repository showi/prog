var ShoNode =  Class.create();
ShoNode.prototype = Object.extend(new ShoObject(), {
/* Constructor */
initialize: function(id) {
	this.__init('ShoNode');
	//this.set('__class_name', 'ShoNode');
	this.__add_property('node_status');
	this.__add_property('node_id');
	this.__add_property('node_parent_id');
	this.__add_property('node_name');
	this.__add_property('node_type');
	this.__add_property('node_subtype');
	this.__add_property('children');
	this.set('children', new Array());
	this.set('node_id', id);
	this.set('node_status', 0);
},

to_string: function() {
	var str = 'node_id       : ' + this.get('node_id') + "\n" +
	          'node_name     : ' + this.get('node_name') + "\n" +
	          'node_type     : ' + this.get('node_type') + "\n"+
	          'node_subtype  : ' + this.get('node_subtype') + "\n" +
	          'node_parent_id: ' + this.get('node_parent_id') + "\n" +
	          'node_status   : ' + this.get('node_status') + "\n";
	return str;
},

set_loaded: function() {
	this.set('node_status', 2);
},


is_loaded: function() {
	if (this.get('node_status') >= 2) {
		return 1;
	}
	return 0;
},


load_data: function(res) {
	if (!res) {
		GSHO.log({f: 'load_data', t: 'e', m: "load_data: no data!"});
		return 0;
	}
	if (!res.data) {
		GSHO.log({f: 'load_data', t: 'e', m: "load_data: no res.data!"});
		return 0;
	}
	if (!res.data.node_id) {
		GSHO.log({f: 'load_data', t: 'e', m: "load_data: no res.data.node_id"});
		return 0;
	}
	this.set('node_id',   res.data.node_id);
	this.set('node_name', res.data.node_name);
	this.set('node_parent_id', res.data.node_parent_id);
	var mt = ShoFunc_node_type_frag(res.data.node_type);
	this.set('node_type', mt.node_type);
	this.set('node_subtype', mt.node_subtype);
	for(i = 0; i < res.childs.length; i++) {			
		if (isUndefined(res.childs[i]['node_id'])) {
			continue;
		}
		this.get('children').push(res.childs[i], res.childs[i]);
	}
	this.set_loaded();
	gshoNodesManager.get_node_by_id(res.data.node_id).notify('sho:refresh');
	return 1;
},

get_children: function() {
	return this.children;
},

get_behavior: function (p) {
	if (!p) {
		this.log({f:'get_behavior', t:'e', m:'No parameter'});
		return undefined;
	}
	if (!p.key) {
		this.log({f:'get_behavior', t:'e', m:'No parameter.key'});
		return undefined;
	}
	return gshoNodesManager.get_behavior({node_type: this.node_type, node_subtype: this.node_subtype, key: p.key});
},

load: function() {
	var node_id = this.get('node_id');
	if (!node_id) {
		this.log({f:'load', t:'e', m:'Cannot load node without node_id'});
		return undefined;
	}
	if (this.is_loaded()) {
		//this.log({f:'load', t:'i', m:"Node with node_id: " + this.get('node_id') + 'already loaded.'});
		this.notify('sho:refresh');
		return undefined;
	}
	if (this.get('node_status') == 1) {
		//this.log({f: 'load', t:'i', m:"Node with node_id: " + this.get('node_id') + ' is loading!'});
		this.notify('sho:refresh');
		return undefined;
	}
	this.set('node_status', 1);
	GSHO_XHR.inc();
	new Ajax.Request(GSHO_URL_AJAX + node_id, {
		method:'get',
		onSuccess: function(transport){
			GSHO_XHR.dec();
			var res = transport.responseText;
			if (!res) {
				GSHO.log({f:'load:Ajax.Request', t:'e', m:"AJAX get id: " + this.get('node_null') + " empty response"});
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

viewLabel: function() {
	return this.node_name;
	
}

});