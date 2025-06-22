function setAlphaColor(rgb, alpha = 0.1) {
	const match = rgb.match(/\d+/g);
	if (!match) return `rgba(117, 166, 187, ${alpha})`;
	const [r, g, b] = match;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createDotImpact(dot) {
	let x = dot.newX + dot.velocityX * 2 + dot.radius;
	let y = dot.newY + dot.velocityY * 2 + dot.radius;
	const color = setAlphaColor(dot.baseColor || dot.style.backgroundColor, 0.3);
	createGelRipple(null, x, y, dot.radius * 2, .5, color);
}

function createGelRipple(box, x, y, radius = 20, dur = .5, color = "rgba(60, 141, 175, 0.41)") {
	const ripple = document.createElement("div");
	ripple.style.position = "absolute";
	ripple.style.width = radius + "px";
	ripple.style.height = radius + "px";
	ripple.style.left = x - radius / 2 + "px";
	ripple.style.top = y - radius / 2 + "px";
	ripple.style.borderRadius = "50%";
	ripple.style.background = color;
	ripple.style.transform = "scale(1)";
	ripple.style.animation = `gelRipple ${dur}s ease-out`;
	ripple.style.zIndex = 2;
	if (box)
		box.appendChild(ripple);
	else
		document.body.appendChild(ripple);
	ripple.addEventListener("animationend", () => ripple.remove());
}
