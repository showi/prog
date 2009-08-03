/**********************************************
 * Methods to extend prototype Element object *
 **********************************************/
var elmMethods = new Object({
	/*******************
	 * sho_get_node_id *
	 *******************/
	sho_get_node_id: 
		function(elm) {
	return $(elm).getAttribute('sho_node_id');
},

/******************
 * sho_get_dom_id *
 ******************/
sho_get_dom_id: function(elm) {
	return $(elm).getAttribute('sho_node_id');
},

/********************
 * sho_elm_get_root *
 ********************/
sho_elm_get_root: function(p_elm) {
	var elm = $(p_elm);
	if (elm.getAttribute('sho_dom_id') && elm.getAttribute('sho_node_id')) {
		return elm;
	}
	var p = $(elm.ancestors()[0]); 
	if (p) {
		return p.sho_elm_get_root();
	}
	return undefined; 
},

/*********************
 * sho_elm_get_label *
 *********************/
sho_elm_get_label: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_Label_' + elm.getAttribute('sho_node_id');
	return $(domID);
},

/***********************
 * sho_elm_get_node_id *
 ***********************/
sho_elm_get_arrow: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_Arrow_' + elm.getAttribute('sho_node_id');
	return $(domID);
},

/**************************
 * sho_elm_get_status_led *
 **************************/
sho_elm_get_status_led: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_nodeStatusLed_' + elm.getAttribute('sho_node_id');
	return $(domID);
},

/**********************
 * sho_elm_get_childs *
 **********************/
sho_elm_get_childs: function(p_elm) {
	var elm = $(p_elm);
	var domID = elm.getAttribute('sho_dom_id') + '_Childs_' + elm.getAttribute('sho_node_id');
	return $(domID);
}

}); // End of elmMethods


/*************************************************************************************************
 * Adding methods to prototype Element (better to subclass Element to create ShoElement but ...) *
 * ***********************************************************************************************/
Element.addMethods(elmMethods);

/********************************
 * ShoElement_tree_node_control *
 ********************************/
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
		'class': 'nodeControls'
	});

	//root.setAttribute('sho_dom_id', args.dom_id);
	//root.setAttribute('sho_node_id', args.node_id);
	var edit = new Element('div', {
		'id': args.dom_id + '_nodeEdit_' + args.node_id,
		'class': 'nodeEdit',
		'href': '#',
		'style': 'display: inline'
	});
	edit.onclick = ShoFunc_empty();
	var txt = "";
	var addElm = new Element('div', {});
	addElm.show();

	var node = gshoNodesManager.get_node_by_id(args.node_id);
	if (isDefined(node) && node.is_loaded()) {
		txt = node.get('node_type') + '-' + node.get('node_subtype');
	} 
	var control = new Element('img', {
		'alt'  : txt,
		'href' : '#',
		'src'  : 'img/node_control_edit2.png',
		'id'   : args.dom_id + '_nodeControls_' + args.node_id,
		'class': 'nodeControls'
	});
	ShoElement_createBubble({'elm': control, 'bubble_id': 'DomShoID_Bubble', 'txt': node }); 		
	var status = new Element('img', {
		'alt'  : txt,
		'href' : '#',
		'src'  : 'img/node_empty_16x16.png',
		'id'   : args.dom_id + '_nodeStatusLed_' + args.node_id,
		'class': 'nodeStatusLed_unknow'
	});
	status.sho_update =  function(p_elm) {
		var elm = $(p_elm);
		if (isUndefined(elm)) {
			GSHO.log({'type': 'error', 'msg': 'Element:tree:status:sho_update, undefined elm'});
			return false;
		}
		var rootElm = elm.sho_elm_get_root();
		if (isUndefined(rootElm)) {
			GSHO.log({'type': 'error', 'msg': 'Element:tree:status:sho_update, undefined rootElm'});
			return false;
		}
		var node_id = rootElm.getAttribute('sho_node_id');
		if (!node_id) {
			GSHO.log({'type': 'error', 'msg': 'Element:tree:status:sho_update, undefined node_id'});
			return false;
		}
		var node = GSHO_NODES[node_id];
		if (isUndefined(node)) {
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
		return true;
	}
	edit.appendChild(control);
	edit.appendChild(status);
	root.appendChild(edit);
	return $(root);
}

