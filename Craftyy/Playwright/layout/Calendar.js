(function(exports){

Layout.initialize({
	html: "/Craftyy/Playwright/layout/Calendar.html"
});

/***

CALENDAR
- A fullscreen layout with folding pages and tabs

*/
var Calendar = {

	// TODO: Should be defined in GameEditor
	tabConfigs: [
		{id:"publish"},
		{id:"preview"},
		{id:"draw"},
		{id:"home"},
		{id:"actionmaker"},
	],

	initialize: function(){

		this.tabs = {};
		this.pageStack = [];

		Layout.ready(this.init.bind(this));

		Layout.showModule = this.showModule.bind(this);
		Layout.addComponent = this.addComponent.bind(this);
		Layout.addIframe = this.addIframe.bind(this);

		// HACK: Before Unload
		Messenger.handleRequest("DisableExitPrompt",function(){
			window.onbeforeunload = null;
		});
		window.onbeforeunload = function(e) {
		    return "Wait, you have unsaved changes!";
		};

	},

	init: function(){

		// TABS
		for(var i=0; i<this.tabConfigs.length; i++){
			_addTab(this.tabConfigs[i]);
		}

	},

	addIframe: function(iframe){
		
		iframe.setAttribute("scrolling","no");

		if(this.pageStack.length==0){
			document.getElementById("first_module").appendChild(iframe);
		}else{
			document.getElementById("module").appendChild(iframe);
		}
		
	},

	showModule: function(module){

		var calendar_container = document.getElementById("calendar_container");
		var modules = document.getElementById("module").children;
		var footer = document.getElementById("footer");

		// Is it in the Stack?
		var idIndex = this.pageStack.indexOf(module);
		if(idIndex<0){

			// First one?
			if(this.pageStack.length!=0){
				module.iframe.style.zIndex = this.pageStack.length;
				calendar_container.style.display = 'block';
			}

			this.pageStack.push(module);
			setTimeout(function(){
				module.iframe.setAttribute("class","shown");
			},1);

		}else{

			// If so, pop everything on top & hide them.
			var popped = this.pageStack.splice(idIndex+1);
			popped.reverse();
			for(var i=0;i<popped.length;i++){
				(function(iframe,delay){
					setTimeout( function(){iframe.setAttribute("class","");}, delay );
				})(popped[i].iframe,i*200);
			}

		}

		// HACK: Navigation is right above the FIRST one.
		if(this.pageStack.length==1){
			setTimeout(function(){
				calendar_container.style.display = 'none';
			},500);
		}

		setTimeout(function(){
			Playwright.currentModule.iframe.focus();
		},100);

	},

	addComponent: function(dom){
		document.getElementById("playwright").appendChild(dom);
	}

};


////////////////
// HELPERS
var _addTab = function(tabConfig){
	var id = tabConfig.id;
	Calendar.tabs[id] = tabConfig;
	var dom = document.getElementById("nav_"+tabConfig.id);
	tabConfig.dom = dom;
};


////////////////
// SINGLETON
exports.Calendar = Calendar;
Calendar.initialize();


})(window);