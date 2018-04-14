const ROOT_NODES_CONTAINER_ID = 'root';

AudioNode.define('ContainerNode', {
	nice_name: 'Container',
	defaults: {},
	props: {
		nodes: {},
		container_is_opened: false
	},
	listeners: {
		on_init: function() {
			this.spawn_dom_element();
		},
	},
	methods: {
		/* Public Container methods */
		add_node: function(node_class_name, user_options) {
			var new_node = AudioNode.__definitions[node_class_name]();
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
			this.dom_element.classList.add('synthez-container-is-opened');
		},

		close: function() {
			for(var id in this.props.nodes ) {
				this.props.nodes[id].destroy_dom_element();
			}
			this.container_is_opened = false;
			this.dom_element.classList.remove('synthez-container-is-opened');
		}
	}
});