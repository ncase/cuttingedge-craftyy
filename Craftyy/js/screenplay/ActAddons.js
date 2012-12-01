(function(exports){

///////////////////////
// ACTOR with EASEL integration
///////////////////////

var tmp = Actor.fromDefinition;
Class.create("Actor",{
	is: "Actor",
	initialize: function(){
		this.art = new Container(); // Art
		this.super(); // Actors & Actions
	},
	setActor: function(actor){
		this.super(actor);
		this.actor.art.addChild(this.art);
	},
	destroy: function(){
		if(this.actor) this.actor.art.removeChild(this.art);
		this.super();
	},

	update: function(timeElapsed){

		// Update all actions
		var a = this.actions.concat();
		for(var i=0; i<a.length; i++){
			var action = a[i];
			if(action.update) action.update(timeElapsed);
		}

		// Update all actors
		var a = this.actors.concat();
		for(var i=0; i<a.length; i++){
			a[i].update(timeElapsed);
		}

	}

});
Actor.fromDefinition = tmp;

})(window);