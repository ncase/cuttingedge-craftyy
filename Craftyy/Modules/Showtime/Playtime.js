(function(exports){

/***

For now, simple Scene JSON input

*/
var Playtime = {

	initialize: function(){

		Screenplay.initialize({
			easel: {
				canvas: document.getElementById("canvas"),
				width:800, height:450,
				fps:30
			},
			scene: {}
		});

	},

	loadProject: function(project){

		Playtime.project = project;
		
		document.getElementById("textio").style.display = 'none';
		document.getElementById("message").style.display = 'none';
			
		// GOT TO THAT SCENE
		Asset.load(Playtime.project.assets).done(function(){

			var firstSceneID = Playtime.project.scenes[0];
			var scene = Asset.resources[firstSceneID];

			exports.Global = {};
			Scene.goto(scene);

			Screenplay.paused = false;

		});

	},

	play: function(){
		Screenplay.paused = false;
	},
	stop: function(){
		Screenplay.paused = true;
		Screenplay.scene.destroy();
		Screenplay.stage.removeChild(Screenplay.scene.art);
		Screenplay.scene = null;
	},

	getTextInput: function(label){

		Screenplay.paused = true;
		Key.active = false;
		var overlay = document.getElementById("textio");
		overlay.style.display = 'block';
		document.getElementById("textio_label").innerHTML = label;

		var promise = new Promise();
		document.getElementById("textio_submit").onclick = function(){
			Screenplay.paused = false;
			Key.active = true;
			overlay.style.display = 'none';
			var text = document.getElementById("textio_text").value;
			promise.resolve(text);
		};
		return promise;

	},

	showMessage: function(label){

		Screenplay.paused = true;

		var overlay = document.getElementById("message");
		overlay.style.display = 'block';

		document.getElementById("message_label").innerHTML = label;

		window.addEventListener("keydown",function waitForEnter(event){
			
			if(event.keyCode!=13) return;

			Screenplay.paused = false;
			overlay.style.display = 'none';

			window.removeEventListener("keydown",waitForEnter);
			event.preventDefault();

		});
		
	}

};

// SINGLETON
exports.Playtime = Playtime;
Playtime.initialize();

})(window);