(function(exports){

var Scene = {

	goto: function(sceneDefinition,options){

		Scene._currentSceneDefinition = sceneDefinition;

		////////////////////
		// SCENE TRANSITION

		if(options && options.transition){
			options.transition(sceneDefinition,options);
		}else{

			if(Screenplay.scene){
				Screenplay.scene.destroy();
				Screenplay.stage.removeChild(Screenplay.scene.art);
			}

			var newScene = Actor.fromDefinition(sceneDefinition);
			Screenplay.scene = newScene;
			Screenplay.stage.addChild(Screenplay.scene.art);

		}
		
	},

	gotoByID: function(id,options){
		Scene.goto( Asset.resources[id], options );
	},

	gotoPrevious: function(options){},
	gotoNext: function(options){},

	reset: function(options){
		Scene.goto( Scene._currentSceneDefinition, options );
	}

};

exports.Scene = Scene;

})(window);