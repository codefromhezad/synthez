var SynthezDataMessage = function(local_trigger_time, source_node, dest_node, message_conf) {
	this.audio_context = SynthezNode.__get_global_audio_context();
	
	this.local_trigger_time = local_trigger_time;

	this.source_node = source_node;
	this.dest_node = dest_node;

	this.conf = message_conf;

	this.__sent = false;
};