/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
	Object.defineProperty(Object.prototype, "watch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
			var
			  oldval = this[prop]
			, newval = oldval
			, getter = function () {
				return newval;
			}
			, setter = function (val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			}
			;
			
			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					  get: getter
					, set: setter
					, enumerable: true
					, configurable: true
				});
			}
		}
	});
}

// object.unwatch
if (!Object.prototype.unwatch) {
	Object.defineProperty(Object.prototype, "unwatch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop) {
			var val = this[prop];
			delete this[prop]; // remove accessors
			this[prop] = val;
		}
	});
}

function runFunction(name, arguments){
    var fn = window[name];
    if(typeof fn !== 'function')
        return;

    fn.apply(window, arguments);
};
var filterArray = [];
for(var i = 0 ; i < 1000 ; i++){
	filterArray.push([]);
	for(var j = 0 ; j < 1000 ; j++){
		filterArray[i].push(false);
	}
}
Array.prototype.clean = function(){
	var cleaned = false;
	while(!cleaned){
		cleaned = true;
		for(var i = 0 ; i < this.length ; i++){
			if(this[i] == undefined){
				this.splice(i,1);
				cleaned = false;
			}
		}
	}
};
Array.prototype.min = function( array ){
    return Math.min.apply( Math, array );
};
Array.prototype.fill = function(value,start,end){
	for(var i = start ; i < end ; i++){
		this[i] = value;
	}
};
Array.prototype.findIndexByPropertyValue = function(property,searchValue){
	for(var i = 0 ; i < this.length ; i++){
		if(this[i][property] === searchValue)
			return i;
	}
	return -1;
};
Array.prototype.getRandomElement = function(){
	return this[randomRange(0,this.length-1)];
}
function inheritsFrom(parent,child){
	child.prototype = Object.create(parent.prototype);
};
function getXML(filename){
	$.ajax({
		url: "xml/" + filename,
		async : false,
		dataType : "xml",
		success : function(response){
			xml = $(response);
		},
		error: function (xhr,err){ alert(err); }
	});
	return xml;
};
function randomRange(min,max){
	var rand = Math.floor(Math.random() * (max + 2)) + min;
	if(rand > max)
		rand = max;
	return rand;
};
function cloneObject(objectInput){
	var tempObject = (JSON.parse(JSON.stringify(objectInput)));
	return tempObject;
}
function cloneArray(arrayInput){
   var out, v, key;
   out = Array.isArray(arrayInput) ? [] : {};
   for (key in arrayInput) {
       v = arrayInput[key];
       out[key] = (typeof v === "object") ? cloneArray(v) : v;
   }
   return out;
}

function button(x,y,width,height,backgroundColor,fontsize,content,data){
	this.buttonObj = new buttonBack(x,y,width,height,backgroundColor,data);
	this.buttonText = text(x,y,width,fontsize,content);
}
button.prototype.display = function(){
	gController.addUI(this.buttonObj,this.buttonText);
}

function buttonBack(x,y,width,height,backgroundColor,data){
	PIXI.Graphics.call(this);
	this.beginFill(backgroundColor);
	this.drawRect(x,y,width,height);
	this.endFill();
	this.pivot.x = width/2;
	this.pivot.y = height/2;
	this.hitArea = new PIXI.Rectangle(x,y,width,height);
	this.interactive = true;
	this.data = data;
}
buttonBack.prototype = Object.create(PIXI.Graphics.prototype);
buttonBack.prototype.constructor = buttonBack;
buttonBack.prototype.setColor = function(color){
	var tempData = this.graphicsData[0];
	var tempPivot = this.pivot;
	var tempHitArea = this.hitArea;
	this.clear();
	this.beginFill(color);
	this.drawRect(tempData.shape.x,tempData.shape.y,tempData.shape.width,tempData.shape.height);
	this.endFill();
	this.pivot = tempPivot;
	this.hitArea = tempHitArea;
}

function statusBar(x,y,width,height,backgroundColor,fontsize,content,data){
	this.statusBarObj = new statusBarBack(x,y,width,height,backgroundColor,data);
	this.statusBarBackground = new rectangle(x,y,width,height,0x00000);
	this.statusBarText = text(x,y,width,fontsize,content);
}
statusBar.prototype.display = function(){
	gController.addUI(this.statusBarBackground,this.statusBarObj,this.statusBarText);
}
statusBar.prototype.setWidth = function(width){
	this.statusBarObj.setBarWidth(width);
}
statusBar.prototype.setText = function(text){
	this.statusBarText.text = text;
}

