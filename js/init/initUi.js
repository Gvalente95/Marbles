function createButton({ labelText, id, value, pageIndex, onChange, keyBind = null , info = null}) {
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
	button.style.height = isMobile ? "64px" : "32px";
	button.style.width = "100%";
	button.style.border = "none";
	button.style.cursor = "pointer";
	button.style.overflow = "hidden";
	button.style.fontSize = "14px";
	button.style.color = "black";
	button.pageIndex = pageIndex;
	const onColor = "rgba(28, 194, 95, 0.3)";
	const offColor = "rgba(187, 36, 36, 0.3)";
	button.style.backgroundColor = currentValue == null ? "rgba(132, 132, 132, 0.2)" : currentValue ? onColor : offColor;
	button.baseColor = button.style.backgroundColor;

	if (keyBind)
	{
		// Keybind section (left side)
		const keyDiv = document.createElement("div");
		keyDiv.textContent = keyBind ? keyBind : "";
		keyDiv.style.width = 50 + "px";
		keyDiv.style.fontSize = controls.style.fontSize;
		keyDiv.style.height = "100%";
		keyDiv.style.display = "flex";
		keyDiv.style.alignItems = "center";
		keyDiv.style.justifyContent = "center";
		keyDiv.style.backgroundColor = "rgba(0,0,0,0.1)";
		keyDiv.style.color = "black";
		button.appendChild(keyDiv);
	}

	// Label section (right side)
	const labelDiv = document.createElement("div");
	labelDiv.textContent = labelText;
	labelDiv.style.flex = "1";                     // prend toute la largeur dispo
	labelDiv.style.height = "100%";
	labelDiv.style.display = "flex";
	labelDiv.style.alignItems = "center";
	labelDiv.style.justifyContent = "center";      // CENTRE LE TEXTE HORIZONTALEMENT
	labelDiv.style.textAlign = "center";           // Sécurité pour le multiline
	if (isMobile)
		labelDiv.style.fontSize = controls.style.fontSize;
	labelDiv.pageIndex = pageIndex;
	button.labelDiv = labelDiv;
	button.appendChild(labelDiv);

	addInfoBox(button, info);
	const toggle = () => {
		onChange(currentValue);
		au.playSound(au.click);
		if (value != -1)
		{
			if (currentValue != null)
			{
				currentValue = !currentValue;
				button.style.backgroundColor = currentValue ? onColor : offColor;
			}
			else
			{
				button.style.backgroundColor = "rgba(0, 0, 0, 0.17)";
				setTimeout(() => button.style.backgroundColor = button.baseColor, 100);
			}
		}
	};
	button.onclick = toggle;
	button.addEventListener("keydown", (e) => {if (e.key === " ") e.preventDefault(); e.stopPropagation();});
	button.addEventListener("click", () => {button.blur();});
	if (keyBind) {
		document.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() === keyBind.toLowerCase()) {
				toggle();
				if (pageIndex >= 0) switchMenuPage(pageIndex, false);}
		});
	}
	return button;
}

function createSlider({ labelText, info, id, min, max, step, value, pageIndex, onChange }) {
	const label = document.createElement("label");
	label.pageIndex = pageIndex;

	const labelSpan = document.createElement("span");
	labelSpan.textContent = labelText;
	labelSpan.style.minWidth = (isMobile ? 200 : 70) + "px";
	labelSpan.style.color = "rgba(0, 0, 0, 0.84)";
	labelSpan.pageIndex = pageIndex;
	labelSpan.style.marginRight = "20px";

	const slider = document.createElement("input");
	slider.type = "range";
	slider.id = id;
	slider.min = min;
	slider.style.thump = "5px";
	slider.style.marginTop = isMobile ? "40px" : "5px";
	slider.max = max;
	slider.step = step;
	slider.value = value;
	if (isMobile)
		slider.style.height = "24px";
	slider.style.flex = "1";
	slider.style.backgroundColor = "rgba(0, 0, 0, 0.73)";
	addInfoBox(slider, info + " [" + min + " - " + max + "]");
	const valueDisplay = document.createElement("span");
	valueDisplay.id = id + "Value";
	valueDisplay.textContent = value;
	valueDisplay.style.width = "40px";
	valueDisplay.style.color = "rgba(0, 0, 0, 0.76)";

	attachHandleInfoBox(slider, () => slider.value);
	slider.addEventListener("input", () => {	
		au.playSound(au.dig);
		valueDisplay.textContent = slider.value;
		onChange(parseFloat(slider.value));
	});
	if (labelText === "Max. Size" || labelText === "Min. Size")
		slider.addEventListener("mouseup", () =>{ resizeDots();});
	label.appendChild(labelSpan);
	label.appendChild(slider);
	label.appendChild(valueDisplay);
	return label;
}

