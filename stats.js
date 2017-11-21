xmlStats = getXML("statistics.xml");
xmlTalents = getXML("talents.xml");
xmlSheet = getXML("charsheet.xml");
var tempStats = [];
var tempName = "";
xmlStats.find("statistics").find("stats").each(function(index){
	tempName = $(this).attr("name");
	$(this).find("stat").each(function(index){
		tempStats.push({name: $(this).find("name").html(), type: tempName, powerTotal: ($(this).find("power").html() === "true"), value: 0, calculation: $(this).find("base").length == 1 ? xmlScript($(this).find("base").html()) : 0, exp: 0, growth: 1});
		if(!TYPECOUNTDONE){
			if(STATTYPECOUNT.findIndexByPropertyValue("name",tempName) == -1)
				STATTYPECOUNT.push({name: tempStats[tempStats.length-1].type, countAll: 1, countPower: tempStats[tempStats.length-1].powerTotal});
			else{
				STATTYPECOUNT[STATTYPECOUNT.findIndexByPropertyValue("name",tempName)].countAll++;
				if(tempStats[tempStats.length-1].powerTotal)
					STATTYPECOUNT[STATTYPECOUNT.findIndexByPropertyValue("name",tempName)].countPower++;
			}
		}
	});
});

var stats = function(){
	this.TempData;
	if(!TYPECOUNTDONE){
		TYPECOUNTDONE = true;
		setTypeCountVars();
	}
	this.stats = cloneArray(tempStats);
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].calculation != 0)
			this.stats[i].value = this.stats[i].calculation(this,"");
	}
	this.questions;
}
stats.prototype.getPower = function(){
	var baseTotal = 0;
	var skillTotalXP = 0;
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].type == "Base" && this.stats[i].powerTotal)
			baseTotal += this.stats[i].value;
		if(this.stats[i].type == "Skills" && this.stats[i].powerTotal)
			skillTotalXP += this.getStatXP(this.stats[i].name);
	}
	return baseTotal + (skillTotalXP / 1000);
}
stats.prototype.getStat = function(statid){
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].name == statid)
			return this.stats[i].value;
	}
}
stats.prototype.setStat = function(statid,value){
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].name == statid){
			this.stats[i].value = value;
			break;
		}
	}
}
stats.prototype.setStatGroup = function(statArray,type){
	if(statArray != STATTYPECOUNT[STATTYPECOUNT.findIndexByPropertyValue("name",type)].countAll)
		return false;
	var statArrayPointer = 0;
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].type == type){
			this.stats[i].value = statArray[statArrayPointer];
			statArrayPointer++;
		}
	}
}
stats.prototype.adjustStat = function(statid,value){
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].name == statid){
			this.stats[i].value += parseInt(value);
			break;
		}
	}
}
stats.prototype.adjustGrowth = function(statid,value){
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].name == statid){
			this.stats[i].growth += parseFloat(value);
			break;
		}
	}
}
stats.prototype.calcStatXP = function(statid,value){
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].name == statid){
			this.stats[i].exp += parseInt(value * growth);
			while(this.stats[i].exp / 100 >= this.stats[i].value){
				this.stats[i].exp -= this.stats[i].value * 100;
				this.stats[i].value++;
			}
		}
	}
}
stats.prototype.getStatXP = function(statid){
	for(var i = 0 ; i < this.stats.length ; i++){
		if(this.stats[i].name == statid){
			var statCount = this.stats[i].value;
			var xpCount = this.stats[i].exp;
			while(statCount > 0){
				xpCount += statCount * 100;
				statCount--;
			}
		}
	}
	return xpCount;
}
stats.prototype.calcStats = function(){
	localObject = this;
	var tempName = "";
	var tempPointer;
	xmlStats.find("statistics").find("stats[name=Creation]").find("stat").each(function(index){
		tempName = $(this).find("name").text();
		localObject.TempData = getXML($(this).find("reference").text());
		tempPointer = localObject.TempData.find(localObject.TempData.find("elementname").text()).filter(function(){
			return $(this).find("name").text() == localObject.getStat(tempName);
		})
		tempPointer.find("statbonus").each(function(index){
			localObject.adjustStat($(this).find("statbonusid").text(),$(this).find("statbonusvalue").text());
		});
		tempPointer.find("growthbonus").each(function(index){
			localObject.adjustGrowth($(this).find("growthbonusid").text(),$(this).find("growthbonusvalue").text());
		});
	});
	this.stats.push({name: "CurrentHealth", type: "Dynamic", powerTotal: false, value: this.getStat("Health"), calculation: 0, exp: 0, growth: 0});
	this.getPower();
}
stats.prototype.createStats = function(input,questions){
	for(var i = 0 ; i < input.length ; i++){
		this.setStat(input[i].statid,input[i].name);
	}
	this.questions = questions;
	this.calcStats();
}
stats.prototype.displayStats = function(offsetX,offsetY){
	localObject = this;
	var columnCount = xmlSheet.find("column").length;
	var x = offsetX;
	var y = offsetY;
	var maxX = gSettings.getSetting("canvaswidth") / columnCount;
	for(var i = 0 ; i < columnCount ; i++){
		y = offsetY;
		xmlSheet.find("column").eq(i).find("display").each(function(index){
			gController.addItem(text(
				10 + (i * maxX),
				y,
				maxX,
				16,
				$(this).attr("group")
			));
			gController.container.getChildAt(gController.container.children.length - 1).anchor.x = 0;
			gController.container.getChildAt(gController.container.children.length - 1).anchor.y = 0;
			y += gController.container.getChildAt(gController.container.children.length - 1).height;
			for(var j = 0 ; j < localObject.stats.length ; j++){
				if(localObject.stats[j].type == $(this).attr("group")){
					gController.addItem(text(
						10 + (i * maxX),
						y,
						maxX,
						14,
						localObject.stats[j].name
					));
					gController.container.getChildAt(gController.container.children.length - 1).anchor.x = 0;
					gController.container.getChildAt(gController.container.children.length - 1).anchor.y = 0;
					gController.addItem(text(
						(maxX * (i+ 1)),
						y,
						maxX,
						14,
						localObject.stats[j].value
					));
					gController.container.getChildAt(gController.container.children.length - 1).anchor.x = 1;
					gController.container.getChildAt(gController.container.children.length - 1).anchor.y = 0;
					y += gController.container.getChildAt(gController.container.children.length - 1).height;
				}
			}
		});
	}
	gController.render();
}