class SongHandler {
  constructor(fsModule, pathModule, audioPlayer, printerModule) {
    this.fs = fsModule;
    this.path = pathModule;
    this.audioPlayer = audioPlayer;
    this.audioFiles = [];
    this.printer = printerModule;
  }

  handleList() {
    try {
      const currentDir = process.cwd();
      const songsDir = this.path.join(currentDir, "songs");

      // Ensure songs directory exists
      if (!this.fs.existsSync(songsDir)) {
        this.fs.mkdirSync(songsDir, { recursive: true });
      }

      const files = this.fs.readdirSync(songsDir);

      // Filter for audio files (mp3, wav, ogg, flac, m4a)
      const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];
      const audioFiles = files.filter((file) => {
        const ext = this.path.extname(file).toLowerCase();
        return audioExtensions.includes(ext);
      });

      // Store audio files with full paths for playing
      this.audioFiles = audioFiles.map((file) => ({
        name: file,
        path: this.path.join(songsDir, file),
      }));

      if (audioFiles.length === 0) {
        this.printer.print(
          "No audio files found in songs directory",
          "warning"
        );
        this.printer.print(`Directory: ${songsDir}`, "info");
        this.printer.print('Use "download <url>" to add songs', "info");
      } else {
        this.printer.print(
          `Found ${audioFiles.length} audio file(s) in: songs/`,
          "info"
        );
        this.printer.print("", "output");

        audioFiles.forEach((file, index) => {
          const filePath = this.path.join(songsDir, file);
          const stats = this.fs.statSync(filePath);
          const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
          this.printer.print(
            `[${index + 1}] ${file} (${fileSize} MB)`,
            "success"
          );
        });
      }
    } catch (error) {
      this.printer.print(`Error: ${error.message}`, "error");
    }
  }

  handlePlay(command) {
    if (!this.audioPlayer) {
      this.printer.print("Error: Audio player not available", "error");
      return;
    }

    // Extract the argument (filename or index)
    const parts = command.trim().split(/\s+/);
    const argument = parts.slice(1).join(" "); // Everything after "play" or "p"

    if (!argument) {
      this.printer.print("Usage: play <filename> or play <index>", "error");
      this.printer.print("Example: play song.mp3 or play 1", "info");
      this.printer.print('Tip: Use "list" to see available files', "info");
      return;
    }

    let fileToPlay = null;

    // Check if argument is a number (index)
    const index = parseInt(argument);
    if (!isNaN(index) && index > 0 && index <= this.audioFiles.length) {
      fileToPlay = this.audioFiles[index - 1];
    } else {
      // Try to find by filename
      const currentDir = process.cwd();
      const filePath = this.path.join(currentDir, argument);

      if (this.fs.existsSync(filePath)) {
        fileToPlay = {
          name: argument,
          path: filePath,
        };
      } else {
        // Try to find partial match in audioFiles
        const match = this.audioFiles.find((f) =>
          f.name.toLowerCase().includes(argument.toLowerCase())
        );

        if (match) {
          fileToPlay = match;
        }
      }
    }

    if (!fileToPlay) {
      this.printer.print(`Error: File not found: ${argument}`, "error");
      this.printer.print('Tip: Use "list" to see available files', "info");
      return;
    }

    // Play the file
    try {
      this.audioPlayer.src = fileToPlay.path;
      this.audioPlayer.play();
      this.currentlyPlaying = fileToPlay;
      this.printer.print(`Now playing: ${fileToPlay.name}`, "success");

      // Update timeline with song name
      if (typeof window !== "undefined" && window.updateTimelineSong) {
        window.updateTimelineSong(fileToPlay.name);
      }
    } catch (error) {
      this.printer.print(`Error playing file: ${error.message}`, "error");
    }
  }

  handlePause() {
    if (!this.audioPlayer) {
      this.printer.print("Error: Audio player not available", "error");
      return;
    }
    this.audioPlayer.pause();
    this.printer.print("Playback paused", "info");
  }

  handleResume() {
    if (!this.audioPlayer) {
      this.printer.print("Error: Audio player not available", "error");
      return;
    }
    this.audioPlayer.play();
    this.printer.print("Playback resumed", "info");
  }

  handleVolume(command) {
    const parts = command.trim().split(/\s+/);
    const argument = parts.slice(1).join(" "); // Everything after "volume" or "vol"

    this.audioPlayer.volume = parseFloat(argument) / 100;
    if (
      isNaN(this.audioPlayer.volume) ||
      this.audioPlayer.volume < 0 ||
      this.audioPlayer.volume > 1
    ) {
      this.printer.print("Usage: volume <0-100>", "error");
      return;
    }
    this.printer.print(`Volume set to ${argument}%`, "success");
  }

  handleNext() {
    if (!this.audioPlayer) {
      this.printer.print("Error: Audio player not available", "error");
      return;
    }

    if (this.audioFiles.length === 0) {
      this.printer.print("No audio files available", "warning");
      this.printer.print('Use "list" to load audio files first', "info");
      return;
    }

    // Randomly select a track
    const randomIndex = Math.floor(Math.random() * this.audioFiles.length);
    const randomTrack = this.audioFiles[randomIndex];

    try {
      this.audioPlayer.src = randomTrack.path;
      this.audioPlayer.play();
      this.currentlyPlaying = randomTrack;

      this.printer.print(`Next (random): ${randomTrack.name}`, "success");

      // Update timeline with song name
      if (typeof window !== "undefined" && window.updateTimelineSong) {
        window.updateTimelineSong(randomTrack.name);
      }
    } catch (error) {
      this.printer.print(`Error playing track: ${error.message}`, "error");
    }
  }

  handlePrevious() {
    if (!this.audioPlayer) {
      this.printer.print("Error: Audio player not available", "error");
      return;
    }

    if (this.audioFiles.length === 0) {
      this.printer.print("No audio files available", "warning");
      this.printer.print('Use "list" to load audio files first', "info");
      return;
    }

    // Randomly select a track (same as next in random mode)
    const randomIndex = Math.floor(Math.random() * this.audioFiles.length);
    const randomTrack = this.audioFiles[randomIndex];

    try {
      this.audioPlayer.src = randomTrack.path;
      this.audioPlayer.play();
      this.currentlyPlaying = randomTrack;

      this.printer.print(`Previous (random): ${randomTrack.name}`, "success");

      // Update timeline with song name
      if (typeof window !== "undefined" && window.updateTimelineSong) {
        window.updateTimelineSong(randomTrack.name);
      }
    } catch (error) {
      this.printer.print(`Error playing track: ${error.message}`, "error");
    }
  }
}

if (typeof window !== "undefined") {
  window.SongHandler = SongHandler;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SongHandler;
}
