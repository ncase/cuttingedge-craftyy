(function(exports){

// KEYBOARD
var Key = {
	
	initialize: function(){

		// KEY DOWN
		window.addEventListener("keydown",function(event){
			if(!Key.active) return; // HACK
			Key.pressed[event.keyCode] = true;
			News.publish("keydown",event);
			event.preventDefault();
		});

		// KEY UP
		window.addEventListener("keyup",function(event){
			if(!Key.active) return; // HACK
			Key.pressed[event.keyCode] = false;
			News.publish("keyup",event);
			event.preventDefault();
		});

	},

	pressed: {},

	active: true // HACK

};

// SHORTCUT GETTERS
var short = function(key,keyCode){
	Object.defineProperty(Key,key,{ get: function(){ 
		return Key.pressed[keyCode];
	} });
};

// Arrow Keys
short("left",37);
short("up",38);
short("right",39);
short("down",40);
short("space",32);

// Alphabet
for( var ascii=65; ascii<=90; ascii++ ){
	short( String.fromCharCode(ascii).toUpperCase(), ascii );
}

// SINGLETON
exports.Key = Key;
window.addEventListener('load',Key.initialize);

})(window);
