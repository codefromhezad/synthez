var AudioNodeTemplate = function() {
	this.audio_context = null;

	this.identifier = null;
	this.node_type = null;
	this.nice_name = null;
	this.instance_name = null;

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
	this.icon = null;

	this.listeners = {};
	this.props = {},

	this.init = function(user_options, parent_container) {
		if( ! AudioNode.__audio_context ) {
			AudioNode.__audio_context = new (window.AudioContext || window.webkitAudioContext)();
		}

		this.audio_context = AudioNode.__audio_context;
		Object.assign(this.settings, this.defaults, user_options || {});

		if( parent_container ) {
			this.parent_container = parent_container;
		}

		this.trigger('on_init');
	};

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

	this.trigger = function(listener_name) {
		if( ! this.listeners[listener_name] ) {
			return undefined;
		}

		return this.listeners[listener_name].call(this);
	};
};