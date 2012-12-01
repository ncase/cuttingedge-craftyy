(function(exports){

////////////////////////
// BASIC
// Barebones Info & Input
////////////////////////

/***

TODO:
- DRY for the very basic Input & Type?
- When raw input value isn't the same as value to give prop
- e.g. logarithmic scale

*/
Class.create("prop.Basic",{
	is: "prop.Property",
	initialize: function(action){
		
		this.super(action);
		
		this.createInfo();
		this.createInput();

		this.dom.appendChild(this.info);
		this.dom.appendChild(document.createElement("br"));
		this.dom.appendChild(this.input);

	},

	// this.info = a dom that describes value of property
	createInfo: function(){	
		this.info = document.createElement("span");
	},

	// this.input = a dom that lets you manipualte property
	createInput: function(){},

	// returns a string describing the current value
	getInfo: function(value){}

});


////////////////////////
// SLIDER RANGE
// Min, Max, Step
////////////////////////

Class.create("prop.Range",{

	is: "prop.Basic",
	min:0, max:100, step:1,

	createInput: function(){

		var range = document.createElement("input");
		range.style.width = "300px";
		range.setAttribute('type','range');
		range.setAttribute('min',this.min);
		range.setAttribute('max',this.max);
		range.setAttribute('step',this.step);
		range.value = this.action[this.prop];

		this.input = range;
		this.onChange();
		this.input.onchange = this.onChange.bind(this);

	},

	onChange: function(){
		var value = parseFloat(this.input.value);
		this.action[this.prop] = value;
		this.info.innerHTML = this.getInfo(value);
	}

});


////////////////////////
// STRING
////////////////////////

Class.create("prop.String",{

	is: "prop.Basic",
	textarea: false,

	createInput: function(){

		var input;
		if(this.textarea){
			input = document.createElement("textarea");
			input.style.width = "400px";
			input.style.height = "400px";
		}else{
			input = document.createElement("input");
			input.setAttribute('type','text');
		}
		input.value = this.action[this.prop];

		this.input = input;
		this.onChange();
		this.input.onchange = this.onChange.bind(this);

	},

	onChange: function(){
		var value = this.input.value;
		this.action[this.prop] = value;
		this.info.innerHTML = this.getInfo(value);
	}

});


////////////////////////
// BOOLEAN
////////////////////////

Class.create("prop.Boolean",{

	is: "prop.Basic",

	createInput: function(){

		var input = document.createElement("input");
		input.setAttribute('type','checkbox');
		input.checked = this.action[this.prop];

		this.input = input;
		this.onChange();
		this.input.onchange = this.onChange.bind(this);

	},

	onChange: function(){
		var value = this.input.checked;
		this.action[this.prop] = value;
		this.info.innerHTML = this.getInfo(value);
	}

});


////////////////////////
// SELECT
////////////////////////

Class.create("prop.Select",{

	is: "prop.Basic",

	createInput: function(){

		var input = document.createElement("select");
		for( var i=0; i<this.options.length; i++ ){
			var option = this.options[i];
			var optionDOM = document.createElement("option"); 
			optionDOM.innerHTML = option.label;
			optionDOM.setAttribute("value",option.value);
			input.appendChild(optionDOM);
		}
		input.value = this.action[this.prop];

		this.input = input;
		this.onChange();
		this.input.onchange = this.onChange.bind(this);

	},

	onChange: function(){
		var value = this.input.value;
		this.action[this.prop] = value;
		this.info.innerHTML = this.getInfo(value);
	}

});


////////////////////////
// ACTOR ID
// String, or Select from screenwrite.
////////////////////////

Class.create("prop.ActorID",{

	is: "prop.Basic",

	createInput: function(){

		// String Input
		this.stringInput = document.createElement("input");
		this.stringInput.setAttribute('type','text');
		this.stringInput.value = this.action[this.prop];
		this.onStringChange();
		this.stringInput.onchange = this.onStringChange.bind(this);

		// Button Input
		this.buttonInput = document.createElement("button");
		this.buttonInput.innerHTML = "Select Actor";
		this.buttonInput.onclick = this.onButtonClick.bind(this);

		// Combined
		this.input = document.createElement("div");
		this.input.appendChild(this.stringInput);
		this.input.appendChild(this.buttonInput);

	},

	onStringChange: function(){
		var value = this.stringInput.value;
		this.action[this.prop] = value;
		this.info.innerHTML = this.getInfo(value);
	},

	onButtonClick: function(){
		var my = this;
		Edit.withModule("scene",null,{mode:"actorID"}).done(function(actorID){
			var value = actorID;
			my.action[my.prop] = value;
			my.info.innerHTML = my.getInfo(value);
			my.stringInput.value = value;
		});
	}

});


////////////////////////
// POSITION: Props are ALWAYS X & Y.
////////////////////////

Class.create("prop.Position",{

	is: "prop.Basic",

	createInput: function(){

		// Button Input
		this.input = document.createElement("button");
		this.input.innerHTML = "Select Position";
		this.input.onclick = this.onButtonClick.bind(this);

	},

	onButtonClick: function(){
		var my = this;
		Edit.withModule("scene",null,{mode:"position"}).done(function(position){
			my.action.x = position.x;
			my.action.y = position.y;
			my.info.innerHTML = my.getInfo(position);
		});
	}

});



////////////////////////
// ACTION
////////////////////////

Class.create("prop.Action",{

	is: "prop.Basic",

	limitTag: null,

	createInput: function(){

		// Drop Zone
		this.input = document.createElement("div");
		this.input.innerHTML = "Perform Action";
		this.input.style.width = "300px";
		this.input.style.height = "20px";
		this.input.style.padding = "10px";
		this.input.style.borderRadius = "10px";
		this.input.style.border = "3px dashed white";
		this.input.style.display = 'none';

		// DRAGON DROP 
		var onDrop = function(event){

			event.stopPropagation();
			event.preventDefault();

			// New Action JSON: Parse it, add it, show it.
			var item = JSON.parse( event.dataTransfer.getData('text') );

			// Just check type
			if(item.type!=="action") return;
			var asset = item.data;

			// META
			if(this.limitTag){
				if( asset.tags.indexOf(this.limitTag) < 0 ) return;
			}

			//Action.showLibrary("behaviour");
			this.input.style.display = 'none';
			
			var newAction = asset.data;
			this.action[this.prop] = newAction;

			this.info.innerHTML = '';
			var editor = this.getInfo(newAction);

			editor.parentEditor = this;
			this.info.appendChild(editor.dom);

			return false;
		
		}.bind(this);

		var onDragOver = function(event){
			event.stopPropagation();
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
			return false;
		};
		var dropzone = this.input;
		dropzone.addEventListener('dragover',onDragOver);
		dropzone.addEventListener('drop',onDrop);

		// Show Value
		var value = this.action[this.prop];
		this.info.innerHTML = '';
		var editor = this.getInfo(value);
		editor.parentEditor = this;
		this.info.appendChild(editor.dom);

	},

	getInfo: function(action){

		// DRY HACK

		// Get the Editor
		var editorName = "edit."+action.is;
		EditorClass = Class.create({
			is: editorName,
			required: true,
			changeable: true
		});
		if(!EditorClass) return null;

		// Get the Asset
		var assets = Action._actionItems.filter(function(config){
			return( config.data.is==action.is );
		});
		var asset = assets[0];
		if(!asset) return null;

		// Now Kiss
		return new EditorClass(action,asset);

	}

});


})(window);