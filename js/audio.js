class AudioManager {
	constructor() {
		this.lastPlayTime = Date.now();
		this.canPlay = true;
		this.active = true;
		this.playInterval = 0.01; // in seconds
		this.audioQueue = [];
		this.buttonOk = new Audio("ressources/audio/buttonOk.mp3");
		this.gameOn = new Audio("ressources/audio/gameOn.mp3");
		this.soundMove = new Audio("ressources/audio/Move.mp3");
		this.tuk = new Audio("ressources/audio/tuk.mp3");
		this.soundCapture = new Audio("ressources/audio/Capture.mp3");
		this.soundDenied = new Audio("ressources/audio/denied.mp3");
		this.trill = new Audio("ressources/audio/trill.mp3");
		this.init_marble_sounds();
	}

	init_marble_sounds()
	{
		const basePath = "ressources/audio/Marble/";
		const pitches = [ "-19", "-16", "-12", "-7", "-4", "0", "+4"];

		this.marble_sounds = [];
		for (let i = 0; i < pitches.length; i++)
		{
			this.marble_sounds[i] = [];
			const fullPath = basePath + "Marble_" + pitches[i];
			for (let v = 0; v < 5; v++)
			{
				const filePath = fullPath + "/" + v + ".mp3";
				this.marble_sounds[i][v] = new Audio(filePath);
			}
		}
	}

	update() {
		this.canPlay = this.active && (time - this.lastPlayTime > this.playInterval * 1000);
	}

	playSound(sound) {
		if (!this.canPlay) return;
		this.lastPlayTime = time;
		const newAu = new Audio(sound.src);
		newAu.play();
	}

	playMarbleSound(dot, velocity, forcePlay = false)
	{
		if (!this.canPlay)
			return;
		if (!forcePlay)
		{
			if (this.audioQueue.length > 20) return;
			if (velocity < .2) return;
			if (time - dot.lastAudioBounce < .1) return;
			if (!dot.hasTouchedBorder) return;
		}
		const sizeNormalized = Math.min(Math.max(dot.size, 5), 50);
		const pitchIndex = Math.floor((1 - (sizeNormalized - 5) / 45) * (this.marble_sounds.length - 1));
		const maxVelocity = 10;
		const velNorm = Math.min(velocity / maxVelocity, 1);
		const variationIndex = Math.floor(velNorm * 4);
		const original = this.marble_sounds[pitchIndex][5 - variationIndex];
		if (!original) return;

		const clone = new Audio(original.src);
		clone.volume = Math.min(1, velocity / 100);
		this.audioQueue.push(clone);

		clone.onended = () => {
			const idx = this.audioQueue.indexOf(clone);
			if (idx !== -1) this.audioQueue.splice(idx, 1);
		};
		clone.play();
		dot.lastAudioBounce = time;
	}
}
