var AudioNodeTemplate = function() {
	this.audio_context = null;
	this.identifier = null;
	this.node_type = null;

	this.defaults = {};
	this.settings = {};

	this.input_nodes = {};
	this.output_nodes = {};

	this.web_audio_node_handle = null;
	
	this.parent_container = null;
	this.dom_element = null;

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

		var parent_dom_element = document.getElementsByTagName('body')[0];
		if( ! this.is_root_container() ) {
			parent_dom_element = this.parent_container.dom_element;
		}

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