function initBoxButtons()
{
	const boxNames = ["Concrete", "Gelatine", "Magnetite", "Vortex", "Teleport", "None"];
	const rect = controls.getBoundingClientRect();
	const w = (rect.width - 20) / 6;
	for (let i = 0; i < 6; i++) {
		const boxButton = document.createElement("div");
		boxButton.type = boxNames[i];
		boxButton.className = boxButton.type;
		boxButton.classList.add("boxButton");
		boxButton.textContent = boxNames[i];
		boxButton.style.borderRadius = "0";
		if (boxButton.textContent === "Teleport")
			boxButton.style.background = "linear-gradient(to right, rgba(57, 204, 116, 0.3) 50%, rgba(255, 0, 0, 0.33) 50%)";
		boxButton.style.width = w + "px";
		boxButton.style.top = "100%";
		boxButton.style.left = 10 + (i * w) + "px";
		boxButton.onclick = () => { switchBoxButton(i); };
		addInfoBox(boxButton, boxNames[i]);
		boxButtons.push(boxButton);
		contentWrapper.appendChild(boxButton);
	}
}

function initSetButton()
{
	const setButton = createButton({
		labelText: "Keys" + "\u00A0".repeat(20) + "Controls",
		id: "SwitchPageButton",
		value: null,
		pageIndex: -1,
		onChange: (v) => { switchMenuPage((contentWrapper.pageIndex + 1) % 2); },
		keyBind: "P",
		info: null,
	});
	setButton.setAttribute("tabindex", "-1");
	setButton.style.pointerEvents = "auto";
	setButton.style.userSelect = "none";  

	emptySpace = document.createElement("div");
	emptySpace.style.height = "20px";
	contentWrapper.appendChild(emptySpace);
	setButton.style.background = "linear-gradient(to right, \
	rgba(132, 132, 132, 0.49) 0%, \
	rgba(0, 0, 0, 0.3) 20%, \
	rgba(0, 0, 0, 0.15) 50%)";

	setButton.labelDiv.style.paddingLeft = "32px";
	setButton.style.top = "120%";
	contentWrapper.appendChild(setButton);
}

function initSliders()
{
	addHeaderInfo("INPUT", "INPUT", 0, 10);
	contentWrapper.appendChild(createSlider({
	labelText: "Click Force",
	info: "How many new dots per click.",
	id: "amountSlider",
	min: 1,
	max: 50,
	step: 1,
	value: params.amount,
	pageIndex: 0,
	onChange: (v) => amount = v,
	})); // click force
	contentWrapper.appendChild(createSlider({
	labelText: "Spawn Rate",
	info: "How often dots are created while mouse is pressed.",
	id: "rateSlider",
	min: .001,
	max: 1,
	step: .01,
	value: params.rate,
	pageIndex: 0,
	onChange: (v) => rate = 1 - v
	})); // spawn rate
	addHeaderInfo("PHYSICS", "PHYSICS", 20, 10);
	contentWrapper.appendChild(createSlider({
	labelText: "Time Scale",
	id: "speedSlider",
	info: "Controls the speed of the whole simulation, great for slow-mo' effect!",
	min: 10000,
	max: 100000,
	step: 1000,
	value: params.speed,
	pageIndex: 0,
	onChange: (v) => speed = v,
	})); // Time Scale
	contentWrapper.appendChild(createSlider({
	labelText: "Gravity X",
	id: "xGravitySlider",
	info: "Horizontal gravity modifier",
	min: -1,
	max: 1,
	step: 0.1,
	value: params.xGravity,
	pageIndex: 0,
	onChange: (v) => xGravity = v
	})); // xGrav
	contentWrapper.appendChild(createSlider({
	labelText: "Gravity Y",
	id: "yGravitySlider",
	info: "Vertical gravity modifier",
	min: -1,
	max: 1,
	step: .1,
	value: params.yGravity,
	pageIndex: 0,
	onChange: (v) => yGravity = v
	})); // yGrav
	contentWrapper.appendChild(createSlider({
	labelText: "Drag X",
	id: "DragSlider",
	info: "Controls the ammount of horizontal velocity loss due to collisions applied to dots",
	min: 0,
	max: .99,
	step: 0.01,
	value: params.xDrag,
	pageIndex: 0,
	onChange: (v) => xDrag = v
	})); // xDrag
	contentWrapper.appendChild(createSlider({
	labelText: "Drag Y",
	id: "DragSlider",
	info: "Controls the ammount of vertical velocity loss due to collisions applied to dots",
	min: 0,
	max: .99,
	step: 0.01,
	value: params.yDrag,
	pageIndex: 0,
	onChange: (v) => yDrag = v
	})); // yDrag
}

