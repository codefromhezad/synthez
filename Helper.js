var Helper = {
	/* String stuff */
	camel_case_to_dash_case: function(str) {
		return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
	},

	/* DOM stuff */
	create_element_from_HTML: function(html_string) {
		var div = document.createElement('div');
		div.innerHTML = html_string.trim();

		return div.firstChild; 
	},

	inject_css_file: function(path) {
		if( ! window.__synthez_injected_css_files ) {
			window.__synthez_injected_css_files = {};
		}

		if( ! window.__synthez_injected_css_files[path] ) {
		    var head  = document.getElementsByTagName('head')[0];
		    var link  = document.createElement('link');
		    link.rel  = 'stylesheet';
		    link.type = 'text/css';
		    link.href = path;
		    link.media = 'all';
		    head.appendChild(link);

		    window.__synthez_injected_css_files[path] = true;
		}
	}
}