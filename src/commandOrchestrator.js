class CommandOrchestrator {
  constructor(outputCallback, audioPlayer, playlistOrchestrator) {
    this.outputCallback = outputCallback;
    this.audioPlayer = audioPlayer;
    this.audioFiles = []; // Store list of audio files for indexing
    this.playlistOrchestrator = playlistOrchestrator;

    // Import Node.js modules (available due to nodeIntegration: true)
    this.fs = require("fs");
    this.path = require("path");
    this.spawn = require("child_process").spawn;
    this.exec = require("child_process").exec;
    const printer = new window.PrinterModule(outputCallback);
    this.helpHandler = new window.HelpHandler(printer);
    this.metaHandler = new window.MetaHandler(this.fs, this.path, printer);
    this.songHandler = new window.SongHandler(
      this.fs,
      this.path,
      audioPlayer,
      printer
    );
    this.downloadHandler = new window.DownloadHandler(
      this.fs,
      this.path,
      printer
    );
    this.playlistHandler = new window.PlaylistHandler(
      this.fs,
      this.path,
      this.playlistOrchestrator,
      this.audioPlayer,
      printer
    );
  }

  handleHelp() {
    return this.helpHandler.handleHelp();
  }

  handleClear() {
    // Clear will be handled by the UI directly
    // Return a special flag
    return this.metaHandler.handleClear();
  }

  handleDate() {
    this.metaHandler.handleDate();
  }

  handleVersion() {
    return this.metaHandler.handleVersion();
  }

  handleDebug() {
    return this.metaHandler.handleDebug();
  }

  handleList() {
    return this.songHandler.handleList();
  }

  handlePlay(command) {
    return this.songHandler.handlePlay(command);
  }

  handlePause() {
    return this.songHandler.handlePause();
  }

  handleResume() {
    return this.songHandler.handleResume();
  }

  handleEcho(command) {
    return this.metaHandler.handleEcho(command);
  }

  handleCalculator(command) {
    return this.metaHandler.handleCalculator(command);
  }

  handleUnknown(command) {
    return this.metaHandler.handleUnknown(command);
  }

  handleDownload(command) {
    return this.downloadHandler.handleDownload(command);
  }

  // Playlist command handlers
  handlePlaylist(command) {
    return this.playlistHandler.handlePlaylist(command);
  }

  handleAdd(command) {
    return this.playlistHandler.handleAdd(command);
  }

  handlePlayPlaylist() {
    return this.playlistHandler.handlePlayPlaylist();
  }
}

// Make CommandHandler available globally for browser context
if (typeof window !== "undefined") {
  window.CommandOrchestrator = CommandOrchestrator;
}

// Also export for Node.js if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = CommandOrchestrator;
}
