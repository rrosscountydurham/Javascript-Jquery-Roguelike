var terrain = function(graphic,frame){
	this.passable = true;
	this.found = false;
	this.visible = false;
	this.occupied = false;
	this.tileType = "Normal";
	this.graphic = graphic;
	this.sprite = new PIXI.Sprite(gController.getImage(graphic,frame));
	this.sprite.anchor = new PIXI.Point(0.5,0.5);
	this.sprite.alpha = 0;
	this.transitionInfo = {map: -1, target: -1};
};
terrain.prototype.setPosition = function(x,y){
	this.sprite.x = (x * gSettings.getSetting("tilesize")) + (gSettings.getSetting("canvaswidth") / 2);
	this.sprite.y = (y * gSettings.getSetting("tilesize")) + (gSettings.getSetting("canvasheight") / 2);
}
terrain.prototype.renderTerrain = function(){
	gController.addSpriteBatch(this.sprite);	
}
terrain.prototype.changeFrame = function(frame){
	gController.removeSpriteBatch(this.sprite);
	this.sprite.texture = gController.getImage(this.graphic,frame);
	gController.addSpriteBatch(this.sprite);
}
terrain.prototype.setMapIndex = function(map,target){
	this.transitionInfo = {map: map, target: target};
}
terrain.prototype.getMapIndex = function(){
	if(this.transitionInfo.map == -1)
		return false;
	else
		return this.transitionInfo;
}