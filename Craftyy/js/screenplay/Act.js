(function(exports){
	
/***

ACTION:
- Just a function storage unit for Actor to use.
- Minimal standalone functionality

ACTORS:
- Maintains subactors & actions init's & destroy's.

*/
Class.create("Action",{
	init: function(){
		/* TO BE IMPLEMENTED */
	},
	setActor: function(actor){
		this.actor = actor;
		this.init();
	},
	destroy: function(){ 
		if(this.actor) _removeFromArray(this.actor.actions,this);
	}
});

Class.create("Actor",{

	is:"Action",
	initialize: function(){

		this.actions = _fromDefinition(this.actions,Action,this);
		var array = this.actions.concat();
		for(var i=0; i<array.length; i++){
			array[i].setActor(this);
		}

		this.actors = _fromDefinition(this.actors,Actor,this);
		var array = this.actors.concat();
		for(var i=0; i<array.length; i++){
			array[i].setActor(this);
		}

	},

	addAction: function(action){ this.actions.push(action); action.setActor(this); },
	addActor: function(actor){ this.actors.push(actor); actor.setActor(this); },
	removeAction: function(action){ _removeFromArray(this.actions,action); action.destroy(); },	
	removeActor: function(actor){ _removeFromArray(this.actors,actor); actor.destroy(); },

	destroy: function(){
		if(this.actor) _removeFromArray(this.actor.actors,this);
		_dryDestroyer(this.actors);
		_dryDestroyer(this.actions); // REVERSE - SYmmetry, I guess?
		this.actor = null;
	}

});


//////////////////
// HELPER METHODS
var _fromDefinition = function(array,Class,me){
	var newArray = [];
	if(array){
		for(var i=0; i<array.length; i++){
			var instance = Class.fromDefinition(array[i]);
			newArray.push(instance);
		}
	}
	return newArray;
};
var _removeFromArray = function(array,item){
	var index = array.indexOf(item);
	if(index<0) return;
	array.splice(index,1);
};
var _dryDestroyer = function(array){
	var clonedArray = array.concat();
	for(var i=0;i<clonedArray.length;i++){
		clonedArray[i].destroy();
	}
	array.splice(0);
};


//////////////////
// STATIC FACTORIES
var _ClassConfig = function(ClassName){
	window[ClassName].fromDefinition = function(config){
		config.is = config.is || ClassName;
		var NewClass = Class.create(config);
		return new NewClass();
	};
};
_ClassConfig("Actor");
_ClassConfig("Action");


})(window);