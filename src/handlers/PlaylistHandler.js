class PlaylistHandler {
  constructor(
    fsModule,
    pathModule,
    playlistOrchestrator,
    audioPlayer,
    printerModule
  ) {
    this.fs = fsModule;
    this.path = pathModule;
    this.playlistOrchestrator = playlistOrchestrator;
    this.audioPlayer = audioPlayer;
    this.printer = printerModule;

    // Load audio files for path resolution
    this.audioFiles = [];
    this.currentlyPlaying = null;
  }

  // Playlist command handlers
  handlePlaylist(command) {
    if (!this.playlistOrchestrator) {
      this.printer.print("Error: Playlist system not available", "error");
      return;
    }

    const parts = command.trim().split(/\s+/);
    const flag = parts[1];

    // playlist -n <name> - Create new playlist
    if (flag === "-n") {
      const name = parts.slice(2).join(" ");
      if (!name) {
        this.printer.print("Usage: playlist -n <name>", "error");
        return;
      }

      const result = this.playlistOrchestrator.createPlaylist(name);
      this.printer.print(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist -add <playlist> <song> - Add song to playlist
    if (flag === "-add") {
      const playlistName = parts[2];
      const songPath = parts.slice(3).join(" ");

      if (!playlistName || !songPath) {
        this.printer.print("Usage: playlist -add <playlist> <song>", "error");
        return;
      }

      // Resolve song path
      const resolvedPath = this.resolveSongPath(songPath);
      if (!resolvedPath) {
        this.printer.print(`Song not found: ${songPath}`, "error");
        return;
      }

      const result = this.playlistOrchestrator.addSongToPlaylist(
        playlistName,
        resolvedPath
      );
      this.printer.print(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist -list - List all playlists
    if (flag === "-list") {
      const playlists = this.playlistOrchestrator.listPlaylists();

      if (playlists.length === 0) {
        this.printer.print("No playlists found", "info");
        this.printer.print("Create one with: playlist -n <name>", "info");
        return;
      }

      this.printer.print(`Found ${playlists.length} playlist(s):`, "info");
      this.printer.print("", "output");

      playlists.forEach((pl) => {
        const selected = pl.isSelected ? " [SELECTED]" : "";
        this.printer.print(`  ${pl.name}${selected}`, "success");
        this.printer.print(`    Tracks: ${pl.trackCount}`, "info");
        this.printer.print(
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
        this.printer.print("Usage: playlist -show <name>", "error");
        return;
      }

      const result = this.playlistOrchestrator.showPlaylist(name);
      if (!result.success) {
        this.printer.print(result.message, "error");
        return;
      }

      const pl = result.playlist;
      this.printer.print(`Playlist: ${pl.name}`, "info");
      this.printer.print(`Tracks: ${pl.tracks.length}`, "info");
      this.printer.print(
        `Created: ${new Date(pl.created).toLocaleString()}`,
        "info"
      );
      this.printer.print("", "output");

      if (pl.tracks.length === 0) {
        this.printer.print("No tracks in playlist", "info");
      } else {
        pl.tracks.forEach((track, index) => {
          this.printer.print(`[${index + 1}] ${track.title}`, "success");
          this.printer.print(`    Path: ${track.path}`, "info");
        });
      }
      return;
    }

    // playlist -rm <name> <index> - Remove track from playlist
    if (flag === "-rm") {
      const playlistName = parts[2];
      const trackIndex = parseInt(parts[3]);

      if (!playlistName || isNaN(trackIndex)) {
        this.printer.print(
          "Usage: playlist -rm <playlist> <track-number>",
          "error"
        );
        return;
      }

      const result = this.playlistOrchestrator.removeTrackFromPlaylist(
        playlistName,
        trackIndex
      );
      this.printer.print(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist -del <name> - Delete playlist
    if (flag === "-del") {
      const name = parts.slice(2).join(" ");
      if (!name) {
        this.printer.print("Usage: playlist -del <name>", "error");
        return;
      }

      const result = this.playlistOrchestrator.deletePlaylist(name);
      this.printer.print(result.message, result.success ? "success" : "error");
      return;
    }

    // playlist <name> - Select playlist
    const name = parts.slice(1).join(" ");
    if (!name) {
      this.printer.print("Usage: playlist <name> or playlist -list", "error");
      return;
    }

    const result = this.playlistOrchestrator.selectPlaylist(name);
    this.printer.print(result.message, result.success ? "success" : "error");

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
      this.printer.print("Error: Playlist system not available", "error");
      return;
    }

    const songPath = command.trim().split(/\s+/).slice(1).join(" ");

    if (!songPath) {
      this.printer.print("Usage: add <song>", "error");
      this.printer.print(
        'Note: You must select a playlist first with "playlist <name>"',
        "info"
      );
      return;
    }

    // Resolve song path
    const resolvedPath = this.resolveSongPath(songPath);
    if (!resolvedPath) {
      this.printer.print(`Song not found: ${songPath}`, "error");
      return;
    }

    const result = this.playlistOrchestrator.addSongToSelected(resolvedPath);
    this.printer.print(result.message, result.success ? "success" : "error");

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
      this.printer.print("Error: Playlist system not available", "error");
      return;
    }

    if (!this.audioPlayer) {
      this.printer.print("Error: Audio player not available", "error");
      return;
    }

    const playlist = this.playlistOrchestrator.getSelectedPlaylist();
    if (!playlist) {
      this.printer.print("No playlist selected", "error");
      this.printer.print(
        'Use "playlist <name>" to select a playlist first',
        "info"
      );
      return;
    }

    if (playlist.tracks.length === 0) {
      this.printer.print(`Playlist "${playlist.name}" is empty`, "warning");
      return;
    }

    // Start playing the playlist from the beginning
    const playlistName = this.playlistOrchestrator.getSelectedPlaylistName();
    const firstTrack = this.playlistOrchestrator.startPlaylist(playlistName);

    if (!firstTrack) {
      this.printer.print("Error starting playlist", "error");
      return;
    }

    try {
      this.audioPlayer.src = firstTrack.path;
      this.audioPlayer.play();
      this.currentlyPlaying = firstTrack;

      this.printer.print(`Playing playlist: ${playlist.name}`, "success");
      this.printer.print(`Now playing: ${firstTrack.title}`, "success");
      this.printer.print(`Tracks in queue: ${playlist.tracks.length}`, "info");

      // Update timeline with song name
      if (typeof window !== "undefined" && window.updateTimelineSong) {
        window.updateTimelineSong(firstTrack.title);
      }

      // Update drawer to highlight current track
      if (typeof window !== "undefined" && window.updateDrawerCurrentTrack) {
        window.updateDrawerCurrentTrack();
      }
    } catch (error) {
      this.printer.print(`Error playing playlist: ${error.message}`, "error");
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

if (typeof window !== "undefined") {
  window.PlaylistHandler = PlaylistHandler;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PlaylistHandler;
}
