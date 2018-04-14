const OSC_TYPE_SINE = "sine";
const OSC_TYPE_SQUARE = "square";
const OSC_TYPE_SAWTOOTH = "sawtooth";
const OSC_TYPE_TRIANGLE = "triangle";
const OSC_TYPE_CUSTOM = "custom";

AudioNode.define('OscillatorNode', {
	defaults: {
		type: OSC_TYPE_SINE,
		frequency: 440
	},
	props: {
		is_playing: false,
	},
	listeners: {
		on_init: function() {
			this.__reset_web_audio_node_handle();
		},
	},
	methods: {
		/* Private OSC methods */
		__reset_web_audio_node_handle: function() {
			this.web_audio_node_handle = this.audio_context.createOscillator();
			this.web_audio_node_handle.type = this.settings.type;
			this.web_audio_node_handle.frequency.value = this.settings.frequency;

			this.props.is_playing = false;

			for(var out_node_index in this.output_nodes) {
				this.web_audio_node_handle.connect(this.output_nodes[out_node_index].web_audio_node_handle);
			}
		},


		/* Public OSC setters/getters */
		set_type: function(new_osc_type) {
			this.settings.type = new_osc_type;
			this.web_audio_node_handle.type = this.settings.type;
		},

		set_frequency: function(new_osc_frequency) {
			this.settings.frequency = new_osc_frequency;
			this.web_audio_node_handle.frequency.value = this.settings.frequency;
		},


		/* Public OSC interaction methods */
		start: function(start_time, end_time) {
			if( this.props.is_playing ) {
				return false;
			}

			this.web_audio_node_handle.start(start_time);
			this.props.is_playing = true;

			if( end_time ) {
				this.web_audio_node_handle.stop(end_time);
				this.__reset_web_audio_node_handle();
			}

			return true;
		},

		stop: function(end_time) {
			if( ! this.props.is_playing ) {
				return false;
			}

			this.web_audio_node_handle.stop(end_time);
			this.__reset_web_audio_node_handle();
			
			return true;
		},

		noteOn: function(note_name, start_time, end_time) {
			var frequency = MusicHelper.note_to_freq(note_name);

			this.stop();
			this.set_frequency(frequency);
			this.start(start_time, end_time);
		},

		noteOff: function(end_time) {
			this.stop(end_time);
		}
	}
});