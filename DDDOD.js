function include(destination) {
var head = document.getElementsByTagName('head')[0]
var script = document.createElement('script');
script.src = destination;
script.async = false;
head.appendChild(script);
}
INCLUDES = [
"widgets.js",
"framesObj.js",
"enums.js",
"stats.js",
"item.js",
"menuCreate.js",
"mainGame.js",
"gameEntity.js",
"mainChar.js",
"terrain.js",
"enemy.js",
"paperdoll.js",
"equippable.js",
"menuItems.js",
"inventory.js",
"events.js",
"terrainGen.js",
"transitionIndex.js",
"entityDefinition.js",

]
debug = false;

if(!debug){
	$(window).load(function(){
		var inc = $.map(INCLUDES,function(src){
			return $.getScript(src);
		});
		
		inc.push($.Deferred(function(deferred){
				$(deferred.resolve);
		}));
		
		$.when.apply($,inc).done(function(){
			gSettings = new settings();
			gController = new controller();
			gController.menuSelect("Main Menu");	
		});
	});
}else{	
	for(var i = 0 ; i < INCLUDES.length ; i++){
		include(INCLUDES[i]);
	}
	$(window).load(function(){
		setTimeout(function(){
		gSettings = new settings();
		gController = new controller();
		gController.menuSelect("Main Menu");
		},500);
	});
}

var settings = function(){
	this.xmlSettings = getXML("settings.xml");
	this.xmlStates = getXML("states.xml");
	this.xmlMainMenu = getXML("mainmenu.xml");
}
settings.prototype.getSetting = function(select){
	return this.xmlSettings.find(select).text();
}
settings.prototype.getStateIndex = function(select){
	var idSelect = null;
	this.xmlStates.find("state").each(function(index){
		if($(this).find("name").text() == select)
			idSelect = index;
	});
	if(idSelect != null)
		return idSelect;
	else
		console.log("State not found");
}

