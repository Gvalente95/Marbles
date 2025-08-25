params = {
amount: 5,
rate: .05,
speed: 40000,
yGravity: 0.5,
xGravity: 0,
xDrag: 0.07,
yDrag: 0,
bounceFactor: .2,
stickStiff: .05,
minSize: 2,
maxSize: 50,
maxDots: 1000,
selfCollision: true,
darkMode: false,
musicMode: true,
highLightType: false,
};
let {
amount,
rate,
speed,
stickStiff,
yGravity,
xGravity,
xDrag,
yDrag,
bounceFactor,
minSize,
maxSize,
maxDots,
selfCollision,
darkMode,
musicMode,
highLightType,
} = params;

dotsAlive = 0;
time = 0;
dots = [];
menuDots = [];
dots_destroyed = [];
boxes = [];
prvBox = null;
dropTime = 0;
curBox = null;
keys = {};
mousePressed = false;
mouseX = 0;
mouseY = 0;
mouseDX = 0;
mouseDY = 0;
timeClick = 0;
linkHeads = [];
isGrowingDot = false;
clickStartTime = 0;
selDot = null;
selBox = null;
sel = null;
tpa = null, tpb = null;
curShape = null;
shapes = [];
lineSpeed = 2;
menuBlock = null;
menuDropRate = .001;
menuDropTime = 0;
menuDropX = 0;
menuDropDir = 1;
isMobile = false;
infoText = null;