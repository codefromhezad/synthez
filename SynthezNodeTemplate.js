var SynthezNodeTemplate = function(node_class_name) {
	this.audio_context = null;

	this.node_type = node_class_name;
	this.parent_type = null;

	this.identifier = null;
	this.nice_name = null;

	this.defaults = {};
	this.settings = {};

	this.audio_output_nodes = {};
	this.message_output_nodes = {};
	this.audio_input_nodes = {};
	this.message_input_nodes = {};

	this.web_audio_node_handle = null;
	
	this.parent_container = null;
	this.dom_element = null;
	this.dom_element_children = {
		title: null,
		body: null,
		ux_quick_access_container: null,
	}

	this.position = {};
	this.icon = {};
	this.ux_quick_access_elements = {};
	this.style_inject = null;

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

	this.add_data_message = function(data_message) {
		data_message.__list_index = this.props.messages_list.push(data_message) - 1;
		return data_message.__list_index;
	};

	this.remove_data_message = function(message_index) {
		this.props.__scheduler.remove(message_index);
	};

	this.send_message_data_to_message_outputs = function(message_data) {
		message_data.__sent = true;
		for(var node_id in this.message_output_nodes) {
			this.message_output_nodes[node_id].trigger('on_message_data', message_data);
		}
	};

	this.disconnect_all_audio_outputs = function() {
		if( this.web_audio_node_handle && this.audio_output_nodes.length ) {
			this.web_audio_node_handle.disconnect();
			this.audio_output_nodes = [];
		}
	}

	this.set_position = function(position) {
		this.position = position;
		
		if( this.dom_element && this.position ) {
			if( this.position.x ) {
				this.dom_element.style['left'] = this.position.x + 'px';
				this.dom_element.setAttribute('data-x', this.position.x);
			}

			if( this.position.y ) {
				this.dom_element.style['top'] = this.position.y + 'px';
				this.dom_element.setAttribute('data-y', this.position.y);
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
		this.dom_element.classList.add('synthez-dom-node');

		this.dom_element.setAttribute('data-identifier', this.identifier);

		if( this.position ) {
			this.set_position(this.position);
		}

		var parent_dom_element = SynthezNode.__main_dom_container;

		if( ! this.is_root_container() ) {
			parent_dom_element = this.parent_container.dom_element_children.body;
		}

		this.dom_element_children.title = document.createElement('div');
		this.dom_element_children.title.classList.add('synthez-node-title');

		this.dom_element_children.body = document.createElement('div');
		this.dom_element_children.body.classList.add('synthez-node-body');

		if( this.style_inject ) {
			Helper.inject_css_file(this.style_inject);
		}

		if( Object.keys(this.ux_quick_access_elements).length ) {
			this.dom_element_children.ux_quick_access_container = document.createElement('div');
			this.dom_element_children.ux_quick_access_container.classList.add('synthez-node-quick-settings-container');

			for( var element_id in this.ux_quick_access_elements ) {
				var ux_dom_element = Helper.create_element_from_HTML(this.ux_quick_access_elements[element_id]);
				this.dom_element_children.ux_quick_access_container.appendChild(ux_dom_element);
			}
		}

		if( this.icon && this.icon.file ) {
			this.dom_element_children.body.style.backgroundImage = "url('"+this.icon.file+"')";
		}

		this.dom_element_children.audio_input = document.createElement('div');
		this.dom_element_children.audio_input.classList.add(
			'synthez-node-connector',
			'synthez-node-connector-input',
			'synthez-node-connector-audio'
		);
		this.dom_element_children.audio_input.setAttribute('data-connector-inout', 'input');
		this.dom_element_children.audio_input.setAttribute('data-connector-type', 'audio');
		this.dom_element_children.audio_input.setAttribute('data-node-identifier', this.identifier);


		this.dom_element_children.audio_output = document.createElement('div');
		this.dom_element_children.audio_output.classList.add(
			'synthez-node-connector',
			'synthez-node-connector-output',
			'synthez-node-connector-audio'
		);
		this.dom_element_children.audio_output.setAttribute('data-connector-inout', 'output');
		this.dom_element_children.audio_output.setAttribute('data-connector-type', 'audio');
		this.dom_element_children.audio_output.setAttribute('data-node-identifier', this.identifier);


		this.dom_element_children.message_input = document.createElement('div');
		this.dom_element_children.message_input.classList.add(
			'synthez-node-connector',
			'synthez-node-connector-input',
			'synthez-node-connector-message'
		);
		this.dom_element_children.message_input.setAttribute('data-connector-inout', 'input');
		this.dom_element_children.message_input.setAttribute('data-connector-type', 'message');
		this.dom_element_children.message_input.setAttribute('data-node-identifier', this.identifier);


		this.dom_element_children.message_output = document.createElement('div');
		this.dom_element_children.message_output.classList.add(
			'synthez-node-connector',
			'synthez-node-connector-output',
			'synthez-node-connector-message'
		);
		this.dom_element_children.message_output.setAttribute('data-connector-inout', 'output');
		this.dom_element_children.message_output.setAttribute('data-connector-type', 'message');
		this.dom_element_children.message_output.setAttribute('data-node-identifier', this.identifier);


		for(var child_name in this.dom_element_children) {
			if( this.dom_element_children[child_name] ) {
				this.dom_element.append(this.dom_element_children[child_name]);
			}
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