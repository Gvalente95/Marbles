function createButton({ labelText, id, value, onChange, keyBind = null }) {
	let currentValue = value;

	const button = document.createElement("button");
	button.id = id;
	button.className = "button";
	button.style.userSelect = "none";
	button.style.display = "flex";
	button.style.alignItems = "center";
	button.style.justifyContent = "flex-start";
	button.style.margin = "4px 0";
	button.style.padding = "0";
	button.style.height = "32px";
	button.style.width = "100%";
	button.style.border = "none";
	button.style.cursor = "pointer";
	button.style.overflow = "hidden";
	button.style.fontSize = "14px";
	button.style.color = "black";

	const onColor = "rgba(28, 194, 95, 0.67)";
	const offColor = "rgba(187, 36, 36, 0.61)";
	button.style.backgroundColor = currentValue == null ? "rgba(171, 102, 102, 0.61)" : currentValue ? onColor : offColor;

	// Keybind section (left side)
	const keyDiv = document.createElement("div");
	keyDiv.textContent = keyBind ? keyBind : "";
	keyDiv.style.width = "15%";
	keyDiv.style.height = "100%";
	keyDiv.style.display = "flex";
	keyDiv.style.alignItems = "center";
	keyDiv.style.justifyContent = "center";
	keyDiv.style.backgroundColor = "rgba(0,0,0,0.1)";
	keyDiv.style.color = "black";
	keyDiv.style.fontSize = "0.85em";

	// Label section (right side)
	const labelDiv = document.createElement("div");
	labelDiv.textContent = labelText;
	labelDiv.style.width = "72%";
	labelDiv.style.height = "100%";
	labelDiv.style.display = "flex";
	labelDiv.style.alignItems = "center";
	labelDiv.style.paddingLeft = "64px";
	button.appendChild(keyDiv);
	button.appendChild(labelDiv);

	const toggle = () => {
		onChange(currentValue);
		au.playSound(au.click);
		if (currentValue != null)
		{
			currentValue = !currentValue;
			button.style.backgroundColor = currentValue ? onColor : offColor;
		}
		else
		{
			const prvClr = button.style.backgroundColor;
			button.style.backgroundColor = "black";
			setTimeout(() => button.style.backgroundColor = prvClr);
		}
	};
	button.onclick = toggle;
	if (keyBind) {
		document.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() === keyBind.toLowerCase()) toggle();
		});
	}
	return button;
}

function createSlider({ labelText, id, min, max, step, value, onChange }) {
	const label = document.createElement("label");
	label.style.userSelect = "none";
	label.style.display = "flex";
	label.style.alignItems = "center";
	label.style.gap = "8px";
	label.style.margin = "4px 0";

	const labelSpan = document.createElement("span");
	labelSpan.textContent = labelText + ":";
	labelSpan.style.minWidth = "70px";
	labelSpan.style.color = "rgba(0, 0, 0, 0.84)";

	const slider = document.createElement("input");
	slider.type = "range";
	slider.id = id;
	slider.min = min;
	slider.max = max;
	slider.step = step;
	slider.value = value;
	slider.style.flex = "1";
	slider.style.backgroundColor = "rgba(0, 0, 0, 0.73)";

	const valueDisplay = document.createElement("span");
	valueDisplay.id = id + "Value";
	valueDisplay.textContent = value;
	valueDisplay.style.width = "40px";
	valueDisplay.style.textAlign = "right";
	valueDisplay.style.color = "rgba(0, 0, 0, 0.76)";

	slider.addEventListener("input", () => {	
		valueDisplay.textContent = slider.value;
		onChange(parseFloat(slider.value));
	});

	label.appendChild(labelSpan);
	label.appendChild(slider);
	label.appendChild(valueDisplay);
	return label;
}

let hasMovedControls = false;
let pendingFrame = false;
let isDraggingControls = false;
function moveControls(controls)
{
	controls.addEventListener("mousedown", (e) => {
		if (e.target.tagName === 'INPUT' ||
		e.target.tagName === 'BUTTON' ||
		e.target.closest('.ui')) return;
		isDraggingControls = true;
		const width = controls.offsetWidth;
		const height = controls.offsetHeight;
		offsetX = e.clientX - controls.offsetLeft;
		offsetY = e.clientY - controls.offsetTop;
		controls.maxLeft = window.innerWidth - width;
		controls.maxTop = window.innerHeight - height;
		controls.style.cursor = "move";
	});

	document.addEventListener("mousemove", (e) => {
		if (!isDraggingControls) return;

		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
		if (!pendingFrame) {
			pendingFrame = true;
			requestAnimationFrame(() => {
				const newLeft = Math.max(0, Math.min(controls.maxLeft, lastMouseX - offsetX));
				const newTop = Math.max(0, Math.min(controls.maxTop, lastMouseY - offsetY));
				controls.style.left = `${newLeft}px`;
				controls.style.top = `${newTop}px`;
				hasMovedControls = true;
				pendingFrame = false;
			});
		}
	});

	document.addEventListener("mouseup", () => {
		if (hasMovedControls) {
			setTimeout(() => hasMovedControls = false, 10);
		}
		isDraggingControls = false;
		controls.style.cursor = "default";
	});
}

