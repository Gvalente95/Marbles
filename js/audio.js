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
		this.click = new Audio("ressources/audio/click.mp3");
		this.clock = new Audio("ressources/audio/clock.mp3");
		this.soundCapture = new Audio("ressources/audio/Capture.mp3");
		this.soundDenied = new Audio("ressources/audio/denied.mp3");
		this.trill = new Audio("ressources/audio/trill.mp3");
		this.magnetSounds = this.initSounds("ressources/audio/Magnet/", 5);
		this.gelSounds = this.initSounds("ressources/audio/Gel/", 10);
		this.concreteSounds = this.initSounds("ressources/audio/Concrete/", 7);
		this.bells = this.initSounds("ressources/audio/Bells/", 11);
		this.initMarbleSounds();
	}

	initSounds(basePath, amount) {
		const sounds = [];
		for (let i = 0; i < amount; i++)
			sounds[i] = new Audio(basePath + i + ".mp3");
		return sounds;
	}

	playRandomSound(list, volume = 1) {
		let index = r_range(0, list.length - 1);
		const au = new Audio(list[index].src);
		au.volume = volume;
		au.play();
	}

	playBoxSound(dot, box = null, volume = 1) {
		let typeName = "box_gelatine";
		if (box) {
			typeName = box.className;
		}
		console.warn("type = " + typeName);
		const sounds = typeName === "box_gelatine" ? this.gelSounds : typeName === "box_concrete" ? this.concreteSounds: this.magnetSounds;
		const base = sounds[r_range(0, sounds.length - 1)];
		const au = base.cloneNode(); // CLONE l’objet Audio

		if (dot) {
			const velMax = Math.max(Math.abs(dot.velocityX), Math.abs(dot.velocityY));
			au.volume = minmax(.1, 1, velMax / 10);
		} else
			au.volume = volume;
		au.play().catch(e => console.warn("Failed to play:", e));
	}

	playGelSound(dot, volume = 1) {
		let index = r_range(0, 9);
		const au = new Audio(this.gelSounds[index].src);
		if (dot) {
			let velMax = dot.velocityX > dot.velocityY ? dot.velocityX : dot.velocityY;
			let volume = minmax(.1, 1, Math.abs(velMax / 10));
			au.volume = volume;
		}
		else
			au.volume = volume;
		au.play();
	}

	initMarbleSounds() {
		const basePath = "ressources/audio/Marble/";
		const pitches = ["-19", "-16", "-12", "-7", "-4", "0", "+4"];

		this.marble_sounds = [];
		for (let i = 0; i < pitches.length; i++) {
			this.marble_sounds[i] = [];
			const fullPath = basePath + "Marble_" + pitches[i];
			for (let v = 0; v < 5; v++) {
				const filePath = fullPath + "/" + v + ".mp3";
				this.marble_sounds[i][v] = new Audio(filePath);
			}
		}
	}

	update() {
		this.canPlay = this.active && (time - this.lastPlayTime > this.playInterval * 1000);
	}

	playSound(sound, volume = 1) {
		if (!this.canPlay) return;
		this.lastPlayTime = time;
		const newAu = new Audio(sound.src);
		newAu.volume = volume;
		newAu.play();
	}

	playMarbleSound(dot, velocity, forcePlay = false)
	{
		if (!this.canPlay)
			return false;
		if (!forcePlay)
		{
			if (this.audioQueue.length > 200) return;
			// if (time - dot.lastAudioBounce < .1) return;
			if (velocity < .1) return false;
			if (!dot.hasTouchedBorder) return false;
		}
		const volume = minmax(0, 1, velocity / (140));
		let original;
		const sizeNormalized = Math.min(Math.max(dot.size, 5), 50);
		const pitchIndex = Math.floor((1 - (sizeNormalized - 5) / 45) * (this.marble_sounds.length - 1));
		const maxVelocity = 10;
		const velNorm = Math.min(velocity / maxVelocity, 1);
		const variationIndex = Math.floor(velNorm * 4);
		original = this.marble_sounds[pitchIndex][5 - variationIndex];
		this.playInQueue(original, volume);
		if (musicMode)
			this.playInQueue(this.bells[dot.auIndex], Math.min(1, volume * 4));
		return true;
	}

	playInQueue(original, volume) {
		if (!original)
			return;
		const au = new Audio(original.src);
		au.volume = volume;
		this.audioQueue.push(au);
		au.onended = () => {
			const idx = this.audioQueue.indexOf(au);
			if (idx !== -1) this.audioQueue.splice(idx, 1);
		};
		au.play();
	}
}
