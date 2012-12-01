(function(exports){

/***

=== PLAYWRIGHT ARCHITECTURE ===
1) Layout, which is a component.
2) Modules, only one connected at a time.
3) Component JS's needed by the above two.

=== FLOW ===
Configures: Logic, then Layout & Modules
Initializes: Layout, Logic, then Modules

***/

var Playwright = {

	initialize: function(config){

		Playwright.config = config;

		// INIT on LOAD
		window.addEventListener("load", function(){
			Loader.loadScript(config.logic);
		}.bind(this));

		// INTERFACE
		Edit.configurePlaywright();
		Messenger.subscribe("playwright.showModule",function(message){
			
			var response = message.response;
			var moduleID = message.params;

			this.showModule(moduleID).done(function(){
				Messenger.publish(response);
			});

		}.bind(this));


	},

	configure: function(config){

		console.log("Configuring Layout & Modules...");

		// Load Layout
		var promise = new Promise();
		Messenger.subscribe("layout.Initialized",function(){
			console.log("Layout Initialized!");
			promise.resolve();
		});
		Loader.loadScript(config.layout.src);

		// Configure Playwright Modules
		for(var i=0;i<config.modules.length;i++){
			var mod = config.modules[i];
			this.addModule(mod);
		}

		return promise;

	},

	////////////////////////
	// MODULES

	modules: {},
	currentModule: {},

	addModule: function(mod){
		var id = mod.id || mod.src;
		var src = mod.src;
		Playwright.modules[id] = { id:id, src:src };
	},

	showModule: function(id){

		// Same thing, except show it in Layout.
		var promise = Playwright.connectModule(id);
		promise.done(function(module){
			Layout.showModule(module);
			Messenger.publish("module.Focus");
		});
		return promise;

	},

	connectModule: function(id){

		console.log("\n== CONNECT MODULE "+id+" ==");

		// Promise it, resolve immediately if already loaded.
		var promise;
		var existingIframe = Playwright.modules[id].iframe;
		if(existingIframe){
			promise = new Promise();
			promise.resolve(Playwright.modules[id]);
		}else{
			promise = Playwright.loadModule(id);
		}

		// When promise fulfilled, have the Layout show it.
		promise.done(function(module){

			Messenger.publish("module.Blur");
			Messenger.connectTo(module.iframe.contentWindow);

			Playwright.currentModule = module;

		});

		return promise;

	},

	loadModule: function(id){

		console.log("Loading Module...");

		// Get config
		var config = Playwright.modules[id];
		var promise = new Promise();
		
		// Create iframe
		var iframe = document.createElement("iframe");
		Layout.addIframe(iframe);

		// One-time load event.
		iframe.addEventListener("load", function onLoad(){
			iframe.removeEventListener("load",onLoad);
			promise.resolve(config);
			console.log("Module Initialized!");
		});
		iframe.src = config.src;

		// Store it.
		config.iframe = iframe;

		// Promise a module with all components loaded.
		return promise;

	}

};

// SINGLETON
exports.Playwright = Playwright;

})(window);