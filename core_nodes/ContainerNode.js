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

			return new_node;
		},

		open: function() {
			for(var id in this.props.nodes ) {
				this.props.nodes[id].spawn_dom_element();
			}
			this.container_is_opened = true;
			this.dom_element.classList.add('synthez-dom-is-opened');

			this.__update_svg_wrapper_size();
		},

		close: function() {
			for(var id in this.props.nodes ) {
				this.props.nodes[id].destroy_dom_element();
			}
			this.container_is_opened = false;
			this.dom_element.classList.remove('synthez-dom-is-opened');
		}
	}
});