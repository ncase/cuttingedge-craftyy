(function(exports){

/***

For now, simple Scene JSON input

*/
var Showtime = {
	initialize: function(){

		Module.initialize();
		Module.input(this.input);
			
		Module.ready(this.init);
		Module.focus(this.focus);
		Module.blur(this.blur);

		Showtime.player = document.getElementById("player");
		ProxyInput.initialize(Showtime.player);

	},
	init: function(){

		document.getElementById("replay").onclick = function(){
			Showtime.input(Showtime._currProject);
			Showtime.player.focus();
		};

		document.getElementById("finish").onclick = function(){
			Module.output();
		};

	},
	input: function(compiledProject,config){

		Showtime._currProject = compiledProject;
			
		// EW, MESSY HACK-LOOKING

		var playerPromise = new Promise();
		Showtime.player.onload = function(){
			playerPromise.resolve();
			Showtime.player.onload = null;
		};

		// FORCE RELOAD
		Showtime.player.src = "";
		Showtime.player.src = "playtime.html";

		playerPromise.done(function(){
			Showtime.player.contentWindow.Playtime.loadProject(compiledProject);
			Showtime.player.focus();
		});

	},
	focus: function(){
		//Showtime.playerPromise.done(function(){
		//Showtime.player.contentWindow.Playtime.play();
		//});
	},
	blur: function(){
		//Showtime.playerPromise.done(function(){
		Showtime.player.src = "";
		//Showtime.player.contentWindow.Playtime.stop();
		//});
	}
};

// SINGLETON
exports.Showtime = Showtime;
Showtime.initialize();

})(window);