let activeBoxIndex = 1;
let boxType = "Gelatine";
let boxButtons = [];
function initControlButtons()
{
	contentWrapper.appendChild(createButton({
			labelText: "Highlight Velocity",
			id: "highLightTypeocityButton",
			value: 0,
			pageIndex: 1,
			onChange: (v) => { this.value = !this.value;  switchHighlightType()},
			keyBind: "H",
			info: "Map the color of each dot to it's velocity",
	})); // Highlight Velocity
	contentWrapper.appendChild(createButton({
		labelText: "Audio",
		id: "SwitchAuButton",
		value: 1,
		pageIndex: 1,
		onChange: (v) => au.active = !au.active,
		keyBind: "A",
		info: "Enable/Disable audio",
	})); // audio
	contentWrapper.appendChild(createButton({
		labelText: "Music Mode",
		id: "MusicModeButton",
		value: musicMode,
		pageIndex: 1,
		onChange: (v) => musicMode = !musicMode,
		keyBind: "M",
		info: "enable/disable musical notes on dots impact",
	})); // music mode
	contentWrapper.appendChild(createButton({
		labelText: "Dark Mode",
		id: "DarkModeButton",
		value: darkMode,
		pageIndex: 1,
		onChange: (v) => switchDarkMode(),
		keyBind: "D",
		info: "enable/disable dark mode",
	})); // Dark Mode
	contentWrapper.appendChild(createButton({
		labelText: "Reset",
		id: "ResetButton",
		value: null,
		pageIndex: 1,
		onChange: (v) => reset(),
		keyBind: "R",
		info: "Delete all dots, boxes and shapes",
	})); // reset
	contentWrapper.appendChild(createButton({
			labelText: "Delete All Dots",
			id: "DeleteAllDotsButton",
			value: null,
			pageIndex: 1,
			onChange: (v) => { deleteDots()},
			keyBind: "X",
			info: "Delete all the dots",
	})); // Delete Dots
	contentWrapper.appendChild(createButton({
		labelText: "DeleteBoxes",
		id: "DeleteAllBoxesButton",
		value: null,
		pageIndex: 1,
		onChange: (v) => deleteBoxes(),
		keyBind: "B",
		info: "Delete all the boxes",
	})); // Delete Boxes
	contentWrapper.appendChild(createButton({
			labelText: "Repel",
			id: "RepelDotsButton",
			value: null,
			pageIndex: 1,
			onChange: (v) => { repelDots([mouseX, mouseY])},
			keyBind: "O",
			info: "Repel elements close to the cursor's position",
	})); // Repel Dots
	contentWrapper.appendChild(createButton({
		labelText: "Attach Boxes",
		id: "GroupBoxesButton",
		value: null,
		pageIndex: 1,
		onChange: (v) => groupBox(getBoxAtPos(mouseX, mouseY), false),
		keyBind: "G",
		info: "Attach all boxes connected to the one behind the cursor",
	})); // Attach boxes
	contentWrapper.appendChild(createButton({
		labelText: "Dettach Boxes",
		id: "DetachBoxesButton",
		value: null,
		pageIndex: 1,
		onChange: (v) => groupBox(getBoxAtPos(mouseX, mouseY), true),
		keyBind: "F",
		info: "Dettach all boxes connected to the one behind the cursor",
	})); // Detach boxes
}

function addLeter(letter)
{
	const label = document.createElement("div");
	label.className = "titleLetter";
	label.textContent = letter;
	label.style.position = "relative";
	label.pointerEvents = "block";
	label.style.zIndex = "9999";
	label.style.animation = "zoom 1s";
	label.style.animation_timing_function = "ease-in-out";
	if (isMobile)
		label.style.fontSize = "10vh";
	return label;
}

