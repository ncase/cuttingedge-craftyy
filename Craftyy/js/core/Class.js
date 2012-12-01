/*
 * CLASS.JS - Single Inheritance in JavaScript
 * by Nicklaus Liow - http://nutcasenightmare.com
 * MIT License.

... is this helper even necessary anymore?
Only thing it actually helps with is .super & initialize
& :is might not really be that helpful.
Could actually help with fucking namespacing or dependency?
(But then retrieving it will be harder?)
Maybe some other refleciton stuff like class name & def?

TODO: Warn if parentName exists but not Class.

 */

(function(exports){

// So that InstanceOf works
// And doesn't need to call Constructor.
var _extending = false;

// Wrap Super
var _wrapSuper = function(fn,parentFn){
    return function(){
        var _previousSuper = this.super;
        this.super = parentFn.bind(this);
        var result = fn.apply(this,arguments);   
        delete this.super;     
        if(_previousSuper) this.super=_previousSuper;
        return result;
    };
};

var createClass = function(definition){

    // Get parent class, if any.
    var parentName = definition.is;
    var ParentClass = parentName ? exports[parentName] : null;
    
    // 1) Start with new parent instance, or blank object.
    var prototype;
    if(ParentClass){
        _extending = true;
        prototype = new ParentClass();
        _extending = false;
    }else{
        prototype = {};
    }

    // 2) Copying over the original Config, applying .super for overridden functions
    for( var prop in definition ){
        if(typeof definition[prop]==="function" && typeof prototype[prop]==="function"){
            prototype[prop] = _wrapSuper(definition[prop],prototype[prop]);
        }else{
            prototype[prop] = definition[prop];
        }
    }

    // Finally creating the Class.
    var Classy = function(){
        if(!_extending && this.initialize){
            this.initialize.apply(this,arguments);
        }
    };
    Classy.prototype = prototype;
    return Classy;

};

// EXPORT
exports.Class = {
    create: function(id,definition){
        if(definition==null){
            return createClass(id); // Anonymous Class
        }else{
            return( exports[id] = createClass(definition) ); // Exported Class
        }
    }
};

})(window);