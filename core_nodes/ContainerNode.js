const ROOT_NODES_CONTAINER_ID = 'root';

const DRAG_INTERACTION_TYPE_MOVE = "drag_move";
const DRAG_INTERACTION_TYPE_CONNECT = "drag_connect";


SynthezNode.define('ContainerNode', {
	nice_name: 'Container',
	defaults: {},
	props: {
		nodes: {},
		container_is_opened: false,
		svg_wrapper: null,

		__current_drag: {
			handle: null,
			target: null,
			target_node: null,
			node_identifier: null,
			drag_type: null,
			drag_connect_inout: null,
			drag_connect_type: null,
			drag_svg_line: null,
		}
	},
	listeners: {
		on_init: function() {
			this.spawn_dom_element();
			var el_id = this.get_dom_element_id();
			var el = this.dom_element;
			var w = el.clientWidth;
			var h = el.clientHeight;

			this.props.svg_wrapper = SVG(el_id);
			this.props.svg_wrapper.node.classList.add('svg-connection-container');
			this.__update_svg_wrapper_size();
		},
	},
	methods: {
		/* Private methods */
		__update_svg_wrapper_size: function() {
			var el = this.dom_element;
			var w = el.clientWidth;
			var h = el.clientHeight;

			this.props.svg_wrapper.size(w, h);
			this.props.svg_wrapper.viewbox(0, 0, w, h);
		},

		__reset_drag_ux_data: function() {
			var __current_drag = this.props.__current_drag;

			if( __current_drag.target === null ) {
				return;
			}

			__current_drag.handle.classList.remove('synthez-drag-source');

			__current_drag.target = null;
			__current_drag.handle = null;
			__current_drag.node_identifier = null;
			__current_drag.target_node = null;
			__current_drag.drag_type = null;
			__current_drag.drag_connect_inout = null;
			__current_drag.drag_connect_type = null;
			__current_drag.drag_connect_dest_inout = null;
			__current_drag.drag_connect_dest_type = null;
			__current_drag.drag_connect_dest_node_identifier = null;

			if( __current_drag.drag_svg_line ) {
				__current_drag.drag_svg_line.remove();
				__current_drag.drag_svg_line = null;
			}
		},

		__setup_ux_listeners: function() {
			var that = this;
			var container_id = that.get_dom_element_id();

			/* InteractJS */
			(function(that, container_id) {

				interact(
					'#'+container_id+' .synthez-node-body .synthez-dom-node'
				).draggable({
					allowFrom: '.synthez-node-title, .synthez-node-connector',
					ignoreFrom: '.synthez-node-connector.connected',
					restrict: {
						restriction: that.dom_element_children.body
					},
					onstart: function(event) {
						var __current_drag = that.props.__current_drag;

						__current_drag.target = event.target;
						__current_drag.handle = event.interaction._eventTarget;
						__current_drag.node_identifier = event.target.getAttribute('data-identifier');
						__current_drag.target_node = that.props.nodes[__current_drag.node_identifier];

						__current_drag.handle.classList.add('synthez-drag-source');

						if( __current_drag.handle.classList.contains('synthez-node-title') ) {

							__current_drag.drag_type = DRAG_INTERACTION_TYPE_MOVE;

						} else if( __current_drag.handle.classList.contains('synthez-node-connector') ) {

							__current_drag.drag_type = DRAG_INTERACTION_TYPE_CONNECT;

							if( __current_drag.handle.classList.contains('synthez-node-connector-input') ) {
								__current_drag.drag_connect_inout = "input";
							} else if( __current_drag.handle.classList.contains('synthez-node-connector-output') ) {
								__current_drag.drag_connect_inout = "output";
							}

							if( __current_drag.handle.classList.contains('synthez-node-connector-audio') ) {
								__current_drag.drag_connect_type = CONNECTION_TYPE_AUDIO;
							} else if( __current_drag.handle.classList.contains('synthez-node-connector-message') ) {
								__current_drag.drag_connect_type = CONNECTION_TYPE_MESSAGE;
							}

							__current_drag.drag_svg_line = that.props.svg_wrapper.line();

							__current_drag.drag_svg_line.node.classList.add(
								'synthez-connection-svg-line', 
								'synthez-connection-svg-line-'+__current_drag.drag_connect_type,
								'synthez-connection-svg-line-dragging'
							);
							__current_drag.drag_svg_line.stroke({
								width: 1,
							});
						}
		
					},
					onend: function(event) {
						// ***
					},
					onmove: function(event) {

						var __current_drag = that.props.__current_drag;

						var target = __current_drag.target,
					        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
					        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

					    var target_node = __current_drag.target_node;

					    switch( __current_drag.drag_type ) {
					    	case DRAG_INTERACTION_TYPE_MOVE:

					    		target_node.set_position({x: x, y: y});

							    for(var id in target_node.audio_output_nodes) {
							    	var to_node = target_node.audio_output_nodes[id];
							    	SynthezNode.update_connection_svg_line(target_node, to_node, CONNECTION_TYPE_AUDIO);
							    }
							    for(var id in target_node.message_output_nodes) {
							    	var to_node = target_node.message_output_nodes[id];
							    	SynthezNode.update_connection_svg_line(target_node, to_node, CONNECTION_TYPE_MESSAGE);
							    }

							    for(var id in target_node.audio_input_nodes) {
							    	var from_node = target_node.audio_input_nodes[id];
							    	SynthezNode.update_connection_svg_line(from_node, target_node, CONNECTION_TYPE_AUDIO);
							    }
							    for(var id in target_node.message_input_nodes) {
							    	var from_node = target_node.message_input_nodes[id];
							    	SynthezNode.update_connection_svg_line(from_node, target_node, CONNECTION_TYPE_MESSAGE);
							    }

					    		break;

					    	case DRAG_INTERACTION_TYPE_CONNECT:
					    		if( SynthezNode.__ux_data.pointer_position === null ) {
					    			return;
					    		}

					    		var start_connector = __current_drag.handle;
								var start_connector_rect = start_connector.getBoundingClientRect();

					    		SynthezNode.set_svg_line_position(
					    			__current_drag.drag_svg_line,
					    			that,
					    			start_connector_rect.width * 0.5 + start_connector_rect.x,
									start_connector_rect.height * 0.5 + start_connector_rect.y - 1,
									SynthezNode.__ux_data.pointer_position.x,
									SynthezNode.__ux_data.pointer_position.y
					    		);

					    		break;
					    }
					},
				});
				
				interact('.synthez-node-connector').dropzone({
					checker: function(drag_event, pointer_event, dropped, dropzone, dropElement, draggable, draggableElement) {
						var __current_drag = that.props.__current_drag;

						if( ! dropped ) {
							return false;
						}

						if( __current_drag.drag_type !== DRAG_INTERACTION_TYPE_CONNECT ) {
							return false;
						}

						var source_inout = __current_drag.drag_connect_inout;
					    var source_type = __current_drag.drag_connect_type;
					    var source_node_identifier = __current_drag.node_identifier;

					    var dest_inout = dropElement.getAttribute('data-connector-inout');
					    var dest_type = dropElement.getAttribute('data-connector-type');
					    var dest_node_identifier = dropElement.getAttribute('data-node-identifier');

					    if( source_inout === dest_inout || 
					    	source_type !== dest_type ||
					    	source_node_identifier === dest_node_identifier
					    ) {
					    	return false;
					    }

					    __current_drag.drag_connect_dest_inout = dest_inout;
					    __current_drag.drag_connect_dest_type = dest_type;
					    __current_drag.drag_connect_dest_node_identifier = dest_node_identifier;

						return true;
					},
					ondropdeactivate: function() {
						that.__reset_drag_ux_data();
					},
					ondrop: function(e) {
						
						var __current_drag = that.props.__current_drag;
						
						var source_inout = __current_drag.drag_connect_inout;
					    var source_type = __current_drag.drag_connect_type;
					    var source_node_identifier = __current_drag.node_identifier;

					    var dest_inout = __current_drag.drag_connect_dest_inout;
					    var dest_type = __current_drag.drag_connect_dest_type;
					    var dest_node_identifier = __current_drag.drag_connect_dest_node_identifier;

					    if( source_inout == "output" ) {
					    	var from = that.props.nodes[source_node_identifier];
					    	var to = that.props.nodes[dest_node_identifier];
					    } else {
					    	var to = that.props.nodes[source_node_identifier];
					    	var from = that.props.nodes[dest_node_identifier];
					    }

					    SynthezNode.connect_nodes(from, to, source_type);
					},
				});

			})(that, container_id);
			
		},

		__destroy_ux_listeners: function() {
			var that = this;
			var container_id = that.get_dom_element_id();

			/* InteractJS */
			interact('#'+container_id+' .synthez-node-body .synthez-dom-node').unset();
		},

		/* Public Container methods */
		add_node: function(node_class_name, user_options) {
			var new_node_builder = SynthezNode.__definitions[node_class_name];

			if( typeof new_node_builder !== "function" ) {
				console.error("'"+node_class_name+"' is not a registered node");
				return;
			}
			
			var new_node = new_node_builder();
			new_node.init(user_options, this);
			
			this.props.nodes[new_node.identifier] = new_node;

			if( this.container_is_opened ) {
				new_node.spawn_dom_element();
			}

			new_node.trigger('after_spawn');

			return new_node;
		},

		open: function() {
			for(var id in this.props.nodes ) {
				this.props.nodes[id].spawn_dom_element();
			}
			this.container_is_opened = true;
			this.dom_element.classList.add('synthez-dom-is-opened');

			this.__update_svg_wrapper_size();

			this.__setup_ux_listeners();
		},

		close: function() {
			for(var id in this.props.nodes ) {
				this.props.nodes[id].destroy_dom_element();
			}
			this.container_is_opened = false;
			this.dom_element.classList.remove('synthez-dom-is-opened');

			this.__destroy_ux_listeners();
		}
	}
});