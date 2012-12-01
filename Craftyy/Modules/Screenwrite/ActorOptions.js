(function(exports){

/***

ACTOR OPTIONS - Letting you select & edit actors

*/
var ActorOptions = {

	initialize: function(){

		Screenwrite.addInputHandler("actorID",this.input);
		Module.ready(_initUI);

		// HACK
		Screenwrite.addInputHandler("position",this.positionInput);

	},

	input: function(input,config){
			
		Global.selected = null;
		News.subscribe("edit.Selected",function onSelected(actor){
			
			var actions = actor._actionEditable.actions;
			var foundAction = null;
			for(var i=0; i<actions.length; i++){
				if(actions[i].is=="meta.ID"){
					foundAction = actions[i]; break;
				}
			}
			if(foundAction){
				News.unsubscribe("edit.Selected",onSelected);
				Module.output(foundAction.id);
			}

		});

	},

	positionInput: function(input,config){
		Screenplay.canvas.addEventListener("click",function onClick(){
			Screenplay.canvas.removeEventListener("click",onClick);

			var position = Screenplay.scene.art.globalToLocal(Mouse.x,Mouse.y);
			Module.output(position);

		});
	},

	editSelected: function(){
		var actor = Global.selected;
		if(!actor) return;
		var actions = actor._actionEditable.actions;
		Edit.withModule("actions",actions).done(function(newActions){
			actor._actionEditable.setActions( newActions );
		});
	}

};

///////////////
// HELPER METHODS
var _initUI = function(){

	// Select Focus (TODO: A COMPONENT)
	News.subscribe("edit.Selected",function(actor){
		var options = document.getElementById("actor_options");
		options.style.display = 'block';

		var global = actor.art.localToGlobal(0,0);
		options.style.left = global.x;// - 125;
		options.style.top = global.y - 70;

	});
	News.subscribe("edit.Deselected",function(){
		var options = document.getElementById("actor_options");
		options.style.display = 'none';
	});

	// Edit
	var editButton = document.getElementById("option_edit");
	editButton.onclick = ActorOptions.editSelected;

	// Delete
	var deleteButton = document.getElementById("option_delete");
	deleteButton.onclick = function(){
		if(Global.selected && Global.selected.outro) Global.selected.outro();
	};

	// Store
	(function(){

		var storeButton = document.getElementById("option_store");
		storeButton.onclick = function(){
			if(Global.selected){

				var compiledActor = Screenwrite.output(Global.selected,"compile");

				// Rip out Position
				compiledActor.actions = compiledActor.actions.filter(function(action){
					return (action.is!="art.SetTransform");
				});

				// Rip out art icon
				var icon = compiledActor.actions.filter(function(action){
					return (action.is=="art.Bitmap");
				})[0].image;		

				// FRESH ID
				var id = Asset.generateID( Asset.manifests, "actor.CustomActor" );

				// NEW ACTOR
				var newActor = {
					"id": id,
					"type": "json/object",
					"label": "Custom Actor"+id,

					"tags": ["actor","foreground"],
					"icon": icon,
					"data": compiledActor
				};

				Messenger.request("project.AddAsset",newActor).done(function(){
					Screenwrite.refreshLibrary();
				});
			}
		};

	})();

	// Shortcuts: TOP-LEVEL HACK
	News.subscribe("keydown",function(event){
		if(event.keyCode!=8) return;
		if(Global.selected && Global.selected.outro) Global.selected.outro();
		event.preventDefault();
		event.stopPropagation();
	});

};

///////////////
// SINGLETON
exports.ActorOptions = ActorOptions;
ActorOptions.initialize();


})(window);