var AudioNode = {
	/* Global private data */
	__definitions: {},
	__identifiers_count: {},

	__audio_context: null,


	/* Dev public methods */
	define: function(node_class_name, node_conf) {
		if( ! node_conf ) {
			node_conf = {};
		}

		(function(node_class_name, node_conf) {
			AudioNode.__definitions[node_class_name] = function() {
				var new_node = new AudioNodeTemplate();

				new_node.defaults = node_conf.defaults || {};
				new_node.listeners = node_conf.listeners || {};

				if( AudioNode.__identifiers_count[node_class_name] === undefined ) {
					AudioNode.__identifiers_count[node_class_name] = 0;
				} else {
					AudioNode.__identifiers_count[node_class_name] += 1;
				}

				new_node.identifier = node_class_name + AudioNode.__identifiers_count[node_class_name];

				if( node_conf.props ) {
					for(var prop_name in node_conf.props) {
						new_node.props[prop_name] = node_conf.props[prop_name];
					}
				}

				if( node_conf.listeners ) {
					for(var listener_name in node_conf.listeners) {
						new_node.listeners[listener_name] = node_conf.listeners[listener_name];
					}
				}

				if( node_conf.methods ) {
					for(var method_name in node_conf.methods) {
						new_node[method_name] = node_conf.methods[method_name];
					}
				}

				return new_node;
			}
		}) (node_class_name, node_conf);
	},


	/* Frontend public methods */
	add: function(node_class_name, user_options) {
		var new_node = AudioNode.__definitions[node_class_name]();
		new_node.init(user_options);

		return new_node;
	},

	connect: function(from, to) {
		to.input_nodes[from.identifier] = from;
		from.output_nodes[to.identifier] = to;

		if( from.web_audio_node_handle && to.web_audio_node_handle ) {
			from.web_audio_node_handle.connect(to.web_audio_node_handle);
		}
	},
};
