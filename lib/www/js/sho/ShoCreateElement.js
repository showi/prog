var elmMethods = {
		sho_get_node_id: function(elm) {
	return $(elm).getAttribute('sho_node_id');
},
sho_get_dom_id: function(elm) {
	return $(elm).getAttribute('sho_node_id');
},
sho_elm_get_root: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_rootNode_' + elm.getAttribute('sho_node_id'); 
	return $(domID);
},
sho_elm_get_label: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_Label_' + elm.getAttribute('sho_node_id');
	return $(domID);
},
sho_elm_get_arrow: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_Arrow_' + elm.getAttribute('sho_node_id');
	return $(domID);
},
sho_elm_get_childs: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_Childs_' + elm.getAttribute('sho_node_id');
	return $(domID);
},

}; // End of elmMethods

// Adding methods to prototype Element (better to subclass Element to create ShoElement but ...)
Element.addMethods(elmMethods);

function ShoCreateElement_node(args) {
	if (!args.dom_id) {
		GSHO.log({type: 'error', msg: 'ShoCreateElement_node, Cannot create node Element without dom_id'});
		return null;
	}
	if (!args.node_id) {
		GSHO.log({type: 'error', msg: 'ShoCreateElement_node, Cannot create node Element without node_id'});
		return null;
	}
	var root = new Element('ul', {
		id: args.dom_id + '_rootNode_' + args.node_id, 
		class: 'rootNode'
	});
	root.setAttribute('sho_dom_id', args.dom_id);
	root.setAttribute('sho_node_id', args.node_id);
	var fLi = new Element('li', {
		"id": args.dom_id + '_firstLi_' + args.node_id,
		"class": 'firstLi',
	});

	/********* 
	 * ARROW *
	 *********/
	var arrow = new Element('img', {
		"id"      : args.dom_id + '_Arrow_' + args.node_id,
		"class"   : "Arrow",
		"src"     : "img/arrow_right.png",
		"sho_node_id" : args.node_id,
		"sho_dom_id"  : args.dom_id,
		//"sho_node_isloaded": false,
		"sho_isopen": false,
	});

	/************************** 
	 * ARROW sho_update event *
	 **************************/
	arrow.sho_update = function (p_elm) {
		var node_id = this.getAttribute('sho_node_id');
		if (!node_id) {
			GSHO.log({type: 'error', msg: 'arrow::sho_update: no node_id!: '});
			return 0;
		}
		var dom_id = this.getAttribute('sho_dom_id');
		if (!dom_id) {
			GSHO.log({type: 'error', msg: 'arrow::sho_update: no dom_id!: '});
			return 0;
		}
//		GSHO.log("[sho_update] Node update, dom_id: " + dom_id + ", node_id: " + node_id);
		var root_id = dom_id + '_rootNode_' + node_id;
		var rootElm = $(dom_id + '_rootNode_' + node_id); 
		if (!rootElm) {
			GSHO.log({type: 'error', msg: 'arrow::sho_update: No root element with id: ' + root_id});
			return 0;
		}
		rootElm.sho_elm_get_label().update(GSHO_NODES[node_id].node_name);
		var elmChilds = rootElm.sho_elm_get_childs();
		var i;
		for(i = 0; i < GSHO_NODES[node_id].children.length; i++) {
			var n = GSHO_NODES[node_id].children[i];
			// Check if this rootElm have this childs
			var newChildID = dom_id + '_rootNode_' + n.node_id;
			if ($(newChildID)) {
				if (GSHO_NODES[$(newChildID).getAttribute('node_id')]) {
					GSHO_NODES[$(newChildID).getAttribute('node_id')].notify('sho_update');
				}
				continue;
			} else {
				var childElm = ShoCreateElement_node({'dom_id': dom_id, 'node_id': n.node_id, 
					'node_name': n.node_name, 'node_type': n.node_type
				});
				childElm.style.visibility = 'visible';
				elmChilds.appendChild(childElm);
				
				if (GSHO_NODES[n.node_id]) {
					childElm.sho_elm_get_arrow().fire('sho_tree_node:click');
				}
			}
		}
		return 1;
	};

	/*********************** 
	 * ARROW onClick event *
	 ***********************/
	arrow.onclick = function() {
		this.fire('sho_tree_node:click');
	},
	arrow.observe('sho_tree_node:click', function (event) {
		var elm = $(Event.element(event));
		var node_id = $(elm).getAttribute('sho_node_id');		
		var dom_id = $(elm).getAttribute('sho_dom_id');
		var childsElm = elm.sho_elm_get_childs();
		if (childsElm) {
			var s = childsElm.style;
			GSHO.log("visibility: " + s.visibility);
			if (s.visibility == 'visible') {
				childsElm.hide();
				s.visibility = 'hidden';
				this.src = "img/arrow_right.png";
			} else {
				childsElm.show();
				s.visibility = 'visible';
				this.src = "img/arrow_down.png";
			}
			if (s.visibility == 'hidden') {
				return 1;
			}
		}
//		GSHO.log("Arrow click, domID: " + dom_id + ", node_id: " + node_id);
		// Check if global object exist
		if (typeof GSHO_NODES[node_id] == 'undefined') {
//			GSHO.log("Le node n'existe pas, on en crée un");
			GSHO_NODES[node_id] = new ShoNode(node_id);
		}
		// On ajoute des observateurs à l'objet
		GSHO_NODES[node_id].add_observer(elm, elm.id, 'sho_update');
		if (!GSHO_NODES[node_id].is_loaded()) {
			GSHO_NODES[node_id].load();
			return;
		}
		GSHO_NODES[node_id].notify('sho_update');
		return;
	}, false);

	/********* 
	 * LABEL *
	 *********/
	var label = new Element('div', {
		id: args.dom_id + '_Label_' + args.node_id,
		class: 'label',
		href: '#'
	}).update("Click To Load");
	if (args.node_name) {
		label.update(args.node_name + '([l])');
	}
	label.setAttribute('sho_dom_id', args.dom_id);
	label.setAttribute('sho_node_id', args.node_id);

	/************ 
	 * ULCHILDS *
	 ************/
	var ulChilds = new Element('ul', {
		id: args.dom_id + '_Childs_' + args.node_id,
		class: 'childs',
	});
	ulChilds.style.visibility = 'hidden';
	ulChilds.hide();
	/*Append element to root node */
	fLi.appendChild(arrow);
	fLi.appendChild(label);
	fLi.appendChild(ulChilds);
	root.appendChild(fLi);
	return $(root);
}	