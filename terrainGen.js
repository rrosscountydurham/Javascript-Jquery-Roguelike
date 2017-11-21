var terrainRect = function(x,y,w,h,maxX,maxY){
	x = parseInt(x); y = parseInt(y); w = parseInt(w); h = parseInt(h);
	this.topleft = new point(x,y);
	this.topleft.bordercheck(maxX,maxY);
	this.bottomright = new point(x+w,y+h);
	this.bottomright.bordercheck(maxX,maxY);
}

xmlTerrain = getXML("terrain.xml");
terrainFrames = [];
xmlTerrain.find("terrain").each(function(index){
	var floorTiles = [];
	var wallTiles = [];
	var waterTiles = [];
	var stairUpTiles = [];
	var stairDownTiles = [];
	$(this).find("floor").find("frame").each(function(index){
		floorTiles.push($(this).html());
	});
	$(this).find("wall").find("frame").each(function(index){
		wallTiles.push($(this).html());
	});
	$(this).find("water").find("frame").each(function(index){
		waterTiles.push($(this).html());
	});
	$(this).find("stairsup").find("frame").each(function(index){
		stairUpTiles.push($(this).html());
	});
	$(this).find("stairsdown").find("frame").each(function(index){
		stairDownTiles.push($(this).html());
	});
	var frames = new framesSorter();
	frames.name = $(this).attr("name"); frames.type = $(this).find("type").html(); frames.floor = floorTiles; frames.wall = wallTiles; frames.water = waterTiles; frames.stairsup = stairUpTiles; frames.stairsdown = stairDownTiles;
	terrainFrames.push(frames);
});

