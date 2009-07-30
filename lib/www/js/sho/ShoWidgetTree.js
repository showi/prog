var ShoElement =  Class.create();
ShoElement.prototype = Object.extend(new ShoObject(), {
	/* Constructor */
	initialize: function(name, params) {
	this.set('__class_name', 'ShoElement');
	$super(name, params);
},
});
//Object.extend(ShowElement, new Element());

var ShoWidgetTree =  Class.create();
ShoWidgetTree.prototype = Object.extend(new ShoObject(), {

	/* Constructor */
	initialize: function(id) {	
	this.set('__class_name', 'ShoWidgetTree');
	//this.log("Creating new tree with root id: " + id)
	this.__add_property('root_id');
	this.set('root_id', id);
},


build: function(elmID, domBaseID, nodeID) {
	var domID = domBaseID + nodeID;
	//this.log('elmID: ' + elmID + ', build: domBaseID= ' + domBaseID + ', nodeID= ' + nodeID + ', domID: ' + domID);
	if (typeof domID == undefined) {
		this.log({type: 'error', msg: "Cannot build tree without valid domID"});
		return null;
	}
	var elm = $(elmID);
	if (!elm) {
		this.log({type: 'error', msg: "Cannot found dom element with id '"+domID+"'"});
		return null;
	}
	if (!GSHO_NODES[nodeID] ) {
		GSHO_NODES[nodeID] = new ShoNode(nodeID);
	}
	var ul = new Element('ul', {class: 'ShoNode'});
	ul.appendChild(
		GSHO_NODES[nodeID].getElement(domBaseID, nodeID)
	);
	elm.appendChild(ul);
	return elm;
//	var ul = new Element('ul', { 'class': 'ShoNode'});
//
//	var nodeRoot = new Element('li', {id: domID, 'class': 'ShoNode_Name'}).update("Not loaded");
//	ul.appendChild(nodeRoot);
//	elm.appendChild(ul);
//
//	// Event onclick
//	//var nodeRootMethods = {
//		nodeRoot.onclick = function() {
//			nodesManager.load(nodeRoot, domBaseID, nodeID);
//			//GSHO.log('----- onCLICK');
//			//alert('Click ' + this.innerHTML);
//		};
//		nodeRoot.shochange =  function() {
//			//GSHO.log("onchange, notify domID: " + domID + ', nodeID: ' + nodeID);
//			if (!GSHO_NODES[nodeID].get('node_name')) {
//				return;
//			}
//			//GSHO.log("This: " + nodeRoot.id);
//			nodeRoot.innerHTML = GSHO_NODES[nodeID].get('node_name') + '(' + GSHO_NODES[nodeID].get('node_type') + ')';
//			var tUL = nodeRoot.getElementsByTagName('ul');
//			if (tUL.length < 1) {
//				//GSHO.log("Adding child["+GSHO_NODES[nodeID].children.length+"]");
//				var i = 0;
//				for(i = 0; i < GSHO_NODES[nodeID].children.length; i++) {
//					//GSHO.log({type: 'error', msg: "Add child id: " + GSHO_NODES[nodeID].children[i]});
//					var wt = new ShoWidgetTree(GSHO_NODES[nodeID].children[i]);
//					wt.build(domID, domBaseID, GSHO_NODES[nodeID].children[i]);
//					//this.build(domID + '_ShoNodeID_' + nodeID, GSHO_NODES[nodeID].children[i]);
//				}
//			} else {
//				GSHO.log("TODO: TEST CHILDREN FOR UPDATE(delete, add)");
//			}
//		};
////	};
	//nodeRoot.addMethods(nodeRootMethods);
},	
});
