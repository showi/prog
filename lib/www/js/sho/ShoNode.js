var ShoNode =  Class.create();
ShoNode.prototype = Object.extend(new ShoObject(), {
/* Constructor */
initialize: function(id) {
	this.set('__class_name', 'ShoNode');
	this.__add_property('node_status');
	this.__add_property('node_id');
	this.__add_property('node_name');
	this.__add_property('node_type');
	this.__add_property('children');
	this.set('children', new Array());
	this.set('node_id', id);
	this.set('node_status', 0);
},

getElement: function (domBaseID, nodeID) {
	var domID = domBaseID +  nodeID;
	var nodeRoot = new Element('li', {id: domID, 'class': 'ShoNode_Name'}).update("Not loaded");
	nodeRoot.onclick = function() {
		nodesManager.load(nodeRoot, domBaseID, nodeID);
		return false;
	};
	nodeRoot.shochange =  function() {
		GSHO.log("----- Notify[onChange] objID: " + nodeRoot.id + ", nodeID: " + nodeID);
		if (!GSHO_NODES[nodeID].get('node_name')) {
			return false;
		}
		var tUL = nodeRoot.getElementsByTagName('ul');
		if (tUL.length < 1) {
			var label = new Element('div', { id: domBaseID + '_Label' + nodeID, class: "ShoNode_Label"});
			var expand = new Element('div', { id: domBaseID + '_LabelExpand' + nodeID, class: "ShoNode_LabelExpand"});
			expand.innerHTML = '<a href="#">+</a>';
			expand.onclick = function () {
				nodeRoot.select('ul').invoke('toggle'); //.select('ul')[0].toggle();
			}
			var text = new Element('div', { id: domBaseID + '_LabelExpandText' + nodeID, class: "ShoNode_LabelText"});
			text.textContent = GSHO_NODES[nodeID].get('node_name') + ' (' + GSHO_NODES[nodeID].get('node_type') + ')';
			label.appendChild(expand);
			label.appendChild(text);
			nodeRoot.textContent = '';
			nodeRoot.appendChild(label);
			var ul = new Element("ul");
			nodeRoot.appendChild(ul);
			var i = 0;
			for(i = 0; i < GSHO_NODES[nodeID].children.length; i++) {
				var child = GSHO_NODES[nodeID].children[i];
				if (!is_array(child)) {
					return false;
				}
				var node_id = child.get('node_id');
				GSHO.log('Add child id ' + node_id);
				if (!GSHO_NODES[node_id]) {
					GSHO_NODES[node_id] = new ShoNode(node_id);
					GSHO_NODES[node_id].set('node_id', node_id);
					GSHO_NODES[node_id].set('node_type', child.get('node_type'));
					GSHO_NODES[node_id].set('node_name', child.get('node_name'));
				}
				var newElm = GSHO_NODES[child].getElement(domBaseID, child);
				ul.appendChild(newElm);
				GSHO_NODES[node_id].add_observer(newElm);
				GSHO_NODES[node_id].notify('shochange');
			}
		} else {
			GSHO.log("TODO: TEST CHILDREN FOR UPDATE(delete, add)");
			var aLi = tUL.getElementsBySelector('li');
			if (aLi.length > 0) {
				var i = 0;
				for (i = 0; i < aLi.length; i++) {
					aLi[i].getElementsByClassName('ShoNode_Label').innerHTML = GSHO_NODES[nodeID];
				}

			}
		}
		return false;
	};
	return nodeRoot;
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
	GSHO.log("status: " + res.status);
	if (!res.status) {
		GSHO.log("invalid data!");
		return 0;
	}
	this.set('node_id',   res.items[0].node_id);
	this.set('node_name', res.items[0].node_name);
	this.set('node_type', res.items[0].node_type);
	for(i = 0; i < res.items[0].children.length; i++) {			
		if (typeof(res.items[0].children[i]['$ref']) == 'undefined') {
			continue;
		}
		this.log("Children :" +  res.items[0].children[i]['$ref'].node_id);
		this.get('children').push(res.items[0].children[i]['$ref']);
	}
	this.set_loaded();
	GSHO_NODES[res.items[0].node_id].notify('shochange');
	return 1;
},

load: function() {
	if (typeof this.get('node_id') == 'undefined') {
		this.log( {type: 'error', msg:'load, undefined id'} );
		return null;
	}
	if (this.is_loaded()) {
		this.log("Node with node_id: " + this.get('node_id') + 'already loaded.');
	}
	if (this.get('node_status') == 1) {
		this.log("Node with node_id: " + this.get('node_id') + ' is loading!');
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
		GSHO.log("status: " +res.status);
		if (!res.status) {
			GSHO.log("Status is false");
			return false;
		}
		var node_id = res.items[0].node_id;
		GSHO.log('Result node_id: ' + node_id);
		GSHO_NODES[node_id].load_data(res);
	},
	onFailure: function(){ alert('Something went wrong...') }
	});
	return 1;
},

toHTM: function() {
	var str = '' +
	'<div>' +  
	'<table>' +  
	'<tr>' + 
	'<td>' +
	'node_id'+ this.get('node_id') + 
	'node_type'+ this.get('node_type') +
	'node_name'+ this.get('node_name') +
	'</td>' +  
	'<td><div id="ShoNodesChildsOf_"'+ this.get('node_id') +'>' + Childs+ '</div></td>' +
	'</tr>' +
	'</table>' +
	'</div>';
	return str;
},
});