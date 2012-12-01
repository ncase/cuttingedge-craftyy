(function(exports){

////////////////
// IMAGE VIA URI: url or raw data works.

var _imageViaURI = function(config,enableCORS){

	var promise = new Promise();
	var id = config.id;
	var src = config.data;

	var image = document.createElement("img");
	if(enableCORS) image.crossOrigin = "";
	image.onload = function(){
		promise.resolve();
	};
	image.src = src;
	
	Asset.resources[id] = image;
	return promise;
	 
};

Asset.registerHandler("image/uri",function(config){
	return _imageViaURI(config,true);
});

Asset.registerHandler("image/raw",function(config){
	return _imageViaURI(config,false);
});


////////////////
// JAVASCRIPT VIA URI

var _previousScriptPromise; // HACK : FOR IT TO BE SYNCHRONOUS
Asset.registerHandler("javascript/uri",function(config){

	var promise = new Promise();
	var id = config.id;
	var src = config.data;

	var script = document.createElement("script");
	script.onload = function(){
		promise.resolve();
	};
	script.src = src;
	Asset.resources[id] = script;

	if(_previousScriptPromise){
		var tmp = _previousScriptPromise;
		_previousScriptPromise = promise;

		(function(script){

			tmp.done(function(){
				document.body.appendChild(script);
			});

		})(script);

	}else{
		_previousScriptPromise = promise;
		document.body.appendChild(script);
	}

	return promise;

});

////////////////
// JAVASCRIPT VIA TEXT: Create immediately.

Asset.registerHandler("javascript/text",function(config){
	
	var promise = new Promise();
	var id = config.id;
	var code = config.data;
	
	var script = document.createElement("script");
	script.innerHTML = code;
	document.body.appendChild(script);

	Asset.resources[id] = script;
	promise.resolve();
	return promise;

});

////////////////
// JSON OBJECT: Create immediately.

Asset.registerHandler("json/object",function _jsonObject(config){
	var promise = new Promise();
	var id = config.id;
	var data = config.data;
	Asset.resources[id] = data;
	promise.resolve();
	return promise;
});

////////////////
// JSON URI

Asset.registerHandler("json/uri",function _jsonURI(config){

	var promise = new Promise();
	var id = config.id;
	var url = config.data;

	ajax.get(url).done(function(response){
		var json = JSON.parse(response);
		Asset.resources[id] = json;
		promise.resolve();
	});
	
	return promise;

});

////////////////
// PACKAGE JSON: Load all things inside the package recursively as another Asset Manifesto

Asset.registerHandler("package/json",function(config){

	var promise = new Promise();
	var url = config.data;

	ajax.get(url).done(function(response){
		var pkg = JSON.parse(response);
		Asset.load(pkg.assets).done(function(){
			promise.resolve();
		});
	});
	
	return promise;

});

////////////////
// AUDIO VIA URI

Asset.registerHandler("audio/uri",function(config){

	var promise = new Promise();
	var id = config.id;
	var src = config.data;

	var audio = document.createElement("audio");
	audio.addEventListener("canplaythrough",function(){
		promise.resolve();
	});
	audio.src = src;
	
	Asset.resources[id] = audio;
	return promise;

});

/////////////////////////
// SPRITESHEETS, SHEEIT

Asset.registerHandler("easel/spritesheet",function(config){

	// TODO: Load image somehow else?

	var promise = new Promise();
		promise.resolve();

	// Goddammit Javascript
	// data.frames instanceof Array = false
	// data.frames = JSON.parse(JSON.stringify(data.frames));
	// data.frames instanceof Array = true
	// dafuq

	config = JSON.parse(JSON.stringify(config));

	var Animation = function() {
		this.initialize();
	};
	Animation._SpriteSheet = new SpriteSheet(config.data);
	var Animation_p = Animation.prototype = new BitmapAnimation();
	Animation_p.BitmapAnimation_initialize = Animation_p.initialize;
	Animation_p.initialize = function() {
		this.BitmapAnimation_initialize(Animation._SpriteSheet);
		this.paused = false;
	}
	
	Asset.resources[config.id] = Animation;
	return promise;

});

})(window);