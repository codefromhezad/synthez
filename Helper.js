var Helper = {
	camel_case_to_dash_case: function(str) {
		return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
	}
}