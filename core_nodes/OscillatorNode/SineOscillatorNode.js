SynthezNode.define('SineOscillatorNode', {
	extends: 'OscillatorNode',
	nice_name: 'Sine Oscillator',
	icon: {
		file: 'core_nodes/OscillatorNode/oscillator_sine.svg',
		credits: 'Sine Wave by Davo Sime from the Noun Project'
	},
	defaults: {
		type: OSC_TYPE_SINE
	}
});