var enemyBase = function(x,y,graphic,frame){
	gameEntity.call(this,x,y,graphic,frame);
	this.stats.setStat("Close quarters combat",100);
	this.isHostile = true;
	this.prevDirection = new point(x,y);
}
inheritsFrom(gameEntity,enemyBase);
enemyBase.prototype.distributeStats = function(statValue,skillValue){
	statValue = parseInt(statValue/statCountPower);
	skillValue = (skillValue * 1000)/skillCountPower;
	var statBlock = [];
	var skillBlock = [];
	var statDev = 0;
	var skillDev = 0;
	var percentVar = 100;
	for(var i = 0 ; i < statCountAll ; i++){
		percentVar = randomRange(80,120);
		statBlock.push(statValue * (percentVar/100));
		statDev += statBlock[i] - statValue;
	}
	for(var i = 0 ; i < skillCountAll ; i++){
		percentVar = randomRange(90,110);
		skillBlock.push(skillValue * (percentVar/100));
		skillDev += skillBlock[i] - skillValue;
	}
	statDev /= statCountAll;
	skillDev /= skillCountAll;
	for(var i = 0 ; i < statCountAll ; i++){
		statBlock[i] -= statDev;
		statBlock[i] = parseInt(statBlock[i]);
	}
	for(var i = 0 ; i < skillCountAll ; i++){
		skillBlock[i] += skillDev;
		skillBlock[i] = getStatByXPValue(skillBlock[i]);
	}
	for(var i = 0 ; i < statCountAll ; i++){
		
	}
}
enemyBase.prototype.performAction = function(){
	if(this.tick < -20){
		console.log(this.tick);
	}
	var tempMove = new point(0,0);
	if(this.point.x > gController.game.entityArray[0].point.x){tempMove.x = -1}
	if(this.point.x < gController.game.entityArray[0].point.x){tempMove.x = 1}
	if(this.point.y > gController.game.entityArray[0].point.y){tempMove.y = -1}
	if(this.point.y < gController.game.entityArray[0].point.y){tempMove.y = 1}
	var target = this.sendEvent(this.point.offset(tempMove.x,tempMove.y),"move");
	if(!target){
		this.movePosition(tempMove.x,tempMove.y);
	}else{
		if(target instanceof terrain){
			var dist = Infinity;
			var test;
			for(var i = 0 ; i < 8 ; i++){
				tempMove.rotate(true);
				if(!target && !this.prevDirection.compare(this.point.offset(tempMove.x,tempMove.y))){
					test = this.point.offset(tempMove.x,tempMove.y);
					if(test.distance(gController.game.entityArray[0].point.x,gController.game.entityArray[0].point.y) < dist)
						dist = test.distance(gController.game.entityArray[0].point.x,gController.game.entityArray[0].point.y);
				}
			}
			tempMove.rotate(true);
			for(var i = 0 ; i < 8 ; i++){
				tempMove.rotate(true);
				if(!target && !this.prevDirection.compare(this.point.offset(tempMove.x,tempMove.y))){
					test = this.point.offset(tempMove.x,tempMove.y);
					if(test.distance(gController.game.entityArray[0].point.x,gController.game.entityArray[0].point.y) == dist){
						this.prevDirection = this.point;
						this.movePosition(tempMove.x,tempMove.y);
					}
				}
			}		
			this.deferTurn();
		}else if(target instanceof mainChar){this.attackMelee(gController.game.entityArray[0]);}
		else{this.deferTurn();}
	}
}