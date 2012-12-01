(function(exports){


/////////////////////
// SCENE
/////////////////////

/*
Class.create("scene.Goto",{
	is:"Action",
	scene: "",
	init: function(){
		Scene.goto({is:this.scene});
	}
});
*/


/////////////////////
// RAW
/////////////////////

Class.create("action.Eval",{
	is:"Action",
	script: "",
	init: function(){
		try{
			eval(this.script);
		}catch(e){
			console.error(e);
		}
	}
});


/////////////////////
// ACTION
/////////////////////

Class.create("action.InitCompressed",{
	is:"Action",
	json: "",
	values: null,
	init: function(){

		// Replace all "%vars%" with own values, by JSON parsing it.
		var json = this.json;
		for(var valueName in this.values){
			var value = JSON.stringify(this.values[valueName]);
			json = json.replace( new RegExp('"%'+valueName+'%"','g'), value );
		}

		// Translate to actual array of actions
		// TODO - Catch: Not all values assigned.
		var actions = JSON.parse(json);

		// Add all of those actions.
		for(var i=0; i<actions.length; i++){
			var action = Action.fromDefinition(actions[i]);
			this.actor.addAction(action);
		}

		this.destroy(); // That's all folks

	}
});


/////////////////////////
// ART
/////////////////////////

Class.create("art.SetVisible",{
	is:"Action",
	visible:false,
	perform: function(){
		this.actor.art.visible = this.visible;
	}
});


/////////////////////////
// SOUND
/////////////////////////

Class.create("sound.Play",{
	is:"Action",
	sound:"",
	perform: function(){

		var audio = Asset.resources[this.sound];
		audio.currentTime = 0;
		audio.play();

		//SoundJS.play(this.sound);

	}
});


/////////////////////////
// LOGIC - TIMER
/////////////////////////

Class.create("logic.Timer",{
	is: "Action",
	delay: 0,
	perform: null,
	init:function(){
		this._perform = Action.fromDefinition(this.perform);
		this.actor.addAction(this._perform);
	},
	update:function(timeElapsed){
		this.delay-=timeElapsed;
		if(this.delay<=0){
			this._perform.perform();
			this.destroy();
		}
	},
	destroy: function(){
		this._perform.destroy();
		this.super();
	}
});

Class.create("logic.Now",{
	is: "Action",
	perform: null,
	init:function(){
		this._perform = Action.fromDefinition(this.perform);
		this.actor.addAction(this._perform);
		this._perform.perform();
		this._perform.destroy();
		this.destroy();
	}
});

Class.create("logic.Forever",{
	is: "Action",
	perform: null,
	update:function(){
		this._perform = Action.fromDefinition(this.perform);
		this.actor.addAction(this._perform);
		this._perform.perform();
		this._perform.destroy();
	}
});



/////////////////////////
// LOGIC - CONTROL
/////////////////////////

Class.create("condition.Update",{
	is:"Action",
	check: null,
	perform: null,
	init:function(){
		this._perform = Action.fromDefinition(this.perform);
		this._check = Action.fromDefinition(this.check);
		this.actor.addAction(this._perform);
		this.actor.addAction(this._check);
	},
	update:function(){
		if(this._check.check()) this._perform.perform();
	},
	destroy: function(){
		this._check.destroy();
		this._perform.destroy();
		this.super();
	}
});

Class.create("condition.Once",{
	is:"condition.Update",
	update:function(){
		if(this._check.check()){
			this._perform.perform();
			this.destroy();
		}
	}
});

Class.create("condition.ChangeToValue",{
	is:"Action",
	value:true,
	init:function(){

		this._check = Action.fromDefinition(this.check);
		this.actor.addAction(this._check);

		this._prevVal = null;

	},
	update:function(){

		var currVal = this._check.check();
		if( currVal==this.value && this._prevVal!==currVal && this._prevVal!==null ){

			this._perform = Action.fromDefinition(this.perform);
			this.actor.addAction(this._perform);
			this._perform.perform();

		}
		this._prevVal = currVal;

	},

	destroy: function(){
		this._check.destroy();
		if(this._perform) this._perform.destroy();
		this.super();
	}

});


/////////////////////////
// LOGIC - CHECK
/////////////////////////

Class.create("check.And",{
	is:"Action",
	first: null,
	second: null,
	init: function(){
		this.first = Action.fromDefinition(this.first);
		this.second = Action.fromDefinition(this.second);
		this.actor.addAction(this.first);
		this.actor.addAction(this.second);
	},
	check: function(){
		return( this.first.check() && this.second.check() );
	}
});

Class.create("check.Key",{
	is:"Action",
	key: null,
	check: function(){
		return Key[this.key];
	}
});

Class.create("check.Proximity",{
	is:"Action",
	target: null,
	radius: 10,
	check: function(){
		if(Global[this.target]){
			var a1 = this.actor.art;
			var a2 = Global[this.target].art;
			var dx=a1.x-a2.x, dy=a1.y-a2.y;
			return (dx*dx+dy*dy<this.radius*this.radius);
		}
		return false;
	}
});

/////////////////////
// LOGIC - PERFORM
/////////////////////

Class.create("perform.MultipleActions",{
	is:"Action",
	actions:null,
	perform: function(){
		for(var i=0; i<this.actions.length; i++){
			var performer = Action.fromDefinition(this.actions[i]);
			this.actor.addAction(performer);
			performer.perform();
		}
	}
});

// HACK: PERFORM TWO ACTIONS
Class.create("perform.TwoActions",{
	is:"Action",
	first: null,
	second: null,
	perform: function(){
		this.first = Action.fromDefinition(this.first);
		this.second = Action.fromDefinition(this.second);
		this.actor.addAction(this.first);
		this.actor.addAction(this.second);
		this.first.perform();
		this.second.perform();
	}
});

Class.create("perform.AddAction",{
	is:"Action",
	action:null,
	target:null,
	perform: function(){
		var actor = (Global[this.target]) ? Global[this.target] : this.actor;
		this.action = Action.fromDefinition(this.action);
		actor.addAction(this.action);
	}
});

Class.create("perform.OnActor",{
	is:"Action",
	action:null,
	target:null,
	perform: function(){
		var actor = (Global[this.target]) ? Global[this.target] : this.actor;
		this.action = Action.fromDefinition(this.action);
		actor.addAction(this.action);
		this.action.perform();
	}
});


/////////////////////
// SCENE ACTIONS
/////////////////////

Class.create("Shake",{
	is:"Action",
	update: function(){
		//this.actor.art.x += Math.random()*20-10;
		//this.actor.art.y += Math.random()*20-10;
		this.actor.art.scaleX = Math.random()*0.1+0.95;
		this.actor.art.scaleY = Math.random()*0.1+0.95;
	}
});

Class.create("camera.BlackAndWhite",{
	is:"Action",
	init: function(){
		// Holy shit this is a violation of encapsulation.
		var _initUpdate = Screenplay.stage.update.bind(Screenplay.stage);
		var canvas = Screenplay.canvas;
		var ctx = canvas.getContext('2d');
		var w=canvas.width, h=canvas.height;
		Screenplay.stage.update = function(){

			_initUpdate();

			// Fuck with Canvas
			var imgd = ctx.getImageData(0,0,w,h);
			var pix = imgd.data;
			for(var i=0, n=pix.length; i<n; i+=4)
				pix[i] = pix[i+1] = pix[i+2] = ( (pix[i]+pix[i+1]+pix[i+2]>350) ? 255 : 0 );
			ctx.putImageData(imgd,0,0);

		};
		this._initUpdate = _initUpdate;
	},
	destroy: function(){
		Screenplay.stage.update = this._initUpdate;
	}
});


/////////////////////////
// SPAWNER
/////////////////////////

Class.create("actor.AddActor",{
	
	is:"Action",
	
	asset:"", // The ID of the resource
	target:"", // Target of where to position it.

	perform: function(){
		
		var actorConfig = Asset.resources[this.asset];
		if(!actorConfig) return;

		// Actor, at target's position.
		var target = (Global[this.target]) ? Global[this.target] : this.actor;
		var actorConfig = {
			actions: actorConfig.actions.concat(),
			actors: []
		};
		actorConfig.actions.unshift({
			is:"art.SetTransform",
			x:target.art.x,
			y:target.art.y 
		});
		var actor = Actor.fromDefinition(actorConfig);

		// Add it to same parent container
		var parentActor = this.actor.actor;
		parentActor.addActor(actor);

	}
});



/////////////////////
// PHYSICS
/////////////////////

var b2Vec2 = Box2D.Common.Math.b2Vec2;

Class.create("box2d.Mover",{
	is:"Action",
	x:0, y:0,	
	perform: function(){
		var vel = this.actor.body.GetLinearVelocity();
		var vx=vel.x, vy=vel.y;
		vx += this.x*0.2;
		vy += this.y*0.2;
		this.actor.body.SetLinearVelocity( new b2Vec2(vx,vy) );
	}
});

Class.create("box2d.SetVelocity",{
	is:"Action",
	x:0, y:0, angular:0,
	init: function(){
		this.actor.body.SetLinearVelocity( new b2Vec2(this.x,this.y) );
		this.actor.body.SetAngularVelocity( this.angular );
		this.destroy(); // That's all folks
	}
});

Class.create("box2d.SetActive",{
	is:"Action",
	active:false,
	perform: function(){
		this.actor.body.SetActive(this.active);
	}
});

Class.create("TopDown",{
	is:"action.InitMultiple",
	speed:5,
	inertia:0.5,
	groupIndex:0,
	init: function(){
		this.actions = [
			{
				is:"box2d.Box", // HACK - should require it. Or something.
				type: Box2D.Dynamics.b2Body.b2_dynamicBody,
				fixedRotation: true,
				restitution: 0,
				dampening:5,
				groupIndex:this.groupIndex
			},
			{
				is:"condition.Update",
				check:{is:"check.Key",key:"left"},
				perform:{is:"box2d.Mover",x:-this.speed,inertia:this.inertia}
			},
			{
				is:"condition.Update",
				check:{is:"check.Key",key:"right"},
				perform:{is:"box2d.Mover",x:this.speed,inertia:this.inertia}
			},
			{
				is:"condition.Update",
				check:{is:"check.Key",key:"up"},
				perform:{is:"box2d.Mover",y:-this.speed,inertia:this.inertia}
			},
			{
				is:"condition.Update",
				check:{is:"check.Key",key:"down"},
				perform:{is:"box2d.Mover",y:this.speed,inertia:this.inertia}
			}
		];
		this.super();
	}
});



/////////////////////
// MISC
/////////////////////

Class.create("Spinner",{
	is:"Action",
	spin:1,
	update:function(){
		this.actor.art.rotation+=this.spin;
	}
});

Class.create("Alert",{
	is:"Action",
	message: "",
	perform: function(){
		alert(this.message);
	}
});

Class.create("ShowtimeMessage",{
	is:"Action",
	message: "",
	perform: function(){
		Playtime.showMessage(this.message);
	}
});
/*Class.create("ShowtimeMessage",{
	is:"Action",
	message: "",
	perform: function(){

		Showtime.getTextInput("Input Here Please").done(function(message){

			var action = Action.fromDefinition({is:"Alert",message:message});
			this.actor.addAction(action);

			action.perform();

		}.bind(this));

	}
});*/

Class.create("Burst",{
	is:"Action",
	radius:100,
	perform: function(){

		// Remove current art
		this.actor.art.children.splice(0);

		// Create a bunch of similar small-sized arts & burst 'em
		for(var i=0; i<8; i++){
			
			var angle = Math.PI*2*( i/8 );
			var x = Math.cos(angle)*this.radius;
			var y = Math.sin(angle)*this.radius;

			var img = Asset.resources["art.GoldBlock"];
			var newArt = new Bitmap(img);
			newArt.scaleX = newArt.scaleY = 0.3;
			this.actor.art.addChild(newArt);

			Tween.get(newArt).to({x:x,y:y},500,Ease.quadOut);

		}

		// Then destroy self.
		setTimeout(function(){
			this.actor.destroy();
		}.bind(this),500);

	}
});

Class.create("Follow",{
	is:"Action",
	targetID:"",
	followX:true,
	followY:true,
	inertia:0.5,
	update: function(){
		var target = Global[this.targetID];
		if(!target || !target.art) return;
		if(this.followX) this.actor.art.x = this.actor.art.x*this.inertia + target.art.x*(1-this.inertia);
		if(this.followY) this.actor.art.y = this.actor.art.y*this.inertia + target.art.y*(1-this.inertia);
	}
});



})(window);