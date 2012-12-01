(function(exports){

/***

SCREENWRITE
- Handles Scene manipulation
- Handles serialization & compilation

TODO:
- NOT input components
- NOT UI components

*/
var Screenwrite = {

	initialize: function(){

		// Init Module
		Module.initialize();
		Module.ready(this.init.bind(this));
		Module.input(this.input.bind(this));
		Module.focus(this.focus);
		Module.blur(this.blur);

		// Init UI
		_initSidebar();
		_initResize();
		_initLibrary();

		// Mesenger
		Messenger.handleRequest("screenwrite.Serialize",Screenwrite.serialize);
		Messenger.handleRequest("screenwrite.Compile",Screenwrite.compile);
		Messenger.handleRequest("screenwrite.CompileProject",Screenwrite.compileProject);

	},

	init: function(){

		// Screenplay
		Screenplay.initialize({
			easel: {
				canvas: document.getElementById("canvas"),
				width:document.body.clientWidth,
				height:document.body.clientHeight,
				fps:30
			},
			scene: {}
		});

		// === TABS ===

		// Find all Tags
		var tabs = {};
		var tabConfigs = [
			
			{id:"gamepieces",bgPosition:"-5px -30px"},
			{id:"art",bgPosition:"-105px -30px"},
			{id:"layers",bgPosition:"-205px -30px"},
			{id:"scenes",bgPosition:"-305px -30px"}

		];

		// Create Tab for each one
		var tabContainer = document.getElementById("tabs");
		for(var i=0; i<tabConfigs.length; i++){
			(function(tab){
				var dom = document.createElement("div");
				tabContainer.appendChild(dom);
				dom.style.backgroundPosition = tab.bgPosition;
				dom.onclick = function(){
					Screenwrite.showLibrary(tab.id);
				};
			})(tabConfigs[i]);
		}

		// Handle Main Edit JSON input
		Screenwrite.addInputHandler( "scene", function(input,config){
			
			Screenwrite.workingSceneID = config.sceneID;
			
			Screenwrite.refreshLibrary().done(function(){
				
				Scene.goto(input);
				
				// TODO: Layers BEFOREHAND?...
				var layers = Screenplay.scene.layers.getOrder();
				Screenwrite.libraries.layers.empty();
				Screenwrite.libraries.layers.addItems(layers);
				Screenwrite.libraries.layers.highlightID("foreground");

			});
		});

		// REFRESH
		Messenger.handleRequestPromise("library.Refresh",Screenwrite.refreshLibrary);

		// SELECT & DESELECT
		News.subscribe("edit.Selected",function(actor){
			Global.selected = actor;
		});
		News.subscribe("edit.Deselected",function(){
			Global.selected = null;
		});
		News.subscribe("mousedown",function(){
			var obj = Screenplay.stage.getObjectUnderPoint(Mouse.x,Mouse.y);
			if(!obj) News.publish("edit.Deselected");
		});

	},

	refreshLibrary: function(){
		var promise = new Promise();
		Messenger.request("project.GetProject").done(function(project){

			Screenwrite.project = project;

			Messenger.request("project.GetUnpackaged").done(function(unpackaged){

				Screenwrite.unpackaged = unpackaged;

				var artItems = Asset.hasTag(Screenwrite.unpackaged,"art");
				var actorItems = Asset.hasTag(Screenwrite.unpackaged,"actor");
				var screenwriteAssets = artItems.concat(actorItems);

				Asset.load(screenwriteAssets).done(function(){

					Screenwrite.libraries.art.empty();
					Screenwrite.libraries.gamepieces.empty();
					Screenwrite.libraries.scenes.empty();

					Screenwrite.libraries.art.addItems(artItems);
					Screenwrite.libraries.gamepieces.addItems(actorItems);
					Screenwrite.libraries.scenes.addItems(Screenwrite.project.scenes);

					Screenwrite.showLibrary("gamepieces");
					Screenwrite.libraries.scenes.highlightID(Screenwrite.workingSceneID);

					promise.resolve();

				});

			});
		});
		return promise;
	},

	/////////////
	// INPUT HANDLER COMPONENTS

	_inputHandlers: {},
	input: function(input,config){
		config = config || {};
		var mode = config.mode ? config.mode : 'scene';
		var handler = Screenwrite._inputHandlers[mode];
		handler(input,config);
	},
	addInputHandler: function(id,callback){
		Screenwrite._inputHandlers[id] = callback;
	},

	/////////////
	// OUTPUT

	serialize: function(){ return _output.call(Screenplay.scene,"serialize"); },
	compile: function(){ return _output.call(Screenplay.scene,"compile"); },
	output: function(target,funcName){ return _output.call(target,funcName); },

	/////////////
	// FOCUS/BLUR

	focus: function(){
		Screenplay.paused=false;
	},
	blur: function(){ 
		Screenplay.paused=true;
		Global.selected = null;
		News.publish("edit.Deselected");
	},

	/////////////
	// COMPILE ALL SCENES DAMMIT
	
	compileProject: function(){

		Screenplay.paused = true;

		// Compiled Assets
		var scripts = Asset.hasAllTags(Screenwrite.unpackaged,["script","preview"]);
		var assets = Asset.hasAnyTag(Screenwrite.unpackaged,["art","audio","actor","sprite"]);

		// Compiled Scenes
		var compiledScenes = [];
		var scenes = Screenwrite.project.scenes;
		for(var i=0;i<scenes.length;i++){

			var sceneID = scenes[i];
			var sceneAsset = Asset.getByID(Screenwrite.unpackaged,sceneID);

			Scene.goto(sceneAsset.data); // HACK? Assumes Scene is Object
			var compiledScene = Screenwrite.compile();

			compiledScenes.push({
				id: sceneID,
				type: "json/object",
				tags: ["scene"],
				data: compiledScene
			});

		}

		// Manifest & Project
		var compiledManifest = scripts.concat(assets).concat(compiledScenes);
		var project = {
			scenes: Screenwrite.project.scenes.concat(),
			assets: compiledManifest
		};

		// Reset
		var sceneAsset = Asset.getByID(Screenwrite.unpackaged,Screenwrite.workingSceneID);
		Scene.goto(sceneAsset.data);

		// Promised Compiled Project
		return project;

	}

};


////////////////////
// INPUT / OUTPUT
////////////////////

var _output = function(funcName){

	// Subactors
	var actors = [];
	for(var i=0; i<this.actors.length; i++){
		var actor = this.actors[i];
		actors.push( _output.call(actor,funcName) );
	}

	// Subactions
	var actions = [];
	for(var i=0; i<this.actions.length; i++){
		var action = this.actions[i];
		if(action[funcName]){
			var actionOutput = action[funcName]();
			if(actionOutput) actions = actions.concat(actionOutput);
		}
	}	

	return {
		actors: actors,
		actions: actions
	};

};


////////////////////
// UI
////////////////////

var _initSidebar = function(){

	var sidebar = document.getElementById("library");
	var hideButton = document.getElementById("hide_button");
	hideButton.onclick = function(){
		var isHidden = (sidebar.getAttribute("class")=="hidden");
		sidebar.setAttribute( "class", isHidden ? "" : "hidden" );
		hideButton.innerHTML = isHidden ? ">>" : "<<";
	};

};

var _initResize = function(){
	
	var canvas = document.getElementById("canvas");
	var onResize = function(){
		
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
		Screenplay.stage.update();

		var libraryContainer = document.getElementById("galleries");
		libraryContainer.style.height = document.body.clientHeight - 100; // - Top - Bottom

	};

	window.addEventListener("resize",onResize);
	Module.ready(onResize);

};

var _initLibrary = function(){
	
	// Create libraries
	Screenwrite.libraries = {
		gamepieces: new exports["lib.Gamepieces"](),
		art: new exports["lib.Art"](),
		layers: new exports["lib.Layers"](),
		scenes: new exports["lib.Scenes"]()
	};

	// Add all libraries to DOM
	var libraryContainer = document.getElementById("galleries");
	for(var lib in Screenwrite.libraries){
		libraryContainer.appendChild(Screenwrite.libraries[lib].dom);
	}

	// Library API
	Screenwrite.showLibrary = function(id){
		
		Screenwrite.selectedLibrary = Screenwrite.libraries[id];

		for(var lib in Screenwrite.libraries){
			var dom = Screenwrite.libraries[lib].dom;
			dom.style.display = (id==lib) ? 'block' : 'none';
		}

	};

	// HACK: STAMPING
	News.subscribe("keydown",function(event){
		if(event.keyCode==32){

			if(!Screenwrite.selectedLibrary.selectedItem) return;
			if(!Screenwrite.selectedLibrary.selectedItem.data) return;

			var message = {
				x: Mouse.x,
				y: Mouse.y,
				item: Screenwrite.selectedLibrary.selectedItem.data
			};

			DropAddItem.addActor(message);
			News.publish("edit.Deselected");

		}
	});

};


////////////////////
// SINGLETON
////////////////////

exports.Screenwrite = Screenwrite;
Screenwrite.initialize();


})(window);