function initSliders(contentWrapper)
{
	contentWrapper.appendChild(createSlider({
	labelText: "Click",
	id: "amountSlider",
	min: 1,
	max: 50,
	step: 1,
	value: params.amount,
	onChange: (v) => amount = v,
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "Rate",
	id: "rateSlider",
	min: .001,
	max: 1,
	step: .01,
	value: params.rate,
	onChange: (v) => rate = 1 - v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "Speed",
	id: "speedSlider",
	min: 10000,
	max: 100000,
	step: 1000,
	value: params.speed,
	onChange: (v) => speed = v,
	}));	

	contentWrapper.appendChild(createSlider({
	labelText: "minSize",
	id: "sizeSlider",
	min: 5,
	max: 50,
	step: 1,
	value: params.minSize,
	onChange: (v) => minSize = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "maxSize",
	id: "sizeSlider",
	min: 5,
	max: 200,
	step: 1,
	value: params.maxSize,
	onChange: (v) => maxSize = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "Stick-Stiffness",
	id: "stickStiffSlider",
	min: 0,
	max: 1,
	step: .01,
	value: params.stickStiff,
	onChange: (v) => stickStiff = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "yGravity",
	id: "yGravitySlider",
	min: -1,
	max: 1,
	step: .1,
	value: params.yGravity,
	onChange: (v) => yGravity = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "xGravity",
	id: "xGravitySlider",
	min: -1,
	max: 1,
	step: 0.1,
	value: params.xGravity,
	onChange: (v) => xGravity = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "xDrag",
	id: "DragSlider",
	min: 0,
	max: 0.1,
	step: 0.01,
	value: params.xDrag,
	onChange: (v) => xDrag = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "yDrag",
	id: "DragSlider",
	min: 0,
	max: 0.1,
	step: 0.01,
	value: params.yDrag,
	onChange: (v) => yDrag = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "Bounce",
	id: "bounceSlider",
	min: 0,
	max: 1,
	step: 0.01,
	value: params.bounceFactor,
	onChange: (v) => bounceFactor = v
	}));

	contentWrapper.appendChild(createSlider({
	labelText: "Max",
	id: "maxSlider",
	min: 5,
	max: 2500,
	step: 1,
	value: params.maxDots,
	onChange: (v) => maxDots = v
	}));
}

let activeBoxIndex = 1;
let boxType = "box_gelatine";
let	boxButtons = [];
function initButtons(contentWrapper, controls)
{
	contentWrapper.appendChild(createButton({
		labelText: "Reset",
		id: "ResetButton",
		value: null,
		onChange: (v) => reset(),
		keyBind: "R",
	}));

	contentWrapper.appendChild(createButton({
		labelText: "Audio",
		id: "SwitchAuButton",
		value: au.active,
		onChange: (v) => au.active = !au.active,
		keyBind: "A",
	}));

	contentWrapper.appendChild(createButton({
		labelText: "Self Collisions",
		id: "SelfCollisionsButton",
		value: selfCollision,
		onChange: (v) => selfCollision = !selfCollision,
		keyBind: "C",
	}));

	contentWrapper.appendChild(createButton({
		labelText: "Dark Mode",
		id: "DarkModeButton",
		value: darkMode,
		onChange: (v) => switchDarkMode(),
		keyBind: "D",
	}));

	contentWrapper.appendChild(createButton({
		labelText: "Music Mode",
		id: "MusicModeButton",
		value: musicMode,
		onChange: (v) => musicMode = !musicMode,
		keyBind: "M",
	}));
	const boxNames = ["Concrete", "Gelatine", "Magnetite", "Vortex", "Teleport", "None"];

	const ctrl_width = 65;
	for (let i = 0; i < 6; i++) {
		const boxButton = document.createElement("div");
		const typeClass = "box_" + boxNames[i].toLowerCase();
		boxButton.className = typeClass;
		boxButton.classList.add("boxButton");
		boxButton.textContent = boxNames[i];
		boxButton.style.width = ctrl_width;
		boxButton.style.left = (10 + i * ctrl_width) + "px";
		boxButton.onclick = () => {switchBoxButton(boxButton, i, typeClass);};
		boxButtons.push(boxButton);
		controls.appendChild(boxButton);
	}
}

function switchBoxButton(boxButton, newIndex, newTypeClass)
{
	au.playSound(au.click);
	boxType = newTypeClass;
	activeBoxIndex = newIndex;
	for (const b of boxButtons)
	{
		// b.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
		b.style.border = "1px solid rgba(255, 255, 255, 0.3)";
	}
	// boxButton.style.backgroundColor = "rgba(0, 255, 0, .8)";
	boxButton.style.border = "2px solid rgba(0, 245, 45, 0.99)";
}

