class ShuffleHandler {
  constructor(playlistOrchestrator, printerModule) {
    this.playlistOrchestrator = playlistOrchestrator;
    this.printer = printerModule;
  }

  // Main shuffle command handler
  handleShuffle(command) {
    if (!this.playlistOrchestrator) {
      this.printer.print("Error: Playlist system not available", "error");
      return;
    }

    const parts = command.trim().split(/\s+/);
    const subCommand = parts[1]?.toLowerCase();

    // shuffle - Toggle shuffle mode
    if (!subCommand) {
      return this.toggleShuffle();
    }

    // shuffle on - Enable shuffle
    if (subCommand === "on") {
      return this.enableShuffle();
    }

    // shuffle off - Disable shuffle
    if (subCommand === "off") {
      return this.disableShuffle();
    }

    // shuffle playlist <name> - Shuffle a specific playlist
    if (subCommand === "playlist") {
      const playlistName = parts.slice(2).join(" ");
      if (!playlistName) {
        this.printer.print("Usage: shuffle playlist <name>", "error");
        return;
      }
      return this.shuffleSpecificPlaylist(playlistName);
    }

    // Unknown subcommand
    this.printer.print(`Unknown shuffle command: ${subCommand}`, "error");
    this.printer.print(
      "Usage: shuffle | shuffle on | shuffle off | shuffle playlist <name>",
      "info"
    );
  }

  // Toggle shuffle mode
  toggleShuffle() {
    const currentState = this.playlistOrchestrator.getShuffleState();

    if (currentState) {
      return this.disableShuffle();
    } else {
      return this.enableShuffle();
    }
  }

  // Enable shuffle mode
  enableShuffle() {
    const result = this.playlistOrchestrator.enableShuffle();

    if (result.success) {
      this.printer.print("Shuffle enabled", "success");
      if (result.shuffledPlaylist) {
        this.printer.print(
          `Shuffled ${result.trackCount} songs in playlist "${result.shuffledPlaylist}"`,
          "info"
        );
      }
    } else {
      this.printer.print(result.message, "error");
    }
  }

  // Disable shuffle mode
  disableShuffle() {
    const result = this.playlistOrchestrator.disableShuffle();

    if (result.success) {
      this.printer.print("Shuffle disabled", "success");
      if (result.restoredCount > 0) {
        this.printer.print(
          `Restored original order for ${result.restoredCount} playlist(s)`,
          "info"
        );
      }
    } else {
      this.printer.print(result.message, "error");
    }
  }

  // Shuffle a specific playlist
  shuffleSpecificPlaylist(playlistName) {
    const result = this.playlistOrchestrator.shufflePlaylist(playlistName);

    if (result.success) {
      this.printer.print(
        `Shuffled ${result.trackCount} songs in playlist "${playlistName}"`,
        "success"
      );
    } else {
      this.printer.print(result.message, "error");
    }
  }
}

// Make ShuffleHandler available globally for browser context
if (typeof window !== "undefined") {
  window.ShuffleHandler = ShuffleHandler;
}

// Also export for Node.js if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShuffleHandler;
}
