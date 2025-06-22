let hasInteracted = false;

function onUserInteraction() {
	if (hasInteracted) return;
	hasInteracted = true;
	console.log("User interacted with the page!");
	removeInteractionListeners();
}

function addInteractionListeners() {
	window.addEventListener("keydown", onUserInteraction);
	window.addEventListener("mousedown", onUserInteraction);
	window.addEventListener("touchstart", onUserInteraction);
	window.addEventListener("mousemove", onUserInteraction);
	window.addEventListener("wheel", onUserInteraction);
}

function removeInteractionListeners() {
	window.removeEventListener("keydown", onUserInteraction);
	window.removeEventListener("mousedown", onUserInteraction);
	window.removeEventListener("touchstart", onUserInteraction);
	window.removeEventListener("mousemove", onUserInteraction);
	window.removeEventListener("wheel", onUserInteraction);
}

addInteractionListeners();