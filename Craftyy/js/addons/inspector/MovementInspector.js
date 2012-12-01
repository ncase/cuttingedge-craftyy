(function(exports){


/////////////////////
// META
/////////////////////

Class.create( "edit.move.ToPoint", {

	is: "edit.Properties",
	required: true,

	properties: [{
		is:"prop.Position",
		getInfo: function(position){
			return "(x:"+position.x+",y:"+position.y+")";
		}
	},{
		is:"prop.Range",
		prop:"duration",
		min:0, max:10000, step:1,
		getInfo: function(value){
			return "Milliseconds: "+value;
		}
	}]

});

Class.create("edit.art.SetRotation",{

	is: "edit.Properties",
	required: true,

	properties: [{
		is:"prop.Range",
		prop:"rotation",
		min:0, max:360, step:1,
		getInfo: function(value){
			return "Rotation: "+value;
		}
	}]

});

Class.create( "edit.move.Relative", {

	is: "edit.Properties",
	required: true,

	properties: [{
		is:"prop.Range",
		prop:"x",
		min:-100, max:100, step:1,
		getInfo: function(value){
			return "Move relative X: "+value;
		}
	},{
		is:"prop.Range",
		prop:"y",
		min:-100, max:100, step:1,
		getInfo: function(value){
			return "Move relative Y: "+value;
		}
	}]

});


Class.create( "edit.art.SetTransformToActor", {

	is: "edit.Properties",
	
	properties: [{
		is: "prop.ActorID",
		prop:"target",
		getInfo: function(value){
			return "Target: ";
		}
	}]

});




})(window);