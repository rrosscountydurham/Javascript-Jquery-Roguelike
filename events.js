xmlEvents = getXML("events.xml");

var events = function(){
	var localObject = this;
	this.eventsArray = [];
	var tmpName = "";
	xmlEvents.find("events").find("event").each(function(index){
		localObject.eventsArray.push({name: $(this).find("name").html(), timeCode: xmlScript($(this).find("time").html()), powerCode: xmlScript($(this).find("power").html())});
	});
}
events.prototype.getEventTime = function(eventName,actorStats){
	var targetStats = 0;
	for(var i = 0 ; i < this.eventsArray.length ; i++){
		if(eventName == this.eventsArray[i].name){
			return this.eventsArray[i].timeCode(actorStats,targetStats);
		}
	}
}
events.prototype.getEventPower = function(eventName,actorStats,targetStats){
	for(var i = 0 ; i < this.eventsArray.length ; i++){
		if(eventName == this.eventsArray[i].name){
			return this.eventsArray[i].powerCode(actorStats,targetStats);
		}
	}
}