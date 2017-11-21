KEYBOARD = {
BACKSPACE:8,
TAB:9,
ENTER:13,
SHIFT:16,
CTRL:17,
ALT:18,
PAUSE:19,
CAPS:20,
ESCAPE:27,
SPACE:32,
PGUP:33,
PGDWN:34,
END:35,
HOME:36,
LEFT:37,
UP:38,
RIGHT:39,
DOWN:40,
INSERT:45,
DELETE:46,
ZERO:48,
ONE:49,
TWO:50,
THREE:51,
FOUR:52,
FIVE:53,
SIX:54,
SEVEN:55,
EIGHT:56,
NINE:57,
A:65,
B:66,
C:67,
D:68,
E:69,
F:70,
G:71,
H:72,
I:73,
J:74,
K:75,
L:76,
M:77,
N:78,
O:79,
P:80,
Q:81,
R:82,
S:83,
T:84,
U:85,
V:86,
W:87,
X:88,
Y:89,
Z:90,
WINKEYLEFT:91,
WINKEYRIGHT:92,
SELECT:93,
NUMPAD0:96,
NUMPAD1:97,
NUMPAD2:98,
NUMPAD3:99,
NUMPAD4:100,
NUMPAD5:101,
NUMPAD6:102,
NUMPAD7:103,
NUMPAD8:104,
NUMPAD9:105,
MULTIPLY:106,
ADD:107,
SUBTRACT:109,
DECIMAL:110,
DIVIDE:111,
F1:112,
F2:113,
F3:114,
F4:115,
F5:116,
F6:117,
F7:118,
F8:119,
F9:120,
F10:121,
F11:122,
F12:123,
NUMLOCK:144,
SCROLLLOCK:145,
SEMICOLON:186,
EQUALS:187,
COMMA:188,
DASH:189,
PERIOD:190,
FORWARDSLASH:191,
GRAVE:192,
OPENBRACKET:219,
BACKSLASH:220,
CLOSEBRAKET:221,
SINGLEQUOTE:222
}
//Octant 0 = (i,0) to (i,i)
//Octant 1 = (i,i) to (0,i)
//Octant 2 = (0,i) to (-i,i)
//Octant 3 = (-i,i) to (-i,0)
//Octant 4 = (-i,0 to (-i,-i)
//Octant 5 = (-i,-i) to (0,-i)
//Octant 6 = (0, -i to (i,-i)
//Octant 7 = (i,-i) to (i,0)
OCTANTMULTIPLY = [
	{bx: 1, ex: 1, by: 0, ey: 1, ix: 0, iy: 1, dx: 1, dy: 0},
	{bx: 1, ex: 0, by: 1, ey: 1, ix: -1, iy: 0, dx: 1, dy: 0},
	{bx: 0, ex: -1, by: 1, ey: 1, ix: -1, iy: 0},
	{bx: -1, ex: -1, by: 1, ey: 0, ix: 0, iy: -1},
	{bx: -1, ex: -1, by: 0, ey: -1, ix: 0, iy: -1},
	{bx: -1, ex: 0, by: -1, ey: -1, ix: 1, iy: 0},
	{bx: 0, ex: 1, by: -1, ey: -1, ix: 1, iy: 0},
	{bx: 1, ex: 1, by: -1, ey: 0, ix: 0, iy: 1}
]

MENUITEMS = {
	CHARACTER: "Character",
	EQUIPMENT: "Equipment",
	TALENTS: "Talents"
}
DOLLSLOTS = []
var xmlPaperdoll = getXML("paperdoll.xml");
var scale = xmlPaperdoll.find("paperdoll").attr("scale");
DOLLSLOTS.push({scale: scale});
xmlPaperdoll.find("paperdoll").find("slot").each(function(index){
	DOLLSLOTS.push({name: $(this).find("name").html(), posx: $(this).find("posx").html(),posy: $(this).find("posy").html()});
});

MAPTYPE = [
	"Overworld",
	"Ground level",
	"Basement",
	"Tower"
]

TYPECOUNTDONE = false;
STATTYPECOUNT = [];
statCountAll = 0;
statCountPower = 0;
skillCountAll = 0;
skillCountPower = 0;
function setTypeCountVars(){
	statCountAll = STATTYPECOUNT[STATTYPECOUNT.findIndexByPropertyValue("name","Base")].countAll;
	statCountPower = STATTYPECOUNT[STATTYPECOUNT.findIndexByPropertyValue("name","Base")].countPower;
	skillCountAll = STATTYPECOUNT[STATTYPECOUNT.findIndexByPropertyValue("name","Skills")].countAll;
	skillCountPower = STATTYPECOUNT[STATTYPECOUNT.findIndexByPropertyValue("name","Skills")].countAll;
}