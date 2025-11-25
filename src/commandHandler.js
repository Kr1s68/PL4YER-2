class CommandHandler {
  constructor(outputCallback, audioPlayer) {
    this.outputCallback = outputCallback;
    this.audioPlayer = audioPlayer;
    this.audioFiles = []; // Store list of audio files for indexing
    this.currentlyPlaying = null;

    // Import Node.js modules (available due to nodeIntegration: true)
    this.fs = require('fs');
    this.path = require('path');
  }

  // Output helper method
  output(text, type = 'output') {
    if (this.outputCallback) {
      this.outputCallback(text, type);
    }
  }

  // Command handlers
  handleHelp() {
    this.output('Available commands:', 'info');
    this.output('  help            - Show this help message', 'info');
    this.output('  clear           - Clear the console', 'info');
    this.output('  list            - List all audio files in current directory', 'info');
    this.output('  play <file|#>   - Play audio file by name or index (alias: p)', 'info');
    this.output('  debug           - Show debug information and API status', 'info');
    this.output('  date            - Show current date and time', 'info');
    this.output('  version         - Show version information', 'info');
    this.output('  echo <msg>      - Echo a message', 'info');
    this.output('  calc <exp>      - Calculate a mathematical expression', 'info');
  }

  handleClear() {
    // Clear will be handled by the UI directly
    // Return a special flag
    return { action: 'clear' };
  }

  handleDate() {
    this.output(new Date().toString(), 'success');
  }

  handleVersion() {
    this.output(`Node.js: ${process.versions.node}`, 'success');
    this.output(`Chrome: ${process.versions.chrome}`, 'success');
    this.output(`Electron: ${process.versions.electron}`, 'success');
  }

  handleDebug() {
    this.output('Debug Information:', 'info');
    this.output('', 'output');

    // Check Node.js modules
    this.output(`fs module: ${typeof this.fs !== 'undefined' ? 'Available' : 'Not available'}`, typeof this.fs !== 'undefined' ? 'success' : 'error');
    this.output(`path module: ${typeof this.path !== 'undefined' ? 'Available' : 'Not available'}`, typeof this.path !== 'undefined' ? 'success' : 'error');

    // Try to get current directory
    try {
      const cwd = process.cwd();
      this.output(`Current directory: ${cwd}`, 'info');
    } catch (error) {
      this.output(`Error getting directory: ${error.message}`, 'error');
    }
  }

  handleList() {
    try {
      const currentDir = process.cwd();
      const files = this.fs.readdirSync(currentDir);

      // Filter for audio files (mp3, wav, ogg, flac, m4a)
      const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
      const audioFiles = files.filter(file => {
        const ext = this.path.extname(file).toLowerCase();
        return audioExtensions.includes(ext);
      });

      // Store audio files with full paths for playing
      this.audioFiles = audioFiles.map(file => ({
        name: file,
        path: this.path.join(currentDir, file)
      }));

      if (audioFiles.length === 0) {
        this.output('No audio files found in current directory', 'warning');
        this.output(`Directory: ${currentDir}`, 'info');
      } else {
        this.output(`Found ${audioFiles.length} audio file(s) in: ${currentDir}`, 'info');
        this.output('', 'output');

        audioFiles.forEach((file, index) => {
          const filePath = this.path.join(currentDir, file);
          const stats = this.fs.statSync(filePath);
          const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
          this.output(`[${index + 1}] ${file} (${fileSize} MB)`, 'success');
        });
      }
    } catch (error) {
      this.output(`Error: ${error.message}`, 'error');
    }
  }

  handlePlay(command) {
    if (!this.audioPlayer) {
      this.output('Error: Audio player not available', 'error');
      return;
    }

    // Extract the argument (filename or index)
    const parts = command.trim().split(/\s+/);
    const argument = parts.slice(1).join(' '); // Everything after "play" or "p"

    if (!argument) {
      this.output('Usage: play <filename> or play <index>', 'error');
      this.output('Example: play song.mp3 or play 1', 'info');
      this.output('Tip: Use "list" to see available files', 'info');
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
          path: filePath
        };
      } else {
        // Try to find partial match in audioFiles
        const match = this.audioFiles.find(f =>
          f.name.toLowerCase().includes(argument.toLowerCase())
        );

        if (match) {
          fileToPlay = match;
        }
      }
    }

    if (!fileToPlay) {
      this.output(`Error: File not found: ${argument}`, 'error');
      this.output('Tip: Use "list" to see available files', 'info');
      return;
    }

    // Play the file
    try {
      this.audioPlayer.src = fileToPlay.path;
      this.audioPlayer.play();
      this.currentlyPlaying = fileToPlay;
      this.output(`Now playing: ${fileToPlay.name}`, 'success');

      // Update timeline with song name
      if (typeof window !== 'undefined' && window.updateTimelineSong) {
        window.updateTimelineSong(fileToPlay.name);
      }
    } catch (error) {
      this.output(`Error playing file: ${error.message}`, 'error');
    }
  }

  handleEcho(command) {
    const message = command.substring(5);
    this.output(message, 'success');
  }

  handleCalculator(command) {
    try {
      const expression = command.substring(5);
      const result = eval(expression);
      this.output(`Result: ${result}`, 'success');
    } catch (error) {
      this.output(`Error: ${error.message}`, 'error');
    }
  }

  handleUnknown(command) {
    this.output(`Unknown command: ${command}`, 'error');
    this.output(`Type 'help' for available commands`, 'info');
  }
}

// Make CommandHandler available globally for browser context
if (typeof window !== 'undefined') {
  window.CommandHandler = CommandHandler;
}

// Also export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommandHandler;
}
