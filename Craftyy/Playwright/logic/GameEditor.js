(function(exports){

/***

GAME EDITOR: 
- Creates, edits & previews a Screenplay Project & its assets.
- Components for asset creation.

*/
var GameEditor = {

	initialize: function(){

		Logic.initialize({
			layout:{ 
				src:"/Craftyy/Playwright/layout/Calendar.js" 
			},
			modules:[
				
				// The first one
				{ id:"scene", src:"/Craftyy/Modules/Screenwrite/Screenwrite.html" },

				// Displayed tabs
				{ id:"publish", src:"/Craftyy/Modules/Publish/publish.html" },
				{ id:"preview", src:"/Craftyy/Modules/Showtime/showtime.html" },
				{ id:"draw", src:"/Craftyy/Modules/Draw/draw.html" },
				{ id:"import", src:"/Craftyy/Modules/Import/import.html" },
				//{ id:"actionmaker", src:"/Craftyy/Modules/ActionMaker/actionmaker.html" },

				// Experimental

				// Hidden, but used.
				//{ id:"actions", src:"/Craftyy/Modules/Actor/actor.html" },
				{ id:"actions", src:"/Craftyy/Modules/Actions/actions.html" },
				{ id:"user", src:"/a?module=true" },

			]
		});

		Logic.ready(GameEditor.loadProject);

	},

	loadProject: function(){

		Loader.loadJSON(Playwright.config.game).done(function(project){
		
			GameEditor.project = project;

			Asset.unpackage(GameEditor.project.assets).done(function(unpackaged){

				GameEditor.unpackaged = unpackaged;

				// EDIT FIRST SCENE
				var scenes = Asset.hasTag(GameEditor.unpackaged,"scene");
				Asset.load(scenes).done(function(){
					GameEditor.editScene( GameEditor.project.scenes[0] );
				});

			});

		});

	},

	saveWorkingScene: function(){

		var promise = new Promise(); // TODO: Thenables? Just passing new params to next promise?

		Messenger.request("screenwrite.Serialize").done(function(serializedScene){

			var workingAsset = Asset.getByID(GameEditor.project.assets,GameEditor.workingScene);

			var workingScene = {
				"label": workingAsset.label,
				
				"id": GameEditor.workingScene,
				"type": "json/object",
				"tags": ["scene"],
				"data": serializedScene
			};

			// REPLACE in Project & Resources
			// TODO: A WAY TO FORCE RELOAD CHANGED ASSETS

			// Project Assets
			var workingIndex = GameEditor.project.assets.indexOf(workingAsset);
			GameEditor.project.assets.splice(workingIndex,1,workingScene);

			// Unpackaged
			var workingIndex = GameEditor.unpackaged.indexOf(workingAsset);
			GameEditor.unpackaged.splice(workingIndex,1,workingScene);

			// Resource
			Asset.resources[GameEditor.workingScene] = serializedScene;

			// Yay
			promise.resolve();

		});

		return promise;

	},

	editScene: function(sceneID){
		GameEditor.workingScene = sceneID;
		Edit.withModule("scene", Asset.resources[GameEditor.workingScene], {sceneID:sceneID} );
	},

	publishGame: function(){

		// 1) Source code
		GameEditor.serializeProject().done(function(serializedProject){

			// 2) Compiled playable
			GameEditor.compileProject().done(function(compiledProject){

				// 3) Screenshot
				Messenger.request("screenwrite.Thumbnail").done(function(rawThumb){

					// 4) Publish
					Edit.withModule("publish", {
						title: Playwright.config.title,
						parentID: Playwright.config.parentID,
						serialized: serializedProject,
						compiled: compiledProject,
						thumbnail: rawThumb
					});

				});

			});
		});

	},

	serializeProject: function(){

		var promise = new Promise();

		GameEditor.saveWorkingScene().done(function(){
			var project = JSON.parse(JSON.stringify(GameEditor.project)); // Clones object
			promise.resolve(project);
		});

		return promise;

	},

	compileProject: function(){

		var promise = new Promise();

		GameEditor.saveWorkingScene().done(function(){
			Messenger.request("library.Refresh").done(function(){
				Messenger.request("screenwrite.CompileProject").done(function(compiledProject){
					promise.resolve(compiledProject);
				});
			});
		});

		return promise;

	},

	previewGame: function(){
		GameEditor.compileProject().done(function(compiledProject){
			Edit.withModule("preview",compiledProject);
			// TODO: One Scene?
			// TODO: Preview has special stuff like debug, skip scene, etc...
		});
	},

	createAction: function(codes){

		if(!codes) return;

		var actionScript = {
			"id": "script.CustomActionScript",
			"type": "javascript/text",
			"tags": ["script","preview"],
			"data": codes.action
		};
		var inspectorScript = {
			"id": "script.CustomInspectorScript",
			"type": "javascript/text",
			"tags": ["script","inspector"],
			"data": codes.inspector
		};
		var actionAsset = JSON.parse(codes.asset);

		GameEditor.project.assets.push(actionScript);
		GameEditor.unpackaged.push(actionScript);

		GameEditor.project.assets.push(inspectorScript);
		GameEditor.unpackaged.push(inspectorScript);

		GameEditor.project.assets.push(actionAsset);
		GameEditor.unpackaged.push(actionAsset);

	},

	addRawImage: function(dataURI){

		if(dataURI==null) return; // Cancelled
		
		var id = Asset.generateID( GameEditor.project.assets, "art.CustomArt" );
		var asset = {
			"id": id,
			"type": "image/raw",
			"tags": ["art","image","raw","custom"],
			"data": dataURI
		};
		GameEditor.project.assets.push(asset);
		GameEditor.unpackaged.push(asset);

		Messenger.request("library.Refresh");

	}

};

/////////////////
// SINGLETON
GameEditor.initialize();
exports.GameEditor = GameEditor;



/////////////////
// MESSENGER API

Logic.ready(function(){

	Messenger.handleRequest("project.AddRawImage",GameEditor.addRawImage);
	Messenger.handleRequest("project.AddAsset",function(asset){
		GameEditor.project.assets.push(asset);
		GameEditor.unpackaged.push(asset);
	});

	Messenger.handleRequest("project.CreateAction",function(def){

		var asset = def.asset;
		var action = def.action;
		
		var id = Asset.generateID( GameEditor.project.assets, "action.CustomAction" );
		var actionAsset = {

			label: id,
			icon: "stickers/custom.png",

			id: id,
			type: "json/object",
			tags: asset.tags.concat(),
			data: action

		};

		GameEditor.project.assets.push(actionAsset);
		GameEditor.unpackaged.push(actionAsset);

	});

	Messenger.handleRequest("project.GetProject",function(){
		return GameEditor.project;
	});
	Messenger.handleRequest("project.GetUnpackaged",function(){
		return GameEditor.unpackaged;
	});
	Messenger.handleRequest("project.GetArt",function(){
		return Asset.hasTag(GameEditor.unpackaged,"art");
	});
	Messenger.handleRequest("project.GetActors",function(){
		return Asset.hasTag(GameEditor.unpackaged,"actor");
	});
	Messenger.handleRequest("project.GetActions",function(){
		return Asset.hasTag(GameEditor.unpackaged,"action");
	});

	Messenger.handleRequest("project.GetInspectorAssets",function(){
		
		var scripts = Asset.hasAllTags(GameEditor.unpackaged,["script","inspector"]);
		var assets = Asset.hasAnyTag(GameEditor.unpackaged,["art","audio","actor","action"]);

		return scripts.concat(assets);

	});
	Messenger.handleRequest("project.GetCompiledAssets",function(){

		var scripts = Asset.hasAllTags(GameEditor.unpackaged,["script","preview"]);
		var assets = Asset.hasAnyTag(GameEditor.unpackaged,["art","audio","actor","sprite","scene"]);

		return scripts.concat(assets);

	});

	Messenger.subscribe("project.BackToScene",function(){
		Playwright.showModule("scene");
	});

	Messenger.handleRequest("project.EditScene",function(sceneID){
		GameEditor.saveWorkingScene().done(function(){
			GameEditor.editScene(sceneID);
		});
	});

	Messenger.handleRequest("project.AddScene",function(){
		
		// Create Scene Asset
		var id = Asset.generateID( GameEditor.project.assets, "scene.CustomScene" );
		var asset = {

			label: id,

			id: id,
			type: "json/object",
			tags: ["scene"],
			data: {
				"actions": [
					{
						"is": "edit.Actions",
						"actions": [
							{
								"is": "scene.Layers",
								"layers": ["background","foreground","overlay"]
							},
							{
								"is": "box2d.World"
							}
						]
					}
				],
				"actors": [
					{
						"actors": [],
						"actions": []
					},
					{
						"actors": [],
						"actions": []
					},
					{
						"actors": [],
						"actions": []
					}
				]
			}

		};

		// Add to Asset lists
		GameEditor.project.assets.push(asset);
		GameEditor.unpackaged.push(asset);
		Asset.resources[id] = asset.data;

		// Add to Scene Array
		GameEditor.project.scenes.push(id);

		// Edit Scene
		GameEditor.saveWorkingScene().done(function(){
			GameEditor.editScene(id);
		});

	});

});

/////////////////
// CALENDAR TABS

Logic.ready(function(){
	
	Calendar.tabs.publish.dom.onclick = GameEditor.publishGame;
	Calendar.tabs.preview.dom.onclick = GameEditor.previewGame;

	Calendar.tabs.home.dom.onclick = function(){
		
		// JUST A TEST
		//window.top.location.href = '/';
		
		Edit.withModule("user");

	};
	Calendar.tabs.actionmaker.dom.onclick = function(){
		//Edit.withModule("actionmaker").done(GameEditor.createAction);

		Edit.withModule("import").done(function(customArts){

			if(!customArts) return;

			for(var i=0;i<customArts.length;i++){
				var asset = customArts[i];
				GameEditor.project.assets.push(asset);
				GameEditor.unpackaged.push(asset);
			}

			Messenger.request("library.Refresh");

		});

	};
	Calendar.tabs.draw.dom.onclick = function(){
		if(Playwright.currentModule.id=="draw") return;
		Edit.withModule("draw").done(GameEditor.addRawImage);
	};

});

})(window);