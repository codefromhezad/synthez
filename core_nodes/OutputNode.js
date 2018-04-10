AudioNode.define('OutputNode', {
	listeners: {
		on_init: function() {
			this.web_audio_node_handle = this.audio_context.destination;
		},
	}
});