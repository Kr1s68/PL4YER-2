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
      const files = this.fs.readdirSync(currentDir);

      // Filter for audio files (mp3, wav, ogg, flac, m4a)
      const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];
      const audioFiles = files.filter((file) => {
        const ext = this.path.extname(file).toLowerCase();
        return audioExtensions.includes(ext);
      });

      // Store audio files with full paths for playing
      this.audioFiles = audioFiles.map((file) => ({
        name: file,
        path: this.path.join(currentDir, file),
      }));

      if (audioFiles.length === 0) {
        this.printer.print(
          "No audio files found in current directory",
          "warning"
        );
        this.printer.print(`Directory: ${currentDir}`, "info");
      } else {
        this.printer.print(
          `Found ${audioFiles.length} audio file(s) in: ${currentDir}`,
          "info"
        );
        this.printer.print("", "output");

        audioFiles.forEach((file, index) => {
          const filePath = this.path.join(currentDir, file);
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
}

if (typeof window !== "undefined") {
  window.SongHandler = SongHandler;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SongHandler;
}
