var gameMenus = function(){
	
}
gameMenus.prototype.showMenu = function(type){
	this.shownEquips = [];
	this.inventory;
	this.paperdoll;
	switch(type){
		case MENUITEMS.EQUIPMENT: this.showEquipment(); break;
	}
}
gameMenus.prototype.showEquipment = function(){
	var cwidth = parseInt(gSettings.getSetting("canvaswidth"));
	var cheight = parseInt(gSettings.getSetting("canvasheight"));
	var gameChar = gController.game.entityArray[0];

	gController.blankBackground();
	var background = new rectangle(cwidth/2,cheight/2,cwidth,cheight,0x5896CC);
	background = background.generateTexture();
	background = new PIXI.Sprite(background);
	gController.addBackground(background);
	this.paperdoll = gameChar.equipped;
	this.paperdoll.showItems(0,0);
	this.inventory = gameChar.charInv;
	this.inventory.showItems(cwidth/100 * 33,cheight/100 * 42,cwidth/100 * 62,cheight/100 * 45);
	var tempButton = new button(
			cwidth/100 * 20,cheight/100 * 90,
			gSettings.getSetting("canvaswidth")/6,gSettings.getSetting("canvasheight")/10,
			0x555555,
			12,
			"Back",
			{}
		);
		tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
			gController.game.reloadScene(true);
		}
		tempButton.display();
}