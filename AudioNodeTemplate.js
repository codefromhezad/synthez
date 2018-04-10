var AudioNodeTemplate = function() {
	this.audio_context = null;
	this.identifier = null;

	this.defaults = {};
	this.settings = {};

	this.input_nodes = {};
	this.output_nodes = {};

	this.web_audio_node_handle = null;

	this.listeners = {};
	this.props = {},

	this.init = function(user_options) {
		if( ! AudioNode.__audio_context ) {
			AudioNode.__audio_context = new (window.AudioContext || window.webkitAudioContext)();
		}

		this.audio_context = AudioNode.__audio_context;
		Object.assign(this.settings, this.defaults, user_options || {});

		this.trigger('on_init');
	};

	this.trigger = function(listener_name) {
		if( ! this.listeners[listener_name] ) {
			return undefined;
		}

		return this.listeners[listener_name].call(this);
	}
};