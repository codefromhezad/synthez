const AUDIO_TIMER_EPSILON = 0.0001;

const CONNECTION_TYPE_AUDIO = "audio";
const CONNECTION_TYPE_MESSAGE = "message";

var SynthezNode = {
	/* Global private data */
	__definitions: {},
	__definitions_base_conf: {},

	__identifiers_count: {},
	__connections: {},

	__root_container_node: null,
	__main_dom_container: null,

	__audio_context: null,

	__global_timer_start_time: null,

	__started: false,

	/* Front public methods */
	start: function(main_container_id) {
		if( SynthezNode.__started ) {
			console.warn('Synthez Global Timer already running. Aborting new start.');
			return false;
		}

		SynthezNode.__main_dom_container = document.getElementById(main_container_id);
		SynthezNode.__main_dom_container.classList.add('synthez-main-dom-container');

		SynthezNode.__global_timer_start_time = Date.now() * 0.001;
		SynthezNode.__started = true;

		return SynthezNode.__get_global_audio_context();
	},

	stop: function() {
		if( ! SynthezNode.__started ) {
			console.warn('Synthez Global Timer not running. Aborting stop.');
			return false;
		}

		SynthezNode.__global_timer_start_time = null;
		SynthezNode.__started = false;
	},

	/* Dev private methods */
	__get_global_audio_context: function() {
		if( ! SynthezNode.__audio_context ) {
			SynthezNode.__audio_context = new (window.AudioContext || window.webkitAudioContext)();
		}

		return SynthezNode.__audio_context;
	},

	__load_conf: function(new_node, node_conf, from_conf) {
		if( ! node_conf ) {
			node_conf = {};
		}

		if( ! from_conf ) {
			from_conf = {};
		}
		
		Object.assign(new_node.defaults, from_conf.defaults || {}, node_conf.defaults || {});
		Object.assign(new_node.messages_receivers, from_conf.messages_receivers || {}, node_conf.messages_receivers || {});
		Object.assign(new_node.listeners, from_conf.listeners || {}, node_conf.listeners || {});
		Object.assign(new_node.icon, from_conf.icon || {}, node_conf.icon || {});
		new_node.nice_name = node_conf.nice_name || new_node.node_type;

		if( SynthezNode.__identifiers_count[new_node.node_type] === undefined ) {
			SynthezNode.__identifiers_count[new_node.node_type] = 0;
		} else {
			SynthezNode.__identifiers_count[new_node.node_type] += 1;
		}

		new_node.identifier = new_node.node_type + SynthezNode.__identifiers_count[new_node.node_type];

		Object.assign(new_node.props, from_conf.props || {}, node_conf.props || {});
		Object.assign(new_node.listeners, from_conf.listeners || {}, node_conf.listeners || {});
		Object.assign(new_node.ux_quick_access_elements, from_conf.ux_quick_access_elements || {}, node_conf.ux_quick_access_elements || {});

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
	connect_nodes: function(from, to, connection_type) {
		if( connection_type === undefined ) {
			connection_type = CONNECTION_TYPE_AUDIO;
		}

		if( from.parent_container.identifier != to.parent_container.identifier ) {
			console.error("Can't connect nodes not belonging to the same container: ", from, to);
			return false;
		}

		switch(connection_type) {
			case CONNECTION_TYPE_AUDIO:
				from.audio_output_nodes[to.identifier] = to;
				to.audio_input_nodes[from.identifier] = from;

				if( from.web_audio_node_handle && to.web_audio_node_handle ) {
					from.web_audio_node_handle.connect(to.web_audio_node_handle);
				}
				break;
			case CONNECTION_TYPE_MESSAGE:
				from.message_output_nodes[to.identifier] = to;
				to.message_input_nodes[from.identifier] = from;
				break;
		}

		from.set_dom_connector_connection_style(connection_type, 'output', true);
		to.set_dom_connector_connection_style(connection_type, 'input', true);

		SynthezNode.make_connection_data(from, to, connection_type);
	},

	disconnect_nodes: function(from, to, connection_type) {
		if( connection_type === undefined ) {
			connection_type = CONNECTION_TYPE_AUDIO;
		}

		var conn_id = SynthezNode.get_connection_identifier(from, to, connection_type);

		if( ! SynthezNode.__connections[conn_id] ) {
			console.warn('The connection "'+conn_id+'" doesn\'t exist. Aborting.');
			return false;
		}

		SynthezNode.remove_connection_data(from, to, connection_type);

		switch(connection_type) {
			case CONNECTION_TYPE_AUDIO:
				delete from.audio_output_nodes[to.identifier];
				delete to.audio_input_nodes[from.identifier];

				if( from.web_audio_node_handle && to.web_audio_node_handle ) {
					to.web_audio_node_handle.disconnect(from.web_audio_node_handle);
				}

				break;
			case CONNECTION_TYPE_MESSAGE:
				delete from.message_output_nodes[to.identifier];
				delete to.message_input_nodes[from.identifier];

				break;
		}

		from.set_dom_connector_connection_style(connection_type, 'output', false);
		to.set_dom_connector_connection_style(connection_type, 'input', false);
	},

	get_connection_identifier: function(from, to, connection_type) {
		return from.identifier+'_'+to.identifier+'_'+connection_type;
	},

	update_connection_svg_line: function(from, to, connection_type) {
		var conn_id = SynthezNode.get_connection_identifier(from, to, connection_type);

		if( ! SynthezNode.__connections[conn_id] ) {
			console.warn('The connection "'+conn_id+'" doesn\'t exist. Aborting.');
			return false;
		}

		var connection_container = from.parent_container;
		var svg_wrapper = connection_container.props.svg_wrapper;

		var container_rect = connection_container.dom_element.getBoundingClientRect();

		var from_output_connector = from.dom_element_children[connection_type+'_output'];
		var to_input_connector = to.dom_element_children[connection_type+'_input'];

		var from_cntor_rect = from_output_connector.getBoundingClientRect();
		var to_cntor_rect = to_input_connector.getBoundingClientRect();

		SynthezNode.__connections[conn_id].line.plot(
			from_cntor_rect.width * 0.5 + from_cntor_rect.x - container_rect.x, 
			from_cntor_rect.height * 0.5 + from_cntor_rect.y - container_rect.y - 1, 
			to_cntor_rect.width * 0.5 + to_cntor_rect.x - container_rect.x, 
			to_cntor_rect.height * 0.5 + to_cntor_rect.y - container_rect.y - 1
		)
	},

	remove_connection_data: function(from, to, connection_type) {
		var conn_id = SynthezNode.get_connection_identifier(from, to, connection_type);

		if( ! SynthezNode.__connections[conn_id] ) {
			console.warn('The connection "'+conn_id+'" doesn\'t exist. Aborting.');
			return false;
		}

		SynthezNode.__connections[conn_id].line.remove();

		delete SynthezNode.__connections[conn_id];
	},

	make_connection_data: function(from, to, connection_type) {
		var conn_id = SynthezNode.get_connection_identifier(from, to, connection_type);

		if( SynthezNode.__connections[conn_id] ) {
			console.warn('The connection "'+conn_id+'" already exists. Aborting.');
			return false;
		}

		var connection_container = from.parent_container;
		var svg_wrapper = connection_container.props.svg_wrapper;

		SynthezNode.__connections[conn_id] = {
			from: from,
			to: to,
			connection_type: connection_type,
			connection_container: connection_container,
			line: svg_wrapper.line()
		};

		SynthezNode.update_connection_svg_line(from, to, connection_type);

		SynthezNode.__connections[conn_id].line.node.classList.add('synthez-connection-svg-line', 'synthez-connection-svg-line-'+connection_type);
		SynthezNode.__connections[conn_id].line.stroke({
			width: 1,
		});
	}
};
