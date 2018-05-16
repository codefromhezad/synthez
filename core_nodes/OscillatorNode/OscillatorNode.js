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
		frequency: 1440
	},
	props: {
		__is_started: false,
		__local_gain_node: null,
	},
	listeners: {
		on_init: function() {
			this.props.__local_gain_node = this.audio_context.createGain();
		},
	},
	messages_receivers: {
		frequency: function(new_osc_frequency) {
			this.set_frequency(new_osc_frequency);
		},
		type: function(new_osc_type) {
			this.set_type(new_osc_type);
		},
		kill: function() {
			this.kill_web_audio_oscillator();
		},
		note_off: function() {
			this.note_off();
		},
		note_on: function(note_freq) {
			this.note_on(note_freq);
		}
	},
	methods: {
		/* Private OSC methods */
		kill_web_audio_oscillator: function() {
			if( ! this.web_audio_node_handle ) {
				return;
			}

			if( this.props.__local_gain_node ) {
				this.props.__local_gain_node.gain.setValueAtTime(this.props.__local_gain_node.gain.value, this.audio_context.currentTime);
				this.props.__local_gain_node.gain.exponentialRampToValueAtTime(0.0001, this.audio_context.currentTime + AUDIO_TIMER_EPSILON);
			}

			var that = this;
			
			setTimeout( function() {
				if( that.props.__is_started ) {
					that.web_audio_node_handle.stop(that.audio_context.currentTime);
				}

				for(var out_node_index in that.audio_input_nodes) {
					that.audio_input_nodes[out_node_index].web_audio_node_handle.disconnect(that.web_audio_node_handle);
				}
				
				that.web_audio_node_handle = null;
				
				that.props.__is_started = false;
			}, this.audio_context.currentTime + AUDIO_TIMER_EPSILON * 2.0)
		},

		reset_web_audio_oscillator: function(before_start_cb) {
			this.web_audio_node_handle = this.audio_context.createOscillator();
			this.web_audio_node_handle.type = this.settings.type;

			for(var out_node_index in this.audio_output_nodes) {
				this.web_audio_node_handle.connect(this.audio_output_nodes[out_node_index].web_audio_node_handle);
			}

			if( before_start_cb !== undefined ) {
				before_start_cb.call(this);
			}

			this.web_audio_node_handle.start(this.audio_context.currentTime);

			this.props.__is_started = true;
		},


		/* Public OSC setters/getters */
		set_type: function(new_osc_type) {
			this.settings.type = new_osc_type;
			this.web_audio_node_handle.type = this.settings.type;
		},

		set_frequency: function(new_osc_frequency, time_offset) {
			this.settings.frequency = new_osc_frequency;
			
			if( this.web_audio_node_handle ) {
				this.web_audio_node_handle.frequency.linearRampToValueAtTime(
					this.settings.frequency, 
					this.audio_context.currentTime + (time_offset ? time_offset : 0)
				);
			}
		},

		/* Public OSC interaction methods */
		note_off: function() {
			this.kill_web_audio_oscillator();

			// if( this.props.__local_gain_node ) {
			// 	this.props.__local_gain_node.gain.linearRampToValueAtTime(0.0, this.audio_context.currentTime);
			// }
		},

		note_on: function(note_freq) {
			this.reset_web_audio_oscillator(function() {
				this.set_frequency(note_freq /*, AUDIO_TIMER_EPSILON */);
			});

			// if( this.props.__local_gain_node ) {
			// 	this.props.__local_gain_node.gain.linearRampToValueAtTime(1.0, this.audio_context.currentTime);
			// }
		}
	}
});

