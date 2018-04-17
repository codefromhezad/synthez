SynthezNode.define('TriangleOscillatorNode', {
	extends: 'OscillatorNode',
	nice_name: 'Triangle Oscillator',
	icon: {
		file: 'core_nodes/OscillatorNode/oscillator_triangle.svg',
		credits: 'Trianglewave by Aurélien Lemesre from the Noun Project'
	},
	defaults: {
		type: OSC_TYPE_TRIANGLE,
		frequency: 440
	}
});