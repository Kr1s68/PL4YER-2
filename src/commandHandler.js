class CommandHandler {
  constructor(outputCallback, audioPlayer, playlistOrchestrator) {
    this.outputCallback = outputCallback;
    this.audioPlayer = audioPlayer;
    this.audioFiles = []; // Store list of audio files for indexing
    this.currentlyPlaying = null;
    this.playlistOrchestrator = playlistOrchestrator;

    // Import Node.js modules (available due to nodeIntegration: true)
    this.fs = require("fs");
    this.path = require("path");
    this.spawn = require("child_process").spawn;
    this.exec = require("child_process").exec;
  }

  // Output helper method
  output(text, type = "output") {
    if (this.outputCallback) {
      this.outputCallback(text, type);
    }
  }

  // Command handlers
  handleHelp() {
    this.output("Available commands:", "info");
    this.output("", "output");
    this.output("General:", "info");
    this.output("  help                    - Show this help message", "info");
    this.output("  clear                   - Clear the console", "info");
    this.output(
      "  date                    - Show current date and time",
      "info"
    );
    this.output("  version                 - Show version information", "info");
    this.output("  echo <msg>              - Echo a message", "info");
    this.output(
      "  calc <exp>              - Calculate a mathematical expression",
      "info"
    );
    this.output(
      "  debug                   - Show debug information and API status",
      "info"
    );
    this.output("", "output");
    this.output("Audio:", "info");
    this.output(
      "  list                    - List all audio files in current directory",
      "info"
    );
    this.output(
      "  play <file|#>           - Play audio file by name or index (alias: p)",
      "info"
    );
    this.output("  pause                   - Pause audio playback", "info");
    this.output("  resume                  - Resume audio playback", "info");
    this.output(
      "  download <url> [name]   - Download YouTube video as MP3 (alias: dl)",
      "info"
    );
    this.output(
      "                            Requires: Python & yt-dlp",
      "info"
    );
    this.output("", "output");
    this.output("Playlists:", "info");
    this.output("  playlist -n <name>      - Create a new playlist", "info");
    this.output(
      "  playlist -add <pl> <song> - Add song to specified playlist",
      "info"
    );
    this.output(
      "  playlist <name>         - Select/activate a playlist",
      "info"
    );
    this.output("  playlist -list          - List all playlists", "info");
    this.output("  playlist -show <name>   - Show playlist details", "info");
    this.output(
      "  playlist -rm <name> <#> - Remove track from playlist",
      "info"
    );
    this.output("  playlist -del <name>    - Delete a playlist", "info");
    this.output(
      "  add <song>              - Add song to currently selected playlist",
      "info"
    );
    this.output(
      "  play                    - Play currently selected playlist",
      "info"
    );
    this.output("  pause                   - Pause audio playback", "info");
    this.output("  resume                  - Resume audio playback", "info");
  }

  handleClear() {
    // Clear will be handled by the UI directly
    // Return a special flag
    return { action: "clear" };
  }

  handleDate() {
    this.output(new Date().toString(), "success");
  }

  handleVersion() {
    this.output(`Node.js: ${process.versions.node}`, "success");
    this.output(`Chrome: ${process.versions.chrome}`, "success");
    this.output(`Electron: ${process.versions.electron}`, "success");
  }

  handleDebug() {
    this.output("Debug Information:", "info");
    this.output("", "output");

    // Check Node.js modules
    this.output(
      `fs module: ${
        typeof this.fs !== "undefined" ? "Available" : "Not available"
      }`,
      typeof this.fs !== "undefined" ? "success" : "error"
    );
    this.output(
      `path module: ${
        typeof this.path !== "undefined" ? "Available" : "Not available"
      }`,
      typeof this.path !== "undefined" ? "success" : "error"
    );

    // Try to get current directory
    try {
      const cwd = process.cwd();
      this.output(`Current directory: ${cwd}`, "info");
    } catch (error) {
      this.output(`Error getting directory: ${error.message}`, "error");
    }
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
        this.output("No audio files found in current directory", "warning");
        this.output(`Directory: ${currentDir}`, "info");
      } else {
        this.output(
          `Found ${audioFiles.length} audio file(s) in: ${currentDir}`,
          "info"
        );
        this.output("", "output");

        audioFiles.forEach((file, index) => {
          const filePath = this.path.join(currentDir, file);
          const stats = this.fs.statSync(filePath);
          const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
          this.output(`[${index + 1}] ${file} (${fileSize} MB)`, "success");
        });
      }
    } catch (error) {
      this.output(`Error: ${error.message}`, "error");
    }
  }

  handlePlay(command) {
    if (!this.audioPlayer) {
      this.output("Error: Audio player not available", "error");
      return;
    }

    // Extract the argument (filename or index)
    const parts = command.trim().split(/\s+/);
    const argument = parts.slice(1).join(" "); // Everything after "play" or "p"

    if (!argument) {
      this.output("Usage: play <filename> or play <index>", "error");
      this.output("Example: play song.mp3 or play 1", "info");
      this.output('Tip: Use "list" to see available files', "info");
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
      this.output(`Error: File not found: ${argument}`, "error");
      this.output('Tip: Use "list" to see available files', "info");
      return;
    }

    // Play the file
    try {
      this.audioPlayer.src = fileToPlay.path;
      this.audioPlayer.play();
      this.currentlyPlaying = fileToPlay;
      this.output(`Now playing: ${fileToPlay.name}`, "success");

      // Update timeline with song name
      if (typeof window !== "undefined" && window.updateTimelineSong) {
        window.updateTimelineSong(fileToPlay.name);
      }
    } catch (error) {
      this.output(`Error playing file: ${error.message}`, "error");
    }
  }

  handlePause() {
    if (!this.audioPlayer) {
      this.output("Error: Audio player not available", "error");
      return;
    }
    this.audioPlayer.pause();
    this.output("Playback paused", "info");
  }

  handleResume() {
    if (!this.audioPlayer) {
      this.output("Error: Audio player not available", "error");
      return;
    }
    this.audioPlayer.play();
    this.output("Playback resumed", "info");
  }

  handleEcho(command) {
    const message = command.substring(5);
    this.output(message, "success");
  }

  handleCalculator(command) {
    try {
      const expression = command.substring(5);
      const result = eval(expression);
      this.output(`Result: ${result}`, "success");
    } catch (error) {
      this.output(`Error: ${error.message}`, "error");
    }
  }

  handleUnknown(command) {
    this.output(`Unknown command: ${command}`, "error");
    this.output(`Type 'help' for available commands`, "info");
  }

  // Check if yt-dlp is installed
  checkYtDlp(callback) {
    this.exec("yt-dlp --version", (error, stdout) => {
      if (error) {
        callback(false, null);
      } else {
        callback(true, stdout.trim());
      }
    });
  }

  handleDownload(command) {
    // Parse command
    const parts = command.trim().split(/\s+/);
    const url = parts[1];
    const customFilename = parts.slice(2).join(" ");

    if (!url) {
      this.output("Usage: download <youtube-url> [filename]", "error");
      this.output(
        "Example: download https://youtube.com/watch?v=xxx my-song",
        "info"
      );
      return;
    }

    // Check if yt-dlp is installed
    this.checkYtDlp((isInstalled, version) => {
      if (!isInstalled) {
        this.output("yt-dlp is not installed", "error");
        this.output("", "output");
        this.output("Installation instructions:", "info");
        this.output(
          "1. Install Python: https://www.python.org/downloads/",
          "info"
        );
        this.output("2. Install yt-dlp: pip install yt-dlp", "info");
        this.output("", "output");
        this.output("See data/README.md for detailed instructions", "info");
        return;
      }

      this.output(`Using yt-dlp ${version}`, "info");
      this.output("Starting download...", "info");

      // Build yt-dlp command
      const currentDir = process.cwd();
      const outputTemplate = customFilename
        ? customFilename.replace(/\.mp3$/i, "") + ".%(ext)s"
        : "%(title)s.%(ext)s";

      const args = [
        "-x", // Extract audio
        "--audio-format",
        "mp3", // Convert to MP3
        "--audio-quality",
        "0", // Best quality
        "--output",
        outputTemplate, // Output filename
        "--newline", // Progress on new lines
        "--no-warnings", // Suppress warnings
        "--progress", // Show progress
        url,
      ];

      // Spawn yt-dlp process
      const ytdlp = this.spawn("yt-dlp", args, {
        cwd: currentDir,
        shell: true,
      });

      let currentProgress = 0;

      // Parse stdout for progress and info
      ytdlp.stdout.on("data", (data) => {
        const output = data.toString();
        const lines = output.split("\n");

        lines.forEach((line) => {
          line = line.trim();
          if (!line) return;

          // Parse progress: [download]  45.2% of 3.45MiB at 1.23MiB/s ETA 00:02
          if (line.includes("[download]") && line.includes("%")) {
            const match = line.match(/(\d+\.?\d*)%/);
            if (match) {
              const progress = parseFloat(match[1]);
              // Only show every 10%
              if (
                Math.floor(progress / 10) > Math.floor(currentProgress / 10)
              ) {
                this.output(`Progress: ${Math.floor(progress)}%`, "info");
                currentProgress = progress;
              }
            }
          }

          // Show destination filename
          if (line.includes("[download] Destination:")) {
            const filename = line.split("Destination:")[1].trim();
            this.output(`Filename: ${filename}`, "info");
          }

          // Show post-processing info
          if (line.includes("[ExtractAudio]")) {
            this.output("Converting to MP3...", "info");
          }
        });
      });

      // Parse stderr for errors
      ytdlp.stderr.on("data", (data) => {
        const error = data.toString().trim();
        if (error && !error.includes("WARNING")) {
          this.output(`Error: ${error}`, "error");
        }
      });

      // Handle process completion
      ytdlp.on("close", (code) => {
        if (code === 0) {
          this.output("✓ Download complete!", "success");
          this.output('Use "list" to see it in your library', "info");
        } else {
          this.output(`Download failed with code ${code}`, "error");
          this.output("", "output");
          this.output("Possible solutions:", "info");
          this.output(
            "1. Check if the URL is valid and video is available",
            "info"
          );
          this.output("2. Try updating yt-dlp: pip install -U yt-dlp", "info");
          this.output(
            "3. Some videos may be region-locked or age-restricted",
            "info"
          );
        }
      });

      // Handle process errors
      ytdlp.on("error", (err) => {
        this.output(`Failed to start yt-dlp: ${err.message}`, "error");
        this.output(
          "Make sure yt-dlp is installed: pip install yt-dlp",
          "info"
        );
      });
    });
  }

  // Playlist command handlers
  handlePlaylist(command) {
    if (!this.playlistOrchestrator) {
      this.output("Error: Playlist system not available", "error");
      return;
    }

    const parts = command.trim().split(/\s+/);
    const flag = parts[1];

    // playlist -n <name> - Create new playlist
    if (flag === "-n") {
      const name = parts.slice(2).join(" ");
      if (!name) {
        this.output("Usage: playlist -n <name>", "error");
        return;
      }

      const result = this.playlistOrchestrator.createPlaylist(name);
      this.output(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist -add <playlist> <song> - Add song to playlist
    if (flag === "-add") {
      const playlistName = parts[2];
      const songPath = parts.slice(3).join(" ");

      if (!playlistName || !songPath) {
        this.output("Usage: playlist -add <playlist> <song>", "error");
        return;
      }

      // Resolve song path
      const resolvedPath = this.resolveSongPath(songPath);
      if (!resolvedPath) {
        this.output(`Song not found: ${songPath}`, "error");
        return;
      }

      const result = this.playlistOrchestrator.addSongToPlaylist(
        playlistName,
        resolvedPath
      );
      this.output(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist -list - List all playlists
    if (flag === "-list") {
      const playlists = this.playlistOrchestrator.listPlaylists();

      if (playlists.length === 0) {
        this.output("No playlists found", "info");
        this.output("Create one with: playlist -n <name>", "info");
        return;
      }

      this.output(`Found ${playlists.length} playlist(s):`, "info");
      this.output("", "output");

      playlists.forEach((pl) => {
        const selected = pl.isSelected ? " [SELECTED]" : "";
        this.output(`  ${pl.name}${selected}`, "success");
        this.output(`    Tracks: ${pl.trackCount}`, "info");
        this.output(
          `    Created: ${new Date(pl.created).toLocaleString()}`,
          "info"
        );
      });
      return;
    }

    // playlist -show <name> - Show playlist details
    if (flag === "-show") {
      const name = parts.slice(2).join(" ");
      if (!name) {
        this.output("Usage: playlist -show <name>", "error");
        return;
      }

      const result = this.playlistOrchestrator.showPlaylist(name);
      if (!result.success) {
        this.output(result.message, "error");
        return;
      }

      const pl = result.playlist;
      this.output(`Playlist: ${pl.name}`, "info");
      this.output(`Tracks: ${pl.tracks.length}`, "info");
      this.output(`Created: ${new Date(pl.created).toLocaleString()}`, "info");
      this.output("", "output");

      if (pl.tracks.length === 0) {
        this.output("No tracks in playlist", "info");
      } else {
        pl.tracks.forEach((track, index) => {
          this.output(`[${index + 1}] ${track.title}`, "success");
          this.output(`    Path: ${track.path}`, "info");
        });
      }
      return;
    }

    // playlist -rm <name> <index> - Remove track from playlist
    if (flag === "-rm") {
      const playlistName = parts[2];
      const trackIndex = parseInt(parts[3]);

      if (!playlistName || isNaN(trackIndex)) {
        this.output("Usage: playlist -rm <playlist> <track-number>", "error");
        return;
      }

      const result = this.playlistOrchestrator.removeTrackFromPlaylist(
        playlistName,
        trackIndex
      );
      this.output(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist -del <name> - Delete playlist
    if (flag === "-del") {
      const name = parts.slice(2).join(" ");
      if (!name) {
        this.output("Usage: playlist -del <name>", "error");
        return;
      }

      const result = this.playlistOrchestrator.deletePlaylist(name);
      this.output(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist <name> - Select playlist
    const name = parts.slice(1).join(" ");
    if (!name) {
      this.output("Usage: playlist <name> or playlist -list", "error");
      return;
    }

    const result = this.playlistOrchestrator.selectPlaylist(name);
    this.output(result.message, result.success ? "success" : "error");

    // Open drawer if playlist selected successfully
    if (
      result.success &&
      typeof window !== "undefined" &&
      window.openPlaylistDrawer
    ) {
      window.openPlaylistDrawer(name, result.playlist);
    }
  }

  handleAdd(command) {
    if (!this.playlistOrchestrator) {
      this.output("Error: Playlist system not available", "error");
      return;
    }

    const songPath = command.trim().split(/\s+/).slice(1).join(" ");

    if (!songPath) {
      this.output("Usage: add <song>", "error");
      this.output(
        'Note: You must select a playlist first with "playlist <name>"',
        "info"
      );
      return;
    }

    // Resolve song path
    const resolvedPath = this.resolveSongPath(songPath);
    if (!resolvedPath) {
      this.output(`Song not found: ${songPath}`, "error");
      return;
    }

    const result = this.playlistOrchestrator.addSongToSelected(resolvedPath);
    this.output(result.message, result.success ? "success" : "error");

    // Update drawer if song was added successfully
    if (
      result.success &&
      typeof window !== "undefined" &&
      window.updateDrawerCurrentTrack
    ) {
      window.updateDrawerCurrentTrack();
    }
  }

  handlePlayPlaylist() {
    if (!this.playlistOrchestrator) {
      this.output("Error: Playlist system not available", "error");
      return;
    }

    if (!this.audioPlayer) {
      this.output("Error: Audio player not available", "error");
      return;
    }

    const playlist = this.playlistOrchestrator.getSelectedPlaylist();
    if (!playlist) {
      this.output("No playlist selected", "error");
      this.output('Use "playlist <name>" to select a playlist first', "info");
      return;
    }

    if (playlist.tracks.length === 0) {
      this.output(`Playlist "${playlist.name}" is empty`, "warning");
      return;
    }

    // Start playing the playlist from the beginning
    const playlistName = this.playlistOrchestrator.getSelectedPlaylistName();
    const firstTrack = this.playlistOrchestrator.startPlaylist(playlistName);

    if (!firstTrack) {
      this.output("Error starting playlist", "error");
      return;
    }

    try {
      this.audioPlayer.src = firstTrack.path;
      this.audioPlayer.play();
      this.currentlyPlaying = firstTrack;

      this.output(`Playing playlist: ${playlist.name}`, "success");
      this.output(`Now playing: ${firstTrack.title}`, "success");
      this.output(`Tracks in queue: ${playlist.tracks.length}`, "info");

      // Update timeline with song name
      if (typeof window !== "undefined" && window.updateTimelineSong) {
        window.updateTimelineSong(firstTrack.title);
      }

      // Update drawer to highlight current track
      if (typeof window !== "undefined" && window.updateDrawerCurrentTrack) {
        window.updateDrawerCurrentTrack();
      }
    } catch (error) {
      this.output(`Error playing playlist: ${error.message}`, "error");
    }
  }

  // Helper to resolve song path (by index or filename)
  resolveSongPath(songIdentifier) {
    // Check if it's a number (index from list command)
    const index = parseInt(songIdentifier);
    if (!isNaN(index) && index > 0 && index <= this.audioFiles.length) {
      return this.audioFiles[index - 1].path;
    }

    // Check if it's a direct file path
    if (this.fs.existsSync(songIdentifier)) {
      return this.path.resolve(songIdentifier);
    }

    // Try as relative path from current directory
    const currentDir = process.cwd();
    const filePath = this.path.join(currentDir, songIdentifier);
    if (this.fs.existsSync(filePath)) {
      return filePath;
    }

    // Try to find partial match in audioFiles
    const match = this.audioFiles.find((f) =>
      f.name.toLowerCase().includes(songIdentifier.toLowerCase())
    );

    if (match) {
      return match.path;
    }

    return null;
  }
}

// Make CommandHandler available globally for browser context
if (typeof window !== "undefined") {
  window.CommandHandler = CommandHandler;
}

// Also export for Node.js if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = CommandHandler;
}
