const DEFAULT_BPM = 120;

SynthezNode.define('SequencerNode', {
	nice_name: 'Sequencer',
	defaults: {
		bpm: DEFAULT_BPM,
		label: 'Unlabeled sequencer',
	},
	props: {
		messages_list: [],
		__full_duration: 0,
		__started_time: 0,

		__scheduler: null,
	},
	listeners: {
		on_init: function() {
			this.props.__scheduler = new WebAudioScheduler({ context: this.audio_context });
			this.props.__full_duration = 0;

			var that = this;

			// this.props.__scheduler.on("start", function() {
			//   console.log('start');
			// });

			// this.props.__scheduler.on("stop", function() {
			//   console.log('stop');
			// });

			this.props.__scheduler.on("processed", function(e) {
				if( e.playbackTime >= that.props.__started_time + that.props.__full_duration ) {
					that.stop();
				}
			});
		}
	},
	methods: {
		/* Private methods */
		__schedule_messages_from_now: function(that, e) {
			var t0 = e.playbackTime;

			for(var message_index = 0; message_index < this.props.messages_list.length; message_index++ ) {
				var data_message = this.props.messages_list[message_index];

				(function(that, t0) {
					that.props.__scheduler.insert(
						t0 + data_message.local_trigger_time,
						function(e) {
							that.send_message_data_to_outputs(e.args.data_message);
						},
						{ data_message: data_message }
					);
				})(that, t0);
			}
			
		},

		/* Public methods */
		set_label: function(new_label) {
			this.settings.label = new_label;
		},

		add_data_message: function(data_message) {
			data_message.__list_index = this.props.messages_list.push(data_message) - 1;
			return data_message.__list_index;
		},

		add_message_note: function(note_name, start_beat, beat_length) {
			var frequency = MusicHelper.note_to_freq(note_name);

			var start_time = MusicHelper.rythm_beats_to_seconds(start_beat, this.settings.bpm);
			var length_time = MusicHelper.rythm_beats_to_seconds(beat_length, this.settings.bpm);

			if( start_time + length_time > this.props.__full_duration ) {
				this.props.__full_duration = start_time + length_time;
			}

			this.add_data_message(new SynthezDataMessage(MESSAGE_TYPE_SETTING, start_time, {
				frequency: frequency
			})); 
		},

		remove_data_message: function(message_index) {
			this.props.__scheduler.remove(message_index);
		},

		play: function() {
			this.stop();
			
			this.add_data_message(new SynthezDataMessage(MESSAGE_TYPE_SETTING, 0.0, 'start')); 
			this.props.__started_time = 0;

			this.props.__scheduler.start( (function(that) {
				return function(e) {
					that.props.__started_time = e.playbackTime;
					that.__schedule_messages_from_now(that, e);
				};
			})(this));
		},

		stop: function() {
			this.props.__scheduler.stop(true);
			this.props.__scheduler.removeAll();
			this.send_message_data_to_outputs(new SynthezDataMessage(MESSAGE_TYPE_SETTING, 0.0, 'stop'));
		}

		// open: function() {
		// 	for(var id in this.props.nodes ) {
		// 		this.props.nodes[id].spawn_dom_element();
		// 	}
		// 	this.container_is_opened = true;
		// 	this.dom_element.classList.add('synthez-container-is-opened');
		// },

		// close: function() {
		// 	for(var id in this.props.nodes ) {
		// 		this.props.nodes[id].destroy_dom_element();
		// 	}
		// 	this.container_is_opened = false;
		// 	this.dom_element.classList.remove('synthez-container-is-opened');
		// }
	}
});