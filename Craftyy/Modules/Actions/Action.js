(function(exports){

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
		_initDragDrop();
		_initButtons();
		_initResize();

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
		Action.editDOM.innerHTML = '';

		// Library Data
		Messenger.request("project.GetInspectorAssets").done(function(scripts){
			Asset.load(scripts).done(function(){
				Messenger.request("project.GetActions").done(function(actionItems){ // HACK

					///////////////////////////////////////////
					///////////////////////////////////////////
					Action._actionItems = actionItems; // HACK
					///////////////////////////////////////////
					///////////////////////////////////////////

					Action.library.empty();
					var tabContainer = document.getElementById("tabs");
					tabContainer.innerHTML = '';

					// HACK
					// TODO: Project.json also has ID's / Names for each one.
					for(var i=0;i<actionItems.length;i++){
						var actionItem = actionItems[i];
						var id = actionItem.data.is;
					}

					Action.library.addItems(actionItems);

					// Find all Tags
					var allTags = ["behaviour","logic","check","perform"];
					for(var i=0; i<allTags.length; i++){
						(function(tag){
							var dom = document.createElement("div");
							tabContainer.appendChild(dom);
							dom.id = "tab_"+tag;
							dom.setAttribute("class","tab_button");
							dom.onclick = function(){
								Action.library.filter(tag);
							};
						})(allTags[i]);
					}
					

					// Populate Edit DOM
					for(var i=0; i<actions.length; i++ ){
						var editor = _getActionEditor(actions[i]);
						if(editor) Action.addEditor(editor);
					}

					// Default Category
					Action.library.filter("behaviour");
					_showCategory("art_action");


				});
			});
		});

	},

	///////////////////////////////
	// ADD & REMOVE Action Editors

	addEditor: function(editor){
		Action.editDOM.appendChild(editor.dom);
	},
	removeEditor: function(editor){
		Action.editDOM.removeChild(editor.dom);
		var index = Action.currentActions.indexOf(editor.action);
		Action.currentActions.splice(index,1);
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

// DRAG & DROP
var _initDragDrop = function(){
	
	var onDrop = function(event){

		event.stopPropagation();
		event.preventDefault();

		// New Action JSON: Parse it, add it, show it.
		var item = JSON.parse( event.dataTransfer.getData('text') );

		// Just check type
		if(item.type!=="action") return;
		
		// Must be: Behaviour, Logic
		var asset = item.data;
		var category = asset.tags[1] || "behaviour";  // HACK, but at least it's out of PropertyEditor
		if(category!="behaviour"&&category!="logic") return;

		var editor = _getActionEditor(asset.data); // Which will be an Action
		if(!editor) return;

		Action.addEditor(editor);
		Action.currentActions.push(editor.action);

		_showCategory(category);

		return false;

	};

	var onDragOver = function(event){
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		return false;
	};

	var dropzone = document.getElementById("main_container");
	dropzone.addEventListener('dragover',onDragOver);
	dropzone.addEventListener('drop',onDrop);

};

// BUTTONS
var _initButtons = function(){

	// Navigation Tabs
	var categories = ['meta','art_action','behaviour','logic']; // HACK
	for(var i=0; i<categories.length; i++){
		(function(category){
			var button = document.getElementById('nav_'+category);
			button.onclick = function(){
				_showCategory(category);
			}
		})(categories[i]);
	}

	// Module Output
	document.getElementById('submit').onclick = function(){
		Module.output(Action.currentActions);
	};

};

// CATEGORY NAVIGATION
var _showCategory = function(category){

	var children = Action.editDOM.children;
	for(var i=0; i<children.length; i++){
		children[i].style.display = ( children[i].model.asset.tags.indexOf(category)>=0 ) ? "block" : "none";
	}

	var categories = ['meta','art_action','behaviour','logic']; // HACK
	for(var i=0; i<categories.length; i++){
		document.getElementById('nav_'+categories[i]).setAttribute("class","");
	}
	document.getElementById('nav_'+category).setAttribute("class","shown");

};

// RESIZE
var _initResize = function(){
	
	var main_container = document.getElementById("main_container");
	var action_list = document.getElementById("action_list");
	var library_contents = document.getElementById("contents");

	var onResize = function(){
		main_container.style.width = document.body.clientWidth - 420 - 60; // - Sidebar - Padding
		action_list.style.height = document.body.clientHeight - 150 - 140; // - Top - Bottom - Padding
		library_contents.style.height = document.body.clientHeight - 100; // - Top - Bottom
	};

	window.addEventListener("resize",onResize);
	Module.ready(onResize);

};

////////////////////
// SINGLETON
////////////////////

exports.Action = Action;
Action.initialize();


// HACK
Module.ready(function(){
	
	// LIBRARY OF ACTIONS
	var dom = document.getElementById("contents");
	Action.library = new Library();
	Action.library.dom = dom;
	Action.library.generateItem = function(config){ return config; };
	Action.library.generateIcon = function(asset){
		
		// Adding the item dom
		var item = document.createElement('div');
		item.setAttribute("class","lib_action");
		item.draggable = true;

		// ICON
		var icon = document.createElement('img');
		icon.id = "icon";
		if(asset.icon){
			icon.src = asset.icon;
		}else{
			icon.style.background = "#000";
		}
		item.appendChild(icon);

		// iNFO
		var info = document.createElement('div');
		info.id = "info";
		item.appendChild(info);

		// LABEL
		var label = document.createElement('div');
		label.id = "label";
		label.innerHTML = asset.label;
		info.appendChild(label);

		// BLURB
		var blurb = document.createElement('div');
		blurb.id = "blurb";
		blurb.innerHTML = asset.blurb;
		info.appendChild(blurb);
		
		// The dragging & item
		item.addEventListener('dragstart',function(event) {
			event.dataTransfer.effectAllowed = 'move';
			if(icon) event.dataTransfer.setDragImage(icon,35,35);
			event.dataTransfer.setData('text',JSON.stringify({
				type:'action',
				data:asset
			}));
		});

		return item;

	};
	Action.library.filter = function(tag){

		var showThese = [];

		for(var i=0; i<this.items.length; i++){
			var icon = this.items[i].icon;
			var tags = this.items[i].tags;
			if(icon.parentNode==Action.library.dom) Action.library.dom.removeChild(icon);
			if(tags.indexOf(tag)>=0) showThese.push(this.items[i]);
		}

		showThese.sort(function(a,b){
			a = a.item.label.toUpperCase();
			b = b.item.label.toUpperCase();
			if(a<b) return -1;
			if(a>b) return 1;
			return 0;
		});
		
		for(var i=0; i<showThese.length; i++){
			var icon = showThese[i].icon;
			Action.library.dom.appendChild(icon);
		}

	};

});



})(window);