function initStartMenu() {
	menuBlock = document.createElement("div");
	menuBlock.className = "menuBlock";
	menuBlock.style.top = "50%";
	menuBlock.style.left = "50%";
	menuBlock.id = "menuBlock";
	menuBlock.active = true;
	menuBlock.started = false;
	menuBlock.onclick = () => switchMenuMode();
	const text = "Marbles";
	menuBlock.appendChild(addLeter(text));
	const subText = document.createElement("div");
	subText.className = "subText";
	subText.textContent = "By Gvalente";
	subText.pointerEvents = "none";
	menuBlock.appendChild(subText);
	document.body.appendChild(menuBlock);
	// initGlass(menuBlock);
	return menuBlock;
}

function initGlass(menuBlock)
{
	const w = menuBlock.getBoundingClientRect().width * .7 ;
	const bw = 40;
	boxes.push(init_box(window.innerWidth / 2 - w - bw - 1, window.innerHeight - 500, bw, 500, "Concreet"));
	boxes.push(init_box(window.innerWidth / 2 + w + 15, window.innerHeight - 500, bw, 500, "Concrete"));
	boxes.push(init_box(window.innerWidth / 2 - w, window.innerHeight - bw, w * 2 + 15, bw, "Conceret"));
	boxes.forEach(b => { b.style.opacity = "0.1"; });
	boxes.push(init_box(window.innerWidth / 2 - w, window.innerHeight - bw - 200, w * 2 + 15, 200, "Gelatine"));
}

function init_infoText()
{
	infoText = document.createElement("div");
	infoText.className = "infoText";
	document.body.appendChild(infoText);
}

function initHeader()
{
	const header = document.createElement("div");
	header.id = "controlsHeader";
	header.textContent = "SETTINGS";
	header.style.width = controls.style.width;
	header.onclick = () => toggle_minimize_controls();
	controls.appendChild(header);
	controls.header = header;
}

function initContentWrapper()
{
	contentWrapper = document.createElement("div");
	contentWrapper.pageIndex = 0;
	contentWrapper.className = "control-content";
	contentWrapper.id = "ControlWrapper";
	controls.appendChild(contentWrapper);
	const label = document.createElement("div");
	label.id = "controllLabel";
	contentWrapper.appendChild(label);
	contentWrapper.style.userSelect = "none";
}

function initControls()
{
	const controls = document.getElementById("controls");
	controls.addEventListener("mouseenter", () => { controls.style.opacity = "1"; });
	controls.addEventListener("mouseleave", () => { if (!minimize) return; controls.style.opacity = ".5"; });
	if (isMobile)
	{
		controls.style.width = (window.innerWidth - 20) + "px";
		controls.style.left = "0px";
		controls.style.fontSize = "40px";
	}
	initDragControls(controls);
	addResizer(controls, "left", null, 300, 600);
	addResizer(controls, "right", null, 300, 600);
	controls.fullWidth = controls.style.width;
}

function initModesButton(label, enumType, valueRef, propName, startMode = undefined, pageIndex = 0, modeInfos)
{
	const modeContainer = document.createElement("div");
	modeContainer.className = "mode";
	modeContainer.style.display = "flex";
	modeContainer.style.flexDirection = "row";
	modeContainer.style.width = "100%";
	modeContainer.pageIndex = pageIndex;
	modeContainer.style.marginBottom = "5px";
	const buttons = [];
	const labelDiv = document.createElement("span");
	labelDiv.textContent = label;
	labelDiv.pageIndex = pageIndex;
	labelDiv.style.margin = "13px 0px";
	labelDiv.style.width = "80px";
	modeContainer.appendChild(labelDiv);
	const modeNames = Object.values(enumType);
	const width = 75 / modeNames.length;
	for (let i = 0; i < modeNames.length; i++)
	{
		const name = modeNames[i];
		const newButton = createButton({
			labelText: name,
			id: name,
			value: -1,
			pageIndex: pageIndex,
			onChange: () => { switchMode(buttons, name, valueRef, propName); },
			keyBind: null,
			info: modeInfos && i < modeInfos.length ? modeInfos[i] : "Set " + label + " to: " + name,
		});
		if (!isMobile)
		{
			newButton.style.marginTop = "8px";
			newButton.style.height = "25px";
		}
		newButton.style.width = width + "%";
		newButton.style.borderRadius = "0px";
		buttons.push(newButton);
		modeContainer.appendChild(newButton);
	}

	contentWrapper.appendChild(modeContainer);
	const initial = startMode ?? valueRef[propName] ?? modeNames[0];
	switchMode(buttons, initial, valueRef, propName);
	function switchMode(modeButtons, newMode, valueRef, propName) {
		valueRef[propName] = newMode;
		for (let i = 0; i < modeButtons.length; i++) {
			const b = modeButtons[i];
			b.style.backgroundColor = b.id === newMode ? b.baseColor : "rgba(0, 0, 0, 0.15)";
		}
		for (const d of dots) {
			d.style.backgroundColor = d.baseColor;
		}
	}
}

