var mainChar = function(x,y,graphic,frame){
	gameEntity.call(this,x,y,graphic,frame);
	this.stats.calcStats();
	this.isTurn = false;
	this.visible = true;
	gController.game.setCamera(this.point);
	this.charInv = new inventory();
	this.charInv.addItem(new equippable(0,"Helmet","items.png",1),-1);
	this.charInv.addItem(new equippable(0,"Helmet","items.png",2),-1);
	this.charInv.addItem(new equippable(0,"Helmet","items.png",3),-1);
	this.charInv.addItem(new equippable(0,"Helmet","items.png",4),-1);
}
inheritsFrom(gameEntity,mainChar);
mainChar.prototype.initPosition = function(x,y){
	this.setPosition(x,y);
	gController.game.setCamera(this.point);
	this.checkVisible();
}
mainChar.prototype.moveChar = function(input){
	var hasMoved = false;
	var target = false;
	switch(input){
		case KEYBOARD.LEFT:
			target = this.sendEvent(this.point.offset(-1,0),"move");
			if(!target){
				hasMoved = true;
				this.movePosition(-1,0);
			}else if(target instanceof enemyBase){
				hasMoved = true;
				this.attackMelee(target);
			}
			break;
		case KEYBOARD.RIGHT:
			target = this.sendEvent(this.point.offset(1,0),"move");
			if(!target){
				hasMoved = true;
				this.movePosition(1,0);
			}else if(target instanceof enemyBase){
				hasMoved = true;
				this.attackMelee(target);
			}
			break;
		case KEYBOARD.UP:
			target = this.sendEvent(this.point.offset(0,-1),"move");
			if(!target){
				hasMoved = true;
				this.movePosition(0,-1);
			}else if(target instanceof enemyBase){
				hasMoved = true;
				this.attackMelee(target);
			}
			break;
		case KEYBOARD.DOWN:
			target = this.sendEvent(this.point.offset(0,1),"move");
			if(!target){
				hasMoved = true;
				this.movePosition(0,1);
			}else if(target instanceof enemyBase){
				hasMoved = true;
				this.attackMelee(target);
			}
			break;
	}
	if(hasMoved){
		gController.game.setCamera(this.point);
		this.checkVisible();
		gController.game.loopingActors();
	}
}
mainChar.prototype.transitionMap = function(input){
	switch(input){
		case KEYBOARD.COMMA:
			var mapIndex = gController.game.terrainArray[this.point.x][this.point.y].getMapIndex();
			if(mapIndex){
				console.log(mapIndex);
				gController.game.loadMap(mapIndex.map,mapIndex.target);
			}
	}
}
mainChar.prototype.checkVisible = function(){
	gController.game.blankTerrain();
	this.VisiblePoints = [];
	this.VisitedPoints = [];
	for(var i = 0 ; i < this.sightRadius * 2 + 1; i++){
		this.VisitedPoints.push([]);
		for(var j = 0 ; j < this.sightRadius * 2 + 1; j++){
			this.VisitedPoints[i].push(false);
		}
	}
	this.terr = gController.game.terrainArray;
	this.entity = gController.game.entityArray;

	for(var i = 0 ; i < 8 ; i++){
		this.scanOctant(i);
	}
	for(var i = 0 ; i < this.VisiblePoints.length ; i++){
		this.terr[this.VisiblePoints[i].x][this.VisiblePoints[i].y].found = true;
		this.terr[this.VisiblePoints[i].x][this.VisiblePoints[i].y].visible = true;
		if(this.terr[this.VisiblePoints[i].x][this.VisiblePoints[i].y].visible && this.terr[this.VisiblePoints[i].x][this.VisiblePoints[i].y].passable)
			this.checkAdjacentVisible(this.VisiblePoints[i]);
	}
	for(var i = 1 ; i < this.entity.length ; i++){
		if(this.terr[this.entity[i].point.x][this.entity[i].point.y].visible){
			this.entity[i].visible = true;
		}
	}
	gController.game.setCamera(this.point);
	
}
mainChar.prototype.scanOctant = function(pOctant){
	var x = OCTANTMULTIPLY[pOctant].bx * this.sightRadius;
	var y = OCTANTMULTIPLY[pOctant].by * this.sightRadius;

	while(!(x == OCTANTMULTIPLY[pOctant].ex * this.sightRadius && y == OCTANTMULTIPLY[pOctant].ey * this.sightRadius)){
		this.drawLine(pOctant,new point(x,y));
		x += OCTANTMULTIPLY[pOctant].ix;
		y += OCTANTMULTIPLY[pOctant].iy;
	}
	this.drawLine(pOctant,new point(x,y));
}
mainChar.prototype.drawLine = function(pOctant,pEndPoint){
	var x1 = 0; var y1 = 0; var x2 = pEndPoint.x; var y2 = pEndPoint.y;
	var x = 0; var y = 0; var rise = pEndPoint.y; var run = pEndPoint.x;
	var delta = rise/run; var adjust = 0; delta >= 0 ? adjust = 1 : adjust = -1;
	var offset = 0; var threshold = 0.5; var oncemore = true; var currPos = this.point.offset(0,0);
	var visitedOffsetX = -this.point.x + this.sightRadius + 1;
	var visitedOffsetY = -this.point.y + this.sightRadius + 1;
	
	if(run == 0){
		while(y1 != y2){
			currPos = this.point.offset(0,y1);
			if(!gController.game.checkBoundary(currPos) || this.point.distance(currPos.x,currPos.y) >= this.sightRadius){
				oncemore = false;
				break;
			}
			if(gController.game.isPassable(currPos)){
				if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
					this.VisiblePoints.push(currPos);
					this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
				}
			}else{
				if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
					this.VisiblePoints.push(currPos);
					this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
				}
				oncemore = false;
				break;
			}
			y1 < y2 ? y1++ : y1--;
		}
		if(oncemore){
			currPos = this.point.offset(0,y1);
			if(gController.game.checkBoundary(currPos) && this.point.distance(currPos.x,currPos.y) < this.sightRadius)
				if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
					this.VisiblePoints.push(currPos);
					this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
				}
		}
	}else{
		if(delta <= 1 && delta >= -1){
			delta = Math.abs(delta);
			y = 0;
			while(x1 != x2){
				currPos = this.point.offset(x1,y);
				if(!gController.game.checkBoundary(currPos) || this.point.distance(currPos.x,currPos.y) >= this.sightRadius){
					oncemore = false;
					break;
				}
				if(gController.game.isPassable(currPos)){
					if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
						this.VisiblePoints.push(currPos);
						this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
					}
				}else{
					if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
						this.VisiblePoints.push(currPos);
						this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
					}
					oncemore = false;
					break;
				}
				offset+= delta;
				if(offset >= threshold){
					y+= adjust;
					threshold++;
				}
				x1 < x2 ? x1++ : x1--;
			}
			if(oncemore){
				currPos = this.point.offset(x1,y);
				if(gController.game.checkBoundary(currPos) && this.point.distance(currPos.x,currPos.y) < this.sightRadius){
					if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
						this.VisiblePoints.push(currPos);
						this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
					}
				}
			}
		}else{
			delta = Math.abs(run/rise);
			x = 0;
			while(y1 != y2){
				currPos = this.point.offset(x,y1);
				if(!gController.game.checkBoundary(currPos) || this.point.distance(currPos.x,currPos.y) >= this.sightRadius){
					oncemore = false;
					break;
				}
				if(gController.game.isPassable(currPos)){
					if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
						this.VisiblePoints.push(currPos);
						this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
					}
				}else{
					if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
						this.VisiblePoints.push(currPos);
						this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
					}
					oncemore = false;
					break;
				}
				offset+= delta;
				if(offset >= threshold){
					x+= adjust;
					threshold++;
				}
				y1 < y2 ? y1++ : y1--;
			}
			if(oncemore){
				currPos = this.point.offset(x,y1);
				if(gController.game.checkBoundary(currPos) && this.point.distance(currPos.x,currPos.y) < this.sightRadius){
					if(!this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY]){
						this.VisiblePoints.push(currPos);
						this.VisitedPoints[currPos.x+visitedOffsetX][currPos.y+visitedOffsetY] = true;
					}
				}
			}
		}
	}
}
mainChar.prototype.checkAdjacentVisible = function(inputPoint){
	var tempRotate = new point(0,1);
	for(var i = 0 ; i < 8 ; i++){
		tempRotate.rotate(true);
		if(!this.terr[inputPoint.x+tempRotate.x][inputPoint.y+tempRotate.y].passable){
			if(this.point.distance(inputPoint.x+tempRotate.x,inputPoint.y+tempRotate.y) <= this.sightRadius){
				this.terr[inputPoint.x+tempRotate.x][inputPoint.y+tempRotate.y].found = true;
				this.terr[inputPoint.x+tempRotate.x][inputPoint.y+tempRotate.y].visible = true;
			}
		}
	}
}
mainChar.prototype.skipTurn = function(){
	this.deferTurn();
	gController.game.loopingActors();
}
mainChar.prototype.switchTurn = function(){
	this.isTurn ? this.isTurn = false : this.isTurn = true;
}
mainChar.prototype.performAction = function(){
	gameEntity.prototype.performAction.call(this);
	this.switchTurn();
}
mainChar.prototype.checkDeath = function(){
	gameEntity.prototype.checkDeath.call(this);
	if(this.stats.getStat("CurrentHealth") <= 0){
		console.log("Games over yeaaaaaaaaaah");
		gController.game.endGame();
	}
}