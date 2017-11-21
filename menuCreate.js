if(debug)
	xmlMenuData = getXML("testchargen.xml");
else
	xmlMenuData = getXML("menuCreate.xml");

var menuCreate = function(){
	this.TempData;
	this.Description;
	this.maxAmount = 1;
	this.currStep = 0;
	this.currSelect = [];
	this.decidedSelect = [];
	this.questionArray = [];
	this.questionCount = 0;
	this.currSelectText = "";
	this.nextStep(true);
}
menuCreate.prototype.drawList = function(pageIndex,elementName,titleText){
	var localObject = this;
	var tempButton;
	gController.blankBackground();
	var maxX = gSettings.getSetting("canvaswidth") - 20;
	var maxY = gSettings.getSetting("canvasheight") - 50;
	var x = 10 + maxX/100 * 15;
	var y = 50 + maxY/100 * 5;
	
	this.Description = new text(
		gSettings.getSetting("canvaswidth")/2,
		maxY/100 * 70,
		maxX,
		20,
		""
	);
	gController.addUI(text(
		gSettings.getSetting("canvaswidth")/2,
		20,
		maxX,
		20,
		titleText),
		this.Description);
	gController.ui.getChildAt(gController.ui.children.length - 1).anchor.y = 0;
	y+= gController.ui.getChildAt(gController.ui.children.length - 1).getBounds().height;
	this.TempData.find(elementName).each(function(index){
		if(index >= pageIndex && index < pageIndex + 12){
			tempButton = new button(
				x,y,
				maxX/100 * 30,
				maxY/100 * 5,
				(localObject.currSelect.indexOf($(this).find("name").html()) == -1) ? 0x555555 : 0x333333,
				12,
				$(this).find("name").html(),
				{name: $(this).find("name").html(),description: $(this).find("description").text(),localObj: localObject}
			);
			tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
				if(localObject.currSelect.length < localObject.maxAmount && localObject.currSelect.indexOf(this.data.name) == -1){
						localObject.currSelect.push(this.data.name);
						this.setColor(0x333333);
						gController.render();
				}else{
					if(localObject.maxAmount == 1){
						if(localObject.currSelect.indexOf(this.data.name) == -1){
							localObject.currSelect[0] = this.data.name;
							for(var i = 0 ; i < gController.ui.children.length ; i++){
								if(gController.ui.children[i] instanceof buttonBack)
									gController.ui.children[i].setColor(0x555555);
							}
							this.setColor(0x333333);
							gController.render();
						}
					}else{
						if(localObject.currSelect.indexOf(this.data.name) != -1){
							localObject.currSelect.splice(localObject.currSelect.indexOf(this.data.name),1);
							this.setColor(0x555555);
							gController.render();
						}
					}
				}
			}
			tempButton.buttonObj.mouseover = function(data){
				localObject.Description.text = this.data.description;
				gController.render();
			}
			tempButton.buttonObj.mouseout = function(data){
				localObject.Description.text = "";
				gController.render();
			}
			tempButton.display();
			if((index+1)%3 == 0){
				x = 10 + maxX/100 * 15;
				y+= maxY/100 * 7.5;
			}else{
				x+= maxX/100 * 35;
			}
		}
	});
	y = 50 + maxY/100 * 40;
	if(pageIndex > 0){
		x = 10 + maxX/100 * 32.5;
		tempButton = new button(x,y,
			maxX/100 * 15,
			maxY/100 * 5,
			0x555555,
			12,
			"<",
			{}
		);
		tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
			localObject.drawList(pageIndex - 12,elementName,titleText);
		}
		tempButton.display();
	}
	x = 10 + maxX/100 * 50;
	tempButton = new button(x,y,
		maxX/100 * 15,
		maxY/100 * 5,
		0x555555,
		12,
		"Select",
		{}
	);
	tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
		if(localObject.currSelect.length == localObject.maxAmount){
				for(var i = 0 ; i < localObject.decidedSelect.length ; i++){
					if(localObject.decidedSelect[i].statid == localObject.TempData.find("statid").html())
						localObject.decidedSelect.splice(i,1);
				}
				for(var i = 0 ; i < localObject.currSelect.length ; i++){
					localObject.decidedSelect.push({statid: localObject.TempData.find("statid").html(), name: localObject.currSelect[i]});
				}
				localObject.nextStep(true);
			}
	}
	tempButton.display();
	if(this.TempData.find(elementName).length > 12 && this.TempData.find(elementName).length > pageIndex + 12){
		x = 10 + maxX/100 * 67.5;
		tempButton = new button(x,y,
			maxX/100 * 15,
			maxY/100 * 5,
			0x555555,
			12,
			">"
		);
		tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
			localObject.drawList(pageIndex + 12,elementName,titleText);
		}
		tempButton.display();
	}
	x = 10 + maxX/100 * 50;
	y += maxY/100 * 7.5;
	tempButton = new button(x,y,
		maxX/100 * 15,
		maxY/100 * 5,
		0x555555,
		12,
		"Go back"
	);
	tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
		localObject.nextStep(false);
	}
	tempButton.display();
	gController.render();
}
menuCreate.prototype.drawQuestions = function(pageIndex,titleText){
	var tempButton;
	var localObject = this;
	gController.blankBackground();
	var maxX = gSettings.getSetting("canvaswidth") - 20;
	var maxY = gSettings.getSetting("canvasheight") - 50;
	var x = 10 + maxX/100 * 50;
	var y = 50 + maxY/100 * 5;
	
	if(pageIndex == 0){
		this.questionCount = this.TempData.find("question").length;
		gController.addUI(text(
			gSettings.getSetting("canvaswidth")/2,
			20,
			maxX,
			20,
			titleText
		));
		gController.ui.getChildAt(gController.ui.children.length - 1).anchor.y = 0;
		y+= gController.ui.getChildAt(gController.ui.children.length - 1).getBounds().height;
		tempButton = new button(
			x,y,
			maxX/100 * 15,
			maxY/100 * 5,
			0x555555,
			20,
			"Continue",
			{}
		);
		tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
			pageIndex = randomRange(1,localObject.questionCount);
			localObject.drawQuestions(pageIndex,titleText);
		}
		tempButton.display();
	}else{
		gController.addUI(text(
			gSettings.getSetting("canvaswidth")/2,
			20,
			maxX,
			20,
			localObject.TempData.find("question").eq(pageIndex-1).find("text").html()
		));
		gController.ui.getChildAt(gController.ui.children.length - 1).anchor.y = 0;
		y+= gController.ui.getChildAt(gController.ui.children.length - 1).getBounds().height;
		localObject.TempData.find("question").eq(pageIndex-1).find("decision").each(function(index){
			tempButton = new button(
				x,y,
				maxX/100 * 50,
				maxY/100 * 10,
				0x555555,
				20,
				$(this).find("text").html()
			);
			tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
				if(localObject.questionArray.length < localObject.maxAmount - 1){
					if(localObject.questionCount < localObject.maxAmount){
						localObject.nextStep(true);
					}else{
						var found = false;
						localObject.questionArray.push({referenceid: xmlMenuData.find("step[name=" + localObject.currStep + "]").find("selection").html(),questionid: pageIndex, answer: index});
						while(!found){
							pageIndex = randomRange(1,localObject.questionCount);
							if(localObject.questionArray.map(function(x) {return x.questionid; }).indexOf(pageIndex) == -1)
								found = true;
						}
						localObject.drawQuestions(pageIndex,titleText);
					}
				}else{
					localObject.questionArray.push({referenceid: xmlMenuData.find("step[name=" + localObject.currStep + "]").find("selection").html(),questionid: pageIndex, answer: index});
					localObject.nextStep(true);
				}
			}
			tempButton.display();
			y+= maxY/100 * 15;
		});
	}
	gController.render();
}
menuCreate.prototype.drawCharSheet = function(titleText){
	var tempButton;
	var localObject = this;
	gController.blankBackground();
	var maxX = gSettings.getSetting("canvaswidth") - 20;
	var maxY = gSettings.getSetting("canvasheight") - 50;
	var x = 10 + maxX/100 * 50;
	var y = 50 + maxY/100 * 5;
	
	gController.addUI(text(
		gSettings.getSetting("canvaswidth")/2,
		20,
		maxX,
		20,
		titleText
	));
	gController.ui.getChildAt(gController.ui.children.length - 1).anchor.y = 0;
	gController.pChar.displayStats(10,gController.ui.getChildAt(gController.ui.children.length - 1).getBounds().height + 30);
	tempButton = new button(
		gSettings.getSetting("canvaswidth")/2,
		gSettings.getSetting("canvasheight") - maxY/100 * 15,
		maxX/100 * 15,
		maxY/100 * 5,
		0x555555,
		12,
		"Confirm character creation"
	);
	tempButton.buttonObj.mousedown = tempButton.buttonObj.touchstart = function(data){
		localObject.nextStep(true);
	}
	tempButton.display();
	gController.render();
}
menuCreate.prototype.nextStep = function(forward){
	forward ? this.currStep++ : this.currStep--;
	if(this.currStep > 0 && this.currStep <= xmlMenuData.find("step").length){
		this.currSelect.length = 0;
		this.TempData = xmlMenuData.find("step[name=" + this.currStep + "]");
		var tempTitle = this.TempData.find("text").html();
		var tempType = this.TempData.find("selection").attr("type");
		this.maxAmount = this.TempData.find("selection").attr("amount");
		this.TempData = getXML(this.TempData.find("selection").html());
		switch(tempType){
			case "list": this.drawList(0,this.TempData.find("elementname").html(),tempTitle); break;
			case "questions" :
				var delArray = [];
				for(var i = 0 ; i < this.questionArray.length ; i++){
					if(this.questionArray[i].referenceid == xmlMenuData.find("step[name=" + this.currStep + "]").find("selection").html())
						delArray.push(i);
				}
				for(var i = 0 ; i < delArray.length ; i++){
					delete this.questionArray[delArray[i]];
				}
				this.questionArray.clean();
				this.drawQuestions(0,tempTitle); break;
			case "charsheet" : gController.pChar.createStats(this.decidedSelect,this.questionArray);
				this.drawCharSheet(tempTitle); break;
		}
	}
	else if(this.currStep == 0){
		gController.menuSelect("Main Menu");
	}else{
		gController.gameBegin();
	}
}

function menuCreateFunc(){
	gController.menu = new menuCreate();
}