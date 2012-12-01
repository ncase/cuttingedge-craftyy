(function(exports){

/***

SCREENPLAY: Handles Easel w/ Actor-Action setup

*/
var Screenplay = {

	initialize: function(config){

		Screenplay.config = config;
		
		// Canvas
		var canvas = config.easel.canvas;
		canvas.width = config.easel.width;
		canvas.height = config.easel.height;
		canvas.style.background = config.easel.background;

		// Input
		Mouse.initialize(canvas);

		// Stage
		var stage = new Stage(canvas);
		stage.enableMouseOver();
		
		// Scene
		var scene = Actor.fromDefinition(config.scene);
		stage.addChild(scene.art);
		
		// Ticker
		Ticker.useRAF = true;
		Ticker.setFPS(config.easel.fps);
		Ticker.addListener(Screenplay.tick);

		// INTERFACE
		Screenplay.canvas = canvas;
		Screenplay.stage = stage;
		Screenplay.scene = scene;

		News.publish("screenplay.Init");
		
	},

	paused: false,
	tick: function(timeElapsed){
		
		if(Screenplay.paused) return;
		if(Screenplay.scene) Screenplay.scene.update( Ticker._interval );
		if(!Screenplay.paused) Screenplay.stage.update(); // In case it changes during update

		News.publish("tick",timeElapsed);

	}

};

exports.Screenplay = Screenplay;

})(window);