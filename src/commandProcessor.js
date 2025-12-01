// CommandHandler is loaded globally via script tag in HTML
class CommandProcessor {
  constructor(outputCallback, audioPlayer, playlistOrchestrator) {
    this.outputCallback = outputCallback;
    this.commandHistory = [];
    this.historyIndex = -1;

    // Initialize CommandHandler (loaded globally via script tag)
    this.commandHandler = new window.CommandHandler(
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
        return this.commandHandler.handleHelp();

      case "clear":
        return this.commandHandler.handleClear();

      case "date":
        return this.commandHandler.handleDate();

      case "version":
        return this.commandHandler.handleVersion();

      case "list":
        return this.commandHandler.handleList();

      case "debug":
        return this.commandHandler.handleDebug();

      case "play":
      case "p":
        // If no arguments, play the selected playlist
        return this.commandHandler.handlePlayPlaylist();

      case "download":
      case "dl":
        return this.commandHandler.handleDownload(command);

      default:
        // Handle commands with parameters
        if (cmd.startsWith("echo ")) {
          return this.commandHandler.handleEcho(command);
        } else if (cmd.startsWith("calc ")) {
          return this.commandHandler.handleCalculator(command);
        } else if (cmd.startsWith("play ") || cmd.startsWith("p ")) {
          return this.commandHandler.handlePlay(command);
        } else if (cmd.startsWith("download ") || cmd.startsWith("dl ")) {
          return this.commandHandler.handleDownload(command);
        } else if (cmd.startsWith("playlist ")) {
          return this.commandHandler.handlePlaylist(command);
        } else if (cmd.startsWith("add ")) {
          return this.commandHandler.handleAdd(command);
        } else if (cmd.startsWith("pause")) {
          return this.commandHandler.handlePause();
        } else if (cmd.startsWith("resume")) {
          return this.commandHandler.handleResume();
        } else {
          return this.commandHandler.handleUnknown(command);
        }
    }
  }
}

// Export for use in HTML
if (typeof module !== "undefined" && module.exports) {
  module.exports = CommandProcessor;
}
