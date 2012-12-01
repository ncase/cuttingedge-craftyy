(function(exports){

var Import = {

	initialize: function(){
		Module.initialize();
		Module.input(function(){}); // NOTHING LOL
		Import.initButtons();
	},

	output: function(){

		var alias = document.getElementById("alias").value;

		ajax.get('/project/creationFromAlias/'+alias).done(function(creationJSON){

			var creation = JSON.parse(creationJSON);
			if(!creation.compiled) return;
			
			ajax.get(creation.compiled).done(function(json){

				var compiledProject = JSON.parse(json);

				// CUSTOM ASSETS
				var hasTag = function(assets,tag){
					return assets.filter(function(asset){
						return( asset.tags.indexOf(tag) >= 0 );
					});
				};
				var customArts = hasTag(compiledProject.assets,"custom");

				// OUTPUT
				Module.output(customArts);

			});

		});

	},
	cancel: function(){
		Module.output(null);
	},

	initButtons: function(){
		document.getElementById("import_button").addEventListener("click",Import.output);
		document.getElementById("cancel_button").addEventListener("click",Import.cancel);
	}

};

// SINGLETON
exports.Import = Import;
Import.initialize();

})(window);