class DownloadHandler {
  constructor(fsModule, pathModule, printerModule) {
    this.fs = fsModule;
    this.path = pathModule;
    this.printer = printerModule;

    this.spawn = require("child_process").spawn;
    this.exec = require("child_process").exec;
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
      this.printer.print("Usage: download <youtube-url> [filename]", "error");
      this.printer.print(
        "Example: download https://youtube.com/watch?v=xxx my-song",
        "info"
      );
      return;
    }

    // Check if yt-dlp is installed
    this.checkYtDlp((isInstalled, version) => {
      if (!isInstalled) {
        this.printer.print("yt-dlp is not installed", "error");
        this.printer.print("", "output");
        this.printer.print("Installation instructions:", "info");
        this.printer.print(
          "1. Install Python: https://www.python.org/downloads/",
          "info"
        );
        this.printer.print("2. Install yt-dlp: pip install yt-dlp", "info");
        this.printer.print("", "output");
        this.printer.print(
          "See data/README.md for detailed instructions",
          "info"
        );
        return;
      }

      this.printer.print(`Using yt-dlp ${version}`, "info");
      this.printer.print("Starting download...", "info");

      // Build yt-dlp command
      const currentDir = process.cwd();
      const songsDir = this.path.join(currentDir, "songs");

      // Ensure songs directory exists
      if (!this.fs.existsSync(songsDir)) {
        this.fs.mkdirSync(songsDir, { recursive: true });
      }

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
        cwd: songsDir,
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
                this.printer.print(
                  `Progress: ${Math.floor(progress)}%`,
                  "info"
                );
                currentProgress = progress;
              }
            }
          }

          // Show destination filename
          if (line.includes("[download] Destination:")) {
            const filename = line.split("Destination:")[1].trim();
            this.printer.print(`Filename: ${filename}`, "info");
          }

          // Show post-processing info
          if (line.includes("[ExtractAudio]")) {
            this.printer.print("Converting to MP3...", "info");
          }
        });
      });

      // Parse stderr for errors
      ytdlp.stderr.on("data", (data) => {
        const error = data.toString().trim();
        if (error && !error.includes("WARNING")) {
          this.printer.print(`Error: ${error}`, "error");
        }
      });

      // Handle process completion
      ytdlp.on("close", (code) => {
        if (code === 0) {
          this.printer.print("✓ Download complete!", "success");
          this.printer.print("Saved to: songs/", "info");
          this.printer.print('Use "list" to see it in your library', "info");
        } else {
          this.printer.print(`Download failed with code ${code}`, "error");
          this.printer.print("", "output");
          this.printer.print("Possible solutions:", "info");
          this.printer.print(
            "1. Check if the URL is valid and video is available",
            "info"
          );
          this.printer.print(
            "2. Try updating yt-dlp: pip install -U yt-dlp",
            "info"
          );
          this.printer.print(
            "3. Some videos may be region-locked or age-restricted",
            "info"
          );
        }
      });

      // Handle process errors
      ytdlp.on("error", (err) => {
        this.printer.print(`Failed to start yt-dlp: ${err.message}`, "error");
        this.printer.print(
          "Make sure yt-dlp is installed: pip install yt-dlp",
          "info"
        );
      });
    });
  }
}

if (typeof window !== "undefined") {
  window.DownloadHandler = DownloadHandler;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = DownloadHandler;
}
