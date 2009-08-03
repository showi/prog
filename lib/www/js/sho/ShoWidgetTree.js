var ShoElement =  Class.create();
ShoElement.prototype = Object.extend(new ShoObject(), {
	/* Constructor */
	initialize: function(name, params) {
	this.set('__class_name', 'ShoElement');
	$super(name, params);
}
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
}	
});
