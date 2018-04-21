var SynthezNodeTemplate = function(node_class_name) {
	this.audio_context = null;

	this.node_type = node_class_name;
	this.parent_type = null;

	this.identifier = null;
	this.nice_name = null;

	this.defaults = {};
	this.settings = {};

	this.input_nodes = {};
	this.output_nodes = {};

	this.web_audio_node_handle = null;
	
	this.parent_container = null;
	this.dom_element = null;
	this.dom_element_children = {
		title: null,
		body: null
	}

	this.position = {};
	this.icon = {};

	this.listeners = {
		on_message_data: function(message_data) {
			switch(message_data.type) {
				case MESSAGE_TYPE_SETTING:
					if( typeof message_data.conf === "string" ) {
						this.trigger_message_receiver(message_data.conf);
					} else {
						for(var setting_slug in message_data.conf) {
							this.trigger_message_receiver(setting_slug, message_data.conf[setting_slug]);
						}
					}
					break;
			}
		}
	};
	this.props = {},

	this.messages_receivers = {};

	this.init = function(user_options, parent_container) {
		this.audio_context = SynthezNode.__get_global_audio_context();
		Object.assign(this.settings, this.defaults, user_options || {});

		if( parent_container ) {
			this.parent_container = parent_container;
		}

		this.trigger('on_init');
	};

	this.send_message_data_to_outputs = function(message_data) {
		message_data.__sent = true;
		for(var node_id in this.output_nodes) {
			this.output_nodes[node_id].trigger('on_message_data', message_data);
		}
	};

	this.disconnect_all_outputs = function() {
		if( this.web_audio_node_handle && this.output_nodes.length ) {
			this.web_audio_node_handle.disconnect();
			this.output_nodes = [];
		}
	}

	this.set_position = function(position) {
		this.position = position;
		
		if( this.dom_element && this.position ) {
			for(var rule in this.position) {
				this.dom_element.style[rule] = this.position[rule];
			}
		}	
	}

	this.set_name = function(nice_name) {
		this.nice_name = nice_name;
		
		if( this.dom_element_children.title ) {
			this.dom_element_children.title.textContent = this.nice_name
		}
	}

	this.get_dom_element_id = function() {
		return 'synthez-' + Helper.camel_case_to_dash_case(this.identifier);
	}

	this.get_dom_element_class_name = function() {
		return 'synthez-' + Helper.camel_case_to_dash_case(this.node_type);
	}

	this.spawn_dom_element = function() {
		if( document.getElementById(this.get_dom_element_id()) ) {
			return;
		}

		this.dom_element = document.createElement('div');
		this.dom_element.id = this.get_dom_element_id();
		this.dom_element.classList.add(this.get_dom_element_class_name());
		this.dom_element.classList.add('synthez-audio-node');

		if( this.position ) {
			this.set_position(this.position);
		}

		var parent_dom_element = document.getElementsByTagName('body')[0];
		if( ! this.is_root_container() ) {
			parent_dom_element = this.parent_container.dom_element_children.body;
		}

		this.dom_element_children.title = document.createElement('div');
		this.dom_element_children.title.classList.add('synthez-node-title');

		this.dom_element_children.body = document.createElement('div');
		this.dom_element_children.body.classList.add('synthez-node-body');

		if( this.icon ) {
			this.dom_element_children.body.style.backgroundImage = "url('"+this.icon.file+"')";
		}

		for(var child_name in this.dom_element_children) {
			this.dom_element.append(this.dom_element_children[child_name]);
		}

		this.set_name(this.nice_name);

		parent_dom_element.prepend(this.dom_element);
	}

	this.destroy_dom_element = function() {
		if( ! document.getElementById(this.get_dom_element_id()) ) {
			return;
		}

		this.dom_element.remove();
	}

	this.is_root_container = function() {
		return (this.node_type == 'ContainerNode' && this.parent_container == null);
	};

	this.trigger = function(listener_name, args_data) {
		if( ! this.listeners[listener_name] ) {
			return undefined;
		}

		return this.listeners[listener_name].call(this, args_data);
	};

	this.trigger_message_receiver = function(setting_key, setting_value) {
		if( this.messages_receivers[setting_key] === undefined ) {
			console.warn('"' + this.nice_name + '" can\'t have any setter for "'+setting_key+'" setting. Aborting.');
			return false;
		}

		if( setting_value === undefined ) {
			return this.messages_receivers[setting_key].call(this);
		} else {
			return this.messages_receivers[setting_key].call(this, setting_value);
		}
	}
};