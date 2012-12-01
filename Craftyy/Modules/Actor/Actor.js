(function(exports){



/********


New Action AND Function friendly thing:
New Actions are just context objects for Function to be called on.
(FunctionAction extends Action)?

// TODO: Remove .fromConfig?



ActionFunction.add("name",function(){

	var private;

	this.update = function(){
	};

	this.destroy = function(){
	};

});

// Combine with Asset info?

// TODO: different editors for COMBINED Actions...

ActionFunction.info("name",{

	label: "Label",
	blurb: "Welcome to the Sub-blurbs",

	editor: {
		is: "edit.Properties",
		properties: [
			{}
		]
	}

});


*********/










/***

ACTION EDITOR:
Takes an array of Actions
And exposes them visually to the user

STRUCTURE:
- Organizing Action Editors by category
- Assumes one Editor per Action.

*/
var Action = {

	currentActions: null,
	editDOM: null,

	initialize: function(){

		// Init Module
		Module.initialize();
		Module.input(Action.input);

		// Init UI
		Action.editDOM = document.getElementById("action_list");
		_initButtons();

		// HACK: Every interval, update the NAME.
		var actor_name = document.getElementById("actor_name");
		setInterval(function(){
			
			if(!Action.currentActions) return;
			
			var metaID = Action.currentActions.filter(function(action){
				return( action.is=="meta.ID" );
			})[0];
			if(!metaID) return;

			actor_name.innerText = metaID.id.toUpperCase();

		},100);

	},

	input: function(actions,config){
		
		Action.currentActions = actions;
		Action.editDOM.innerHTML = JSON.stringify(actions);

	}

};


////////////////////
// EDITORS
////////////////////

var _getActionEditor = function(action){

	// Get the Editor
	var editorName = "edit."+action.is; 
	EditorClass = exports[editorName];
	if(!EditorClass) return null;

	// Get the Asset
	var assets = Action._actionItems.filter(function(config){
		return( config.data.is==action.is );
	});
	var asset = assets[0];
	if(!asset) return null;
	
	// HACK: TODO: TO FIGURE OUT:
	// How would you tell spinner.right from spinner.left then?

	// Now Kiss
	return new EditorClass(action,asset);

}


////////////////////
// INIT UI
////////////////////

// BUTTONS
var _initButtons = function(){

	document.getElementById('submit').onclick = function(){
		Module.output(Action.currentActions);
	};

};

////////////////////
// SINGLETON
////////////////////

exports.Action = Action;
Action.initialize();


})(window);