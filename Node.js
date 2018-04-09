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

var AudioNode = {
	/* Global private data */
	__definitions: {},
	__identifiers_count: {},

	__audio_context: null,


	/* Dev public methods */
	define: function(node_class_name, node_conf) {
		if( ! node_conf ) {
			node_conf = {};
		}

		(function(node_class_name, node_conf) {
			AudioNode.__definitions[node_class_name] = function() {
				var new_node = new AudioNodeTemplate();

				new_node.defaults = node_conf.defaults || {};
				new_node.listeners = node_conf.listeners || {};

				if( AudioNode.__identifiers_count[node_class_name] === undefined ) {
					AudioNode.__identifiers_count[node_class_name] = 0;
				} else {
					AudioNode.__identifiers_count[node_class_name] += 1;
				}

				new_node.identifier = node_class_name + AudioNode.__identifiers_count[node_class_name];

				if( node_conf.props ) {
					for(var prop_name in node_conf.props) {
						new_node.props[prop_name] = node_conf.props[prop_name];
					}
				}

				if( node_conf.listeners ) {
					for(var listener_name in node_conf.listeners) {
						new_node.listeners[listener_name] = node_conf.listeners[listener_name];
					}
				}

				if( node_conf.methods ) {
					for(var method_name in node_conf.methods) {
						new_node[method_name] = node_conf.methods[method_name];
					}
				}

				return new_node;
			}
		}) (node_class_name, node_conf);
	},


	/* Frontend public methods */
	add: function(node_class_name, user_options) {
		var new_node = AudioNode.__definitions[node_class_name]();
		new_node.init(user_options);

		return new_node;
	},

	connect: function(from, to) {
		to.input_nodes[from.identifier] = from;
		from.output_nodes[to.identifier] = to;

		from.web_audio_node_handle.connect(to.web_audio_node_handle);
	},
};



AudioNode.define('OscillatorNode', {
	defaults: {
		type: "square",
		frequency: 440
	},
	props: {
		is_playing: false,
	},
	listeners: {
		on_init: function() {
			this.reset_web_audio_node_handle();
		},
	},
	methods: {
		reset_web_audio_node_handle: function() {
			this.web_audio_node_handle = this.audio_context.createOscillator();
			this.web_audio_node_handle.type = this.settings.type;
			this.web_audio_node_handle.frequency.value = this.settings.frequency;

			this.props.is_playing = false;

			for(var out_node_index in this.output_nodes) {
				this.web_audio_node_handle.connect(this.output_nodes[out_node_index].web_audio_node_handle);
			}
		},
		start: function(start_time, end_time) {
			if( this.props.is_playing ) {
				return false;
			}

			this.web_audio_node_handle.start(start_time);
			this.props.is_playing = true;

			if( end_time ) {
				this.web_audio_node_handle.stop(end_time);
				this.reset_web_audio_node_handle();
			}

			return true;
		},

		stop: function(end_time) {
			if( ! this.props.is_playing ) {
				return false;
			}

			this.web_audio_node_handle.stop(end_time);
			this.reset_web_audio_node_handle();

			return true;
		}
	}
});

AudioNode.define('OutputNode', {
	listeners: {
		on_init: function() {
			this.web_audio_node_handle = this.audio_context.destination;
		},
	}
});

