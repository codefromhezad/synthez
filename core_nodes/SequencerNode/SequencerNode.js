const DEFAULT_BPM = 120;

SynthezNode.define('SequencerNode', {
	nice_name: 'Sequencer',
	icon: {
		file: 'core_nodes/SequencerNode/sequencer_icon.svg',
		credits: 'Stairs by Xela Ub from the Noun Project'
	},
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
	ux_quick_access_elements: {
		play_pause: '<div class="synthez-ux-quick-access-input synthez-ux-button synthez-seq-button synthez-seq-play-pause" data-action="play">Play</div>'
	},
	listeners: {
		on_init: function() {
			this.props.__scheduler = new WebAudioScheduler({ context: this.audio_context });
			this.props.__full_duration = 0;

			var that = this;

			this.props.__scheduler.on("processed", function(e) {
				if( e.playbackTime >= that.props.__started_time + that.props.__full_duration ) {
					that.stop();
				}
			});
		},
		after_spawn: function() {
			var node = this;

			/* Setup UX Quick access listeners */
			var playpause_button = this.dom_element_children.ux_quick_access_container.getElementsByClassName('synthez-seq-play-pause')[0];
			playpause_button.addEventListener('click', function(e) {
				var action = this.getAttribute('data-action');

				if( action == "play" ) {
					node.play();
				} else if( action == "stop" ) {
					node.stop();
				}
			}, false);
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
							that.send_message_data_to_message_outputs(e.args.data_message);
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

		play: function() {
			this.stop();
			
			var playpause_button = this.dom_element_children.ux_quick_access_container.getElementsByClassName('synthez-seq-play-pause')[0];
			playpause_button.setAttribute('data-action', 'stop');
			playpause_button.textContent = "Stop";
			
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
			var playpause_button = this.dom_element_children.ux_quick_access_container.getElementsByClassName('synthez-seq-play-pause')[0];

			playpause_button.setAttribute('data-action', 'play');
			playpause_button.textContent = "Play";

			this.props.__scheduler.stop(true);
			this.props.__scheduler.removeAll();
			this.send_message_data_to_message_outputs(new SynthezDataMessage(MESSAGE_TYPE_SETTING, 0.0, 'stop'));
		}

		// open: function() {
		// 	for(var id in this.props.nodes ) {
		// 		this.props.nodes[id].spawn_dom_element();
		// 	}
		// 	this.container_is_opened = true;
		// 	this.dom_element.classList.add('synthez-dom-is-opened');
		// },

		// close: function() {
		// 	for(var id in this.props.nodes ) {
		// 		this.props.nodes[id].destroy_dom_element();
		// 	}
		// 	this.container_is_opened = false;
		// 	this.dom_element.classList.remove('synthez-dom-is-opened');
		// }
	}
});