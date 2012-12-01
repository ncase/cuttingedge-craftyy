(function(exports){

// TODO: STEP vs ANIMATE
Class.create("move.ToPoint",{
	is:"Action",
	x: 0,
	y: 0,
	duration: 0,
	perform: function(){
		Tween
			.get(this.actor.art)
			.to({x:this.x,y:this.y},this.duration,Ease.linear);
	}
});

Class.create("art.SetRotation",{
	is:"Action",
	rotation: 0,
	perform: function(){
		this.actor.art.rotation = this.rotation;
		this.destroy(); // That's all folks
	}
});

Class.create("art.SetTransformToActor",{
	is:"Action",
	target: null,
	radius: 10,
	perform: function(){
		
		var target = Global[this.target];
		if(!target) return;

		this.actor.art.x = target.art.x;
		this.actor.art.y = target.art.y;
		this.actor.art.rotation = target.art.rotation;
		this.destroy(); // That's all folks

	}
});

// TODO: STEP vs ANIMATE
Class.create("move.Relative",{ 
	is:"Action",
	x: 0,
	y: 0,
	perform: function(){
		var matrix = this.actor.art.getMatrix();
		matrix.tx = matrix.ty = 0;
		matrix.append(1,0,0,1,this.x,this.y);
		this.actor.art.x += matrix.tx;
		this.actor.art.y += matrix.ty;
	}
});


})(window);