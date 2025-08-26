time = 0;
params = {
amount: 5, rate: .05, speed: 40000, yGravity: 0.5, xGravity: 0,
xDrag: 0.07, yDrag: 0, bounceFactor: .2, stickStiff: .05,
minSize: 2, maxSize: 50, maxDots: 1000,
darkMode: false, musicMode: true, highLightType: false,};
let {
amount, rate, speed, yGravity, xGravity,
xDrag, yDrag, bounceFactor, stickStiff, 
minSize, maxSize, maxDots,
darkMode, musicMode, highLightType,} = params;
const DotInteractionType = Object.freeze({ NONE: 'None', BASE: 'Base', GROUP: 'Group', FUSE: 'Fuse', });
const LinkInteractionType = Object.freeze({ NONE: 'None', ALL: 'All', HEAD: 'Head', FAMILY: 'Family', });

let colParams = {dot: DotInteractionType.NONE, link: LinkInteractionType.NONE};
//	PARAMS

menuBlock = null;
menuDropRate = .001;
menulastDotsDrop = 0;
menuDropX = 0;
menuDropDir = 1;
isMobile = false;
velTiltX = 0;
velTiltY = 0;
velSensibility = 10;
infoText = null;
//	UI

keys = {};
mousePressed = false;
mouseX = window.innerWidth / 2;
mouseY = window.innerHeight / 2;
mouseDX = 0;
mouseDY = 0;
timeClick = 0;
//	INPUT

dotsAlive = 0;
dots = [];
menuDots = [];
dots_destroyed = [];
lastDotsDrop = 0;
linkHeads = [];
selDot = null;
//	DOTS

boxes = [];
prvBox = null;
curBox = null;
selBox = null;
tpa = null, tpb = null;
//	BOXES

curShape = null;
shapes = [];
lineSpeed = 2;
//	SHAPES
