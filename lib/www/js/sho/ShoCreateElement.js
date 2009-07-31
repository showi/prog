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
		
		sho_elm_add_child: function(p_elm, p_child) {
			var elm = $(p_elm);
			var child = $(p_child);
			if (child.getAttribute('sho_node_id')) {
				GSHO.log("Can't add child element without sho_node_id");
				return 0;
			}
			var elmChilds = elm.sho_get_childs();
			if (!elmChilds) {
				GSHO.log("Cannot found child element!");
				return 0;
			}
			var elmLi = new Element('li');
			elmLi.appendChild(child);
			elmChilds.appendChild(elmLi);
			return $(child);
		},

		shochange: function(p_elm, child) {
			var elm = $(p_elm);
			var node_id = elm.getAttribute('sho_node_id');
			GSHO.log('Change id: ' + elm.getAttribute('sho_node_id'));
			elm.sho_elm_get_label().update(GSHO_NODES[node_id].get('node_name'));
			var childsElm = elm.sho_elm_get_childs();
			if (!childsElm) {
				GSHO.log({"type": "error", "msg": "shochange, could not find dom childs."});
				return false;
			}
			var i = 0;
			for(i = 0; i < GSHO_NODES[node_id].children.length; i++) {
				var c = GSHO_NODES[node_id].children[i];
				GSHO.log("child: " + c.node_id);
				
				if ($( elm.getAttribute('sho_dom_id') + '_rootNode_' + c.node_id )) {
					GSHO.log("Child exist!");
					continue;
				}
				var newElm = $(ShoCreateElement_node({ "dom_id": elm.getAttribute('sho_dom_id'), 
					"node_id": c.node_id,
					"node_name": c.node_name,
					"node_type": c.node_type,
				}));
				childsElm.appendChild(newElm);
			}

			return false;
		}
	};

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
		var arrow = new Element('img', {
			"id"      : args.dom_id + '_Arrow_' + args.node_id,
			"class"   : "Arrow",
			"src"     : "img/arrow_right.png",
			"sho_node_id" : args.node_id,
			"sho_dom_id"  : args.dom_id,
			//"sho_node_isloaded": false,
			"sho_isopen": false,
		});
		arrow.sho_update = function (p_elm) {
			//alert("open folder");
			//if ()
			var node_id = $(this.getAttribute('sho_node_id'));
			var dom_id = $(this.getAttribute('sho_dom_id'));
			var rootElm = $(dom_id + '_rootNode_' + node_id); 
			if (rootElm) {
				rootElm.hide();
			}
			//var node_id = elm.getAttribute('sho_node_id');
			this.src = "img/arrow_down.png";
			return false;
		};
		arrow.observe('click', function (event) {
			var elm = $(Event.element(event));
			var node_id = $(elm).getAttribute('sho_node_id');
			var dom_id = $(elm).getAttribute('sho_dom_id');
			//elm.update('Loading node_id: ' + node_id);
			if (this.getAttribute('sho_isopen') == true) {
				this.setAttribute('sho_isopen', false);
			} else {
				this.setAttribute('sho_isopen', true);
			}
			var rootElm = $(dom_id + '_rootNode_' +node_id);
			if (rootElm) {
				if (this.getAttribute('sho_isopen') == false) {
					rootElm.hide();
				} else {
					rootElm.show();
				}
			} else {
				GSHO.log({type: 'error', msg:'Cannot find root elm!'});
				return;
			}
			if (!GSHO_NODES[node_id]) {
				GSHO_NODES[node_id] = new ShoNode(node_id);
				//GSHO_NODES[node_id].add_observer($(arrow), $(arrow).id, 'sho_update');
				GSHO_NODES[node_id].add_observer(elm, elm.id, 'shochange');
				GSHO_NODES[node_id].add_observer(elm, elm.id, 'sho_update');
				GSHO_NODES[node_id].notify('sho_update');
				GSHO_NODES[node_id].load();
				//this.src = "img/arrow_right.png";
			}
			return false;
		}, false);
		//arrow.setAttribute("sho_folder_isopen", false);
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
		$(label).observe('click', function(event) {
			var elm = Event.element(event);
			var node_id = $(elm).getAttribute('sho_node_id');
			elm.update('Loading node_id: ' + node_id);
			if (GSHO_NODES[node_id]) {
				if (GSHO_NODES[node_id].is_loaded()) {
					elm.sho_elm_get_label().update(GSHO_NODES[node_id].get('node_name'));
				} else {
					GSHO_NODES[node_id].add_observer(elm, elm.id, 'shochange');
					GSHO_NODES[node_id].load();
				}
			} else {
				GSHO_NODES[node_id] = new ShoNode(node_id);
				GSHO_NODES[node_id].add_observer(elm, elm.id, 'shochange');
				GSHO_NODES[node_id].load();
				
			}
		});
		var ulChilds = new Element('ul', {
			id: args.dom_id + '_Childs_' + args.node_id,
			class: 'childs',
		});
		fLi.appendChild(arrow);
		fLi.appendChild(label);
		fLi.appendChild(ulChilds);
		root.appendChild(fLi);
		return $(root);
	}	