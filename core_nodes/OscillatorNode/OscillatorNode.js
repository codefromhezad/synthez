const OSC_TYPE_SINE = "sine";
const OSC_TYPE_SQUARE = "square";
const OSC_TYPE_SAWTOOTH = "sawtooth";
const OSC_TYPE_TRIANGLE = "triangle";
const OSC_TYPE_CUSTOM = "custom";

SynthezNode.define('OscillatorNode', {
	nice_name: 'Oscillator',
	icon: {
		file: 'core_nodes/OscillatorNode/oscillator_generic.svg',
		credits: 'Oscillator by James Christopher from the Noun Project'
	},
	defaults: {
		type: OSC_TYPE_SINE,
		frequency: 440
	},
	props: {
		is_playing: false,
		is_initialized: false,

		__local_gain_node: null,
	},
	listeners: {
		on_init: function() {
			
		},
	},
	messages_receivers: {
		frequency: function(new_osc_frequency) {
			this.set_frequency(new_osc_frequency);
		},
		type: function(new_osc_type) {
			this.set_type(new_osc_type);
		},
		start: function() {
			this.start();
		},
		stop: function() {
			this.stop();
		},
	},
	methods: {
		/* Private OSC methods */


		/* Public OSC setters/getters */
		set_type: function(new_osc_type) {
			this.settings.type = new_osc_type;
			this.web_audio_node_handle.type = this.settings.type;
		},

		set_frequency: function(new_osc_frequency) {
			this.settings.frequency = new_osc_frequency;
			
			if( this.web_audio_node_handle ) {
				this.web_audio_node_handle.frequency.linearRampToValueAtTime(
					this.settings.frequency, 
					this.audio_context.currentTime
				);
			}
		},


		/* Public OSC interaction methods */
		boot: function() {
			this.web_audio_node_handle = this.audio_context.createOscillator();
			this.web_audio_node_handle.type = this.settings.type;

			this.props.__local_gain_node = this.audio_context.createGain();
			this.web_audio_node_handle.connect(this.props.__local_gain_node);

			for(var out_node_index in this.audio_output_nodes) {
				this.props.__local_gain_node.connect(this.audio_output_nodes[out_node_index].web_audio_node_handle);
			}

			this.props.__local_gain_node.gain.setValueAtTime(0, this.audio_context.currentTime);
			this.web_audio_node_handle.start(this.audio_context.currentTime + AUDIO_TIMER_EPSILON);

			this.props.is_initialized = true;
		},

		kill: function() {
			this.web_audio_node_handle.stop(this.audio_context.currentTime);
			this.disconnect_all_audio_outputs();

			this.props.is_initialized = false;
		},

		start: function() {
			if( ! this.props.is_initialized ) {
				this.boot();
			}

			if( this.props.is_playing ) {
				return; // Already playing
			}

			this.web_audio_node_handle.frequency.linearRampToValueAtTime(
				this.settings.frequency, 
				this.audio_context.currentTime
			);

			this.props.__local_gain_node.gain.setValueAtTime(1.0, this.audio_context.currentTime);
			
			this.props.is_playing = true;
		},

		stop: function() {
			this.props.is_playing = false;

			if( this.props.__local_gain_node ) {
				this.props.__local_gain_node.gain.setValueAtTime(0.0, this.audio_context.currentTime);
			}
			

			return true;
		},
	}
});

