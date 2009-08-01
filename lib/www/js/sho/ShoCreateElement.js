var elmMethods = new Object({
	sho_get_node_id: function(elm) {
		return $(elm).getAttribute('sho_node_id');
	
	},

sho_get_dom_id: function(elm) {
	return $(elm).getAttribute('sho_node_id');
},

sho_elm_get_root: function(p_elm) {
	var elm = $(p_elm);
	if (elm.getAttribute('sho_dom_id') && elm.getAttribute('sho_node_id')) {
		return elm;
	}
	var p = $(elm.ancestors()[0]); 
	if (p) {
		return p.sho_elm_get_root();
	}
	return null; 

//	var domID = elm.getAttribute('sho_dom_id') + '_rootNode_' + elm.getAttribute('sho_node_id'); 
//	return $(domID);
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
sho_elm_get_status_led: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_nodeStatusLed_' + elm.getAttribute('sho_node_id');
	return $(domID);
},

sho_elm_get_childs: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_Childs_' + elm.getAttribute('sho_node_id');
	return $(domID);
},

}); // End of elmMethods

//Adding methods to prototype Element (better to subclass Element to create ShoElement but ...)
Element.addMethods(elmMethods);


/*
 *  \brief Création d'un node de façon global et ajout d'observateur
 */
function ShoElement_create_gnode(args) {
	/*
	 * Checking paramaters
	 */
	if (!is_defined(args.node_id)) {
		GSHO.error({type: 'error', msg: 'ShoElement_create_gnode, no args.node_id!'});
		return null;
	}
	if (!is_defined(GSHO_NODES[args.node_id])) {
		GSHO_NODES[args.node_id] = new ShoNode(args.node_id);
	}
	/*
	 * Add calling element to global node observer's list
	 */
	GSHO_NODES[args.node_id].add_observer(args.elm, args.elm.id, 'sho_update');
	/*
	 * We need a loaded node
	 */
	if (!GSHO_NODES[args.node_id].is_loaded()) { /* Not loaded so load it */
		GSHO_NODES[args.node_id].__queue_event('load', GSHO_NODES[args.node_id]);
	}
	/*
	 * Notify all registered observer that a sho_update happened
	 */
	GSHO_NODES[args.node_id].notify('sho_update');
}


function ShoElement_tree_node_control(args) {
	if (!args.dom_id) {
		GSHO.log({type: 'error', msg: 'ShoCreateElement_node_control, Cannot create node Element without dom_id'});
		return null;
	}
	if (!args.node_id) {
		GSHO.log({type: 'error', msg: 'ShoCreateElement_node_control, Cannot create node Element without node_id'});
		return null;
	}	
	var root = new Element('div', {
		'id': args.dom_id + '_nodeControls_' + args.node_id,
		'class': 'nodeControls',
	});

	//root.setAttribute('sho_dom_id', args.dom_id);
	//root.setAttribute('sho_node_id', args.node_id);
	var edit = new Element('a', {
		'id': args.dom_id + '_nodeEdit_' + args.node_id,
		'class': 'nodeEdit',
		'href': '#',
	});
	var addElm = new Element('div', {});
	addElm.show();
	//addElm.absolutize();
	//addElm.update("######");
	//edit.appendChild(addElm);

	edit.observe('mouseover', function(event) {
		var elm = $(Event.element(event));
		var node_id = $(elm).getAttribute('sho_node_id');		
		var dom_id = $(elm).getAttribute('sho_dom_id');
		//GSHO.log("mouseover -> dom_id: " + dom_id + ", node_id: " + node_id);
		var off =  elm.cumulativeOffset();

	});
	var txt = "";
	var node = GSHO_NODES[args.node_id];
	if (is_defined(node) && node.is_loaded()) {
		txt = node.get('node_type') + '-' + node.get('node_subtype');
	} 
	var control = new Element('img', {
		'alt'  : txt,
		'href' : '#',
		'src'  : 'img/node_control_edit2.png',
		'id'   : args.dom_id + '_nodeControls_' + args.node_id,
		'class': 'nodeControls',
	});
	var status = new Element('img', {
		'alt'  : txt,
		'href' : '#',
		'src'  : 'img/node_empty_16x16.png',
		'id'   : args.dom_id + '_nodeStatusLed_' + args.node_id,
		'class': 'nodeStatusLed_unknow',
	});
	status.sho_update =  function(p_elm) {
		var elm = $(p_elm);
		if (!is_defined(elm)) {
			GSHO.log({'type': 'error', 'msg': 'Element:tree:status:sho_update, undefined elm'});
			return false;
		}
		var rootElm = elm.sho_elm_get_root();
		if (!is_defined(rootElm)) {
			GSHO.log({'type': 'error', 'msg': 'Element:tree:status:sho_update, undefined rootElm'});
			return false;
		}
		var node_id = rootElm.getAttribute('sho_node_id');
		if (!node_id) {
			GSHO.log({'type': 'error', 'msg': 'Element:tree:status:sho_update, undefined node_id'});
			return false;
		}
		var node = GSHO_NODES[node_id];
		if (!is_defined(node)) {
			GSHO.log({'type': 'error', 'msg': 'Element:tree:status:sho_update, no global node with node_id: ' + node_id});
			return false;
		}
		var s = node.get('node_status');
		if (s == 1) {
			elm.setClassName = 'nodeStatusLed_loading';
		} else if (s == 2) {
			elm.setClassName = 'nodeStatusLed_loaded';
		} else {
			elm.setClassName = 'nodeStatusLed_unknow';
		}
	}
	edit.appendChild(control);
	edit.appendChild(status);
	root.appendChild(edit);
	return $(root);
}