function statusBarBack(x,y,width,height,backgroundColor,data){
	PIXI.Graphics.call(this);
	this.backgroundColor = backgroundColor;
	this.maxWidth = width;
	this.beginFill(backgroundColor);
	this.drawRect(x,y,width,height);
	this.endFill();
	this.pivot.x = width/2;
	this.pivot.y = height/2;
	this.hitArea = new PIXI.Rectangle(x,y,width,height);
	this.interactive = true;
	this.data = data;	
}
statusBarBack.prototype = Object.create(PIXI.Graphics.prototype);
statusBarBack.prototype.constructor = statusBarBack;
statusBarBack.prototype.setBarWidth = function(width){
	var tempData = this.graphicsData[0];
	var tempPivot = this.pivot;
	var tempHitArea = this.hitArea;
	var tempBackgroundColor = this.backgroundColor;
	this.clear();
	this.beginFill(tempBackgroundColor);
	this.drawRect(tempData.shape.x,tempData.shape.y,this.maxWidth * width,tempData.shape.height);
	this.endFill();
	this.pivot = tempPivot;
	this.hitArea = tempHitArea;
	
}

function rectangle(x,y,width,height,backgroundColor){
	var box = new PIXI.Graphics();
	box.beginFill(backgroundColor);
	box.drawRect(x,y,width,height);
	box.endFill();
	box.pivot.x = width/2;
	box.pivot.y = height/2;
	box.hitArea = new PIXI.Rectangle(x,y,width,height);
	return box;
};

function text(x,y,width,fontsize,content){
	var style = {
		font: 'bold ' + fontsize + 'px Arial',
		fill: "#FFFFFF",
		wordWrap : true,
		wordWrapWidth: width
	}
	var text = new PIXI.Text(content,style);
	text.x = x;
	text.y = y;
	text.anchor = new PIXI.Point(0.5,0.5);
	return text;
};

function point(x,y){
	this.x = x;
	this.y = y;
}
point.prototype.compare = function(point){
	if(this.x == point.x && this.y == point.y)
		return true;
	else
	return false;
}
point.prototype.set = function(x,y){
	this.x = x;
	this.y = y;
}
point.prototype.move = function(x,y){
	this.x+=x;
	this.y+=y;
}
point.prototype.offset = function(x,y){
	return new point(this.x+x,this.y+y);
}
point.prototype.display = function(){
	return this.x + " " + this.y;
}
point.prototype.randomRotateStart = function(){
	switch(randomRange(0,7)){
		case 0: this.set(0,-1); break; case 1: this.set(1,-1); break; case 2: this.set(1,0); break;
		case 3: this.set(1,1); break; case 4: this.set(0,1); break; case 5: this.set(-1,1); break;
		case 6: this.set(-1,0); break; case 7: this.set(-1,-1); break;
	}
}
point.prototype.rotate = function(direction){
	if(direction){
		switch(this.x){
			case 1:
				switch(this.y){
					case 1: this.x = 0; break;
					case 0: this.y = 1; break;
					case -1: this.y = 0; break;
				}
				break;
			case 0:
				switch(this.y){
					case 1: this.x = -1; break;
					case -1: this.x = 1; break;
				}
				break;
			case -1:
				switch(this.y){
					case 1: this.y = 0; break;
					case 0: this.y = -1; break;
					case -1: this.x = 0; break;
				}
				break;
		}
	}else{
		switch(this.x){
			case 1:
				switch(this.y){
					case 1: this.y = 0; break;
					case 0: this.y = -1; break;
					case -1: this.x = 0; break;
				}
				break;
			case 0:
				switch(this.y){
					case 1: this.x = 1; break;
					case -1: this.x = -1; break;
				}
				break;
			case -1:
				switch(this.y){
					case 1: this.x = 0; break;
					case 0: this.y = 1; break;
					case -1: this.y = 0; break;
				}
				break;
		}
	}
}
point.prototype.distance = function(x,y){
	return Math.abs(Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y - y,2)));
}
point.prototype.boundarycheck = function(maxX,maxY){
	if(this.x < 0)
		this.x = 0;
	if(this.x > maxX - 1)
		this.x = maxX - 1;
	if(this.y < 0)
		this.y = 0;
	if(this.y > maxY - 1)
		this.y = maxY - 1;
}
point.prototype.bordercheck = function(maxX,maxY){
	if(this.x < 1)
		this.x = 1;
	if(this.x > maxX - 2)
		this.x = maxX - 2;
	if(this.y < 1)
		this.y = 1;
	if(this.y > maxY - 2)
		this.y = maxY - 2;
}

var swap = function(x){return x};

function getStatXP(level){
	var statCount = level;
	var xpCount = 0;
	while(statCount > 0){
		xpCount += statCount * 100;
		statCount--;
	}
	return xpCount;
}
function getStatByXPValue(xp){
	var statCount = 0;
	while(xp > (statCount + 1) * 100){
		statCount++;
		xp -= statCount * 100;
	}
	return statCount;
}
//https://github.com/kittykatattack/learningPixi#keyboard
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.press = function(){};
  key.release = function(){};
  
  return key;
}

function xmlScript(inputCode){
	var fn = new Function('actor','target',"return " + inputCode);
	return fn;
}