var transitionIndex = function(){
	this.transitionArray = [];
}
transitionIndex.prototype.addIndex = function(mapLocated,mapTargetted,targetIndex,upDown){
	while(this.transitionArray.length <= mapLocated || this.transitionArray.length <= mapTargetted){
		this.transitionArray.push([]);
	}
	this.transitionArray[mapLocated].push({position: new point(0,0), mapTargetted: mapTargetted, targetIndex: targetIndex, upDown : upDown});
	this.transitionArray[mapTargetted].push({position: new point(0,0), mapTargetted: mapLocated, targetIndex: this.transitionArray[mapLocated].length - 1, upDown: !upDown});
}
transitionIndex.prototype.setPosition = function(mapLocated,mapIndex,position){
	if(mapLocated < this.transitionArray.length){
		if(mapIndex < this.transitionArray[mapLocated].length)
			this.transitionArray[mapLocated][mapIndex].position = position;
	}else
		return false;
}
transitionIndex.prototype.getPosition = function(mapLocated,mapIndex){
	if(mapLocated < this.transitionArray.length){
		if(mapIndex < this.transitionArray[mapLocated].length)
			return this.transitionArray[mapLocated][mapIndex].position;
	}else
		return false;
}
transitionIndex.prototype.setMapAndIndex = function(mapLocated,mapIndex,mapTargetted,targetIndex){
	if(mapLocated < this.transitionArray.length){
		if(mapIndex < this.transitionArray[mapLocated].length){
			this.transitionArray[mapLocated][mapIndex].mapTargetted = mapTargetted;
			this.transitionArray[mapLocated][mapIndex].targetIndex = targetIndex;
		}
	}else
		return false;
}
transitionIndex.prototype.getLength = function(){
	return this.transitionArray.length;
}
transitionIndex.prototype.getMapLinks = function(mapLocated){
	if(mapLocated < this.transitionArray.length)
		return this.transitionArray[mapLocated];
	else
		return false;
}