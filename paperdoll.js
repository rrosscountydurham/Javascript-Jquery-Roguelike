xmlPaperdoll = getXML("paperdoll.xml");

var paperdoll = function(){
	this.itemList = [];
	this.spriteList = [];
	localObject = this;
	xmlPaperdoll.find("paperdoll").find("slot").each(function(index){
		localObject.itemList.push({name: $(this).find("name").html(), item: 0});
	});
}
paperdoll.prototype.getItem = function(slot){
	for(var i = 0 ; i < this.itemList.length ; i++){
		if(this.itemList[i].name == slot)
			return this.itemList[i];
	}
	return false;
}
paperdoll.prototype.getItemIndex = function(slot){
	for(var i = 0 ; i < this.itemList.length ; i++){
		if(this.itemList[i].name == slot)
			return i;
	}
	return false;
}
paperdoll.prototype.setItem = function(target){
	if(gController.game.cursorItem instanceof equippable || gController.game.cursorItem == 0){
		if(this.getItemIndex(gController.game.cursorItem.slot) == target.data.slot || gController.game.cursorItem == 0){
			var localObject = this;
			var cwidth = parseInt(gSettings.getSetting("canvaswidth"));
			var cheight = parseInt(gSettings.getSetting("canvasheight"));
			var prevX = this.spriteList[target.data.slot].x;
			var prevY = this.spriteList[target.data.slot].y;
			var tempSprite = new PIXI.Sprite(gController.getImage("empty.png"));
			gController.removeUI(this.spriteList[target.data.slot]);

			var tempItem = this.itemList[target.data.slot].item;
			if(tempItem != 0){
				tempItem.sprite.height = tempSprite.height;
				tempItem.sprite.width = tempSprite.width;
			}
			this.itemList[target.data.slot].item = gController.game.cursorItem;
			gController.game.cursorItem = tempItem;
			if(this.itemList[target.data.slot] == 0){
				
				tempSprite.interactive = true;
				tempSprite.hitArea = new PIXI.Rectangle(-tempSprite.width/2,-tempSprite.height/2,tempSprite.width,tempSprite.height);
				tempSprite.anchor = new PIXI.Point(0.5,0.5);
			}
			else{
				tempSprite = this.itemList[target.data.slot].item.sprite;
			}
			tempSprite.height = parseInt(cheight / 100 * DOLLSLOTS[0].scale);
			tempSprite.width = parseInt(cheight / 100 * DOLLSLOTS[0].scale);
			tempSprite.x = prevX;
			tempSprite.y = prevY;
			tempSprite.data = {slot: target.data.slot};
			tempSprite.mousedown = function(mouseData){
				localObject.setItem(this);
			}
			gController.addUI(tempSprite);
			this.spriteList.splice(target.data.slot,1,tempSprite);
			gController.game.setCursorItem();
		}
	}
}
paperdoll.prototype.showItems = function(x,y){
	var localObject = this;
	var cwidth = parseInt(gSettings.getSetting("canvaswidth"));
	var cheight = parseInt(gSettings.getSetting("canvasheight"));
	var tempSprite = new PIXI.Sprite(gController.getImage("empty.png"));

	for(var i = 1 ; i < DOLLSLOTS.length ; i++){
		if(this.itemList[i-1].item == 0){
			tempSprite = new PIXI.Sprite(gController.getImage("empty.png"));
			tempSprite.anchor = new PIXI.Point(0.5,0.5);
			tempSprite.hitArea = new PIXI.Rectangle(-tempSprite.width/2,-tempSprite.height/2,tempSprite.width,tempSprite.height);
		}
		else
			tempSprite = this.itemList[i-1].item.sprite;
		tempSprite.height = parseInt(cheight / 100 * DOLLSLOTS[0].scale);
		tempSprite.width = parseInt(cheight / 100 * DOLLSLOTS[0].scale);
		tempSprite.x = x + parseInt(cwidth / 100 * DOLLSLOTS[i].posx);
		tempSprite.y = y + parseInt(cheight / 100 * DOLLSLOTS[i].posy);
		tempSprite.interactive = true;
		tempSprite.data = {slot: i-1};
		tempSprite.mousedown = function(mouseData){
			localObject.setItem(this);
		}
		this.spriteList.push(tempSprite);
		gController.addUI(tempSprite);
	}
}