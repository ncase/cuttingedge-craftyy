(function(exports){

var BOX2D_SCALE = 100;
var BOX2D_TIMESTEP = Ticker._interval/1000;

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

Class.create("box2d.World",{

	is: "Action",
	gravity: {x:0,y:0},

	init: function(){

		Global["box2d"] = this;

		// Properties
        this.gravity = new b2Vec2( this.gravity.x, this.gravity.y );
        this.world = new b2World( this.gravity, false );
        this.feed = new Feed();

        // Garbage
		this.bodies = [];
		this.graveyard = [];

		// Listeners
		var listener = new Box2D.Dynamics.b2ContactListener();
		listener.BeginContact = function(contact){ this.feed.publish("BeginContact",contact); }.bind(this);
		listener.EndContact = function(contact){ this.feed.publish("EndContact",contact); }.bind(this);
		listener.PostSolve = function(contact,impulse){ this.feed.publish("PostSolve",{contact:contact,impulse:impulse}); }.bind(this);
		this.world.SetContactListener(listener);

	},

	update: function(){

		this.world.Step( BOX2D_TIMESTEP, 8, 3 );
        this.world.ClearForces();

        // Garbage
        for(var i=0; i<this.graveyard.length; i++){
        	var body = this.graveyard[i];
	    	body.SetUserData(null);
	    	this.world.DestroyBody(body);
        }
        this.graveyard.splice(0);

	},

	destroy: function(){
		this.super();
		Global["box2d"] = null;
	},

	createBody: function(bodyDef){
		var body = this.world.CreateBody(bodyDef);
		this.bodies.push(body);
		return body;
	},

	destroyBody: function(body){
		if(body && this.graveyard){
			var index = this.bodies.indexOf(body);
			this.bodies.splice(index,1);
			this.graveyard.push(body);
		}
	}
	
});

Class.create("box2d.Box",{

	is: "Action",

	density: 1,
	friction: 0.3,
	dampening: 0.3,
	restitution: 0,
	isSensor: false,
	fixedRotation: false,
	shape: "box",
	type: b2Body.b2_staticBody,

	groupIndex:0,

	init: function(){

		// Create Fixture
        var fixtureDef = new b2FixtureDef();
        fixtureDef.density = this.density;
        fixtureDef.restitution = this.restitution;
        fixtureDef.friction = this.friction;
        fixtureDef.isSensor = this.isSensor;
        fixtureDef.filter.groupIndex = this.groupIndex;

        // Box Shape
        switch(this.shape){

        	case "box":
        		var bounds = this.actor.bounds;
		        fixtureDef.shape = new b2PolygonShape();
		        fixtureDef.shape.SetAsBox( (bounds.width*0.5)/BOX2D_SCALE, (bounds.height*0.5)/BOX2D_SCALE );
		        break;

		    case "circle":
        		var radius = 35/BOX2D_SCALE;
        		fixtureDef.shape = new b2CircleShape(radius);
        		break;

	    }

        // Create Body
        var bodyDef = new b2BodyDef();
        bodyDef.type = this.type;
        var Box = Global["box2d"];
        this.body = Box.createBody(bodyDef);
        this.body.CreateFixture(fixtureDef);
        this.actor.body = this.body;

        // Misc Params: Fixed Rotation, Dampening
        this.body.SetFixedRotation(this.fixedRotation);
        this.body.SetLinearDamping(this.dampening);
		this.body.SetAngularDamping(this.dampening);

        // Initial Conditions
        this.body.SetPositionAndAngle(
        	new b2Vec2( this.actor.art.x/BOX2D_SCALE, this.actor.art.y/BOX2D_SCALE ),
        	this.actor.art.rotation * (Math.PI/180)
        );

        // This Actor is its User Data
        this.body.SetUserData(this.actor);

	},

	update: function(){

		if(!this.body.IsActive()) return;

	    var center = this.body.GetWorldCenter();
        this.actor.art.rotation = this.body.GetAngle() * (180 / Math.PI);
        this.actor.art.x = center.x * BOX2D_SCALE;
        this.actor.art.y = center.y * BOX2D_SCALE;
	},

    destroy: function(){
    	if(!Global["box2d"]) return;
		Global["box2d"].destroyBody(this.body);
    	this.actor.body = null;
    	this.body = null;
    }

});

Class.create("check.Contact",{
	is:"Action",
	init: function(){
		this.contacts = 0;
		var Box = Global["box2d"];
		Box.feed.subscribe("BeginContact",this._onBeginContact,this);
		Box.feed.subscribe("EndContact",this._onEndContact,this);
	},
	check:function(){
		return this.contacts>0;
	},
	destroy: function(){
		if(!Global["box2d"]) return;
		Global["box2d"].feed.removeTarget(this);
	},
	_onBeginContact: function(contact){
		var fixture = this.actor.body.GetFixtureList(); // ASSUMES ONE FIXTURE.
		if( contact.GetFixtureA()==fixture || contact.GetFixtureB()==fixture ){
			this.contacts++;
		}
	},
	_onEndContact: function(contact){
		var fixture = this.actor.body.GetFixtureList(); // ASSUMES ONE FIXTURE.
		if( contact.GetFixtureA()==fixture || contact.GetFixtureB()==fixture ){
			this.contacts--;
		}
	}
});

/**
Class.create("check.Collide",{
	is:"Action",
	threshold: 1,
	init: function(){
		this._lastImpact = 0;
		var Box = Global["box2d"];
		Box.feed.subscribe("PostSolve",this._onImpact,this);
	},
	check:function(){
		return this._lastImpact > this.threshold;
	},
	update:function(){
		this._lastImpact = 0;
	},
	destroy: function(){
		if(!Global["box2d"]) return;
		Global["box2d"].feed.removeTarget(this);
	},
	_onImpact: function(params){
		var contact = params.contact;
		var impulse = params.impulse;
		this._lastImpact += impulse.normalImpulses[0];
	}
});
*/

})(window);