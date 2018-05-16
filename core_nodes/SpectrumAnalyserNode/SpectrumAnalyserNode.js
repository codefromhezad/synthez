SynthezNode.define('SpectrumAnalyserNode', {
	nice_name: 'Spectrum Analyser',
	icon: {
		/* No icon */
	},
	defaults: {
		smoothing_time_constant: 0.3,
		fft_size: 512,
	},
	props: {
		canvas: null,
		canvas_ctx: null,
		animation_frame_handler: null,
	},
	listeners: {
		on_init: function() {
			this.boot();
		},
		after_spawn: function() {
			this.dom_element_children.canvas = Helper.create_element_from_HTML('<canvas class="synthez-visualiser-screen"></canvas>');
			this.dom_element_children.body.appendChild(this.dom_element_children.canvas);

			this.props.canvas = this.dom_element_children.canvas;
			this.props.canvas_ctx = this.props.canvas.getContext('2d');

			this.start();
		},
	},
	methods: {
		/* Private Analyser methods */
		__draw: function() {
			if( ! this.web_audio_node_handle ) {
				return;
			}

			var c_ctx = this.props.canvas_ctx;
			var a_ctx = this.web_audio_node_handle;

			var width = c_ctx.canvas.width;
			var height = c_ctx.canvas.height;
			var freq_data = new Uint8Array(a_ctx.frequencyBinCount);
			var scaling = height / 256;

			a_ctx.getByteFrequencyData(freq_data);

			c_ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
			c_ctx.fillRect(0, 0, width, height);

			c_ctx.lineWidth = 2;
			c_ctx.strokeStyle = 'rgb(0, 200, 0)';
			c_ctx.beginPath();

			for (var x = 0; x < width; x++) {
				c_ctx.moveTo(x, height);
				c_ctx.lineTo(x, height - freq_data[x] * scaling);
				c_ctx.stroke();
			}
		},

		/* Public Analyser setters/getters */
		set_smoothing_time_constant: function(new_value) {
			this.settings.smoothing_time_constant = new_value;

			if( this.web_audio_node_handle ) {
				this.web_audio_node_handle.smoothingTimeConstant = this.settings.smoothing_time_constant;
			}
		},

		set_fft_size: function(new_value) {
			this.settings.fft_size = new_value;
			
			if( this.web_audio_node_handle ) {
				this.web_audio_node_handle.fftSize = this.settings.fft_size;
			}
		},


		/* Public Analyser interaction methods */
		start: function() {
			var that = this;

			(function(that) {
				function step() {
					that.__draw();
					that.props.animation_frame_handler = requestAnimationFrame(step); 
				}
				that.props.animation_frame_handler = requestAnimationFrame(step); 
			})(that);
		},

		stop: function() {
			cancelAnimationFrame(this.props.animation_frame_handler);
		},

		boot: function() {
			this.web_audio_node_handle = this.audio_context.createAnalyser();

			this.set_smoothing_time_constant(this.settings.smoothing_time_constant);
			this.set_fft_size(this.settings.fft_size);
		},
	}
});

