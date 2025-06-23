let hasMovedControls = false;
let pendingFrame = false;
let isDraggingControls = false;
function moveControls(controls, xCenter, yCenter)
{
	const rect = controls.getBoundingClientRect();
	const newLeft = xCenter - rect.width / 2;
	const newTop = yCenter - rect.height / 2;
	controls.style.left = `${newLeft}px`;
	controls.style.top = `${newTop}px`;
	controls.style.width = 200 + "px";
}

function initDragControls(controls)
{
	controls.addEventListener("mousedown", (e) => {
		if (isResizing || e.target.tagName === 'INPUT' ||
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
		if (isResizing || !isDraggingControls) return;

		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
		if (!pendingFrame) {
			pendingFrame = true;
			requestAnimationFrame(() => {
				if (!keys["Shift"])
					return;
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

function switchBoxButton(newIndex)
{
	au.playSound(au.click);
	activeBoxIndex = newIndex;
	const boxButton = boxButtons[activeBoxIndex];
	boxType = boxButton.type;
	for (const b of boxButtons)
	{
		b.style.border = "0px solid rgba(255, 255, 255, 0)";
		b.style.opacity = ".5";
	}
	boxButton.style.border = "2px solid rgba(0, 245, 45, 0.75)";
	boxButton.style.opacity = "1";
}

const baseDark =  "rgb(38, 36, 39)";
const baseWhite = "rgb(231, 204, 248)";
function switchDarkMode(active = !darkMode) {
	darkMode = active;
	// document.body.style.background = darkMode ? baseDark : baseWhite;
	if (darkMode) document.body.style.background = "linear-gradient(to bottom, rgb(35, 20, 37), rgb(13, 12, 20))";
	else document.body.style.background = "linear-gradient(to bottom, rgb(196, 165, 213), rgb(153, 151, 209))";

	const controls = document.getElementById("controls");
	if (!controls) return;

	const header = document.getElementById("controlsHeader");
	header.style.color = darkMode ? "white" : "black";

	if (darkMode) {
		controls.style.background = "rgba(255, 255, 255, 0.05)";
		controls.style.backdropFilter = "blur(10px)";
		controls.style.color = "white";
		[...controls.querySelectorAll("label, span, button")].forEach(el => el.style.color = "rgba(232, 218, 244, 0.81)");
	} else {
		controls.style.background = "rgba(0, 0, 0, 0.05)";
		controls.style.backdropFilter = "blur(10px)";
		controls.style.color = "black";
		[...controls.querySelectorAll("label, span, button")].forEach(el => el.style.color = "rgba(0, 0, 0, 0.78)");
	}
}

let minimize = false;
function toggle_minimize_controls(newMinimize = !minimize) {
	if (hasMovedControls)
		return;
	minimize = newMinimize;
	controls.classList.toggle("minimized", minimize);
	controls.style.opacity = minimize ? "0.5" : "1";
	controls.style.width = minimize ? controls.fullWidth / 2 : controls.fullWidth;
	controls.header.style.backgroundColor = minimize ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.06), 0)";
	au.playGelSound();
}

function switchMenuMode(on = !menuBlock.active)
{
	const controls = document.getElementById("controls");
	const contentWrapper = document.getElementById("ControlWrapper");
	if (!on)
		menuBlock.started = true;
	contentWrapper.style.visibility = on ? "hidden" : "visible";
	contentWrapper.style.pointerEvents = on ? "none" : "auto";
	controls.style.visibility = on ? "hidden" : "visible";
	controls.style.pointerEvents = on ? "none" : "auto";
	menuBlock.active = on;
	menuBlock.style.animation = on
		? "fadeIn 1s ease forwards" 
		: "fadeOut 0.2s ease forwards";
	menuBlock.style.pointerEvents = on ? "auto" : "none";
	menuBlock.offsetHeight;
	toggle_minimize_controls(true);
}

function switchMenuPage(pageIndex, force = false)
{
	if (!force && contentWrapper.pageIndex == pageIndex) return;
	const button = document.getElementById("SwitchPageButton");
	const colorA = pageIndex == 1 ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.3)";
	const colorB = pageIndex == 1 ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.15)";
	button.style.background = `linear-gradient(to right, 
		rgba(132, 132, 132, 0.49) 0%,
		rgba(132, 132, 132, 0.49) 16%,	
		${colorA} 16%, 
		${colorA} 50%, 
		${colorB} 50%, 
		${colorB} 100%)`;

	contentWrapper.pageIndex = pageIndex;
	[...controls.querySelectorAll("label, span, button")].forEach(el => el.classList.toggle("hidden", !(el.pageIndex === pageIndex || el.pageIndex == -1)));
}

function addResizers(element)
{
	addResizer(element, "left", "top");
	addResizer(element, "left", "bottom");
	addResizer(element, "right", "top");
	addResizer(element, "right", "bottom");
}

let rotating = false;
function addRotator(element) {
	const rotator = document.createElement("div");
	rotator.className = "rotator";
	rotator.style.position = "absolute";
	rotator.style.width = "10px";
	rotator.style.height = "10px";
	rotator.style.borderRadius = "50%";
	rotator.style.background = "rgba(255, 0, 0, 0.3)";
	rotator.style.cursor = "grab";
	rotator.style.left = "50%";
	rotator.style.top = "50%";
	rotator.style.transform = "translateX(-50%)";
	element.appendChild(rotator);
	rotating = false;
	let center = {};
	const getAngle = (x, y) => {
		const dx = x - center.x;
		const dy = y - center.y;
		return Math.atan2(dy, dx) * (180 / Math.PI);
	};
	rotator.addEventListener("mousedown", (e) => {
		e.preventDefault();
		rotating = true;
		const rect = element.getBoundingClientRect();
		center = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2
		};
	});
	document.addEventListener("mousemove", (e) => {
		if (!rotating) return;
		if (element != selBox)
			return;
		const angle = getAngle(e.clientX, e.clientY);
		element.style.transform = `rotate(${angle}deg)`;
		element.angle = angle;
	});
	document.addEventListener("mouseup", () => {
		rotating = false;
	});
}

let isResizing = false;
function addResizer(element, horDir, verDir, minW = 20, maxW = Infinity, minH = 20, maxH = Infinity) {
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
				const newW = startWidth + (clientX - startX);
				if (newW < minW || newW > maxW)
					return;
				element.width = newW;
				element.style.width = element.width + "px";
			} else if (horDir === "left") {
				const newW = startWidth - (clientX - startX);
				if (newW < minW || newW > maxW)
					return;
				element.x = startLeft + (clientX - startX);
				element.width = newW;
				element.style.width = element.width + "px";
				element.style.left = element.x + "px";
			}

			if (verDir === "bottom") {
				const newH = startHeight + (clientY - startY);
				if (newH < minH || newH > maxH)
					return;
				element.height = newH;
				element.style.height = element.height + "px";
			} else if (verDir === "top") {
				const newH = startHeight - (clientY - startY);
				if (newH < minH || newH > maxH)
					return;
				element.y = startTop + (clientY - startY);
				element.height = newH;
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

function addInfoBox(element, infoOrFn)
{
	if (!infoOrFn) return;

	const infoBox = document.createElement("div");
	infoBox.className = "infoBox";
	document.body.appendChild(infoBox);

	const updateText = () => {
		infoBox.textContent = (typeof infoOrFn === "function") ? infoOrFn() : infoOrFn;
		const rect = infoBox.getBoundingClientRect();
		infoBox.w = rect.width;
		infoBox.h = rect.height;
	};

	element.addEventListener("mousemove", () => {
		if (isDraggingControls) {
			infoBox.style.visibility = "hidden";
			return;
		}
		updateText();
		infoBox.style.visibility = "visible";
		infoBox.style.left = minmax(0, window.innerWidth - infoBox.w, mouseX - infoBox.w / 2) + "px";
		infoBox.style.top = minmax(0, window.innerHeight - infoBox.h, mouseY - infoBox.h - 15) + "px";
	});

	element.addEventListener("mouseleave", () => {
		infoBox.style.visibility = "hidden";
	});
}

function attachHandleInfoBox(slider) {
	const infoBox = document.createElement("div");
	infoBox.className = "infoBox";
	infoBox.style.position = "absolute";
	infoBox.style.visibility = "hidden";
	infoBox.style.pointerEvents = "none";
	document.body.appendChild(infoBox);
	function updateInfoBox() {
		const rect = slider.getBoundingClientRect();
		const percent = (slider.value - slider.min) / (slider.max - slider.min);
		const x = rect.left + rect.width * percent;
		const y = rect.top;
		infoBox.textContent = slider.value;
		infoBox.style.left = (x - infoBox.offsetWidth / 2) + "px";
		infoBox.style.top = (y - 42) + "px";
	}
	slider.addEventListener("input", () => {
		infoBox.style.visibility = "visible";
		updateInfoBox();
	});
	slider.addEventListener("mouseleave", () => {
		infoBox.style.visibility = "hidden";
	});
	slider.addEventListener("mouseenter", () => {
		infoBox.style.visibility = "hidden";
	});
}
