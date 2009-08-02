var ShoNode =  Class.create();
ShoNode.prototype = Object.extend(new ShoObject(), {
/* Constructor */
initialize: function(id) {
	this.__init();
	this.set('__class_name', 'ShoNode');
	this.__add_property('node_status');
	this.__add_property('node_id');
	this.__add_property('node_name');
	this.__add_property('node_type');
	this.__add_property('node_subtype');
	this.__add_property('children');
	this.set('children', new Array());
	this.set('node_id', id);
	this.set('node_status', 0);
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
	if (!res.status) {
		GSHO.log({type: 'error', msg: "load_data: invalid data!"});
		return 0;
	}
	this.set('node_id',   res.items[0].node_id);
	this.set('node_name', res.items[0].node_name);
	var mt = res.items[0].node_type.split(':');
	this.set('node_type', mt[0]);
	this.set('node_subtype', mt[1]);	
	for(i = 0; i < res.items[0].children.length; i++) {			
		if (typeof(res.items[0].children[i]['$ref']) == 'undefined') {
			continue;
		}
		this.get('children').push(res.items[0].children[i]['$ref']);
	}
	this.set_loaded();
	GSHO_NODES[res.items[0].node_id].notify('sho_update');
	return 1;
},

get_children: function() {
	return this.children;
},

load: function() {
	if (typeof this.get('node_id') == 'undefined') {
		this.log( {type: 'error', msg:'load, undefined id'} );
		return null;
	}
	if (this.is_loaded()) {
		this.log("Node with node_id: " + this.get('node_id') + 'already loaded.');
		this.notify('sho_update');
		return null
	}
	if (this.get('node_status') == 1) {
		this.log("Node with node_id: " + this.get('node_id') + ' is loading!');
		this.notify('sho_update');
		return null;
	}
	this.set('node_status', 1);
	new Ajax.Request(GSHO_URL_AJAX + this.get('node_id'), {
		method:'get',
		onSuccess: function(transport){
			var res = transport.responseText;
			if (!res) {
				GSHO.log({type: 'error', msg: "AJAX get id: " + this.get('node_null') + " empty response"});
				return false;
			}
			res = res.evalJSON();
			if (!res.status) {
				GSHO.log({type: 'error', msg: "ShoNode::Ajax request, false status!"});
				return false;
			}
			var node_id = res.items[0].node_id;
			GSHO_NODES[node_id].load_data(res);
		},
		onFailure: function(transport){ 
			GSHO.log({type: 'error', msg: "ShoNode::Ajax request, something went wrong...!"});
			alert('Something went wrong...');
		},
	});
	return 1;
},

});