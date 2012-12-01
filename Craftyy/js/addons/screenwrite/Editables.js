(function(exports){

/***

== EDIT ACTIONS ==
- Serializes itself for Playwright Editor.
- Compiles for Showtime Player.
- Takes data, Previews it, & lets it be editable.

*/
Class.create("edit.Edit",{

	is:"Action",
	init: function(){ 
		this.preview(); 
		this.edit();
	},

	// TO BE IMPLEMENTED
	preview: function(){},
	edit: function(){},
	serialize: function(){},
	compile: function(){},

});

Class.create("edit.scene.Layers",{
	is:"edit.Edit",
	action: null,
	preview: function(){
		this.actor.addAction( Action.fromDefinition(this.action) );
	}
});

Class.create("edit.meta.ID",{
	is:"edit.Edit",
	action: null,
	preview: function(){
		this.id = this.action.id;
		Global[this.id] = this.actor;
	},
	destroy: function(){
		if(Global[this.id]==this.actor){
			delete Global[this.id];
		}
	}
});

Class.create("edit.art.Bitmap",{
	is:"edit.Edit",
	action: null,
	preview: function(){
		this._artAction = Action.fromDefinition({
			is:"art.Bitmap",
			image:this.action.image
		});
		this.actor.addAction(this._artAction);
	},
	destroy: function(){
		this._artAction.destroy(); // Well this is unnecessary since art.Bitmap destroys itself on init.
		this.super();
	},
});

Class.create("edit.art.SetTransform",{
	is:"edit.Edit",
	action: null,
	preview: function(){
		this.actor.art.x = this.action.x;
		this.actor.art.y = this.action.y;
	},
	edit: function(){
		this._dragAction = Action.fromDefinition({is:"Draggable"});
		this.actor.addAction(this._dragAction);
	},
	destroy: function(){
		this._dragAction.destroy();
		this.super();
	},
	update: function(){
		this.action.x = this.actor.art.x;
		this.action.y = this.actor.art.y; // Or rather, change it on MOUSEUP?
	}
});

Class.create("edit.Actions",{
	
	is:"edit.Edit",
	actions: null,

	edit: function(){

		// Actions
		this.actions = this.actions || [];
		this.actor._actionEditable = this; // TOTAL HACK
		this.editables = [];

		// Set 'em
		this.setActions(this.actions);

	},

	setActions: function(newActions){

		// This will solve: Changing art & Changing position. Also any post-edit-actions-fuckery like Dragging.

		// DESTROY ALL PREVIOUS EDIT ACTIONS
		var editables = this.editables.concat();
		for(var i=0;i<editables.length;i++){
			editables[i].destroy();
		}
		this.editables.splice(0);

		// SET NEW ACTIONS
		this.actions = newActions;

		// HACK????
		// TODO: Do not Hard-coded Actions
		for(var i=0; i<this.actions.length; i++){
			var action = this.actions[i];
			var hackyName = "edit."+action.is;
			if( exports[hackyName] ){
				var editableAction = Action.fromDefinition({ is:hackyName });
				editableAction.action = action;
				this.editables.push(editableAction);
				this.actor.addAction(editableAction);
			}
		}

	},

	serialize: function(){
		return { 
			is:"edit.Actions",
			actions:this.actions
		};
	},

	compile: function(){
		return this.actions;
	},

});

Class.create("edit.Selectable",{
	is:"edit.Edit",
	preview: function(){
		
		this.highlight = new Shape();
		this.highlight.alpha = 0;
		this.actor.art.addChild(this.highlight);

		this._formOutline();

	},
	// HACK
	_formOutline: function(){
		var g = this.highlight.graphics;
		var bounds = this.actor.bounds;
		g.clear();
		g.beginStroke("#555");
		g.setStrokeStyle(2);
		g.drawRect(bounds.x,bounds.y,bounds.width,bounds.height);
	},
	edit: function(){
		this._clickBuffer = -1;
		this.actor.art.onClick = function(evt){
			
			if(this._clickBuffer>0){

				this._clickBuffer = -1;
				ActorOptions.editSelected();

			}else{
			
				this._clickBuffer = 10;

				this._formOutline(); // HACK
				News.publish("edit.Selected",this.actor);

			}

		}.bind(this);
	},
	update: function(){

		if(this._clickBuffer>0) this._clickBuffer--;

		var gotoAlpha = (Global.selected==this.actor) ? 1 : 0;
		this.highlight.alpha = (gotoAlpha+this.highlight.alpha)*0.5;

	},
	serialize: function(){
		return { is:"edit.Selectable" };
	}
});


Class.create("edit.Animation",{
	is:"edit.Edit",
	edit: function(){
		this.actor.intro = this.intro.bind(this);
		this.actor.outro = this.outro.bind(this);
	},
	intro: function(){
		this.actor.art.scaleX = this.actor.art.scaleY = 0;
		Tween.get(this.actor.art).to({scaleX:1,scaleY:1},1000,Ease.bounceOut);
		News.publish("edit.Selected",this.actor);
	},
	outro: function(){
		News.publish("edit.Deselected");
		Tween.get(this.actor.art)
			.to({scaleX:0,scaleY:0},1000,Ease.elasticIn)
			.call(this.actor.destroy.bind(this.actor));
	},
	serialize: function(){
		return { is:"edit.Animation" };
	}
});



})(window);