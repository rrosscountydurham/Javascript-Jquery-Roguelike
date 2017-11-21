var gameController = function(){
	var localObject = this;
	this.initialising = true;
	this.gameMenus = new gameMenus();
	this.gameEvents = new events();
	this.entityArray = []; this.terrainArray = []; this.worldArray = []; this.universeArray = []; this.worldPositionsArray = []; this.entityDefinitionArray;
	this.passableArray = [];
	this.currWorld = 0;
	this.terrainGenerator = new terrainGenerator();
	this.suspendActions = false;
	this.cameraX = 0; this.cameraY = 0;
	this.mapSizeX = 100; this.mapSizeY = 100;
	this.cameraXLimit = parseInt(gSettings.getSetting("canvaswidth")/(2 * gSettings.getSetting("tilesize")));
	this.cameraYLimit = parseInt(gSettings.getSetting("canvasheight")/(2 * gSettings.getSetting("tilesize")));
	this.hoverItem = 0; this.cursorItem = 0;
	this.cursorSprite = new PIXI.Sprite(gController.getImage("items.png",0));
	this.cursorSprite.anchor.x = 0.5; this.cursorSprite.anchor.y = 0.5;
	this.cursorSprite.visible = false;
	this.cursorSprite.x = 100; this.cursorSprite.y = 100;
	this.uiElements = [];
	this.keyboardInput = new Array(222);
	this.keyboardInput.fill(0,0,this.keyboardInput.length-1);
	$.each(KEYBOARD,function(index,value){
		localObject.keyboardInput[value] = new keyboard(value);
	});
	this.setKeys();
}
gameController.prototype.load = function(){
	this.genWorld();
	this.loadMap(0,0);
	this.entityArray[0].checkVisible();
	this.drawUI();
	this.drawScene();
	this.initialising = false;
}
gameController.prototype.setCursorPos = function(){
	this.cursorSprite.x = gController.renderer.plugins.interaction.mouse.global.x;
	this.cursorSprite.y = gController.renderer.plugins.interaction.mouse.global.y;
}
gameController.prototype.setHoverItem = function(item){
	this.hoverItem = item;
}
gameController.prototype.setCursorItem = function(){
	gController.removeUI(this.cursorSprite);
	if(this.cursorItem == 0){
		this.cursorSprite.visible = false;
		$("#main").css('cursor','auto');
	}else{
		this.cursorSprite.visible = true;
		this.cursorSprite.texture = gController.getImage("items.png",this.cursorItem.frame);
		$("#main").css('cursor','none');
	}
	gController.addUI(this.cursorSprite);
}
gameController.prototype.setKeys = function(){
	var localObject = this;
	$(document).on("keydown",function(e){
		localObject.keyboardInput[event.which].press();
		e.preventDefault();
	});
	$(document).on("keyup",function(e){
		localObject.keyboardInput[event.which].release();
		e.preventDefault();
	});
	if(!this.suspendActions){
		this.keyboardInput[KEYBOARD.LEFT].press = function(){
			localObject.entityArray[0].moveChar(KEYBOARD.LEFT);
		}
		this.keyboardInput[KEYBOARD.RIGHT].press = function(){
			localObject.entityArray[0].moveChar(KEYBOARD.RIGHT);
		}
		this.keyboardInput[KEYBOARD.UP].press = function(){
			localObject.entityArray[0].moveChar(KEYBOARD.UP);
		}
		this.keyboardInput[KEYBOARD.DOWN].press = function(){
			localObject.entityArray[0].moveChar(KEYBOARD.DOWN);
		}
		this.keyboardInput[KEYBOARD.SPACE].press = function(){
			localObject.entityArray[0].skipTurn();
		}
		this.keyboardInput[KEYBOARD.COMMA].press = function(){
			localObject.entityArray[0].transitionMap(KEYBOARD.COMMA);
		}
		this.keyboardInput[KEYBOARD.ONE].press = function(){
			localObject.loadMap(0,0);
		}
		this.keyboardInput[KEYBOARD.TWO].press = function(){
			localObject.loadMap(1,0);
		}
	}else{
		$(document).off("keydown");
		$(document).off("keyup");
	}
}
gameController.prototype.setCamera = function(point){
	this.cameraX = point.x;
	this.cameraY = point.y;
	if(this.cameraX < this.cameraXLimit)
		this.cameraX = this.cameraXLimit;
	if(this.cameraY < this.cameraYLimit)
		this.cameraY = this.cameraYLimit;
	if(this.cameraX > this.mapSizeX - this.cameraXLimit)
		this.cameraX = this.mapSizeX - this.cameraXLimit;
	if(this.cameraY > this.mapSizeY - this.cameraYLimit)
		this.cameraY = this.mapSizeY - this.cameraYLimit;
}
gameController.prototype.initOccupied = function(){
}
gameController.prototype.setOccupied = function(prevPoint,point){
	this.terrainArray[prevPoint.x][prevPoint.y].occupied = false;
	this.terrainArray[point.x][point.y].occupied = true;
}
gameController.prototype.addEntity = function(entity){
	this.entityArray.push(entity);
}
gameController.prototype.removeEntity = function(entity){
	for(var i = 0 ; i < this.entityArray.length ; i++){
		if(this.entityArray[i] == entity){
			gController.removeItem(this.entityArray[i].sprite);
			this.entityArray.splice(i,1);
		}
	}
}
gameController.prototype.reloadScene = function(keys){
	gController.blankBackground();
	for(var i = 0 ; i < this.terrainArray.length ; i++){
		for(var j = 0 ; j < this.terrainArray[i].length ; j++){
			this.terrainArray[i][j].occupied = false;
			if(this.terrainArray[i][j].passable)
				this.passableArray.push({x: i, y: j});
			gController.addSpriteBatch(this.terrainArray[i][j].sprite);
			if(this.terrainArray[i][j].found)
				this.terrainArray[i][j].sprite.alpha = 0.5;
			if(this.terrainArray[i][j].visible)
				this.terrainArray[i][j].sprite.alpha = 1;
		}
	}
	for(var i = 0 ; i < this.entityArray.length ; i++){
		gController.addItem(this.entityArray[i].sprite);
		this.terrainArray[this.entityArray[i].point.x][this.entityArray[i].point.y].occupied = true;
	}
	if(keys){
		this.suspendActions = false;
		this.setKeys();
	}
	this.drawUI();
	this.drawScene();
}
gameController.prototype.genWorld = function(){
	this.worldArray = [];
	this.worldPositionsArray = new transitionIndex();
	this.worldArray.push({generated: false, terrain: 0, entities: [], type: "Overworld",frames: "Overworld", minEntityCount: 0, maxEntityCount: 0, level: 0});
	
	var mapAmount = randomRange(100,200);
	for(var i = 0 ; i < mapAmount ; i++){
		this.worldArray.push({generated: false, terrain: 0, entities: [], type: "Ground level", frames: "Dungeon", minEntityCount: 100, maxEntityCount: 200, level: 1});
		this.worldPositionsArray.addIndex(0,this.worldArray.length - 1,0,true);
	}

	var GroundMapAmount = mapAmount;
	mapAmount = randomRange(500,1000);
	var claimedMaps = [];
	var mapIndex = -1;
	var sanityCheck = 0;
	var stairCount = 0;
	claimedMaps.fill(false,0,GroundMapAmount);
	for(var i = 0 ; i < mapAmount ; i++){
		while(true){
			mapIndex = randomRange(1,this.worldArray.length-1);
			if(!claimedMaps[mapIndex]){
				claimedMaps[mapIndex] = true;
				this.worldArray.push({generated: false, terrain: 0, entities: [], type: "Basement", frames: "", minEntityCount: 100, maxEntityCount: 200, level: this.worldArray[mapIndex].level + 1});
				claimedMaps.push(false);
				stairCount = randomRange(5,10);
				for(var j = 0 ; j < stairCount ; j++){
					this.worldPositionsArray.addIndex(mapIndex,this.worldArray.length -1,j,true);
				}
				break;
			}
			sanityCheck++;
			if(sanityCheck > 1000)
				break;
		}
		sanityCheck = 0;
	}
	var BasementMapAmount = mapAmount;
	mapAmount = randomRange(50,100);
	for(var i = 0 ; i < mapAmount ; i++){
		while(true){
			sanityCheck++;
			if(sanityCheck > 1000)
				break;
		}
		sanityCheck = 0;
	}
	this.entityDefinitionArray = new entityDefinition();
	this.entityDefinitionArray.addNewDefinition(10);
	this.universeArray.push({level: 10, world: this.worldArray, worldPos: this.worldPositionsArray, entityDef: this.entityDefintionArray});
}
gameController.prototype.genTerrain = function(index){
	var tempTerrain = [];
	var terrainSize = 8;
	
	if(this.worldArray[index].type != MAPTYPE[0])
		this.terrainGenerator.genTerrain(tempTerrain,index,randomRange(20,150),randomRange(20,150),this.worldPositionsArray,this.worldArray[index].type,this.worldArray[index].frames);
	else
		this.terrainGenerator.genTerrain(tempTerrain,index,Math.pow(2,terrainSize) + 3,Math.pow(2,terrainSize) + 3,this.worldPositionsArray,this.worldArray[index].type,this.worldArray[index].frames);
	this.positionTerrain(tempTerrain);
	this.worldArray[index].terrain = tempTerrain;
	this.terrainArray = this.worldArray[index].terrain;
	this.passableArray = [];
	for(var i = 0 ; i < this.terrainArray.length ; i++){
		for(var j = 0 ; j < this.terrainArray[i].length ; j++){
			this.worldArray[index].terrain[i][j].occupied = false;
			if(this.worldArray[index].terrain[i][j].passable)
				this.passableArray.push({x: i, y: j});
		}
	}
	this.genEntities(index);
	//this.worldArray[index].entities = [];
	this.worldArray[index].generated = true;
}
gameController.prototype.genEntities = function(index){
	var tempEntityArray = [];
	var tempPos;
	var amount = randomRange(this.worldArray[index].minEntityCount,this.worldArray[index].maxEntityCount);
	tempEntityArray.push(0);
	var minLevel = (1 + (this.worldArray[index].level / 10)) * this.universeArray[this.currWorld].level * 0.75;
	var maxLevel = (1 + (this.worldArray[index].level/10)) * this.universeArray[this.currWorld].level * 1.25;
	var monsterList = this.entityDefinitionArray.getEntityDefinition(minLevel,maxLevel);
	var currMon = randomRange(0,monsterList.length-1);
	//DEBUG DEBUG DEBUG
	for(var i = 0 ; i < amount ; i++){
		tempPos = this.placeInWorld();
		tempEntityArray.push(new enemyBase(0,0,"entities.png",0));
		tempEntityArray[i+1].stats = monsterList[currMon].stats;
		tempEntityArray[i+1].changeFrame(monsterList[currMon].frame);
		tempEntityArray[i+1].setPosition(tempPos.x,tempPos.y);
		this.terrainArray[tempPos.x][tempPos.y].occupied = true;
		//console.log("Entity placed");
	}
	//DEBUG DEBUG DEBUG
	this.worldArray[index].entities = tempEntityArray;
}
gameController.prototype.loadMap = function(index,position){
	var landingCell;
	if(index < this.worldArray.length){
		if(!this.worldArray[index].generated)
			this.genTerrain(index);
		else{
			this.terrainArray = this.worldArray[index].terrain;
			this.passableArray = [];
			for(var i = 0 ; i < this.terrainArray.length ; i++){
				for(var j = 0 ; j < this.terrainArray[i].length ; j++){
					this.worldArray[index].terrain[i][j].occupied = false;
					if(this.worldArray[index].terrain[i][j].passable)
						this.passableArray.push({x: i, y: j});
				}
			}
		}
		this.mapSizeX = this.terrainArray.length;
		this.mapSizeY = this.terrainArray[0].length;
			
		if(!this.initialising){
			var tempChar = this.entityArray[0];
			this.entityArray = this.worldArray[index].entities;
			
			this.entityArray[0] = tempChar;
			landingCell = this.worldPositionsArray.getPosition(index,position);
			if(landingCell){
				this.entityArray[0].initPosition(landingCell.x,landingCell.y);
				this.entityArray[0].checkVisible();
			}
			this.reloadScene(false);				
		}else{
			this.entityArray = this.worldArray[index].entities;
			var tempPoint = this.placeInWorld();
			this.entityArray[0] = new mainChar(tempPoint.x,tempPoint.y,"entities.png",3);
			for(var i = 0 ; i < this.entityArray.length ; i++){
				this.terrainArray[this.entityArray[i].point.x][this.entityArray[i].point.y].occupied = true;
			}
		}
	}
}
gameController.prototype.placeInWorld = function(){
	return this.passableArray.getRandomElement();
}
gameController.prototype.positionTerrain = function(terrainIn){
	for(var i = 0 ; i < terrainIn.length ; i++){
		for(var j = 0 ; j < terrainIn[i].length ; j++){
			terrainIn[i][j].renderTerrain();
			terrainIn[i][j].setPosition(i,j);
		}
	}
}
gameController.prototype.refreshTerrain = function(){
	for(var i = 0 ; i < this.terrainArray.length ; i++){
		for(var j = 0 ; j < this.terrainArray[i].length ; j++){
			if(this.terrainArray[i][j].found)
				this.terrainArray[i][j].sprite.alpha = 0.5;
			if(this.terrainArray[i][j].visible)
				this.terrainArray[i][j].sprite.alpha = 1;
			/*DEBUG DEBUG DEBUG*/
			this.terrainArray[i][j].sprite.alpha = 1;
			/*DEBUG DEBUG DEBUG*/
		}
	}
	for(var i = 0 ; i < this.entityArray.length ; i++){
		if(this.entityArray[i].visible)
			this.entityArray[i].sprite.alpha = 1;
		else
			this.entityArray[i].sprite.alpha = 0;
	}
}
gameController.prototype.blankTerrain = function(){
	for(var i = 0 ; i < this.terrainArray.length ; i++){
		for(var j = 0 ; j < this.terrainArray[i].length ; j++){
			this.terrainArray[i][j].visible = false;
		}
	}
	for(var i = 1 ; i < this.entityArray.length ; i++){
		this.entityArray[i].visible = false;
	}
}
gameController.prototype.isPassable = function(point){
	if(point.x >= 0 && point.x < this.mapSizeX && point.y >= 0 && point.y < this.mapSizeY){
		return this.terrainArray[point.x][point.y].passable;
	}else{
		return false;
	}
}
gameController.prototype.checkBoundary = function(point){
	if(point.x < 0 || point.x > this.mapSizeX - 1 || point.y < 0 || point.y > this.mapSizeY - 1)
		return false;
	else
		return true;
}
gameController.prototype.drawScene = function(){
	this.drawEnvironment();
}
gameController.prototype.drawEnvironment = function(){
	var localObject = this;
	this.refreshTerrain();
	gController.container.position = new PIXI.Point(-this.cameraX * gSettings.getSetting("tilesize"),-this.cameraY * gSettings.getSetting("tilesize"));
}
gameController.prototype.drawUI = function(){
	var localObject = this;
	var tempButton = new button(
			100,gSettings.getSetting("canvasheight") - (gSettings.getSetting("canvasheight")/20),
			gSettings.getSetting("canvaswidth")/10,gSettings.getSetting("canvasheight")/15,
			0x555555,
			12,
			"Equipment",
			{local: localObject, menu: "Equipment"}
	);
	tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
		this.data.local.gameMenus.showMenu(this.data.menu);
		gController.addUI(this.data.local.cursorSprite);
		this.data.local.suspendActions = true;
		this.data.local.setKeys();
	}
	tempButton.display();
	var tempBar = new statusBar(
		100,100,
		gSettings.getSetting("canvaswidth")/10,gSettings.getSetting("canvasheight")/15,
		0xff0000,
		12,
		"100/100",
		{}
	);
	tempBar.update = function(){
		this.setWidth(localObject.entityArray[0].getHealthRatio());
		this.setText(localObject.entityArray[0].stats.getStat("CurrentHealth") + '/' + localObject.entityArray[0].stats.getStat("Health"));
	}
	tempBar.update();
	tempBar.display();
	this.uiElements.push({name: "HealthBar", element: tempBar});
}
gameController.prototype.updateUI = function(){
	for(var i = 0 ; i < this.uiElements.length ; i++){
		this.uiElements[i].element.update();
	}
}
gameController.prototype.handleEvent = function(actor,target,type){
	if(type == "move"){
		if(target.x < 0 || target.x > this.mapSizeX - 1 || target.y < 0 || target.y > this.mapSizeY - 1)
			return "Out of bounds";
		var len = this.entityArray.length;
		for(var i = 0 ; i < len ; i++){
			if(this.entityArray[i].point.compare(target) && this.entityArray[i] != actor){
				return this.entityArray[i];
			}
		}
		if(!this.terrainArray[target.x][target.y].passable){
			return this.terrainArray[target.x][target.y];
		}
		return false;
	}
}
gameController.prototype.loopingActors = function(){
	var isLooping = true;
	while(isLooping){
		for(var i = 0 ;i < this.entityArray.length ; i++){
			this.entityArray[i].entityTick();
		}
		if(this.entityArray.length == 0){
			isLooping = false; continue;
		}
		if(this.entityArray[0].isTurn){
			isLooping = false;
			this.entityArray[0].switchTurn();
		}
	}
	if(this.entityArray.length > 0)
		this.drawScene();
	this.updateUI();
}
gameController.prototype.endGame = function(){
	this.entityArray = []; this.terrainArray = [];
	this.suspendActions = true;
	this.setKeys();
	gController.blankBackground();
	gController.menuSelect("Main Menu");
}
function mainGameFunc(){
	gController.game = new gameController;
	gController.game.load();
	gLoop();
}
function gLoop(){
	gController.game.setCursorPos();
	gController.render();
	requestAnimationFrame(gLoop);
}