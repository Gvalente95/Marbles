function r_range(min, max){
	return (min + Math.floor(Math.random() * (max - min)));}

function f_range(min, max){
	return (min + Math.random() * (max - min));}

function minmax(min, max, value){
	return Math.max(min, Math.min(max, value));}

function lerp(a, b, t) {return a + (b - a) * t;}

function rotate(velocity, angle) {
	return {
		x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
		y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
	};}

function getRevAngle(angle) {
	return (angle + Math.PI) % (2 * Math.PI);
}
	

function setVelTilt() {
    let velX = 0, velY = 0;

	if (typeof window.DeviceMotionEvent !== "undefined" && typeof window.DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission().then(permissionState => {
            if (permissionState === "granted") {
                window.addEventListener("devicemotion", (event) => {
                    const { x, y, z } = event.accelerationIncludingGravity;
                    const magnitude = Math.sqrt(x * x + y * y + z * z);
                    velX = -x / magnitude; // Normalize and invert x for intuitive tilt
                    velY = -y / magnitude; // Normalize and invert y for intuitive tilt
                    // Clamp to -1 to 1
                    velX = Math.max(-1, Math.min(1, velX));
                    velY = Math.max(-1, Math.min(1, velY));
                }, { once: true });
            }
        }).catch(console.error);
	} else if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", (event) => {
			let { x, y, z } = event.accelerationIncludingGravity;
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            velX = -x / magnitude; // Normalize and invert x
            velY = -y / magnitude; // Normalize and invert y
            // Clamp to -1 to 1
            velX = Math.max(-1, Math.min(1, velX));
            velY = Math.max(-1, Math.min(1, velY));
        }, { once: true });
    }
	velTiltX = velX;
	velTiltY = velY;
}