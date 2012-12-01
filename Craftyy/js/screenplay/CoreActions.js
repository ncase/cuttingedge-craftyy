(function(exports){



/////////////////////
// SCENE
/////////////////////

Class.create("scene.Layers",{
	is:"Action",
	layers:null,
	init: function(){
		this.layers = this.layers || [];
		this.actor.layers = this;
	},
	getByID: function(id){
		var index = this.layers.indexOf(id);
		if(index<0) return null;
		return this.actor.actors[index];
	},
	getOrder: function(){
		return this.layers.concat();
	}
});

/////////////////////
// META
/////////////////////

Class.create("meta.ID",{
	is:"Action",
	id:"",
	init: function(){
		Global[this.id] = this.actor;
	},
	destroy: function(){
		if(Global[this.id]==this.actor){
			delete Global[this.id];
		}
	}
});


/////////////////////
// ACTION
/////////////////////

Class.create("action.InitMultiple",{
	is:"Action",
	actions: null,
	init:function(){
		this.actions = this.actions || [];
		for(var i=0; i<this.actions.length;i++){
			this.actor.addAction( Action.fromDefinition(this.actions[i]) );
		}
		this.destroy(); // That's all folks
	}
});



/////////////////////
// GLOBAL DATA
/////////////////////

Class.create("check.Global",{
	is:"Action",
	prop:"",
	value:null,
	check: function(){
		return( Global[this.prop] == this.value );
	}
});

Class.create("set.Global",{
	is:"Action",
	prop:"",
	value:null,
	perform:function(){
		Global[this.prop] = this.value;
	}
});


/////////////////////
// ART
/////////////////////

Class.create("art.SetTransform",{
	is: "Action",
	x:null,
	y:null,
	init: function(){
		if(this.x!==null) this.actor.art.x = this.x;
		if(this.y!==null) this.actor.art.y = this.y;
		this.destroy(); // That's all folks
	}
});
 
Class.create("art.Bitmap",{
	is: "Action",
	image: null,
	init: function(){
		
		this.image = Asset.resources[this.image];
	
		this.bitmap = new Bitmap(this.image);
		this.bitmap.regX = this.image.width/2;
		this.bitmap.regY = this.image.height/2;
		this.actor.art.addChild(this.bitmap);
		this.bitmap.actor = this.actor; // HACK to detect via Selectable

		this.actor.bounds = {
			x:-this.bitmap.regX, y:-this.bitmap.regY,
			width:this.image.width, height:this.image.height
		};

	},
	destroy: function(){
		this.actor.art.removeChild(this.bitmap);
		this.super();
	}
});


/////////////////////
// MISC
/////////////////////

Class.create("Draggable",{
	is:"Action",
	init:function(){
		var target = this.actor.art;
		this.actor.art.onPress = function(evt){

			var local = target.parent.globalToLocal(evt.stageX,evt.stageY);
			var offset = {x:target.x-local.x, y:target.y-local.y};

			evt.onMouseMove = function(ev) {

				var local = target.parent.globalToLocal(ev.stageX,ev.stageY);
				target.x = local.x+offset.x;
				target.y = local.y+offset.y;

			}
		};
	}
});


})(window);