function addDotsSegment()
{
	addHeaderInfo("A circle with many properties that can interact with other elements.", "DOTS");
	const infoLabels = ["No Collisions", "Normal collisions", "Dot tend to stay attached", "Dot fuse together"];
	initModesButton("Collisions", DotInteractionType, colParams, "dot", DotInteractionType.BASE, 0, infoLabels);
	contentWrapper.appendChild(createSlider({
	labelText: "Min. Size",
	id: "sizeSlider",
	info: "Minimum size of newly-created dots.",
	min: 5, max: 200, step: 1,
	value: params.minSize,
	pageIndex: 0,
	onChange: (v) => minSize = v})); // minSize
	contentWrapper.appendChild(createSlider({
	labelText: "Max. Size",
	id: "sizeSlider",
	info: "Maximum size of newly-created dots.",
	min: 5, max: 200, step: 1,
	value: params.maxSize,
	pageIndex: 0,
	onChange: (v) => maxSize = v})); // maxSize
	contentWrapper.appendChild(createSlider({
	labelText: "Max amount",
	id: "maxSlider",
	info: "Limits the maximum amount of dots",
	min: 5, max: isMobile ? 100 : 3000, step: 1,
	value: params.maxDots,
	pageIndex: 0,
		onChange: (v) => maxDots = v
	})); // max dots
	contentWrapper.appendChild(createSlider({
	labelText: "Bounciness",
	id: "bounceSlider",
	info: "Dots bounciness modifier, make'em jump!",
	min: 0,
	max: 1,
	step: 0.01,
	value: params.bounceFactor,
	pageIndex: 0,
	onChange: (v) => bounceFactor = v
	})); // bounce
}

function addHeaderInfo(info, label, margTop = 20, margDown = 0)
{
	const labelDiv = document.createElement("div");
	addInfoBox(labelDiv, info);
	labelDiv.className = "mode";
	labelDiv.pageIndex = 0;
	labelDiv.textContent = label;
	labelDiv.style.marginTop = margTop + "px";
	labelDiv.style.marginBottom = margDown + "px";
	labelDiv.style.fontWeight = "bold";
	contentWrapper.appendChild(labelDiv);
}

function addLinkSegment()
{
	addHeaderInfo("Form an unbreakable chain of dots by clicking 'L' or by dragging them onto each-other.", "LINKS");
	const infoLabels = ["Link Dots won't collide with anything", "Link Dots will collide with everything", "Link Heads will collide with everything", "Link Dots won't collide with dots of the same chain"];
	initModesButton("Collisions", LinkInteractionType, colParams, "link", LinkInteractionType.ALL, 0, infoLabels);
	contentWrapper.appendChild(createButton({
		labelText: "Link all dots",
		id: "LinkAllButton",
		value: null,
		pageIndex: 0,
		onChange: (v) => linkAllDots(),
		keyBind: "L",
		info: "Link all dots together",
	})); // Link all dots
	contentWrapper.appendChild(createSlider({
	labelText: "Stick",
	id: "stickStiffSlider",
	info: "Controls how much glue is applied to dots linked together",
	min: 0, max: 1, step: .01,
	value: params.stickStiff,
	pageIndex: 0,
	onChange: (v) => stickStiff = v
	})); // stick
}
function initUi()
{
	initControls()
	initHeader();
	initContentWrapper();
	initSliders();
	initControlButtons();
	addDotsSegment();
	addLinkSegment();
	initSetButton();
	initBoxButtons();
	init_infoText();
	initStartMenu();
	switchDarkMode(false);
	switchMenuMode(true, true);
	switchMenuPage(0, true);
	switchBoxButton(1);
	if (!isMobile)
		moveControls(controls, 25, 40);
}
