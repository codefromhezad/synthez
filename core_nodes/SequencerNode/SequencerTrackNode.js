
SynthezNode.define('SequencerTrackNode', {
	nice_name: 'Sequencer Track',
	defaults: {
		bpm: 120,
		label: 'track',

		/* 
		 * notes_list format:
		 * [
		 *   {
		 *		frequency: <note_frequency>,
		 *		beat_start: <start_beat>
		 *		beat_length: <beat_length>,
		 *   }
		 * ]
		*/
		notes_list: [],
	},
	props: {
		instrument_node: null
	},
	listeners: {

	},
	methods: {
		/* Public methods */
		set_label: function(new_label) {
			this.settings.label = new_label;
		},

		add_note: function(note_conf) {
			return this.settings.notes_list.push(note_conf) - 1;
		},

		remove_note: function(note_index) {
			this.settings.notes_list.splice(note_index, 1);
		},

		set_instrument_node: function(instr_node) {
			this.props.instrument_node = instr_node;
		},

		play: function() {
			var audio_context_current_time = this.props.instrument_node.audio_context.currentTime;

			for(var i = 0; i < this.settings.notes_list.length; i++) {
				var note_data = this.settings.notes_list[i];

				var start_time = audio_context_current_time + MusicHelper.rythm_beats_to_length(note_data.beat_start, this.settings.bpm);
				var end_time = start_time + MusicHelper.rythm_beats_to_length(note_data.beat_length, this.settings.bpm);

				this.props.instrument_node.noteOn(note_data.frequency, start_time, end_time);
			}
		},

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