function ShoTree_update(p_elm) {
	var elm = $(p_elm);
	//GSHO.log("ShoTree_update: elm_id: " + elm.id);
	var rootElm = elm.sho_elm_get_root();
	if (!rootElm) {
		GSHO.log({type: 'error', msg: 'arrow::sho_update: Can\'t found root element!'});
		return 0;
	}
	var node_id = rootElm.getAttribute('sho_node_id');
	GSHO.log("ShoTree_update: node_id: " + node_id);
	if (!node_id) {
		GSHO.log({type: 'error', msg: 'arrow::sho_update: no node_id!'});
		return 0;
	}
	if (!GSHO_NODES[node_id]) {
		GSHO.log({type: 'error', msg: 'arrow::sho_update: no global node with id: ' + node_id});
		return 0;
	}
	var dom_id = rootElm.getAttribute('sho_dom_id');
	if (!dom_id) {
		GSHO.log({type: 'error', msg: 'arrow::sho_update: no dom_id!: '});
		return 0;
	}
	if (GSHO_NODES[node_id].is_loaded()) {
		rootElm.sho_elm_get_status_led().className = 'nodeStatusLed_loaded';
	} else if (GSHO_NODES[node_id].get('node_status') == 1) {
		rootElm.sho_elm_get_status_led().className = 'nodeStatusLed_loading';
		return 1;
	} else {		
		rootElm.sho_elm_get_status_led().className = 'nodeStatusLed_unknow';
		return 1;
	}
	rootElm.sho_elm_get_label().update(GSHO_NODES[node_id].node_name);
	var elmChilds = rootElm.sho_elm_get_childs();
	// Adding child
	GSHO_NODES[node_id].children.each(function (n, index) { 
		var newChildID = dom_id + '_rootNode_' + n.node_id;
		if ($(newChildID)) {
			var rootChild = $(newChildID).sho_elm_get_root();
			if (GSHO_NODES[rootChild.getAttribute('node_id')]) {
				GSHO_NODES[rootChild.getAttribute('node_id')].notify('sho_update');
			}
			return 1;
		} else {
			var childElm = ShoElement_tree_node({'dom_id': dom_id, 'node_id': n.node_id, 
				'node_name': n.node_name, 'node_type': n.node_type
			});
			childElm.style.visibility = 'visible';
			elmChilds.appendChild(childElm);
			if (GSHO_NODES[n.node_id]) {
				childElm.sho_elm_get_arrow().fire('sho_tree_node:click');
			}
		}
	}); // End each
	return 1;
}

