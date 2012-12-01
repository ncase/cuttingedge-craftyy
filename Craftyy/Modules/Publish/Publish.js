(function(exports){

/***

For now, simple Scene JSON i/o

*/
var Publish = {
	initialize: function(){
		Module.initialize();
		Module.input(this.input);
		_initButtons();
	},
	input: function(input){
		
		Publish._input = input;

		document.getElementById("title").value = input.title;
		document.getElementById("thumbnail").src = input.thumbnail;

	},
	submit: function(gameData){
		gameData.parent_id = Publish._input.parentID;
		return ajax.post("/Creation/savePlaywright",gameData);
	}
};

//////////////
// HELPER 

var _initButtons = function(){


	document.getElementById("export").onclick = function(){
		document.getElementById("info").style.display = 'none';
		document.getElementById("response2").style.display = 'block';
		document.getElementById("response_export").value = JSON.stringify(Publish._input.serialized);
	};
	document.getElementById("back_from_export").onclick = function(){
		document.getElementById("info").style.display = 'block';
		document.getElementById("response2").style.display = 'none';
	};


	document.getElementById("cancel").onclick = function(){
		Module.output();
	};
	document.getElementById("submit").onclick = function(){
		
		// CHECK IF LOGGED IN.
		ajax.post('/user/getCurrentUser').done(function(response){
			var user = JSON.parse(response);
			if(user){

				// Game Data
				var gameData = {
					title: document.getElementById("title").value,
					blurb: document.getElementById("blurb").value
				};

				// INFO
				document.getElementById("submit").style.display = 'none';
				document.getElementById("info").style.display = 'none';
				document.getElementById("response").style.display = 'block';

				///////////////////
				// SAVE GAME DATA

				saveCustomAssets().promise.done(function(){
					saveProject().promise.done(function(projectData){
						saveThumbnails().promise.done(function(thumbnailData){

							gameData.source = projectData.source;
							gameData.compiled = projectData.compiled;
							gameData.thumbnail = thumbnailData.thumbnail;

							// Message
							document.getElementById("response_link").innerHTML = "Saving Game...";
							console.log(gameData);

							// Yes - save it.
							Publish.submit(gameData).done(function(response){
							
								response = JSON.parse(response);
								var alias = response.alias;
								document.getElementById("response_link").innerHTML = "http://labs.craftyy.com/c/"+alias;

								// You now have my permission to leave
								Messenger.request("DisableExitPrompt");
							
							});

						});
					});					
				});

			}else{

				// No - Prompt login.
				Edit.withModule("user");

			}
		});

	};

};


///////////////////////////////////////////////////
// STAGE GATES
///////////////////////////////////////////////////

// TODO: An Addon to Promise?
// Thenables? Stages?

var getStageGate = function(stageDef){
	
	// Promise & Message
	var assetsSaved = new Promise();
	var promiseMessage = {};

	// Saving Assets
	var _assetsTotal = stageDef.amount;
	var _assetsLeft = _assetsTotal;
	var _onSaved = function(url){
		if(!url) return; //error
		_assetsLeft--;
		_next();
	}

	// Message
	var responseDOM = document.getElementById("response_link");
	var _next = function(){
		responseDOM.innerHTML = stageDef.label+"... ("+_assetsLeft+"/"+_assetsTotal+")";
		if(_assetsLeft==0) assetsSaved.resolve(promiseMessage);
	};
	_next();

	// Stage Gate
	return {
		promise: assetsSaved,
		callback: _onSaved,
		message: promiseMessage
	};

};

///////////////////////////////////////////////////
// SAVE CUSTOM RAW IMAGES & REPLACE URL
///////////////////////////////////////////////////

var saveCustomAssets = function(){

	// Which are the custom arts?
	var rawImages = Asset.hasAllTags(Publish._input.serialized.assets,["image","raw"]);
	var stageGate = getStageGate({
		label: "Saving Custom Art",
		amount: rawImages.length
	});

	// Custom Art Assets
	var _saveCustomAsset = function(rawAsset){

		ajax.post("/Asset/publish",{
			filedata: rawAsset.data,
			extension: "png",
			type: "blob"
		}).done(

			// Closure, dammit.
			(function(rawAsset){
				return function(url){

					var _removeTag = function(asset,tag){
						var index = asset.tags.indexOf(tag);
						if(index<0) return;
						asset.tags.splice(index,1);
					};

					// Replace in Source Project
					var project = Publish._input.serialized;
					var asset = Asset.getByID(project.assets,rawAsset.id);
					asset.type = "image/uri";
					asset.data = url;
					_removeTag(asset,"raw");

					// Replace in Compiled Project
					var project = Publish._input.compiled;
					var asset = Asset.getByID(project.assets,rawAsset.id);
					asset.type = "image/uri";
					asset.data = url;
					_removeTag(asset,"raw");
					
					// One's saved
					stageGate.message[rawAsset.id] = url;
					stageGate.callback(url);

				};
			})(rawAsset)

		);

	};
	for(var i=0;i<rawImages.length;i++){
		_saveCustomAsset( rawImages[i] );
	}

	// Promise
	return stageGate;

};

///////////////////////////////////////////////////
// SAVE PROJECT
///////////////////////////////////////////////////

var saveProject = function(){

	// Stage Gate
	var stageGate = getStageGate({
		label: "Saving Project",
		amount: 2
	});

	// Save JSONs
	var _saveJSON = function(json,key){
		ajax.post("/Asset/publish",{
			filedata: JSON.stringify(json),
			extension: "json",
			type: "text"
		}).done(function(url){
			stageGate.message[key] = url;
			stageGate.callback(url);
		});
	};
	_saveJSON( Publish._input.serialized, "source" );
	_saveJSON( Publish._input.compiled, "compiled" );

	// Promise
	return stageGate;

};

///////////////////////////////////////////////////
// SAVE THUMBNAIL
///////////////////////////////////////////////////

var saveThumbnails = function(){

	// Stage Gate
	var stageGate = getStageGate({
		label: "Saving Thumbnails",
		amount: 1
	});

	// Save Image
	var _saveImage = function(raw,key){
		ajax.post("/Asset/publish",{
			filedata: raw,
			extension: "png",
			type: "blob"
		}).done(function(url){
			stageGate.message[key] = url;
			stageGate.callback(url);
		});
	};
	_saveImage( Publish._input.thumbnail, "thumbnail" );

	// Promise
	return stageGate;
	
};



// SINGLETON
exports.Publish = Publish;
Publish.initialize();

})(window);