(function(exports){

/****

LIBRARY:
- Maintains DOM & Icon DOMs
- Stores associated data
- Takes an Item & Icon Generator
- Filters them based on tags?

TODO: DE-classify it? 
TODO: More DRY please.

*/
Class.create( "Library", {

	initialize: function(){
		this.items = [];
		this.initDOM();
	},

	addItem: function(config){
		var item = this.generateItem(config);
		var icon = this.generateIcon(config);
		this.items.push({
			item:item,
			icon:icon,
			tags:config.tags
		}); // HACK - Tags?
		this.addIconDOM(icon);
	},

	addItems: function(configs){
		for(var i=0;i<configs.length;i++) this.addItem(configs[i]);
	},

	empty: function(){
		this.items.splice(0);
		this.emptyDOM();
	},

	/* TO BE IMPLEMENTED */
	generateItem: function(config){ return config.item; },
	generateIcon: function(config){ return config.icon; },
	initDOM: function(){},
	addIconDOM: function(icon){ this.dom.appendChild(icon); },
	emptyDOM: function(){ this.dom.innerHTML=''; },
	filter: function(filter){}

});

})(window);