var terrainGenerator = function(){
	this.terrain; this.mapXSize; this.mapYSize;
}
terrainGenerator.prototype.genTerrain = function(terrainIn,terrainId,x,y,transitionArray,terrainType,inputFrames){

	this.terrain = terrainIn;
	this.terrainId = terrainId;
	this.mapSizeX = x;
	this.mapSizeY = y;
	this.inputFrames;
	this.selectionTiles = [];
	this.tArray = transitionArray.getMapLinks(terrainId);
	
	var sanityCheck = 0;
	var tempFrames;
	if(inputFrames == ""){
		while(true){
			sanityCheck++;
			if(sanityCheck > 100)
				break;
			tempFrames = terrainFrames.getRandomElement();
			if(tempFrames.type == terrainType)
				break;
		}
	}else{
		for(var i = 0 ; i < terrainFrames.length ; i++){
			if(inputFrames == terrainFrames[i].name){
				tempFrames = terrainFrames[i];
				break;
			}
		}
	}
	this.inputFrames = tempFrames;
	if(this.terrain.length == 0){
		for(var i = 0 ; i < this.mapSizeX ; i++){
			this.terrain.push([]);
			for(var j = 0 ; j < this.mapSizeY ; j++){
				if(terrainType != MAPTYPE[0]){
					this.terrain[i].push(new terrain("tiles.png",this.inputFrames.wall.getRandomElement()));
					this.terrain[i][j].passable = false;
				}else{
					this.terrain[i].push(new terrain("tiles.png",this.inputFrames.water.getRandomElement()));
					this.terrain[i][j].passable = false;
				}
			}
		}
	}
	if(terrainType == MAPTYPE[0])
		terrainType = 0;
	if(terrainType == MAPTYPE[1] || terrainType == MAPTYPE[2])
		terrainType = randomRange(2,2);
	switch(terrainType){
		case 999: this.debugDungeonType(); break;
		case 0:  this.genOverworldType1(); break;
		case 1: this.genDungeonType1(); break;
		case 2: this.genDungeonType2(); break;
	}
	var emptyCell = false;
	var currentIndex;
	var frame = 0;
	for(var i = 0 ; i < this.tArray.length ; i++){
		emptyCell = this.findEmptyCell();
		frame = (this.tArray[i].upDown == true) ? this.inputFrames.stairsdown.getRandomElement() : this.inputFrames.stairsup.getRandomElement();
		if(emptyCell){
			this.terrain[emptyCell.x][emptyCell.y].changeFrame(frame);
			this.terrain[emptyCell.x][emptyCell.y].setMapIndex(this.tArray[i].mapTargetted,this.tArray[i].targetIndex);
			this.tArray[i].position = new point(emptyCell.x,emptyCell.y);
		}
	}
}
terrainGenerator.prototype.genOverworldType1 = function(){
	var tempTerrain = [];
	var tempTerrain2 = [];
	for(var i = 0 ; i < this.mapSizeX ; i++){
		tempTerrain.push([]);
		for(var j = 0 ; j < this.mapSizeY ; j++){
			if(i == 0 || j == 0 || i == this.mapSizeX - 1 || j == this.mapSizeY - 1)
				tempTerrain[i].push(0);
			else
				tempTerrain[i].push(randomRange(0,1));
		}
	}
	var cycle = false;
	var checkPoint;
	var comparePoint;
	var cyclePoints = [];
	var totalNeighbours = 0;
	var sanityCheck = 0;
	do{
		sanityCheck++
		if(sanityCheck > 30)
			break;
		cycle = false;
		tempTerrain2 = [];
		for(var i = 1 ; i < this.mapSizeX - 1 ; i++){
			for(var j = 1 ; j < this.mapSizeY - 1 ; j++){
				checkPoint = new point(0,0);
				if(i < this.mapSizeX - 2)
					checkPoint.x += 1;
				else
					checkPoint.x -= 1;
				cyclePoints = [];
				for(var k = 0 ; k < 8 ; k++){
					checkPoint.rotate();
					comparePoint = checkPoint.offset(i,j);
					if(comparePoint.x > 0 && comparePoint.x < this.mapSizeX - 2 && comparePoint.y > 0 && comparePoint.y < this.mapSizeY - 2)
						cyclePoints.push(tempTerrain[comparePoint.x][comparePoint.y]);
				}
				totalNeighbours = 0;
				for(var k = 0 ; k < cyclePoints.length ; k++){
					totalNeighbours += cyclePoints[k];
				}
				if((totalNeighbours < 5) && tempTerrain[i][j] == 1){
					tempTerrain2.push({i: i, j : j, value: 0});
					cycle = true;
				}
				if((totalNeighbours >= 5) && tempTerrain[i][j] == 0){
					tempTerrain2.push({i : i, j : j, value : 1});
					cycle = true;
				}
			}
		}
		for(var i = 0 ; i < tempTerrain2.length ; i++){
			tempTerrain[tempTerrain2[i].i][tempTerrain2[i].j] = tempTerrain2[i].value;
		}
	}while(cycle)
	for(var i = 0 ; i < tempTerrain.length ; i++){
		for(var j = 0 ; j < tempTerrain[i].length ; j++){
			if(tempTerrain[i][j] == 1){
				this.terrain[i][j].passable = true;
				this.terrain[i][j].changeFrame(this.inputFrames.floor.getRandomElement());
			}
		}
	}	
}
terrainGenerator.prototype.debugDungeonType = function(){
	var startRect = new terrainRect((this.mapSizeX-randomRange(10,20)) / 2,(this.mapSizeY-randomRange(10,20)) / 2,randomRange(10,20),randomRange(10,20),this.mapSizeX,this.mapSizeY);
	this.drawRect(startRect);
}
terrainGenerator.prototype.genDungeonType1 = function(){
	var cellCount = 0;
	var startRect = new terrainRect((this.mapSizeX-randomRange(3,6)) / 2,(this.mapSizeY-randomRange(3,6)) / 2,randomRange(3,6),randomRange(3,6),this.mapSizeX,this.mapSizeY);
	var maximumCells = parseInt( (this.mapSizeX * (randomRange(20,80) / 100)) * (this.mapSizeY * (randomRange(20,80) / 100)) );
	cellCount += this.drawRect(startRect);
	
	var returnToStart = false;
	var repeat = 0;
	var selectedCell = this.findEmptyCellAdjacentWall(startRect,"");
	while(!returnToStart){
		repeat++;
		if(repeat > 1000)
			break;
		var corridorLength = randomRange(3,10);
		var corridorWidth = randomRange(0,2);
		var corridor;
		if(selectedCell){
			if(selectedCell.direction == "north")
				corridor = new terrainRect(selectedCell.point.x - corridorWidth / 2,selectedCell.point.y - corridorLength,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
			if(selectedCell.direction == "east")
				corridor = new terrainRect(selectedCell.point.x,selectedCell.point.y - corridorWidth / 2,corridorLength,corridorWidth,this.mapSizeX,this.mapSizeY);
			if(selectedCell.direction == "south")
				corridor = new terrainRect(selectedCell.point.x - corridorWidth/2,selectedCell.point.y,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
			if(selectedCell.direction == "west")
				corridor = new terrainRect(selectedCell.point.x - corridorLength,selectedCell.point.y - corridorWidth/2,corridorLength,corridorWidth,this.mapSizeX,this.mapSizeY);
			this.drawRect(corridor);
		}else{
			selectedCell = this.findEmptyCellAdjacentWall(startRect,""); continue;
		}
		var avoid;
		switch(selectedCell.direction){case "north": avoid = "south"; break; case "east": avoid = "west"; break; case "south": avoid = "north"; break; case "west": avoid = "east"; break;}
		selectedCell = this.findEmptyCellAdjacentWall(corridor,avoid);
		corridorLength = randomRange(4,12);
		corridorWidth = randomRange(4,12);
		
		if(selectedCell){
			this.drawRect(new terrainRect(selectedCell.point.x,selectedCell.point.y,0,0,this.mapSizeX,this.mapSizeY));
			if(selectedCell.direction == "north")
				corridor = new terrainRect(selectedCell.point.x - corridorWidth/2,selectedCell.point.y - corridorLength - 1,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
			if(selectedCell.direction == "east")
				corridor = new terrainRect(selectedCell.point.x + 1,selectedCell.point.y - corridorLength/2,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
			if(selectedCell.direction == "south")
				corridor = new terrainRect(selectedCell.point.x - corridorWidth/2,selectedCell.point.y + 1,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
			if(selectedCell.direction == "west")
				corridor = new terrainRect(selectedCell.point.x - corridorWidth - 1,selectedCell.point.y - corridorLength/2,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
			this.drawRect(corridor);
		}else{
			selectedCell = this.findEmptyCellAdjacentWall(startRect,""); continue;
		}
		selectedCell = this.findEmptyCellAdjacentWall(corridor,"");
	}
}
terrainGenerator.prototype.genDungeonType2 = function(){
	var roomList = [];
	roomList.push(new terrainRect((this.mapSizeX-randomRange(3,6)) / 2,(this.mapSizeY-randomRange(3,6)) / 2,randomRange(4,12),randomRange(4,12),this.mapSizeX,this.mapSizeY));
	this.drawRect(roomList[0]);
	
	var repeat = 0;
	var room = 0;
	var feature = 0;
	var selectedCell;
	var corridor;
	var corridorWidth = 0;
	var corridorHeight = 0;
	while(true){
		repeat++
		if(repeat > 1000)
			break;
		room = roomList[randomRange(0,roomList.length-1)];
		selectedCell = this.findEmptyCellAdjacentWall(room,"");
		feature = randomRange(0,10);
		if(feature < 8)
			feature = 0;
		else
			feature = 1;
		switch(feature){
			case 0: 
			if(selectedCell){
				corridorLength = randomRange(3,10);
				corridorWidth = randomRange(0,0);
				if(selectedCell.direction == "north")
					corridor = new terrainRect(selectedCell.point.x - corridorWidth / 2,selectedCell.point.y - corridorLength - 1,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
				if(selectedCell.direction == "east")
					corridor = new terrainRect(selectedCell.point.x + 1,selectedCell.point.y - corridorWidth / 2,corridorLength,corridorWidth,this.mapSizeX,this.mapSizeY);
				if(selectedCell.direction == "south")
					corridor = new terrainRect(selectedCell.point.x - corridorWidth/2,selectedCell.point.y + 1,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
				if(selectedCell.direction == "west")
					corridor = new terrainRect(selectedCell.point.x - corridorLength - 1,selectedCell.point.y - corridorWidth/2,corridorLength,corridorWidth,this.mapSizeX,this.mapSizeY);
				if(!this.checkRect(corridor)){
					this.drawRect(new terrainRect(selectedCell.point.x,selectedCell.point.y,0,0,this.mapSizeX,this.mapSizeY));
					this.drawRect(corridor);
					roomList.push(corridor);
				}
			}
			case 1:
			if(selectedCell){
				corridorLength = randomRange(4,12);
				corridorWidth = randomRange(4,12);
				if(selectedCell.direction == "north")
					corridor = new terrainRect(selectedCell.point.x - corridorWidth/2,selectedCell.point.y - corridorLength - 1,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
				if(selectedCell.direction == "east")
					corridor = new terrainRect(selectedCell.point.x + 1,selectedCell.point.y - corridorLength/2,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
				if(selectedCell.direction == "south")
					corridor = new terrainRect(selectedCell.point.x - corridorWidth/2,selectedCell.point.y + 1,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
				if(selectedCell.direction == "west")
					corridor = new terrainRect(selectedCell.point.x - corridorWidth - 1,selectedCell.point.y - corridorLength/2,corridorWidth,corridorLength,this.mapSizeX,this.mapSizeY);
				if(!this.checkRect(corridor)){
					this.drawRect(new terrainRect(selectedCell.point.x,selectedCell.point.y,0,0,this.mapSizeX,this.mapSizeY));
					this.drawRect(corridor);
					roomList.push(corridor);
				}
			}
		}
	}
}
terrainGenerator.prototype.findWallCell = function(){
	var sanityCheck = 10000;
	var randX = 0;
	var randY = 0;
	var returnCell = false;
	while(sanityCheck > 0){
		sanityCheck--;
		randX = randomRange(1,this.mapSizeX - 2);
		randY = randomRange(1,this.mapSizeY - 2);
		if(!this.terrain[randX][randY].passable){
			returnCell = new point(randX,randY);
			break;
		}
	}
	return returnCell;
}
terrainGenerator.prototype.findEmptyCell = function(){
	var sanityCheck = 10000;
	var randX = 0;
	var randY = 0;
	var returnCell = false;
	while(sanityCheck > 0){
		sanityCheck--;
		randX = randomRange(1,this.mapSizeX - 2);
		randY = randomRange(1,this.mapSizeY - 2);
		if(this.terrain[randX][randY].passable){
			returnCell = new point(randX,randY);
			break;
		}
	}
	return returnCell;
}
terrainGenerator.prototype.findEmptyCellAdjacentWall = function(rectangle,avoid){
	var foundPoints = [];
	var checkPoint = new point(0,0);
	if(avoid != "north"){
		for(var i = rectangle.topleft.x ; i <= rectangle.bottomright.x ; i++){
			checkPoint.set(i,rectangle.topleft.y - 1);
			checkPoint.boundarycheck(this.mapSizeX,this.mapSizeY);
			if(!this.terrain[checkPoint.x][checkPoint.y].passable)
				foundPoints.push({direction: "north",point: new point(checkPoint.x,checkPoint.y)});
		}
	}
	if(avoid != "east"){
		for(var i = rectangle.topleft.y ; i <= rectangle.bottomright.y ; i++){
			checkPoint.set(rectangle.bottomright.x + 1,i);
			checkPoint.boundarycheck(this.mapSizeX,this.mapSizeY);
			if(!this.terrain[checkPoint.x][checkPoint.y].passable)
				foundPoints.push({direction: "east",point: new point(checkPoint.x,checkPoint.y)});
		}
	}
	if(avoid != "south"){
		for(var i = rectangle.topleft.x ; i <= rectangle.bottomright.x ; i++){
			checkPoint.set(i,rectangle.bottomright.y + 1);
			checkPoint.boundarycheck(this.mapSizeX,this.mapSizeY);
			if(!this.terrain[checkPoint.x][checkPoint.y].passable)
				foundPoints.push({direction: "south",point: new point(checkPoint.x,checkPoint.y)});
		}
	}
	if(avoid != "west"){
		for(var i = rectangle.topleft.y ; i <= rectangle.bottomright.y ; i++){
			checkPoint.set(rectangle.topleft.x - 1,i);
			checkPoint.boundarycheck(this.mapSizeX,this.mapSizeY);
			if(!this.terrain[checkPoint.x][checkPoint.y].passable)
				foundPoints.push({direction: "west",point: new point(checkPoint.x,checkPoint.y)});
		}
	}
	if(foundPoints.length > 0)
		return foundPoints.getRandomElement();
	else
		return false;
}
terrainGenerator.prototype.checkRect = function(rectangle){
	var passable = false;
	for(var i = rectangle.topleft.x - 1 ; i <= rectangle.bottomright.x + 1; i++){
		for(var j = rectangle.topleft.y - 1; j <= rectangle.bottomright.y + 1; j++){
			if(this.terrain[i][j].passable){
				passable = true;
				break;
			}
		}
		if(passable){break;}
	}
	return passable;
}
terrainGenerator.prototype.drawRect = function(rectangle){
	var cellCount = 0;
	for(var i = rectangle.topleft.x ; i <= rectangle.bottomright.x ; i++){
		for(var j = rectangle.topleft.y ; j <= rectangle.bottomright.y ; j++){
			if(!this.terrain[i][j].passable){
				cellCount++;
				this.terrain[i][j].passable = true;
				this.terrain[i][j].changeFrame(this.inputFrames.floor.getRandomElement());
			}
		}
	}
	return cellCount;
}