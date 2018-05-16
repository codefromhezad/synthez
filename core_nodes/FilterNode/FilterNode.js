const FILTER_TYPE_LOWPASS = "lowpass";
const FILTER_TYPE_HIGHPASS = "highpass";
const FILTER_TYPE_BANDPASS = "bandpass";
const FILTER_TYPE_LOWSHELF = "lowshelf";
const FILTER_TYPE_HIGHSHELF = "highshelf";
const FILTER_TYPE_PEAKING = "peaking";
const FILTER_TYPE_NOTCH = "notch";
const FILTER_TYPE_ALLPASS = "allpass";

SynthezNode.define('FilterNode', {
	nice_name: 'Filter',
	icon: {
		file: 'core_nodes/FilterNode/generic_filter.svg',
		credits: 'filter by Javi Ayala from the Noun Project'
	},
	defaults: {
		type: FILTER_TYPE_BANDPASS,
		frequency: 800,
		Q: 100,
		gain: 0
	},
	props: {
		
	},
	listeners: {
		on_init: function() {
			this.boot();
		},
	},
	messages_receivers: {
		type: function(new_filter_type) {
			this.set_type(new_filter_type);
		},
		frequency: function(new_filter_frequency) {
			this.set_frequency(new_filter_frequency);
		},
		Q: function(new_filter_Q) {
			this.set_Q(new_filter_Q);
		},
		gain: function(new_filter_gain) {
			this.set_gain(new_filter_gain);
		}
	},
	methods: {
		/* Private OSC methods */


		/* Public OSC setters/getters */
		set_type: function(new_filter_type) {
			this.settings.type = new_filter_type;
			this.web_audio_node_handle.type = this.settings.type;
		},

		set_frequency: function(new_filter_frequency) {
			this.settings.frequency = new_filter_frequency;
			
			if( this.web_audio_node_handle ) {
				this.web_audio_node_handle.frequency.linearRampToValueAtTime(
					this.settings.frequency, 
					this.audio_context.currentTime
				);
			}
		},

		set_Q: function(new_filter_Q) {
			this.settings.Q = new_filter_Q;

			if( this.web_audio_node_handle ) {
				this.web_audio_node_handle.Q.linearRampToValueAtTime(
					this.settings.Q, 
					this.audio_context.currentTime
				);
			}
		},

		set_gain: function(new_filter_gain) {
			this.settings.gain = new_filter_gain;

			if( this.web_audio_node_handle ) {
				this.web_audio_node_handle.gain.linearRampToValueAtTime(
					this.settings.gain, 
					this.audio_context.currentTime
				);
			}
		},


		/* Public OSC interaction methods */
		boot: function() {
			this.web_audio_node_handle = this.audio_context.createBiquadFilter();

			this.set_type(this.settings.type);
			this.set_frequency(this.settings.frequency);
			this.set_Q(this.settings.Q);
			this.set_gain(this.settings.gain);
		},
	}
});

