(function(exports){

var _ACTOR_ID = 0;
var DropAddItem = {

	initialize: function(){
		Module.ready(_initDragDrop);
	},

	dropItem: function(message){
		switch(message.item.type){
			
			case "actor": 
				DropAddItem.addActor(message);
				break;

			case "ghost": 
				DropAddItem.addActor(message,true);
				break;

		}
	},

	addActor: function(message,isGhost){

		var actor = JSON.parse(JSON.stringify(message.item.data));
		var _actions = actor.actions;

		// Layer
		var layer = Screenplay.scene.layers.getByID(Screenwrite.workingLayer);

		// Global coords, Snap to Grid
		var position = layer.art.globalToLocal(message.x,message.y);
		var snapX = Math.round(position.x/20)*20;
		var snapY = Math.round(position.y/20)*20;
		_actions.unshift({ is:"art.SetTransform", x:snapX, y:snapY });

		// Auto Actions, unless it already haaassss one....
		var foundAction = false;
		for(var i=0; i<_actions.length; i++){
			if(_actions[i].is=="meta.ID"){
				foundAction = true; break;
			}
		}
		if(!foundAction){
			_ACTOR_ID++;
			while(Global["actor"+_ACTOR_ID]){
				_ACTOR_ID++;
			}
			_actions.unshift({ is:"meta.ID", id:"actor"+_ACTOR_ID });
		}

		var newActor = {
			actions:[
				{ is:"edit.Animation" },			
				{ is:"edit.Actions", actions: _actions },
				{ is:"edit.Selectable" },
			]
		};

		actor = Actor.fromDefinition(newActor);
		layer.addActor(actor);

		// TODO: GHOSTS DON'T NEED ACTIONS? (They need Art Actions, but not meta, etc...)

		// GHOST
		if(isGhost){
			DropAddItem.ghostActor = actor;
			actor.art.alpha = 0.5;
		}else{
			actor.intro();
		}

	}

};

///////////////
// HELPER METHODS

var _initDragDrop = function(){

	var drop = document.getElementById("canvas");
	var onDrop = function(event){

		try{
			//var json = JSON.parse( event.dataTransfer.getData('text') );
			var json = JSON.parse( DropAddItem.dragItemData );
		}catch(e){
			return false;
		} // HACK. GODDAMN JSON.

		if(DropAddItem.ghostActor){
			DropAddItem.ghostActor.actor.removeActor(DropAddItem.ghostActor);
			DropAddItem.ghostActor = null;
		}

		DropAddItem.dropItem({
			x: event.pageX,
			y: event.pageY,
			item: json
		});
		
		event.stopPropagation();
		event.preventDefault();

		return false;
	};
	var onDragOver = function(event){

		if(DropAddItem.ghostActor){
			
			var position = DropAddItem.ghostActor.actor.art.globalToLocal(event.pageX,event.pageY);
			var snapX = Math.round(position.x/20)*20;
			var snapY = Math.round(position.y/20)*20;

			DropAddItem.ghostActor.art.x = snapX;
			DropAddItem.ghostActor.art.y = snapY;

		}

		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		
		return false;

	};
	var onDragEnter = function(event){

		try{
			//var json = JSON.parse( event.dataTransfer.getData('text') );
			var json = JSON.parse( DropAddItem.dragItemData );
		}catch(e){
			return false;
		} // HACK. GODDAMN JSON.

		json.type = "ghost";
		DropAddItem.dropItem({
			x: event.pageX,
			y: event.pageY,
			item: json
		});

	};
	var onDragLeave = function(event){
		if(DropAddItem.ghostActor){
			DropAddItem.ghostActor.actor.removeActor(DropAddItem.ghostActor);
			DropAddItem.ghostActor = null;
		}
	};
	drop.addEventListener('dragover',onDragOver);
	drop.addEventListener('drop',onDrop);
	drop.addEventListener('dragenter',onDragEnter);
	drop.addEventListener('dragleave',onDragLeave);

};


///////////////
// SINGLETON
exports.DropAddItem = DropAddItem;
DropAddItem.initialize();

})(window);