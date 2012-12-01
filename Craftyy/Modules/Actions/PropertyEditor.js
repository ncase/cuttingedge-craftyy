(function(exports){

/***

PER-PROPERTY ACTION EDITOR:
- Title
- Per-property components
- Delete button

TODO:
- Default Arguments
- Requiring other Actions (this might require a higher level)

*/
Class.create("edit.Properties",{

	asset:null,
	action:null,
	editors:[],

	properties: null,
	required: false,
	changeable: false,

	initialize: function(action,asset){

		this.asset = asset;
		this.action = action;
		this.editors = [];
		this.properties = this.properties || [];
		
		var dom = document.createElement("div");
		dom.setAttribute("class","prop_editor");
		this.dom = dom;
		this.dom.model = this;

		this.initInfo();
		this.initProperties();
		this.initButtons();

	},

	initInfo: function(){

		// HEADER
		var info = document.createElement('div');
		info.id = "info";
		this.dom.appendChild(info);
		this.infoDOM = info;

		// ICON
		var icon = document.createElement('img');
		icon.width = icon.height = 40;
		if(this.asset.icon){
			icon.src = this.asset.icon;
		}else{
			icon.style.background = "#000";
		}
		info.appendChild(icon);

		// TITLE
		var title = document.createElement("div");
		title.id = "title";
		title.innerHTML = this.asset.label;
		info.appendChild(title);

	},

	initProperties: function(){

		// PROPERTIES
		var props = document.createElement('div');
		props.id = "properties";
		this.dom.appendChild(props);

		for(var i=0; i<this.properties.length; i++){
			var UIClass = Class.create(this.properties[i]);
			var ui = new UIClass(this.action);
			props.appendChild(ui.dom);
			this.editors.push(ui);
		}
	},

	initButtons: function(){

		// Delete Button
		if(!this.required){

			var deleteButton = document.createElement("div");
			this.deleteButton = deleteButton;
			deleteButton.id = "delete_button";
			deleteButton.innerText = "x";

			this.infoDOM.appendChild(deleteButton);
			this.deleteButton.onclick = function(){
				Action.removeEditor(this);
			}.bind(this);

		}

		// Store Button
		if(!this.unstoreable){

			var storeButton = document.createElement("div");
			this.storeButton = storeButton;
			storeButton.id = "store_button";
			storeButton.innerText = "save";

			this.infoDOM.appendChild(storeButton);
			this.storeButton.onclick = function(){
				
				console.log(this.asset,this.action);
				Messenger.request("project.CreateAction",{
					asset:this.asset,
					action:this.action
				});

			}.bind(this);

		}


		// Change Button
		if(this.changeable){
			var changeButton = document.createElement("button");
			this.changeButton = changeButton;
			changeButton.innerHTML = "CHANGE";
			this.dom.appendChild(changeButton);
			this.changeButton.onclick = function(){
				//Action.showLibrary("perform");
				this.parentEditor.input.style.display = 'block';
			}.bind(this);
		}

		// Serialize Action
		

	}

});


/***

PROPERTY COMPONENT:
Creates DOM that visually exposes a single property of an action object

*/
Class.create("prop.Property",{
	
	action: null,
	dom: null,
	prop: "",

	initialize: function(action){
		this.action = action;
		this.dom = document.createElement("div");
		this.dom.model = this;
	}

});


})(window);