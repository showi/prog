var ShoWidgetFactory =  Class.create();
ShoWidgetFactory.prototype = Object.extend(new ShoObject(), {
// Static Properties
__screen: null,

//	Constructor
initialize: function() {
	this.set('__class_name', 'ShoWidgetFactory')
	if (!this.__screen) {
		this.log("Setting static __screen");
		var elm = document.getElementById('ShoID_SCREEN');
		if (!elm) {
			this.log({type: 'error', msg: "Cannot set static __screen"});
			return null;
		}
		this.__screen = elm;
	}
},	

__tpl_replace: function(elm, name, reg, rootid) {
	if (!elm) {
		this.log('__tpl_replace, null elm');
		return;
	}
	if (!name) {
		this.log('__tpl_replace, null name');
	}
	if (!elm[name]) {
		return;
	}
	if (!reg.test(elm[name])) {
		return;
	}
	var str = '' + elm[name];
	this.log("STR: >>>" + str + "<<<");
	var regfuncrem = /\s*function\s+(\w+)\s*\(\s*(\w*)\s*\)\s*\{\s*(.*)\s*\}\s*/;
	var matches = str.match(regfuncrem);
	if (matches == undefined) {
		this.log("Matches is null");
		return;
	}
	this.log("matches  " + matches[1]);
	if (!matches) {
		return;
	}
	if (matches.lenght) {
		this.log("No function match");
		return;
	}
	str = matches[3];
	str = str.replace(reg, rootid);
	this.log('str: ' + str)
	this.log('Replace id: ' + rootid);
	this.log('Replace: ' + str);
	this.log('Replace function : ' + matches[1]);
	elm[matches[1]] = function () { eval(str); };
},

__tpl_replace_all: function(elm, rootid, id) {
	this.log("replace_all rootid: " + rootid + ", id: " + id);
	this.__tpl_replace(elm, 'onmousedown', GREG_TPL_WIDGET_ID, rootid, id);
	this.__tpl_replace(elm, 'onmouseup'  , GREG_TPL_WIDGET_ID, rootid, id);
	this.__tpl_replace(elm, 'onclick'  , GREG_TPL_WIDGET_ID, rootid, id);
},

//Instantiate private helper
__instantiate: function(win, node, newid) {
	for (var n = 0; n < node.childNodes.length; n++) {
		var childNode = node.childNodes[n];
		if (!childNode) {
			continue;
		}
		var newelm = childNode.cloneNode(false);
		if (newelm.id) {
			this.log('id: ' + newelm.id);
			newelm.id = trim(newelm.id + newid);
			this.__tpl_replace_all(newelm, newelm.id);		
		} else {
			this.__tpl_replace_all(newelm, 'widgetMain_'+newid);
		}
		win.appendChild(newelm);
		this.__instantiate(newelm, childNode, newid);
	}		
},

//Create a new widget instance (new DOM subtree)
instantiate: function(id) {
	var screen = document.getElementById('ShoID_SCREEN');
	var elm = document.getElementById(id);
	if (!elm) {
		this.log({type: 'error', msg: 'instantiate withoud valid DOM base id'});
		return 0;
	}
	var preid = this.__genid.get(this.get('__class_name')+0);
	var newid = trim(id + preid);
	this.log("newid: " + newid); 
	var win = elm.cloneNode(false);
	win.id = newid;
	win.sho_widget_id = preid;
	this.__tpl_replace_all(win, newid);
	for (var n = 0; n < elm.childNodes.length; n++) {
		var node = elm.childNodes[n];
		if (!node) {
			continue;
		}
		var newelm = node.cloneNode(false);
		if (newelm.id) {
			this.log('id: ' + newelm.id);
			newelm.id =  newelm.id + id;
			this.__tpl_replace_all(newelm, newelm.id);
		} else {
			this.__tpl_replace_all(newelm, preid);
		}
		win.appendChild(newelm);
		this.__instantiate(newelm, node, preid);
	}
	screen.appendChild(win);
	return win;
},
});

var ShoWidget_Main =  Class.create();
ShoWidget_Main.prototype = Object.extend(new ShoObject(), {
	// Static Properties
	__base_id: 'widgetBase',

	// Constructor
	initialize: function() {	
	this.__add_property('elm');
	this.__add_property('__movable', true);
	this.set('__class_name', 'ShoWidget_Main');
	this.__base_id = 'widgetMain_';
	var Factory = new ShoWidgetFactory();
	this.set('elm', Factory.instantiate(this.__base_id));
	if (!this.get('elm')) {
		this.log("Cannot set new main widget with id '"+ this.__base_id +"'");
	}	
	this.__installHandlers();
},

__installHandlers: function () {
	// install on move handler
	var elm = this.get('elm');
	if (!elm) { 
		this.log("Cannot install handlers without element"); 
		return 0;
	}
},

getElmById: function(id) {
	var elm = document.getElementById(id);
	if (!elm) {
		this.log("Cannot get elm with id: " + id);
		return null;
	}
	return elm;
},

setTitle: function(title) {
	var id = 'ShoWidgetTitleID_' + this.get('elm').sho_widget_id;
	var elm = this.getElmById(id);
	if (!elm) {
		this.log("Cannot set widget title, invalid id '" + id + "'");
		return null;
	} 
	elm.innerHTML = title;
	return elm;
},

getTitle: function() {
	var id = 'ShoWidgetTitleID_' + this.get('elm').sho_widget_id;
	var elm = this.getElmById(id);
	if (!elm) {
		this.log("Cannot set widget title, invalid id '" + id + "'");
		return null;
	} 
	return elm.innerHTML;
},

setContent: function(content) {
	var id = 'ShoWidgetContentID_' + this.get('elm').sho_widget_id;
	var elm = this.getElmById(id);
	if (!elm) {
		this.log("Cannot set widget title, invalid id '" + id + "'");
		return null;
	} 
	elm.innerHTML = content;
	return elm;
},

getContent: function() {
	var id = 'ShoWidgetContentID_' + this.get('elm').sho_widget_id;
	var elm = this.getElmById(id);
	if (!elm) {
		this.log("Cannot set widget title, invalid id '" + id + "'");
		return null;
	} 
	return elm.innerHTML;
},

setStatus: function(status) {
	var id = 'ShoWidgetStatusID_' + this.get('elm').sho_widget_id;
	var elm = this.getElmById(id);
	if (!elm) {
		this.log("Cannot set widget title, invalid id '" + id + "'");
		return null;
	} 
	elm.innerHTML = status;
	return elm;
},

getStatus: function() {
	var id = 'ShoWidgetStatusID_' + this.get('elm').sho_widget_id;
	var elm = this.getElmById(id);
	if (!elm) {
		this.log("Cannot set widget title, invalid id '" + id + "'");
		return null;
	} 
	return elm.innerHTML;
},

}); // End of ShoWidget_Main Class