var controller = function(){
	this.state = gSettings.getStateIndex("Main Menu");
	this.menuXML = gSettings.xmlMainMenu;
	this.menu;
	this.pChar = new stats();
	this.allItems = new PIXI.Container();
	this.background = new PIXI.Container();
	this.container = new PIXI.Container();
	this.ui = new PIXI.Container();
	this.spriteBatch = new PIXI.ParticleContainer(300000,{},300000);
	this.spriteBatch.setProperties({alpha: "true", interactiveChildren: "true", interactive: "true"});
	this.addItem(this.spriteBatch);
	//this.addItem(this.spriteBatch2);
	this.allItems.addChild(this.background);
	this.allItems.addChild(this.container);
	this.allItems.addChild(this.ui);
	this.renderer = PIXI.autoDetectRenderer(
		gSettings.getSetting("canvaswidth"),
		gSettings.getSetting("canvasheight"));
	$("#main").append(this.renderer.view);
	this.images = [];
	this.loadImages();
}
controller.prototype.loadImages = function(){
	var localObject = this;
	var graphicsXML = getXML("graphics.xml");
	$.ajax({
	  url: 'graphics',
	  success: function(data){
		 $(data).find("a:contains(.png)").each(function(){ 
			if(graphicsXML.find('graphic[name="' + $(this).text() + '"]').length <= 0){
				localObject.images.push({
					name: $(this).text(), 
					type: "sprite", 
					texture: new PIXI.Texture.fromImage('graphics/' + $(this).text())
				});
			}
			else{
				localObject.images.push({
					name: $(this).text(), 
					type: "sheet", 
					texture: new PIXI.Texture.fromImage('graphics/' + $(this).text()), 
					size: parseInt(graphicsXML.find('graphic[name="' + $(this).text() + '"]').find("size").html())
				});
			}
		 });
	  }
	});
}
controller.prototype.addBackground = function(){
	for(var i = 0 ; i < arguments.length; i++){
		this.background.addChild(arguments[i]);
	}
}
controller.prototype.addItem = function(){
	for(var i = 0 ; i < arguments.length ; i++){
		this.container.addChild(arguments[i]);
	}
}
controller.prototype.removeItem = function(){
	for(var i = 0 ; i < arguments.length ; i++){
		this.container.removeChild(arguments[i]);
	}
}
controller.prototype.addSpriteBatch = function(){
	for(var i = 0 ; i < arguments.length; i++){
		this.spriteBatch.addChild(arguments[i]);
	}
}
controller.prototype.removeSpriteBatch = function(){
	for(var i = 0 ; i < arguments.length ; i++){
		this.spriteBatch.removeChild(arguments[i]);
	}
}
controller.prototype.addUI = function(){
	for(var i = 0 ; i < arguments.length; i++){
		this.ui.addChild(arguments[i]);
	}
}
controller.prototype.removeUI = function(){
	for(var i = 0 ; i < arguments.length; i++){
		this.ui.removeChild(arguments[i]);
	}	
}
controller.prototype.getImage = function(filename,frame){
	for(var i = 0 ; i < this.images.length ; i++){
		if (this.images[i].name == filename && this.images[i].type == "sprite")
			return this.images[i].texture;
		else if(this.images[i].name == filename && this.images[i].type == "sheet"){
			var columns = Math.floor(this.images[i].texture.width / this.images[i].size);
			var tempTexture = new PIXI.Texture(
				this.images[i].texture,
				new PIXI.Rectangle(
					frame % columns * this.images[i].size,
					Math.floor(frame / columns) * this.images[i].size,
					this.images[i].size,33
				)
			);
			return tempTexture;
		}
	}
	return "Texture not found";
}
controller.prototype.render = function(){
	if(arguments.length == 0){
		this.renderer.render(this.allItems);
	}
	else{
		for(var i = 0 ; i < arguments.length ; i++){
			this.renderer.render(this.background.getChildAt(this.container.getChildIndex(arguments[i])));
			this.renderer.render(this.container.getChildAt(this.container.getChildIndex(arguments[i])));
			this.renderer.render(this.ui.getChildAt(this.container.getChildIndex(arguments[i])));
		}
	}
}
controller.prototype.blankBackground = function(){
	this.background.removeChildren();
	this.container.removeChildren();
	this.container.position = new PIXI.Point(0,0);
	this.spriteBatch.removeChildren();
	this.ui.removeChildren();
	this.addItem(this.spriteBatch);
}
controller.prototype.menuSelect = function(select){
	var localObject = this;
	var tempButton;
	this.blankBackground();
	var x = gSettings.getSetting("canvaswidth")/2;
	var y = gSettings.getSetting("canvasheight")/4;
	this.menuXML.find('item[name="' + select + '"]').children('item').each(function(index){
		tempButton = new button(
			x,y,
			gSettings.getSetting("canvaswidth")/6,gSettings.getSetting("canvasheight")/10,
			0x555555,
			12,
			$(this).attr("name"),
			{local: localObject, name: $(this).attr("name"), bottom: ($(this).children('item').length > 0) ? false : $(this).html()}
		);
		tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
			if(!this.data.bottom)
					this.data.local.menuSelect(this.data.name);
				else
					runFunction(this.data.bottom + "Func");
		}
		tempButton.display();
		y += gSettings.getSetting("canvasheight")/10 + gSettings.getSetting("canvasheight")/100;
	});
	if(localObject.menuXML.find('item[name="' + select + '"]').parents().length > 0){
		tempButton = new button(
				x,y,
				gSettings.getSetting("canvaswidth")/6,gSettings.getSetting("canvasheight")/10,
				0x555555,
				12,
				"Back",
				{local: localObject, name: "Back"}
			)
			tempButton.buttonObj.mousedown = tempButton.touchstart = function(data){
				this.data.local.menuSelect(data.local.menuXML.find('item[name="' + select + '"]').parent().attr("name"));
			}
			localObject.addItem(tempButton.buttonObj,tempButton.buttonText);
		}
	this.render();
}
controller.prototype.gameBegin = function(){
	this.blankBackground();
	this.menu = 0;
	mainGameFunc();
}