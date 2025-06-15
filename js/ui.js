function createButton({ labelText, id, value, onChange }) {
	let currentValue = value;
	const button = document.createElement("button");
	button.style.userSelect = "none";
	button.style.display = "flex";
	button.style.alignItems = "center";
	button.style.gap = "8px";
	button.style.margin = "4px 0";
	button.className = "button";
	button.id = id;
	button.textContent = labelText;
	button.style.backgroundColor = currentValue ? "green" : "red";
	button.onclick = () => {
		currentValue = !currentValue;
		onChange(currentValue);
		button.style.backgroundColor = currentValue ? "green" : "red";
	};
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

	const slider = document.createElement("input");
	slider.type = "range";
	slider.id = id;
	slider.min = min;
	slider.max = max;
	slider.step = step;
	slider.value = value;
	slider.style.flex = "1";

	const valueDisplay = document.createElement("span");
	valueDisplay.id = id + "Value";
	valueDisplay.textContent = value;
	valueDisplay.style.width = "40px";
	valueDisplay.style.textAlign = "right";

	slider.addEventListener("input", () => {
		valueDisplay.textContent = slider.value;
		onChange(parseFloat(slider.value));
	});

	label.appendChild(labelSpan);
	label.appendChild(slider);
	label.appendChild(valueDisplay);
	return label;
}

function initSliders()
{
	const controls = document.getElementById("controls");
	controls.appendChild(createSlider({
	labelText: "Click",
	id: "amountSlider",
	min: 1,
	max: 50,
	step: 1,
	value: params.amount,
	onChange: (v) => amount = v
	}));

	controls.appendChild(createSlider({
	labelText: "minSize",
	id: "sizeSlider",
	min: 5,
	max: 50,
	step: 1,
	value: params.minSize,
	onChange: (v) => minSize = v
	}));

	controls.appendChild(createSlider({
	labelText: "maxSize",
	id: "sizeSlider",
	min: 5,
	max: 50,
	step: 1,
	value: params.maxSize,
	onChange: (v) => maxSize = v
	}));

	controls.appendChild(createSlider({
	labelText: "yGravity",
	id: "yGravitySlider",
	min: -1,
	max: 1,
	step: 0.01,
	value: params.yGravity,
	onChange: (v) => yGravity = v
	}));

	controls.appendChild(createSlider({
	labelText: "xGravity",
	id: "xGravitySlider",
	min: -1,
	max: 1,
	step: 0.01,
	value: params.xGravity,
	onChange: (v) => xGravity = v
	}));

	controls.appendChild(createSlider({
	labelText: "xDrag",
	id: "DragSlider",
	min: 0,
	max: 0.1,
	step: 0.001,
	value: params.xDrag,
	onChange: (v) => xDrag = v
	}));

	controls.appendChild(createSlider({
	labelText: "yDrag",
	id: "DragSlider",
	min: 0,
	max: 0.1,
	step: 0.001,
	value: params.yDrag,
	onChange: (v) => yDrag = v
	}));

	controls.appendChild(createSlider({
	labelText: "Bounce",
	id: "bounceSlider",
	min: 0,
	max: 1,
	step: 0.01,
	value: params.bounceFactor,
	onChange: (v) => bounceFactor = v
	}));

	controls.appendChild(createSlider({
	labelText: "Max",
	id: "maxSlider",
	min: 5,
	max: 5000,
	step: 1,
	value: params.maxDots,
	onChange: (v) => maxDots = v
	}));
}

function initButtons()
{
	controls.appendChild(createButton({
		labelText: "Delete Dots",
		id: "DeleteButton",
		value: false,
		onChange: (v) => deleteDots(),
	}));

	controls.appendChild(createButton({
		labelText: "SwitchAu",
		id: "SwitchAuButton",
		value: au.active,
		onChange: (v) => au.active = !au.active,
	}));

	controls.appendChild(createButton({
		labelText: "Self Collisions",
		id: "SelfCollisionsButton",
		value: selfCollision,
		onChange: (v) => selfCollision = !selfCollision,
	}));
}