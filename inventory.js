inventory = function(){
	this.itemList = [];
	this.itemList.fill(0,0,1000);
	this.lastItem = -1;
	this.spriteList = [];
	this.offsetX = 0;
	this.offsetY = 0;
}
inventory.prototype.addItem = function(item,target){
	if(target >= 0){
		this.itemList[target] = item;
		if(this.lastItem < target)
			this.lastItem = target;
	}
	else{
		var count = -1;
		while(true){
			count++;
			if(count > this.itemList.length - 1)
				break;
			if(this.itemList[count] == 0)
				break;
		}
		if(count <= this.itemList.length){
			this.itemList[count] = item;
			if(this.lastItem < count)
				this.lastItem = count;
		}
		else
			return "Inventory Full";
	}
}
inventory.prototype.removeItem = function(target){
	this.itemList.splice(target,1);
	this.lastItem--;
}
inventory.prototype.swapItem = function(target){
	var localObject = this;
	var prevX = this.spriteList[target.data.slot].x;
	var prevY = this.spriteList[target.data.slot].y;
	gController.removeUI(this.spriteList[target.data.slot]);
	
	var tempItem = this.itemList[target.data.slot];
	this.itemList[target.data.slot] = gController.game.cursorItem;
	gController.game.cursorItem = tempItem;
	if(this.itemList[target.data.slot] == 0){
		tempSprite = new PIXI.Sprite(gController.getImage("items.png",0));
		tempSprite.interactive = true;
		tempSprite.hitArea = new PIXI.Rectangle(-tempSprite.width/2,-tempSprite.height/2,tempSprite.width,tempSprite.height);
		tempSprite.anchor = new PIXI.Point(0.5,0.5);
	}
	else{
		tempSprite = this.itemList[target.data.slot].sprite;
	}
	tempSprite.x = prevX;
	tempSprite.y = prevY;
	tempSprite.data = {slot: target.data.slot};
	tempSprite.mousedown = function(mouseData){
		localObject.swapItem(this);
	}
	gController.addUI(tempSprite);
	this.spriteList.splice(target.data.slot,1,tempSprite);
	if(this.lastItem < target.data.slot)
		this.lastItem = target.data.slot;
	gController.game.setCursorItem();
}
inventory.prototype.showItems = function(x,y,width,height){
	this.spriteList = [];
	this.offsetX = x;
	this.offsetY = y;
	var localObject = this;
	var tempSprite = new PIXI.Sprite(gController.getImage("items.png",0));
	width -= width % tempSprite.width;
	height -= height % tempSprite.height;
	var posX = 0;
	var posY = 0;
	var maxX = width / tempSprite.width;
	var maxY = height / tempSprite.height;
	var itemSlot = 0;
	
	while(posY <= maxY){
		if(this.itemList[itemSlot] == 0){
			tempSprite = new PIXI.Sprite(gController.getImage("items.png",0));
			tempSprite.interactive = true;
			tempSprite.hitArea = new PIXI.Rectangle(-tempSprite.width/2,-tempSprite.height/2,tempSprite.width,tempSprite.height);
			tempSprite.anchor = new PIXI.Point(0.5,0.5);
		}
		else{
			tempSprite = this.itemList[itemSlot].sprite;
		}
		tempSprite.x = x + (posX * tempSprite.width) + (tempSprite.width);
		tempSprite.y = y + (posY * tempSprite.height) + (tempSprite.height);
		tempSprite.data = {slot: itemSlot};
		tempSprite.mousedown = function(mouseData){
			localObject.swapItem(this);
		}
		gController.addUI(tempSprite);
		this.spriteList.push(tempSprite);
		itemSlot++;
		posX++;
		if(posX > maxX){
			posX = 0; posY++;
		}
	}
}