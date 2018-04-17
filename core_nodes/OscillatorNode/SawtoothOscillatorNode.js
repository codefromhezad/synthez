SynthezNode.define('SawtoothOscillatorNode', {
	extends: 'OscillatorNode',
	nice_name: 'Sawtooth Oscillator',
	icon: {
		file: 'core_nodes/OscillatorNode/oscillator_sawtooth.svg',
		credits: 'sawtooth by Aurélien Lemesre from the Noun Project'
	},
	defaults: {
		type: OSC_TYPE_SAWTOOTH,
		frequency: 440
	}
});