/******************
 * ShoTree_update *
 ******************/
function ShoTree_update(p_elm) {
	var elm = $(p_elm);
	var rootElm = elm.sho_elm_get_root();
	if (!rootElm) {
		GSHO.log({f: 'ShoTree_update', t: 'e', m: 'arrow::sho_update: Can\'t found root element!'});
		return 0;
	}
	var node_id = rootElm.getAttribute('sho_node_id');
	if (!node_id) {
		GSHO.log({f: 'ShoTree_update', t: 'e', m: 'arrow::sho_update: no node_id!'});
		return 0;
	}
	var node = gshoNodesManager.get_node_by_id(node_id);
	if (!isObject(node)) {
		GSHO.log({f: 'ShoTree_update', t: 'e', m: 'arrow::sho_update: no global node with id: ' + node_id});
		return 0;
	}
	var dom_id = rootElm.getAttribute('sho_dom_id');
	if (!dom_id) {
		GSHO.log({f: 'ShoTree_update', t: 'e', m: 'arrow::sho_update: no dom_id!: '});
		return 0;
	}
	//GSHO.log({f: 'ShoTree_update',t: 'i', m: "ShoTree_update, root_id: " + rootElm.id + ", node_id: " + node_id} );
	if (node.is_loaded()) {
		rootElm.sho_elm_get_status_led().className = 'nodeStatusLed_loaded';
	} else if (node.get('node_status') == 1) {
		rootElm.sho_elm_get_status_led().className = 'nodeStatusLed_loading';
		return 1;
	} else {		
		rootElm.sho_elm_get_status_led().className = 'nodeStatusLed_unknow';
		return 1;
	}
	var elmLabel = rootElm.sho_elm_get_label();
	if (isUndefined(elmLabel)) {
		GSHO.log({f: 'ShoTree_update', t: 'e', m: 'Cannot get elmLabel: '});
		return 0;
	}
	var content =  node.viewLabel();
	if (!content) {
		content =  node.node_name;
	}
	elmLabel.update(content);
	var elmChilds = rootElm.sho_elm_get_childs();
	// Adding child
	node.children.each(function (n, index) { 
		if (isUndefined(n.node_id)) {
			node.children.next();
		}
		cat = ShoFunc_node_type_frag(n.node_type);
		n.node_subtype = cat.node_subtype;
		n.node_type = cat.node_type;
		var newChildID = dom_id + '_rootNode_' + n.node_id;
		if ($(newChildID)) {
			var rootChild = $(newChildID).sho_elm_get_root();
			var node_id = rootChild.getAttribute('node_id');
			if (node_id) {
				var nodeChild = gshoNodesManager.get_node_by_id(node_id);
				if (isObject(nodeChild)) {
					nodeChild.notify('sho_update');
					return 1;
				}
			}
			return 0;
		} else {
			var childElm = ShoElement_tree_node({'dom_id': dom_id, 'node_id': n.node_id, 
				'node_name': n.node_name, 'node_type': n.node_type, 'node_subtype': n.node_type
			});
			childElm.style.visibility = 'visible';
			elmChilds.appendChild(childElm);
			var nodeChild = gshoNodesManager.get_node_by_id(n.node_id);
			var bal = gshoNodesManager.is_autoloaded({'node_type': n.node_type, 'node_subtype': n.node_subtype});
			if (bal || nodeChild) {
				gshoNodesManager.__queue_event('onclick', childElm.sho_elm_get_arrow());	
			}
		}
		return 1;
	}); // End each
	return 1;
}

