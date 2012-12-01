(function(exports){


/////////////////////
// RAW
/////////////////////

Class.create( "edit.action.Eval", {

	is: "edit.Properties",

	properties: [{
		is: "prop.String",
		prop:"script",
		textarea:true,
		getInfo: function(value){
			return "Run this script:";
		}
	}]

});


/////////////////////
// META
/////////////////////

Class.create( "edit.meta.ID", {

	is: "edit.Properties",
	required: true,

	properties: [{
		is: "prop.String",
		prop:"id",
		getInfo: function(value){
			return "Global ID:";
		}
	}]

});



/////////////////////
// ART
/////////////////////

Class.create( "edit.art.Bitmap", {

	asset:null,
	action:null,
	editors:[],

	properties: null,
	required: false,
	changeable: false,

	initialize: function(action,asset){

		this.asset = asset;
		this.action = action;
		this.images = [];
		
		var dom = document.createElement("div");
		this.dom = dom;
		this.dom.model = this;

		this.initImages();
		this.onSelect(this.action.image);

	},

	initImages: function(){

		var assets = Asset.manifests.filter(function(asset){
			return( asset.id.indexOf("art.")==0 );
		});

		for(var i=0;i<assets.length;i++){
			
			var asset = assets[i];
			var img = Asset.resources[asset.id];
			
			img.assetID = asset.id;
			img.width = img.height = 70;
			img.onclick = this.onSelect.bind(this,asset.id);

			this.dom.appendChild(img);
			this.images.push(img);

		}

	},

	onSelect: function(id){
		this.action.image = id;
		for(var i=0;i<this.images.length;i++){
			var image = this.images[i];
			image.style.border = (image.assetID==id) ? "5px solid white" : "none";
		}
	}

});



/////////////////////
// SOUND
/////////////////////

Class.create( "edit.sound.Play", {

	is: "edit.Properties",
	
	properties: [{
		is: "prop.Select",
		prop:"sound",
		initialize: function(action){
			
			var audios = Asset.manifests.filter(function(asset){
				return( asset.id.indexOf("audio.")==0 );
			});
			
			this.options = [];
			for(var i=0;i<audios.length;i++){
				var audio = audios[i];
				this.options.push({
					label: audio.id,
					value: audio.id
				});
			}

			this.super(action);
			
		},
		getInfo: function(value){
			return "Sound ID:";
		}
	}]

});



/////////////////////
// LOGIC
/////////////////////

Class.create( "edit.logic.Timer", {

	is: "edit.Properties",
	
	properties: [{
		is:"prop.Range",
		prop:"delay",
		min:0, max:10000, step:100,
		getInfo: function(value){
			return "Perform action in "+(value/1000)+" seconds.";
		}
	},{
		is:"prop.Action",
		prop:"perform"
	}]

});

Class.create( "edit.logic.Now", {
	is: "edit.Properties",
	properties: [{
		is:"prop.Action",
		prop:"perform"
	}]
});

Class.create( "edit.logic.Forever", {
	is: "edit.Properties",
	properties: [{
		is:"prop.Action",
		prop:"perform"
	}]
});


Class.create( "edit.condition.Once",{
	
	is:"edit.Properties",
		
	properties: [{
		is:"prop.Action",
		limitTag: "check",
		prop:"check"
	},{
		is:"prop.Action",
		limitTag: "perform",
		prop:"perform"
	}]

});

Class.create( "edit.condition.ChangeToValue",{
	
	is:"edit.Properties",
		
	properties: [{
		is:"prop.Boolean",
		prop:"value",
		getInfo: function(value){
			return "Change to True/False? "+value;
		}
	},{
		is:"prop.Action",
		limitTag: "check",
		prop:"check"
	},{
		is:"prop.Action",
		limitTag: "perform",
		prop:"perform"
	}]

});


/////////////////////
// CONDITIONS
/////////////////////


Class.create( "edit.check.Proximity",{

	is:"edit.Properties",
	
	properties: [{
		is: "prop.ActorID",
		prop:"target",
		getInfo: function(value){
			return "Target ID:";
		}
	},{
		is:"prop.Range",
		prop:"radius",
		min:0, max:500, step:1,
		getInfo: function(value){
			return "Radius of "+value;
		}
	}]

});

Class.create( "edit.check.Key",{

	is:"edit.Properties",
	
	properties: [{
		is: "prop.String",
		prop:"key",
		getInfo: function(value){
			return "Key:";
		}
	}]

});

Class.create( "edit.check.And",{

	is:"edit.Properties",
	
	properties: [{
		is:"prop.Action",
		prop:"first",
		limitTag: "check"
	},{
		is:"prop.Action",
		prop:"second",
		limitTag: "check"
	}]

});



/////////////////////
// GLOBAL
/////////////////////

Class.create("edit.check.Global",{
	
	is:"edit.Properties",
	
	properties: [{
		is:"prop.String",
		prop:"prop",
		getInfo: function(){ return "Property:"; }
	},{
		is:"prop.String",
		prop:"value",
		getInfo: function(){ return "Value:"; }
	}]

});

Class.create("edit.set.Global",{

	is:"edit.Properties",
	
	properties: [{
		is:"prop.String",
		prop:"prop",
		getInfo: function(){ return "Property:"; }
	},{
		is:"prop.String",
		prop:"value",
		getInfo: function(){ return "Value:"; }
	}]

});



/////////////////////
// ACTION
/////////////////////

Class.create( "edit.perform.AddAction",{

	is:"edit.Properties",
	
	properties: [{
		is: "prop.ActorID",
		prop:"target",
		getInfo: function(value){
			return "Target ID: (empty for SELF)";
		}
	},{
		is:"prop.Action",
		prop:"action"
	}]

});

Class.create( "edit.perform.OnActor",{

	is:"edit.Properties",
	
	properties: [{
		is: "prop.ActorID",
		prop:"target",
		getInfo: function(value){
			return "Target ID: (empty for SELF)";
		}
	},{
		is:"prop.Action",
		prop:"action",
		limitTag:"perform"
	}]

});

Class.create( "edit.perform.TwoActions",{

	is:"edit.Properties",
	
	properties: [{
		is:"prop.Action",
		prop:"first",
		limitTag:"perform"
	},{
		is:"prop.Action",
		prop:"second",
		limitTag:"perform"
	}]

});


/////////////////////
// PHYSICS
/////////////////////

Class.create( "edit.box2d.SetVelocity",{
	is:"edit.Properties",
	
	properties: [{
		is:"prop.Range",
		prop:"x",
		min:-10, max:10, step:0.1,
		getInfo: function(value){
			return "Velocity X: "+value;
		}
	},{
		is:"prop.Range",
		prop:"y",
		min:-10, max:10, step:0.1,
		getInfo: function(value){
			return "Velocity Y: "+value;
		}
	},{
		is:"prop.Range",
		prop:"angular",
		min:-5, max:5, step:0.1,
		getInfo: function(value){
			return "Angular Velocity: "+value;
		}
	}]

});

Class.create( "edit.box2d.Box",{
	is:"edit.Properties",
	
	properties: [{
		is:"prop.Select",
		prop:"type",
		options:[
			{label:"STATIC - Box cannot move, and acts as a solid wall to other boxes.",value:0},
			{label:"KINEMATIC - Box can move, but not be affected by other boxes.",value:1},
			{label:"DYNAMIC - Box can move, and be affected by other boxes.",value:2},
		],
		getInfo: function(value){
			return "Choose type of Physics";
		}
	},/*{
		is:"prop.Select",
		prop:"shape",
		options:[
			{label:"Box",value:"box"},
			{label:"Circle",value:"circle"}
		],
		getInfo: function(value){
			return "Choose shape of Box";
		}
	},*/{
		is:"prop.Range",
		prop:"density",
		min:0, max:5, step:0.1,
		getInfo: function(value){
			return "Density: "+value;
		}
	},{
		is:"prop.Range",
		prop:"friction",
		min:0, max:1, step:0.05,
		getInfo: function(value){
			return "Friction: "+value;
		}
	},{
		is:"prop.Range",
		prop:"dampening",
		min:0, max:5, step:0.1,
		getInfo: function(value){
			return "Dampening: "+value;
		}
	},{
		is:"prop.Range",
		prop:"restitution",
		min:0, max:1, step:0.05,
		getInfo: function(value){
			return "Bounce: "+value;
		}
	},{
		is:"prop.Boolean",
		prop:"isSensor",
		getInfo: function(value){
			return "Is Sensor? "+value;
		}
	},{
		is:"prop.Boolean",
		prop:"fixedRotation",
		getInfo: function(value){
			return "Rotation Fixed? "+value;
		}
	},{
		is:"prop.Range",
		prop:"groupIndex",
		min:-5, max:5, step:1,
		getInfo: function(value){
			if(value<0) return "Part of group "+value+" and I don't collide with my own group";
			if(value>0) return "Part of group "+value+" and I collide with my own group";
			return "No collision grouping";
		}
	}]

});

/////////////////////
// MISC
/////////////////////

Class.create( "edit.Draggable",{
	is:"edit.Properties",
	label: "Draggable"
});

Class.create( "edit.Shake",{
	is:"edit.Properties",
	label: "Shake"
});

Class.create( "edit.perform.MultipleActions",{
	is:"edit.Properties",
	label: "Hard Coded Coin Explode"
});

Class.create( "edit.check.Contact",{
	is:"edit.Properties",
	label: "Check Contact"
});


Class.create( "edit.actor.AddActor",{

	is:"edit.Properties",
	
	properties: [{
		is: "prop.Select",
		prop:"asset",
		initialize: function(action){
			
			var actors = Asset.manifests.filter(function(asset){
				return( asset.id.indexOf("actor.")==0 );
			});
			
			this.options = [];
			for(var i=0;i<actors.length;i++){
				var actor = actors[i];
				this.options.push({
					label: actor.id,
					value: actor.id
				});
			}

			this.super(action);
			
		},
		getInfo: function(value){
			return "Asset ID of Actor: "+value;
		}
	},{
		is: "prop.ActorID",
		prop:"target",
		getInfo: function(value){
			return "At Position here (Leave blank for self):";
		}
	}]

});

Class.create( "edit.art.SetVisible", {
	
	is: "edit.Properties",
		
	properties: [{
		is:"prop.Boolean",
		prop:"visible",
		getInfo: function(value){
			return "Set Visible? "+value;
		}
	}]

});

Class.create( "edit.box2d.SetActive", {
	
	is: "edit.Properties",
		
	properties: [{
		is:"prop.Boolean",
		prop:"active",
		getInfo: function(value){
			return "Set Active? "+value;
		}
	}]

});

Class.create( "edit.Spinner", {
	
	is: "edit.Properties",
		
	properties: [{
		is:"prop.Range",
		prop:"spin",
		min:-90, max:90, step:1,
		getInfo: function(value){
			if(value<0) return "Spin me counterclockwise "+value+" degrees per frame";
			if(value>0) return "Spin me clockwise "+value+" degrees per frame";
			return "Don't spin me.";
		}
	}]

});

Class.create( "edit.TopDown", {
	
	is: "edit.Properties",
	
	properties: [{
		is: "prop.Range",
		prop:"speed",
		min:0, max:50, step:1,
		getInfo: function(value){
			return "Maximum speed of "+value+" pixels per frame";
		}
	},{
		is: "prop.Range",
		prop:"inertia",
		min:0, max:1, step:0.05,
		getInfo: function(value){
			if(value==1.00) return "Impossible to move.";
			if(value==0.00) return "Instant acceleration.";
			return "Inertia of "+value;
		}
	},{
		is:"prop.Range",
		prop:"groupIndex",
		min:-5, max:5, step:1,
		getInfo: function(value){
			if(value<0) return "Part of group "+value+" and I don't collide with my own group";
			if(value>0) return "Part of group "+value+" and I collide with my own group";
			return "No collision grouping";
		}
	}]

});

Class.create( "edit.Follow", {

	is: "edit.Properties",
	
	properties: [{
		is: "prop.ActorID",
		prop:"targetID",
		getInfo: function(value){
			return "Target ID:";
		}
	},{
		is:"prop.Boolean",
		prop:"followX",
		getInfo: function(value){
			return "Follow X: "+value;
		}
	},{
		is:"prop.Boolean",
		prop:"followY",
		getInfo: function(value){
			return "Follow Y: "+value;
		}
	},{
		is: "prop.Range",
		prop:"inertia",
		min:0, max:1, step:0.1,
		getInfo: function(value){
			return "Inertia: "+value;
		}
	}]

});

Class.create( "edit.Burst",{

	is:"edit.Properties",
	
	properties: [{
		is:"prop.Range",
		prop:"radius",
		min:0, max:500, step:1,
		getInfo: function(value){
			return "Radius of "+value;
		}
	}]

});

Class.create( "edit.ShowtimeMessage",{

	is:"edit.Properties",
	label:"ShowtimeMessage",

	properties: [{
		is: "prop.String",
		prop:"message",
		getInfo: function(value){
			return "Say this:";
		}
	}]

});



})(window);