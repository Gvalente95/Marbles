const audioPath = "ressources/audio/";
class AudioManager {
	constructor() {
		this.lastPlayTime = 0;
		this.canPlay = true;
		this.active = true;
		this.playInterval = ((isMobile) ? .2 : 0.05);
		this.audioQueue = [];
		this.buttonOk = new Audio(audioPath + "buttonOk.mp3");
		this.gameOn = new Audio(audioPath + "gameOn.mp3");
		this.soundMove = new Audio(audioPath + "Move.mp3");
		this.dig = new Audio(audioPath + "dig.mp3");
		this.tuk = new Audio(audioPath + "tuk.mp3");
		this.click = new Audio(audioPath + "click.mp3");
		this.clock = new Audio(audioPath + "clock.mp3");
		this.soundCapture = new Audio(audioPath + "Capture.mp3");
		this.soundDenied = new Audio(audioPath + "denied.mp3");
		this.trill = new Audio(audioPath + "trill.mp3");
		this.magnetSounds = this.initSounds(audioPath + "Magnet/", 5);
		this.gelSounds = this.initSounds(audioPath + "Gel/", 10);
		this.concreteSounds = this.initSounds(audioPath + "Concrete/", 7);
		this.stretchSounds = this.initSounds(audioPath + "Stretch/", 3);
		this.bells = this.initSounds(audioPath + "Bells/", 11);
		this.initMarbleSounds();
	}

	initSounds(basePath, amount) {
		const sounds = [];
		for (let i = 0; i < amount; i++)
			sounds[i] = new Audio(basePath + i + ".mp3");
		return sounds;
	}

	playRandomSound(list, volume = 1) {
		if (!this.canPlay) return;
		let index = r_range(0, list.length - 1);
		const au = new Audio(list[index].src);
		au.volume = volume;
		this.lastPlayTime = now;
		au.play();
	}

	playBoxSound(dot, box = null, volume = 1) {
		if (!this.canPlay) return;
		let typeName = "Gelatine";
		if (box) {
			typeName = box.className;
		}
		const sounds = typeName === "Gelatine" ? this.gelSounds : typeName === "Concrete" ? this.concreteSounds: this.magnetSounds;
		const base = sounds[r_range(0, sounds.length - 1)];
		const au = base.cloneNode(); // CLONE l’objet Audio

		if (dot) {
			const velMax = Math.max(Math.abs(dot.velocityX), Math.abs(dot.velocityY));
			au.volume = minmax(.1, 1, velMax / 10);
		} else
			au.volume = volume;
		this.lastPlayTime = now;
		au.play().catch(e => console.warn("Failed to play:", e));
	}

	playGelSound(dot, volume = 1) {
		if (!this.canPlay) return;
		let index = r_range(0, 9);
		const au = new Audio(this.gelSounds[index].src);
		if (dot) {
			let velMax = dot.velocityX > dot.velocityY ? dot.velocityX : dot.velocityY;
			let volume = minmax(.1, 1, Math.abs(velMax / 10));
			au.volume = volume;
		}
		else
			au.volume = volume;
		this.lastPlayTime = now;
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
		this.canPlay = (
			this.active &&
			(now - this.lastPlayTime > this.playInterval)
		);
	}

	playSound(sound, volume = 1) {
		if (!this.canPlay) return;
		this.lastPlayTime = now;
		const newAu = new Audio(sound.src);
		newAu.volume = volume;
		newAu.play();
	}

	playMarbleSound(dot, velocity, forcePlay = false)
	{
		if (!this.canPlay) return false;
		if (!forcePlay)
		{
			if (this.audioQueue.length > 200) return;
			// if (time - dot.lastAudioBounce < .1) return;
			if (velocity < .1) return false;
			if (!dot.hasTouchedBorder) return false;
		}
		const volume = minmax(0, .8, velocity / (140));
		let original;
		const sizeNormalized = Math.min(Math.max(dot.size, 5), 200);
		const pitchIndex = minmax(0, this.marble_sounds.length - 1, Math.floor((1 - (sizeNormalized - 5) / 45) * (this.marble_sounds.length - 1)));
		const maxVelocity = 10;
		const velNorm = Math.min(velocity / maxVelocity, 1);
		const variationIndex = Math.floor(velNorm * 4);
		original = this.marble_sounds[pitchIndex][5 - variationIndex];
		if (!musicMode && !menuBlock.active)
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
		this.lastPlayTime = now;
		au.play();
	}
}