/************************
 * ShoElement_tree_node *
 ************************/
function ShoElement_tree_node(args) {
	if (!args.dom_id) {
		GSHO.log({f: 'ShoElement_tree_node', t: 'error', m: 'ShoCreateElement_node, Cannot create node Element without dom_id'});
		return null;
	}
	if (!args.node_id) {
		GSHO.log({f: 'ShoElement_tree_node', t: 'error', m: 'ShoCreateElement_node, Cannot create node Element without node_id'});
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
		"class": 'firstLi'
	});
	/********* 
	 * ARROW *
	 *********/
	var acont = new Element('a', {
		'href': '#'
	});
	acont.addClassName("Arrow_Container");
	var arrow = new Element('img', {
		"id"      : args.dom_id + '_Arrow_' + args.node_id,
		"class"   : "nodeFolder_close",
		"src"     : "img/node_empty_16x16.png",
		"sho_node_id" : args.node_id,
		"sho_dom_id"  : args.dom_id,
		//"sho_node_isloaded": false,
		"sho_isopen": false
	});
	/************************** 
	 * ARROW sho_update event *
	 **************************/
	arrow.sho_update = function(p_elm) {
		var elm = $(p_elm) || $(this);
		elm.fire('sho_tree_node:update');
		//GSHO.log({f: 'arrow.sho_update', t: 'i', m: "fire event sho_tree_node_update"});
		return false;
	};
	arrow.observe('sho_tree_node:update', function (event) {
		Event.stop(event);
		var elm = $(Event.element(event));
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
		if (!elm) {
			GSHO.log({f: 'arrow_observe(sho_tree_node:click)', t:'e', m: 'element undefined'});
			return false;
		}
		var rootElm = elm.sho_elm_get_root();
		if (!rootElm) {
			GSHO.log({f: 'arrow_observe(sho_tree_node:click)', t:'e', m: 'element undefined'});
			return false;
		}

		var node_id = rootElm.getAttribute('sho_node_id');		
		var dom_id = rootElm.getAttribute('sho_dom_id');
		var childsElm = elm.sho_elm_get_childs();
		var statusElm = elm.sho_elm_get_status_led();
		if (childsElm) {
			var s = childsElm.style;
			if (s.visibility == 'visible') {
				childsElm.hide();
				s.visibility = 'hidden';
				this.className = 'nodeFolder_close';
			} else {
				childsElm.show();
				s.visibility = 'visible';
				this.className = 'nodeFolder_open';
			}
			if (s.visibility == 'hidden') {
				return false;
			}
		}
		gshoNodesManager.add_node({'dom_id': dom_id, 'node_id': node_id, 'elm': elm});
		if (statusElm && node_id) {
			var node = gshoNodesManager.get_node_by_id(node_id);
			if (node) {
				var node_status = node.get('node_status');
				if (node_status == 1){	
					statusElm.className = "nodeStatusLed_loading";
				} else if (node_status >= 2) {
					statusElm.className = "nodeStatusLed_loaded";
				} else {
					statusElm.classNAme = "nodeStatusLed_unknow";
				}
			}
		}
		return false;
	}, false);

	/********* 
	 * LABEL *
	 *********/

	var label = new Element('div', {
		id: args.dom_id + '_Label_' + args.node_id,
		class: 'label',
		href: '#'
	});//.update("Click To Load");
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
		class: 'childs'
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
		'class': 'Multree'
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
		gshoNodesManager.add_node({'dom_id': dom_id, 'node_id': node_id, 'elm': elm});
	}
	elm.observe('sho:update', function(event) {
		Event.stop(event);
	});
	return elm;
}

function gsho_elementCreate(name, args) {
	if (name == 'tree_node') {
		return ShoElement_tree_node(args);
	} else if (name == 'multree') {
		return ShoElement_multree(args);
	}
	else {
		GSHO.log({type: 'error', msg: 'gsho_elementCreate, invalid name: ' + name})
		return null;
	}
}