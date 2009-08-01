var ShoNodesManager =  Class.create();
ShoNodesManager.prototype = Object.extend(new ShoObject(), {

initialize: function() {
	this.__init();
	this.set('__class_name', 'ShoNodesManager');
},

load: function(obj, domBaseID, nodeID) {
	var domID = domBaseID + nodeID;
	if (!obj) {
		this.log("No obj, adomID: " + domID);
		return null;
	}
	if (typeof nodeID == 'undefined') {
		this.log( {type: 'error', msg:'load, undefined id'} );
		return null;
	}
	if (typeof GSHO_NODES[nodeID] == 'undefined') {
		this.log("Create node id: " + nodeID + ' , obj ID: ' + obj.id + ' , domID: ' + domID + ', domeBaseID: ' + domBaseID);
		GSHO_NODES[nodeID] = new ShoNode(nodeID);
	}
	if (GSHO_NODES[nodeID].is_loaded()) {
		this.log("Node with id '"+nodeID+"' is already loaded!");
		return null;
	}
	GSHO_NODES[nodeID].add_observer(obj, obj.id, "sho_update");
	return GSHO_NODES[nodeID].load();
},

}); // End of ShoNodesManager Class