(function(exports){

/////////////////////////////
// GENERAL LIBRARY

Class.create( "Library", {

	initialize: function(){
		this.items = [];
		this.initDOM();
	},

	addItem: function(asset){
		var item = this.generateItem(asset);
		this.items.push(item);
		this.addItemDOM(item);
	},

	addItems: function(configs){
		for(var i=0;i<configs.length;i++) this.addItem(configs[i]);
	},

	empty: function(){
		this.items.splice(0);
		this.emptyDOM();
	},

	/* TO BE IMPLEMENTED */
	initDOM: function(){ this.dom = document.createElement('div'); },
	generateItem: function(asset){ return asset; },
	addItemDOM: function(item){ this.dom.appendChild(item.dom); },
	emptyDOM: function(){ this.dom.innerHTML=''; }

});

/////////////////////////////
// HELPER METHODS in COMMON

var _generateDraggableDOM = function(library,item,data){

	// Creating the item's DOM
	var dom = document.createElement('div');
	dom.setAttribute("class","lib_item");
	dom.draggable = true;

	var dragImage = new Image();
	dragImage.src = "icons/actor.png";

	// The dragging & item
	dom.addEventListener('dragstart',function(event) {
		
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setDragImage(dragImage,dragImage.width/2,dragImage.height/2);
	
		DropAddItem.dragItemData = JSON.stringify(data);
		News.publish("edit.Deselected");

	});

	// Selectable
	dom.onclick = function(){
		this.highlightItem(item);
	}.bind(library);

	return dom;

};

Class.create( "lib.SelectableList", {

	is: "Library",

	highlightID: function(id){
		var sceneItem = this.items.filter(function(item){
			return item.id==id;
		});
		if(sceneItem.length==0) return;
		sceneItem = sceneItem[0];
		this.highlightItem(sceneItem);
	},

	highlightItem: function(item){
		this.selectedItem = item;
		for(var i=0;i<this.items.length;i++){
			this.items[i].dom.setAttribute("selected","false");
		}
		item.dom.setAttribute("selected","true");
	},

	empty: function(){
		this.selectedItem = null;
		this.super();
	}

});

/////////////////////////////
// SPECIFIC LIBRARIES

Class.create( "lib.Gamepieces", {

	is: "lib.SelectableList",

	generateItem: function(asset){

		var item = {};
		var itemData = {
			type:'actor',
			data:asset.data
		};

		// Creating the item's Draggable DOM
		var dom = _generateDraggableDOM(this,item,itemData);
		item.dom = dom;

		// ICON
		var icon = document.createElement('img');
		icon.id = "icon";
		icon.src = Asset.resources[asset.icon].src; // Get the art ID's image
		icon.draggable = false;
		dom.appendChild(icon);

		// INFO
		var info = document.createElement('div');
		info.id = "info";
		dom.appendChild(info);

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

		// Return Item
		item.id = asset.id;
		item.data = itemData;
		return item;

	}

});

Class.create( "lib.Art", {

	is: "lib.SelectableList",

	generateItem: function(asset){

		var item = {};
		var itemData = {
			type:'actor',
			data: {
				"actions": [
					{
						"is": "art.Bitmap",
						"image": asset.id
					}
				]
			}
		};

		// Creating the item's Draggable DOM
		var dom = _generateDraggableDOM(this,item,itemData);
		item.dom = dom;

		// ICON
		var icon = document.createElement('img');
		icon.id = "icon";
		icon.src = asset.data;
		icon.draggable = false;
		dom.appendChild(icon);

		// FLOAT GRID!
		dom.style.float = "left";

		// Return Item
		item.id = asset.id;
		item.data = itemData;
		return item;


	}

});

Class.create( "lib.Layers", {

	is: "lib.SelectableList",
	
	highlightID: function(id){
		this.super(id);
		Screenwrite.workingLayer = id;
	},

	generateItem: function(layerID){

		var item = {};

		// Creating the item's DOM
		var dom = document.createElement('div');
		dom.setAttribute("class","lib_item");
		item.dom = dom;

		// Visiblility Toggle
		var eye = new Image();
		dom.appendChild(eye);
		eye.id = "icon";
		eye.src = "icons/eye.png";
		eye.style.width = eye.style.height = "32px";
		eye.style.cursor = "pointer";
		eye.onclick = function(){
			var layer = Screenplay.scene.layers.getByID(layerID);
			layer.art.visible = !layer.art.visible;
			eye.style.opacity = (layer.art.visible) ? 1.0 : 0.5;
		};

		// Asset Info
		var info = document.createElement("div");
		dom.appendChild(info);
		info.id = "info"
		info.style.fontSize = "25px";
		info.style.cursor = "pointer";
		info.innerHTML = layerID;
		info.onclick = function(){
			Screenwrite.workingLayer = layerID;
			this.highlightItem(item);
		}.bind(this);

		// Return Item
		item.id = layerID;
		return item;

	}

});

Class.create( "lib.Scenes", {

	is: "lib.SelectableList",

	addItemDOM: function(item){ this.contents.appendChild(item.dom); },
	emptyDOM: function(){ this.contents.innerHTML=''; },

	initDOM: function(){

		this.super();

		this.contents = document.createElement("div");
		this.addSceneButton = document.createElement("button");
		this.dom.appendChild(this.contents);
		this.dom.appendChild(this.addSceneButton);

		this.addSceneButton.innerHTML = "ADD SCENE";
		this.addSceneButton.style.position = 'absolute';
		this.addSceneButton.style.cursor = 'pointer';
		this.addSceneButton.style.bottom = this.addSceneButton.style.right = 0;
		this.addSceneButton.style.width = 100;
		this.addSceneButton.style.height = 50;

		this.addSceneButton.onclick = function(){
			Messenger.request("project.AddScene");
		};
		
	},

	generateItem: function(sceneID){

		var item = {};

		// Creating the item's DOM
		var dom = document.createElement('div');
		dom.setAttribute("class","lib_item");
		item.dom = dom;

		// Asset Info
		var asset = Asset.getByID(Screenwrite.unpackaged,sceneID);
		var info = document.createElement("div");
		dom.appendChild(info);
		info.id = "info"
		info.style.fontSize = "25px";
		info.style.cursor = "pointer";
		info.innerHTML = asset.label;
		info.onclick = function(){
			Messenger.request("project.EditScene",asset.id);
			this.highlightItem(item);
		}.bind(this);

		// Return Item
		item.id = asset.id;
		item.asset = asset;
		return item;

	}

});


})(window);