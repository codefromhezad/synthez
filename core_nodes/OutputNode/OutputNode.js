AudioNode.define('OutputNode', {
	nice_name: 'Output',
	icon: {
		file: 'core_nodes/OutputNode/noun_327603_cc.svg',
		credits: 'Speaker by www.yugudesign.com from the Noun Project'
	},
	listeners: {
		on_init: function() {
			this.web_audio_node_handle = this.audio_context.destination;
		},
	}
});