function initUi()
{
	const controls = document.getElementById("controls");
	moveControls(controls);
	const header = document.createElement("div");
	header.id = "controlsHeader";
	header.textContent = "Controls";
	header.onclick = () => toggle_minimize_controls();
	controls.appendChild(header);
	contentWrapper = document.createElement("div");
	contentWrapper.className = "control-content";
	contentWrapper.id = "ControlWrapper";
	controls.appendChild(contentWrapper);
	const label = document.createElement("div");
	label.id = "controllLabel";
	contentWrapper.appendChild(label);
	contentWrapper.style.userSelect = "none";
	initSliders(contentWrapper);
	initButtons(contentWrapper, controls);
	[...controls.querySelectorAll("label, span, button")].forEach(el => el.style.color = "black");
	switchDarkMode(true);
}

const baseDark =  "rgb(38, 36, 39)";
const baseWhite = "rgb(231, 204, 248)";
function switchDarkMode(active = !darkMode) {
	darkMode = active;
	document.body.style.background = darkMode ? baseDark : baseWhite;

	const controls = document.getElementById("controls");
	if (!controls) return;

	const header = document.getElementById("controlsHeader");
	header.style.color = darkMode ? "white" : "black";

	if (darkMode) {
		controls.style.background = "rgba(255, 255, 255, 0.1)";
		controls.style.backdropFilter = "blur(10px)";
		controls.style.color = "white";
		[...controls.querySelectorAll("label, span, button")].forEach(el => el.style.color = "white");
	} else {
		controls.style.background = "rgba(255, 255, 255, 0.6)";
		controls.style.backdropFilter = "blur(10px)";
		controls.style.color = "black";
		[...controls.querySelectorAll("label, span, button")].forEach(el => el.style.color = "black");
	}
}

let minimize = false;
function toggle_minimize_controls(newMinimize = !minimize) {
	if (hasMovedControls)
		return;
	minimize = newMinimize;
	controls.classList.toggle("minimized", minimize);
	au.playGelSound();
}


let isResizing = false;
function addResizer(element, horDir, verDir) {
	const resizer = document.createElement("div");
	resizer.className = "resizer";
	resizer.style.position = "absolute";
	resizer.style.width = horDir && !verDir ? "10px" : "15px";
	resizer.style.height = verDir && !horDir ? "10px" : "15px";
	resizer.style.cursor =
		(horDir === "left" || horDir === "right" ? "ew-resize" : "") +
		(verDir === "top" || verDir === "bottom" ? (horDir ? "-" : "") + "ns-resize" : "");
	if (horDir === "left") resizer.style.left = "0";
	if (horDir === "right") resizer.style.right = "0";
	if (verDir === "top") resizer.style.top = "0";
	if (verDir === "bottom") resizer.style.bottom = "0";

	element.appendChild(resizer);

	const startResize = (startX, startY) => {
		const startWidth = element.offsetWidth;
		const startHeight = element.offsetHeight;
		const startLeft = element.offsetLeft;
		const startTop = element.offsetTop;
		isResizing = true;
		const onMove = (e) => {
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;
			if (horDir === "right") {
				element.width = Math.max(20, startWidth + (clientX - startX));
				element.style.width = element.width + "px";
			} else if (horDir === "left") {
				element.x = startLeft + (clientX - startX);
				element.width = Math.max(20, startWidth - (clientX - startX));
				element.style.width = element.width + "px";
				element.style.left = element.x + "px";
			}

			if (verDir === "bottom") {
				element.height = Math.max(20, startHeight + (clientY - startY));
				element.style.height = element.height + "px";
			} else if (verDir === "top") {
				element.y = startTop + (clientY - startY);
				element.height = Math.max(20, startHeight - (clientY - startY));
				element.style.height = element.height + "px";
				element.style.top = element.y + "px";
			}
		};

		const stopResize = () => {
			isResizing = false;
			document.removeEventListener("mousemove", onMove);
			document.removeEventListener("mouseup", stopResize);
			document.removeEventListener("touchmove", onMove);
			document.removeEventListener("touchend", stopResize);
		};

		document.addEventListener("mousemove", onMove);
		document.addEventListener("mouseup", stopResize);
		document.addEventListener("touchmove", onMove);
		document.addEventListener("touchend", stopResize);
	};

	resizer.addEventListener("mousedown", (e) => {
		e.preventDefault();
		startResize(e.clientX, e.clientY);
	});
	resizer.addEventListener("touchstart", (e) => {
		e.preventDefault();
		startResize(e.touches[0].clientX, e.touches[0].clientY);
	}, { passive: false });
}

function addResizers(element)
{
	addResizer(element, "left", "top");
	addResizer(element, "left", "bottom");
	addResizer(element, "right", "top");
	addResizer(element, "right", "bottom");
}