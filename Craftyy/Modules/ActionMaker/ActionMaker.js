(function(exports){

var ActionMaker = {

	initialize: function(){
		Module.initialize();
		Module.input(function(){}); // NOTHING LOL
		ActionMaker.initButtons();
	},

	output: function(){

		var codes = {
			action: document.getElementById("code_action").value,
			inspector: document.getElementById("code_inspector").value,
			asset: {
				"label": "Custom Action",
				"icon": "stickers/custom.png",

				"id": "action.CustomAction",
				"type": "json/object",
				"tags": ["action","behaviour"],
				"data": {"is":"CustomAction"}
			}
		};

		Module.output(codes);

	},
	cancel: function(){
		Module.output(null);
	},

	initButtons: function(){
		document.getElementById("add").addEventListener("click",ActionMaker.output);
		document.getElementById("cancel").addEventListener("click",ActionMaker.cancel);
	}

};

// SINGLETON
exports.ActionMaker = ActionMaker;
ActionMaker.initialize();

})(window);