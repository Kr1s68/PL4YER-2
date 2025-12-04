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
    this.printer = new window.PrinterModule(outputCallback);
    this.helpHandler = new window.HelpHandler(this.printer);
    this.metaHandler = new window.MetaHandler(this.fs, this.path, this.printer);
    this.songHandler = new window.SongHandler(
      this.fs,
      this.path,
      audioPlayer,
      this.printer
    );
    this.downloadHandler = new window.DownloadHandler(
      this.fs,
      this.path,
      this.printer
    );
    this.playlistHandler = new window.PlaylistHandler(
      this.fs,
      this.path,
      this.playlistOrchestrator,
      this.audioPlayer,
      this.printer
    );
    this.shuffleHandler = new window.ShuffleHandler(
      this.playlistOrchestrator,
      this.printer
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

  handleVolume(command) {
    return this.songHandler.handleVolume(command);
  }

  handleNext() {
    // Check if a playlist is selected/active
    if (this.playlistOrchestrator && this.playlistOrchestrator.getSelectedPlaylist()) {
      // Route to playlist handler if playlist is active
      return this.playlistHandler.handleNext();
    } else {
      // Route to song handler for random selection
      return this.songHandler.handleNext();
    }
  }

  handlePrevious() {
    // Check if a playlist is selected/active
    if (this.playlistOrchestrator && this.playlistOrchestrator.getSelectedPlaylist()) {
      // Route to playlist handler if playlist is active
      return this.playlistHandler.handlePrevious();
    } else {
      // Route to song handler for random selection
      return this.songHandler.handlePrevious();
    }
  }

  handleShuffle(command) {
    return this.shuffleHandler.handleShuffle(command);
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
