

var SynthezNode = {
	/* Global private data */
	__definitions: {},
	__definitions_base_conf: {},

	__identifiers_count: {},

	__root_container_node: null,

	__audio_context: null,

	/* Dev private methods */
	__load_conf: function(new_node, node_conf, from_conf) {
		if( ! node_conf ) {
			node_conf = {};
		}

		if( ! from_conf ) {
			from_conf = {};
		}
		
		Object.assign(new_node.defaults, from_conf.defaults || {}, node_conf.defaults || {});
		Object.assign(new_node.listeners, from_conf.listeners || {}, node_conf.listeners || {});
		Object.assign(new_node.icon, from_conf.icon || {}, node_conf.icon || {});
		new_node.nice_name = node_conf.nice_name || new_node.node_type;

		// new_node.defaults = node_conf.defaults || {};
		// new_node.listeners = node_conf.listeners || {};
		// new_node.nice_name = node_conf.nice_name || new_node.node_type;
		// new_node.icon = node_conf.icon || null;

		if( SynthezNode.__identifiers_count[new_node.node_type] === undefined ) {
			SynthezNode.__identifiers_count[new_node.node_type] = 0;
		} else {
			SynthezNode.__identifiers_count[new_node.node_type] += 1;
		}

		new_node.identifier = new_node.node_type + SynthezNode.__identifiers_count[new_node.node_type];

		// if( node_conf.props ) {
		// 	for(var prop_name in node_conf.props) {
		// 		new_node.props[prop_name] = node_conf.props[prop_name];
		// 	}
		// }

		// if( node_conf.listeners ) {
		// 	for(var listener_name in node_conf.listeners) {
		// 		new_node.listeners[listener_name] = node_conf.listeners[listener_name];
		// 	}
		// }

		Object.assign(new_node.props, from_conf.props || {}, node_conf.props || {});
		Object.assign(new_node.listeners, from_conf.listeners || {}, node_conf.listeners || {});

		if( from_conf.methods ) {
			for(var method_name in from_conf.methods) {
				new_node[method_name] = from_conf.methods[method_name];
			}
		}

		if( node_conf.methods ) {
			for(var method_name in node_conf.methods) {
				new_node[method_name] = node_conf.methods[method_name];
			}
		}
	},

	/* Dev public methods */
	define: function(node_class_name, node_conf) {
		(function(node_class_name, node_conf) {

			SynthezNode.__definitions_base_conf[node_class_name] = node_conf || {};

			SynthezNode.__definitions[node_class_name] = function() {
				
				var from_conf = {};
				var new_node = new SynthezNodeTemplate(node_class_name);

				if( node_conf.extends ) {
					if( SynthezNode.__definitions[node_conf.extends] === undefined ) {
						console.warn('Trying to extend a non existing node definition ("'+node_conf.extends+'"). Aborting.');
						return;
					}

					new_node.parent_type = node_conf.extends;
					from_conf = SynthezNode.__definitions_base_conf[node_conf.extends];
				}
				
				SynthezNode.__load_conf(new_node, node_conf, from_conf);

				return new_node;
			}
		}) (node_class_name, node_conf);
	},

	create_root_container_node: function() {
		var root_node = SynthezNode.__definitions['ContainerNode']();
		root_node.init();

		root_node.set_name('Root container');
		SynthezNode.__root_container_node = root_node;

		root_node.open();

		return root_node;
	},

	/* Frontend public methods */
	connect_nodes: function(from, to) {
		to.input_nodes[from.identifier] = from;
		from.output_nodes[to.identifier] = to;

		if( from.web_audio_node_handle && to.web_audio_node_handle ) {
			from.web_audio_node_handle.connect(to.web_audio_node_handle);
		}
	},
};
