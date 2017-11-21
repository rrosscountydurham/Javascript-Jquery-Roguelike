var equippable = function(stats,slot,graphic,frame){
	item.call(this,graphic,frame);
	this.stats = stats;
	this.slot = slot;
}
inheritsFrom(item,equippable);