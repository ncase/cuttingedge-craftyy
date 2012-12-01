(function(exports){

/***

LOADER - Loads HTML & Scripts

*/
var Loader = {

	loadHTML: function(url){

		// After XHR, put into a div.
		var promise = new Promise();
		ajax.get(url).done(function(innerHTML){
			var div = document.createElement('div');
			div.innerHTML = innerHTML;
			promise.resolve(div);
		});
		return promise;

	},

	loadJSON: function(url){
		
		var promise = new Promise();
		
		ajax.get(url).done(function(json){
			var object = JSON.parse(json);
			promise.resolve(object);
		});

		return promise;

	},

	loadScript: function(source){

		// Create script
		var promise = new Promise();
		var script = document.createElement("script");

		// Load event.
		script.onload = function(){
			promise.resolve(script);
		};
		script.src = source;
		document.body.appendChild(script);

		// Promise a loaded Script.
		return promise;

	},

	loadScripts: function(sources){

		// Zero scripts edge case
		var promise = new Promise();
		if(sources.length==0){
			promise.resolve();
			return promise;
		}

		// Load all scripts
		var _scriptsLeft = sources.length;
		var _onScriptLoad = function(){
			if(--_scriptsLeft==0) promise.resolve();
		};
		for(var i=0; i<sources.length; i++){
			var source = sources[i];
			Loader.loadScript(source).done(_onScriptLoad);
		}
		return promise;

	}

};

exports.Loader = Loader;

})(window);