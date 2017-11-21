var entityDefinition = function(){
	this.entityDefinitions = [];
}
entityDefinition.prototype.addNewDefinition = function(power){
	var statAllowance = 0;
	var skillAllowance = 0;
	for(var i = 0 ; i < 100 ; i++){
		statAllowance = parseInt(power * (30 - (randomRange(5,10)))/100);
		skillAllowance = power - statAllowance;
		this.entityDefinitions.push(new enemyBase(0,0,"entities.png",randomRange(0,2)));
		this.entityDefinitions[i].distributeStats(parseInt(statAllowance*(1 + ((i - 50)/100))) ,parseInt(skillAllowance*(1 + ((i - 50)/100))));
	}
}
entityDefinition.prototype.getEntityDefinition = function(minPower,maxPower){
	var powerTest = 0;
	var monsterList = [];
	for(i = 0 ; i < this.entityDefinitions.length ; i++){
		powerTest = this.entityDefinitions[i].stats.getPower();
		if(powerTest > minPower && powerTest < maxPower)
			monsterList.push(this.entityDefinitions[i]);
	}
	
	while(monsterList.length < 5){
		var power = randomRange(minPower,maxPower);
		statAllowance = parseInt(power * (30 - (randomRange(5,10)))/100);
		skillAllowance = power - statAllowance;
		this.entityDefinitions.push(new enemyBase(0,0,"entities.png",randomRange(0,2)));
		this.entityDefinitions[this.entityDefinitions.length - 1].distributeStats(parseInt(statAllowance*(1 + ((i - 50)/100))) ,parseInt(skillAllowance*(1 + ((i - 50)/100))));
		monsterList.push(this.entityDefinitions[i]);
	}

	return monsterList;
}