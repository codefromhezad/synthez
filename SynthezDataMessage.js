const MESSAGE_TYPE_SETTING = "setting";

var SynthezDataMessage = function(message_type, local_trigger_time, message_conf) {
	this.audio_context = SynthezNode.__get_global_audio_context();
	this.type = message_type;
	this.local_trigger_time = local_trigger_time;
	this.__sent = false;


	/* message_conf format 
	 *
	 * if(message_type == MESSAGE_TYPE_SETTING):
	 * * {
	 * *	<setting_slug>: <new_setting_value>,
	 * *	<setting_slug>: <new_setting_value>,
	 * *	...
	 * * }
	 *
	 */

	this.conf = message_conf;
};