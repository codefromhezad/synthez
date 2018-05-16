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
		__full_duration: 0,
		__started_time: 0,

		__messages: [],
	},
	ux_quick_access_elements: {
		play_pause: '<div class="synthez-ux-quick-access-input synthez-ux-button synthez-seq-button synthez-seq-play-pause" data-action="play">Play</div>'
	},
	listeners: {
		on_init: function() {
			this.props.__full_duration = 0;
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

		__add_data_message: function(trigger_time, output_node, data_message_conf) {
			var data_message = new SynthezDataMessage(
				trigger_time,
				this,
				output_node,
				data_message_conf
			);

			this.props.__messages.push(data_message);
		},

		__add_data_message_to_all_outputs: function(trigger_time, data_message_conf) {
			for(var node_id in this.message_output_nodes) {
				this.__add_data_message(
					trigger_time, 
					this.message_output_nodes[node_id],
					data_message_conf
				);
			}
		},

		__add_messages_list_to_global_timer: function() {
			for(var i = 0; i < this.props.__messages.length; i++) {
				SynthezNode.__message_events.push(this.props.__messages[i]);
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

			this.__add_data_message_to_all_outputs(
				start_time + AUDIO_TIMER_EPSILON,
				{ note_on: frequency }
			);

			this.__add_data_message_to_all_outputs(
				start_time + AUDIO_TIMER_EPSILON + length_time,
				'note_off'
			);
		},

		play: function() {
			this.stop();
			
			var playpause_button = this.dom_element_children.ux_quick_access_container.getElementsByClassName('synthez-seq-play-pause')[0];
			playpause_button.setAttribute('data-action', 'stop');
			playpause_button.textContent = "Stop";
			
			// this.__add_data_message_to_all_outputs(
			// 	0.0,
			// 	'kill'
			// );

			this.props.__started_time = this.audio_context.currentTime;
			
			this.__add_messages_list_to_global_timer();
		},

		stop: function() {
			var playpause_button = this.dom_element_children.ux_quick_access_container.getElementsByClassName('synthez-seq-play-pause')[0];

			playpause_button.setAttribute('data-action', 'play');
			playpause_button.textContent = "Play";

			//this.send_message_data_to_message_outputs(new SynthezDataMessage(0.0, 'kill'));
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