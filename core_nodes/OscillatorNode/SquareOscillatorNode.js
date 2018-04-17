SynthezNode.define('SquareOscillatorNode', {
	extends: 'OscillatorNode',
	nice_name: 'Square Oscillator',
	icon: {
		file: 'core_nodes/OscillatorNode/oscillator_square.svg',
		credits: 'Squarewave by Aurélien Lemesre from the Noun Project'
	},
	defaults: {
		type: OSC_TYPE_SQUARE,
		frequency: 440
	}
});