(function(exports){

var SceneTransition = SceneTransition || {};
exports.SceneTransition = SceneTransition;

//////////////////////
// GET SCREENSHOT

var _getScreenshot = function(){

	// FOR WHATEVER FUCKING REASON I CAN'T DO:
	/**

	var promise = new Promise();
	var image = new Image();
	image.onload = function(){
		promise.resolve(image);
	};
	image.src = Screenplay.canvas.toDataURL();
	return promise;

	**/
	// IT JUST FREEZES THE FADE, but still "FINISHES".
	// TODO: FIGURE OUT WHY, coz it causes the frame to be off by ONE.
	// Alt: Screenplay.stage.update() beforehand. Nah, still looks choppy.

	var promise = new Promise();

	var w = Screenplay.canvas.width;
	var h = Screenplay.canvas.height;

	var canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	
	var ctx = canvas.getContext('2d');
	Screenplay.stage.draw(ctx);

	var image = new Image();
	image.onload = function(){
		promise.resolve(image);
	};
	image.src = canvas.toDataURL();

	return promise;

};

var _getBeforeAfterBitmaps = function(sceneDefinition,options){

	var promise = new Promise();
	Screenplay.paused = true;

	// FROM
	var fromImage = _getScreenshot();
	if(Screenplay.scene){
		Screenplay.scene.destroy();
		Screenplay.stage.removeChild(Screenplay.scene.art);
	}
	Screenplay.scene = null;
	fromImage.done(function(fromImage){

		// TO
		var newScene = Actor.fromDefinition(sceneDefinition);
		Screenplay.stage.addChild(newScene.art);
		var toImage = _getScreenshot();
		Screenplay.stage.removeChild(newScene.art);
		toImage.done(function(toImage){

			Screenplay.paused = false;

			// Bitmaps
			var fromBitmap = new Bitmap(fromImage);
			var toBitmap = new Bitmap(toImage);
			
			promise.resolve({
				fromBitmap: fromBitmap,
				toBitmap: toBitmap,
				callback: function(){

					Screenplay.stage.addChild(newScene.art);
					Screenplay.scene = newScene;

				}
			});

		});

	});

	return promise;

};

//////////////////////
// FADE

SceneTransition.fade = function(sceneDefinition,options){
	_getBeforeAfterBitmaps(sceneDefinition,options).done(function(bitmapConfig){

		var fromBitmap = bitmapConfig.fromBitmap;
		var toBitmap = bitmapConfig.toBitmap;
		var callback = bitmapConfig.callback;

		// ADD
		Screenplay.stage.addChild(fromBitmap);
		Screenplay.stage.addChild(toBitmap);

		// FADE
		var duration = options.duration || 1000;
		toBitmap.alpha = 0;
		Tween.get(fromBitmap).to( {alpha:0}, duration );
		Tween.get(toBitmap).to( {alpha:1}, duration ).call(function(){
			
			Screenplay.stage.removeChild(fromBitmap);
			Screenplay.stage.removeChild(toBitmap);

			callback();

		});

	});
};

//////////////////////
// IRIS IN & OUT

SceneTransition.iris = function(sceneDefinition,options){
	_getBeforeAfterBitmaps(sceneDefinition,options).done(function(bitmapConfig){

		var fromBitmap = bitmapConfig.fromBitmap;
		var toBitmap = bitmapConfig.toBitmap;
		var callback = bitmapConfig.callback;

		// IRIS
		var circle = new Shape();
		var g = circle.graphics;
		g.beginFill("#000");
		g.drawCircle(0,0,10);

		// IRIS POSITION
		var w = Screenplay.canvas.width;
		var h = Screenplay.canvas.height;
		circle.x = w/2;
		circle.y = h/2;

		// TWEEN
		var duration = options.duration || 1000;
		var onTweenComplete = function(){
			
			Screenplay.stage.removeChild(fromBitmap);
			Screenplay.stage.removeChild(toBitmap);
			Screenplay.stage.removeChild(circle);

			callback();

		};
		switch(options.direction){

			case "in": // Circle mask shrinks in

				Screenplay.stage.addChild(fromBitmap);
				Screenplay.stage.addChild(circle);
				circle.compositeOperation = "destination-in";
				Screenplay.stage.addChild(toBitmap);
				toBitmap.compositeOperation = "destination-over";

				circle.scaleX = circle.scaleY = 50;
				Tween.get(circle).to({scaleX:0,scaleY:0},duration).call(onTweenComplete);

				break;

			case "out": // Circle mask grows out

				Screenplay.stage.addChild(toBitmap);
				Screenplay.stage.addChild(circle);
				circle.compositeOperation = "destination-in";
				Screenplay.stage.addChild(fromBitmap);
				fromBitmap.compositeOperation = "destination-over";

				circle.scaleX = circle.scaleY = 0;
				Tween.get(circle).to({scaleX:50,scaleY:50},duration).call(onTweenComplete);

				break;

		}

	});
};

SceneTransition.irisIn = function(sceneDefinition,options){
	options.direction = "in";
	SceneTransition.iris(sceneDefinition,options);
};

SceneTransition.irisOut = function(sceneDefinition,options){
	options.direction = "out";
	SceneTransition.iris(sceneDefinition,options);
};

})(window);