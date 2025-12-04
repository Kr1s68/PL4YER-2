// CommandHandler is loaded globally via script tag in HTML
class CommandProcessor {
  constructor(outputCallback, audioPlayer, playlistOrchestrator) {
    this.outputCallback = outputCallback;
    this.commandHistory = [];
    this.historyIndex = -1;

    // Initialize CommandHandler (loaded globally via script tag)
    this.commandOrchestrator = new window.CommandOrchestrator(
      outputCallback,
      audioPlayer,
      playlistOrchestrator
    );
  }

  // Add command to history
  addToHistory(command) {
    if (command.trim()) {
      this.commandHistory.push(command);
      this.historyIndex = this.commandHistory.length;
    }
  }

  // Get previous command from history
  getPreviousCommand() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.commandHistory[this.historyIndex];
    }
    return null;
  }

  // Get next command from history
  getNextCommand() {
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      return this.commandHistory[this.historyIndex];
    } else {
      this.historyIndex = this.commandHistory.length;
      return "";
    }
  }

  // Output helper method
  output(text, type = "output") {
    if (this.outputCallback) {
      this.outputCallback(text, type);
    }
  }

  // Main command processor
  processCommand(command) {
    const cmd = command.trim().toLowerCase();

    // Add command to history
    this.addToHistory(command);

    // Echo the command
    this.output(`> ${command}`, "output");

    // Process commands using switch case
    switch (cmd) {
      case "":
        // Empty command, do nothing
        break;

      case "help":
        return this.commandOrchestrator.handleHelp();

      case "clear":
        return this.commandOrchestrator.handleClear();

      case "date":
        return this.commandOrchestrator.handleDate();

      case "version":
        return this.commandOrchestrator.handleVersion();

      case "list":
        return this.commandOrchestrator.handleList();

      case "debug":
        return this.commandOrchestrator.handleDebug();

      case "play":
      case "p":
        // If no arguments, play the selected playlist
        return this.commandOrchestrator.handlePlayPlaylist();

      case "download":
      case "dl":
        return this.commandOrchestrator.handleDownload(command);

      case "next":
      case "n":
        return this.commandOrchestrator.handleNext();

      case "previous":
      case "prev":
        return this.commandOrchestrator.handlePrevious();

      case "shuffle":
        return this.commandOrchestrator.handleShuffle(command);

      default:
        // Handle commands with parameters
        if (cmd.startsWith("echo ")) {
          return this.commandOrchestrator.handleEcho(command);
        } else if (cmd.startsWith("calc ")) {
          return this.commandOrchestrator.handleCalculator(command);
        } else if (cmd.startsWith("play ") || cmd.startsWith("p ")) {
          return this.commandOrchestrator.handlePlay(command);
        } else if (cmd.startsWith("download ") || cmd.startsWith("dl ")) {
          return this.commandOrchestrator.handleDownload(command);
        } else if (cmd.startsWith("playlist ")) {
          return this.commandOrchestrator.handlePlaylist(command);
        } else if (cmd.startsWith("add ")) {
          return this.commandOrchestrator.handleAdd(command);
        } else if (cmd.startsWith("pause")) {
          return this.commandOrchestrator.handlePause();
        } else if (cmd.startsWith("resume")) {
          return this.commandOrchestrator.handleResume();
        } else if (cmd.startsWith("volume")) {
          return this.commandOrchestrator.handleVolume(command);
        } else if (cmd.startsWith("shuffle ")) {
          return this.commandOrchestrator.handleShuffle(command);
        } else {
          return this.commandOrchestrator.handleUnknown(command);
        }
    }
  }
}

// Export for use in HTML
if (typeof module !== "undefined" && module.exports) {
  module.exports = CommandProcessor;
}
