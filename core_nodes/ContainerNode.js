const ROOT_NODES_CONTAINER_ID = 'root';

SynthezNode.define('ContainerNode', {
	nice_name: 'Container',
	defaults: {},
	props: {
		nodes: {},
		container_is_opened: false,
		svg_wrapper: null,
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

		__setup_ux_listeners: function() {
			var that = this;
			var container_id = that.get_dom_element_id();

			/* InteractJS */
			(function(that, container_id) {

				var __current_drag = {
					handle: null,
					target: null,
					node_identifier: null
				};

				interact('#'+container_id+' .synthez-node-body .synthez-dom-node')
					.draggable({
						allowFrom: '.synthez-node-title, .synthez-node-connector',
						restrict: {
							restriction: that.dom_element_children.body
						},
						onstart: function(event) {
							__current_drag.target = event.target;
							__current_drag.handle = event.interaction._eventTarget;
							__current_drag.node_identifier = event.target.getAttribute('data-identifier');
							__current_drag.target_node = that.props.nodes[__current_drag.node_identifier];
						},
						onend: function(event) {
							__current_drag.target = null;
							__current_drag.handle = null;
							__current_drag.node_identifier = null;
							__current_drag.target_node = null;
						},
						onmove: function(event) {

							var target = __current_drag.target,
						        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
						        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

						    var target_node = __current_drag.target_node;

						    /* Move node */
						    target_node.set_position({x: x, y: y});

						    /* Update Node SVG connexions */
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
						}
					})

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