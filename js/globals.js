time = 0;
params = {
amount: 5, rate: .05, speed: 40000, yGravity: 0.5, xGravity: 0,
xDrag: 0.07, yDrag: 0, bounceFactor: .2, stickStiff: .05,
minSize: 2, maxSize: 50, maxDots: 1000,
selfCollision: true, darkMode: false, musicMode: true, highLightType: false,};
let {
amount, rate, speed, yGravity, xGravity,
xDrag, yDrag, bounceFactor, stickStiff, 
minSize, maxSize, maxDots,
selfCollision, darkMode, musicMode, highLightType,} = params;
const DotInteractionType = Object.freeze({ NONE: 'none', ATTRACT: 'attract', FUSE: 'fuse', REPEL: 'repel',});
dotSelf = DotInteractionType.NONE;
//	PARAMS

menuBlock = null;
menuDropRate = .001;
menulastDotsDrop = 0;
menuDropX = 0;
menuDropDir = 1;
isMobile = false;
infoText = null;
//	UI

keys = {};
mousePressed = false;
mouseX = 0;
mouseY = 0;
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
