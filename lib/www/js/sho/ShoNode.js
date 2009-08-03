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

to_string: function() {
	var str = 'node_id     : ' + this.get('node_id') + "\n" +
	       'node_name   : ' + this.get('node_name') + "\n" +
	       'node_type   : ' + this.get('node_type') + "\n"+
	       'node_subtype: ' + this.get('node_subtype') + "\n" +
	       'node_status : ' + this.get('node_status') + "\n";
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
	if (!res.status) {
		GSHO.log({f: 'load_data', t: 'e', m: "load_data: invalid data!"});
		return 0;
	}
	this.set('node_id',   res.items[0].node_id);
	this.set('node_name', res.items[0].node_name);
	//var mt = res.items[0].node_type.split(':');
	var mt = ShoFunc_node_type_frag(res.items[0].node_type);
	this.set('node_type', mt.node_type);
	this.set('node_subtype', mt.node_subtype);
	//this.log('load_data, node_type: ' + this.get('node_type'));
	if (this.get('node_type') == 'people' && this.get('node_subtype') == 'entry') {
		var node = gshoNodesManager.getNodeById(res.items[0].node_id);;
		node.viewLabel = function () {
			return '<a href="#" onclick="return false;">'+ node.node_name +'</a>';
		};
	} else if (this.get('node_type') == 'url') {
		var node = gshoNodesManager.getNodeById(res.items[0].node_id);
		if ( this.get('node_subtype') == 'wikipedia') {
			var aElm = new Element('a', {
				
				onload: function() {
					alert("loaded");
					return false;
				}
			});
			aElm.src = aElm.src;
			node.viewLabel = function () {
				return '<a href="#" onclick="return false;">'+ node.node_name +'</a>';
			};
		}
	}
	for(i = 0; i < res.items[0].children.length; i++) {			
		if (isUndefined(res.items[0].children[i]['$ref'])) {
			continue;
		}
		this.get('children').push(res.items[0].children[i]['$ref']);
	}
	this.log({f: 'load_data', t:'i', m: 'Data for node_id: ' + res.items[0].node_id + ' is ready!'});
	this.set_loaded();
	gshoNodesManager.getNodeById(res.items[0].node_id).notify('sho_update');
	return 1;
},

get_children: function() {
	return this.children;
},

load: function() {
	var node_id = this.get('node_id');
	if (!node_id) {
		this.log({f:'load', t:'e', m:'Cannot load node without node_id'});
		return undefined;
	}
	if (this.is_loaded()) {
		this.log({f:'load', t:'i', m:"Node with node_id: " + this.get('node_id') + 'already loaded.'});
		this.notify('sho_update');
		return undefined;
	}
	if (this.get('node_status') == 1) {
		this.log({f: 'load', t:'i', m:"Node with node_id: " + this.get('node_id') + ' is loading!'});
		this.notify('sho_update');
		return undefined;
	}
	this.set('node_status', 1);
	//ShoFunc_xhr_inc();
	new Ajax.Request(GSHO_URL_AJAX + this.get('node_id'), {
		method:'get',
		onSuccess: function(transport){
			ShoFunc_xhr_dec();
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
			var node_id = res.items[0].node_id;
			var node = gshoNodesManager.getNodeById(node_id);
			node.load_data(res);
			return false;
		},
		onFailure: function(transport){ 
			ShoFunc_xhr_dec();
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