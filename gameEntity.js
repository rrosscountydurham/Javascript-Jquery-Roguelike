var gameEntity = function(x,y,graphic,frame){
	this.point = new point(x,y);
	this.stats = new stats();
	this.equipped = new paperdoll();
	this.visible = true;
	this.tick = 1000;
	this.graphic = graphic;
	this.frame = frame;
	this.sprite = new PIXI.Sprite(gController.getImage(graphic,frame));
	this.sprite.anchor = new PIXI.Point(0.5,0.5);
	this.setPosition(x,y);
	this.sightRadius = 10;
	gController.addItem(this.sprite);
}
gameEntity.prototype.changeFrame = function(frame){
	gController.removeItem(this.sprite);
	this.sprite.texture = gController.getImage(this.graphic,frame);
	gController.addItem(this.sprite);
}
gameEntity.prototype.setPosition = function(x,y){
	this.point.set(x,y);
	this.sprite.x = (x  * gSettings.getSetting("tilesize")) + (gSettings.getSetting("canvaswidth") / 2);
	this.sprite.y = (y  * gSettings.getSetting("tilesize")) + (gSettings.getSetting("canvasheight") / 2);
}
gameEntity.prototype.movePosition = function(x,y){
	gController.game.setOccupied(this.point,this.point.offset(x,y));
	this.point.move(x,y);
	this.sprite.x = (this.point.x  * gSettings.getSetting("tilesize")) + (gSettings.getSetting("canvaswidth") / 2);
	this.sprite.y = (this.point.y  * gSettings.getSetting("tilesize")) + (gSettings.getSetting("canvasheight") / 2);
	this.tick += (Math.abs(x) + Math.abs(y)) * gController.game.gameEvents.getEventTime("move",this.stats);
}
gameEntity.prototype.attackMelee = function(target){
	var toHit = parseInt(gController.game.gameEvents.getEventPower("melee",this.stats,target.stats));
	var damage = parseInt(gController.game.gameEvents.getEventPower("basichit",this.stats,target.stats));
	var critical = gController.game.gameEvents.getEventPower("basichit",this.stats,target.stats);
	if(toHit <= 0){
		damage = 0;
		console.log("Missed");
	}
	if(toHit > 0 && toHit < 25){
		damage /= 2;
		console.log("Deflected hit");
	}
	if(toHit >= 25 && toHit < 50){
		console.log("Normal hit");
	}
	if(toHit >= 50 && toHit < 75){
		damage *= 1.5;
		console.log("Good hit");
	}
	if(toHit >= 75 && toHit < 100){
		damage *= 2;
		console.log("Great hit");
	}
	if(toHit >= 100 && toHit < 150){
		damage *= 2.5;
		console.log("Supberb hit");
	}
	if(critical >= randomRange(0,10000)){
		console.log("Critical!");
	}
	damage = parseInt(damage);
	console.log(damage);
	if(damage < 0)
		damage = 0;
	target.stats.adjustStat("CurrentHealth",-damage);
	target.checkDeath();
	this.tick += gController.game.gameEvents.getEventTime("melee",this.stats);
}
gameEntity.prototype.checkDeath = function(){
	if(this.stats.getStat("CurrentHealth") <= 0){
		gController.game.removeEntity(this);
	}
}
gameEntity.prototype.getHealthRatio = function(){
	return this.stats.getStat("CurrentHealth") / this.stats.getStat("Health");
}
gameEntity.prototype.deferTurn = function(){
	this.tick += 1000;
}
gameEntity.prototype.entityTick = function(){
	this.tick -= this.stats.getStat("Speed");
	if(this.tick < 0){
		this.performAction();
	}
}
gameEntity.prototype.performAction = function(){
}
gameEntity.prototype.sendEvent = function(target,type){
	return gController.game.handleEvent(this,target,type);
}