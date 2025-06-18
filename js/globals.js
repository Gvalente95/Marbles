au = new AudioManager();
params = {
amount: 5,
rate: .05,
speed: 40000,
yGravity: 0.5,
xGravity: 0,
xDrag: 0.01,
yDrag: 0,
bounceFactor: 0.3,
stickStiff: .05,
minSize: 2,
maxSize: 50,
maxDots: 1000,
selfCollision: true,
darkMode: false,
musicMode: true,
};
let {
amount,
rate,
speed,
yGravity,
xGravity,
xDrag,
yDrag,
bounceFactor,
stickStiff,
minSize,
maxSize,
maxDots,
selfCollision,
darkMode,
musicMode,
} = params;

time = 0;
dots = [];
dots_destroyed = [];
boxes = [];
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
