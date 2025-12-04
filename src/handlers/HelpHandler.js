class HelpHandler {
  constructor(printerModule) {
    this.printer = printerModule;
  }

  // Command handlers
  handleHelp() {
    this.printer.print("Available commands:", "info");
    this.printer.print("", "output");
    this.printer.print("General:", "info");
    this.printer.print(
      "  help                    - Show this help message",
      "info"
    );
    this.printer.print("  clear                   - Clear the console", "info");
    this.printer.print(
      "  date                    - Show current date and time",
      "info"
    );
    this.printer.print(
      "  version                 - Show version information",
      "info"
    );
    this.printer.print("  echo <msg>              - Echo a message", "info");
    this.printer.print(
      "  calc <exp>              - Calculate a mathematical expression",
      "info"
    );
    this.printer.print(
      "  debug                   - Show debug information and API status",
      "info"
    );
    this.printer.print("", "output");
    this.printer.print("Audio:", "info");
    this.printer.print(
      "  list                    - List all audio files in current directory",
      "info"
    );
    this.printer.print(
      "  play <file|#>           - Play audio file by name or index (alias: p)",
      "info"
    );
    this.printer.print(
      "  pause                   - Pause audio playback",
      "info"
    );
    this.printer.print(
      "  resume                  - Resume audio playback",
      "info"
    );
    this.printer.print(
      "  download <url> [name]   - Download YouTube video as MP3 (alias: dl)",
      "info"
    );
    this.printer.print(
      "                            Requires: Python & yt-dlp",
      "info"
    );
    this.printer.print("", "output");
    this.printer.print("Playlists:", "info");
    this.printer.print(
      "  playlist -n <name>      - Create a new playlist",
      "info"
    );
    this.printer.print(
      "  playlist -add <pl> <song> - Add song to specified playlist",
      "info"
    );
    this.printer.print(
      "  playlist <name>         - Select/activate a playlist",
      "info"
    );
    this.printer.print(
      "  playlist -list          - List all playlists",
      "info"
    );
    this.printer.print(
      "  playlist -show <name>   - Show playlist details",
      "info"
    );
    this.printer.print(
      "  playlist -rm <name> <#> - Remove track from playlist",
      "info"
    );
    this.printer.print("  playlist -del <name>    - Delete a playlist", "info");
    this.printer.print(
      "  add <song>              - Add song to currently selected playlist",
      "info"
    );
    this.printer.print(
      "  play                    - Play currently selected playlist",
      "info"
    );
    this.printer.print(
      "  pause                   - Pause audio playback",
      "info"
    );
    this.printer.print(
      "  resume                  - Resume audio playback",
      "info"
    );
    this.printer.print("", "output");
    this.printer.print("Shuffle:", "info");
    this.printer.print(
      "  shuffle                 - Toggle shuffle mode on/off",
      "info"
    );
    this.printer.print(
      "  shuffle on/off          - Explicitly enable/disable shuffle",
      "info"
    );
    this.printer.print(
      "  shuffle playlist <name> - Shuffle a specific playlist",
      "info"
    );
  }
}

if (typeof window !== "undefined") {
  window.HelpHandler = HelpHandler;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = HelpHandler;
}
