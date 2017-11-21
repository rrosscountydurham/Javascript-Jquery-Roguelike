var item = function(graphic,frame){
	var localObject = this;
	this.graphic = graphic;
	this.frame = frame;
	this.sprite = new PIXI.Sprite(gController.getImage(graphic,frame));
	this.sprite.interactive = true;
	this.sprite.hitArea = new PIXI.Rectangle(-this.sprite.width/2,-this.sprite.height/2,this.sprite.width,this.sprite.height);
	this.sprite.anchor = new PIXI.Point(0.5,0.5);
	this.sprite.mouseover = function(mouseData){
		gController.game.setHoverItem(localObject);
	}
	this.sprite.mouseout = function(mouseData){
		gController.game.setHoverItem(0);
	}
}
item.prototype.refreshSprite = function(frame){
	
}