(function(exports){

/***

Calling a Module to be used as an EDITOR.

Top-level Playwright handles edit requests
Submodules & Playwright can call Edit.withModule()

*/
var Edit = {

	configurePlaywright: function(){

		Messenger.handleRequestPromise("edit.withModule",function(params){

			var promise = new Promise();

			var prevModuleID = Playwright.currentModule.id;
			var moduleID = params.module;
			var input = params.input;
			var config = params.config;

			// 1) Show the requested Module
			Messenger.request("playwright.showModule",moduleID).done(function(){

				// 2) Get the output
				Messenger.request("module.Edit",{ input:input, config:config }).done(function(output){

					// 3) Swap back to original Module
					Messenger.request("playwright.showModule",prevModuleID).done(function(){
						
						// 4) Output
						promise.resolve(output);

					});

				});

			});

			return promise;

		});

	},

	withModule: function(moduleID,input,config){

		return Messenger.request("edit.withModule",{
			module: moduleID,
			input: input,
			config: config
		});

	}

};

// SINGLETON
exports.Edit = Edit;

})(window);