function ShoElement_tree_node(args) {
	if (!args.dom_id) {
		GSHO.log({type: 'error', msg: 'ShoCreateElement_node, Cannot create node Element without dom_id'});
		return null;
	}
	if (!args.node_id) {
		GSHO.log({type: 'error', msg: 'ShoCreateElement_node, Cannot create node Element without node_id'});
		return null;
	}
	var root = new Element('ul', {
		'id': args.dom_id + '_rootNode_' + args.node_id, 
		'class': 'rootNode'
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
	var acont = new Element('a', {
		'href': '#', 
	});
	acont.addClassName("Arrow_Container");
	var arrow = new Element('img', {
		"id"      : args.dom_id + '_Arrow_' + args.node_id,
		"class"   : "nodeFolder_close",
		"src"     : "img/node_empty_16x16.png",
		"sho_node_id" : args.node_id,
		"sho_dom_id"  : args.dom_id,
		//"sho_node_isloaded": false,
		"sho_isopen": false,
	});
	/************************** 
	 * ARROW sho_update event *
	 **************************/
	arrow.sho_update = function(p_elm) {
		var elm = $(p_elm) || $(this);
		//alert('update')
		elm.fire('sho_tree_node:update' , elm);
		return false;
	};
	arrow.observe('sho_tree_node:update', function (event) {
		Event.stop(event);
		var elm = $(Event.element(event));
		//alert("Fire elm: " + elm.id);
		ShoTree_update(elm);
		return false;
	});

	/*********************** 
	 * ARROW onClick event *
	 ***********************/
	arrow.onclick = function() {
		this.fire('sho_tree_node:click');
		return false;
	},
	arrow.observe('sho_tree_node:click', function (event) {
		Event.stop(event);
		var elm = $(Event.element(event));
		var rootElm = elm.sho_elm_get_root();
		var node_id = rootElm.getAttribute('sho_node_id');		
		var dom_id = rootElm.getAttribute('sho_dom_id');
		var childsElm = elm.sho_elm_get_childs();
		var statusElm = elm.sho_elm_get_status_led();
		if (childsElm) {
			var s = childsElm.style;
			GSHO.log("visibility: " + s.visibility);
			if (s.visibility == 'visible') {
				childsElm.hide();
				s.visibility = 'hidden';
				this.className = 'nodeFolder_close';
				//this.src = "img/arrow_right.png";
			} else {
				childsElm.show();
				s.visibility = 'visible';
				//this.src = "img/arrow_down.png";
				this.className = 'nodeFolder_open';
			}
			if (s.visibility == 'hidden') {
				return 1;
			}
		}
		ShoElement_create_gnode({'dom_id': dom_id, 'node_id': node_id, 'elm': elm});
		if (statusElm) {
			var node_status = GSHO_NODES[node_id].get('node_status');
			if (node_status == 1){	
				statusElm.className = "nodeStatusLed_loading";
			} else if (node_status >= 2) {
				statusElm.className = "nodeStatusLed_loaded";
			} else {
				statusElm.classNAme = "nodeStatusLed_unknow";
			}
			//GSHO_NODES[node_id].notify('sho_update');
		}
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
		label.update(args.node_name);
	}
//	label.setAttribute('sho_dom_id', args.dom_id);
//	label.setAttribute('sho_node_id', args.node_id);

	var nodeControl = ShoElement_tree_node_control(args);
	/************ 
	 * ULCHILDS *
	 ************/
	var ulChilds = new Element('ul', {
		id: args.dom_id + '_Childs_' + args.node_id,
		class: 'childs',
	});
	ulChilds.style.visibility = 'hidden';
	ulChilds.hide();
	acont.appendChild(arrow);
	/*Append element to root node */
	fLi.appendChild(acont);
	fLi.appendChild(label);
	fLi.appendChild(nodeControl);
	fLi.appendChild(ulChilds);
	root.appendChild(fLi);
	return $(root);
}	

function ShoElement_multree(args) {
	var elm = new Element('div', {
		'id': args.dom_id + '_Multree_' + args.node_id,
		'class': 'Multree',
	});
	elm.setAttribute('sho_node_id', args.node_id);
	elm.setAttribute('sho_dom_id', args.dom_id);
	elm.update("MULTREEE");
	elm.sho_update = function (p_elm) {
		var elm = $(p_elm);
		var rootElm = elm.sho_elm_get_root();
		var node_id = rootElm.getAttribute('sho_node_id');
		var dom_id = rootElm.getAttribute('sho_dom_id');
		//alert("Update multree");
		ShoElement_create_gnode({'dom_id': dom_id, 'node_id': node_id, 'elm': elm});
	}
	elm.observe('sho:update', function(event) {
		 Event.stop(event);
	});
	return elm;
}

function gsho_elementCreate(name, args) {
	if (name == 'tree_node') {
		return ShoElement_tree_node(args);
	} else if (name = 'multree') {
		return ShoElement_multree(args);
	}
	else {
		GSHO.log({type: 'error', msg: 'gsho_elementCreate, invalid name: ' + name})
		return null;
	}
}