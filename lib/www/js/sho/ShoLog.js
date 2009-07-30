var ShoLog =  Class.create();
ShoLog.prototype = {
		/* Constructor */
	initialize: function(win_id) {
		this._shoObj = new Object({
			_properties: {
				labels: {},
				data: {},
			},
		});
	this.add_property('_class_name');
	this.add_property('win_id');
	this.add_property('win_elm');
	this.add_property('buffered')
	this.add_property('logs'); 
	this.add_property('reverse');
	this.add_property('num_log');
	this.add_property('_need_refresh');
	this._init_properties();
	this.set('logs', new Array());
	this.set('buffered', true);
	this.set('_class_name', 'shojs_Clog');
	this.set('reverse', true);
	this.set('_need_refresh', true);
	this.set('num_log', 0);
	var elm;
	if (elm = document.getElementById(win_id)) {
		this.set('win_elm', elm);
		this.set('win_id', this.win_id);  
	} else {
		this.set('win_elm', null);
		this.set('win_id', null);  
	}
	this.turn('all', true);
},

add_property: function(name) {
	if(this.is_valid_property()) {
		return;
	}
	this._shoObj._properties.labels[name] = 1;
	this.set(name, null);
},

_init_properties:function() {
	for(name in this._shoObj._properties.labels) {
		this.set(name, null);
	}
	return 1;
},

is_valid_property:function(name) {
	return this._shoObj._properties.labels[name];
},

get:function(name) {
	if (!this.is_valid_property(name)) {
		msg = "[get] Invalid properties '"+name+"' \nobject["+this.get('_class_name')+"]";
		this.m(msg);
		return null;
	}
	return this._shoObj._properties.data[name];
},

set_win_id: function(id) {
	this.set('win_id', null);
	this.set('win_elm', null);
	var elm = document.getElementById(id);
	if (!elm)
		return;
	this.set('win_id', id);
	this.set('win_elm', elm);
},

set:function(name, value) {
	if (!this.is_valid_property(name)) {
		msg = "[set] Invalid properties '"+name+"' \nobject["+this.get('_class_name')+"]";
		this.m(msg);
		return 0;
	}
	this._shoObj._properties.data[name] = value;
	return 1;
},

extract_args: function(args) {
	var obj = new Object();
	if (args.msg) {
		obj.msg =  '' + args.msg;
		obj.type = '' + args.type;
	} else {
		obj.msg = '' + args;
		obj.type = 'echo';
	}
	return obj;
},

m:function(args) {
	var p = this.extract_args(args);
	this.set('num_log', this.get('num_log') + 1);
	this.get('logs').push(p);
	this.set('_need_refresh', true);
},

turn: function(type, flag) {
	return 0;
},

o: function(args) {
	var p = this.extract_args(args);
	header = '<div class="shocss_class_log"><span class="shocss_class_log_'+p.type+'">';
	footer = '</span></div>';
	str = header 
	+ p.msg;
	+ footer;
	this.write(str);
},

flush: function() {
	var elm;
	if (!(elm = this.get('logs'))) {
		this.myalert("can't show");
		elm.innerHTML = "";
	}
	this.set('logs', null);
	this.set('logs', new Array());
},

log_pop: function () {
	var logs = this.get('logs')
	logs.pop();
},

myalert:function(msg) {
	alert(this._shoObj._class_name + ':: ' + msg);
},

set_event:function (type, win_id, code) {
	elm = document.getElementById(win_id);
	if (!elm) {
		alert("set_event: Cannot get element with id " + win_id);
		return;
	}
	elm[type] = code;
},

log_shift: function() {
	this.get('num_log');
	var l = this.get('logs');
	if (!l) {
		return null;
	}
	if (!l[0]) {
		return null;
	}
	var msg = l[0];
	l.shift();
	this.set('num_log', this.get('num_log') - 1);
	return msg;
	return null;
},

show: function() {
	if (!this.get('win_elm'))
		return;
	var logs = this.get('logs');
	if (!this.get('_need_refresh'))
		return;
	while(this.get('num_log') > 25)
		this.log_shift();
	this.get('win_elm').innerHTML = "";
	if (this.get('reverse')) {
		for(i = logs.length - 1; i >= 0; i--) {
			this.o(logs[i]);
		}
	} else {
		for(i in logs) {
			if (logs[i].msg) {
				this.o(logs[i])
			}
		}
	}
	this.set('_need_refresh', false);
},

write:function(args) {
	var p = this.extract_args(args);
	elm = null;
	if (!(elm = this.get('win_elm'))) {
		this.myalert("Cannot get win_elm " + elm)
		return 0;
	}
	elm.innerHTML += p.msg;
	return 1;
},

}; // class end
