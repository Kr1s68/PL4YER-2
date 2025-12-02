class PlaylistOrchestrator {
  constructor() {
    this.fs = require('fs');
    this.path = require('path');

    // State management
    this.selectedPlaylist = null; // Currently selected playlist name
    this.playlists = new Map(); // In-memory cache of playlists
    this.currentTrackIndex = -1; // Current playing track index in selected playlist

    // Data directory
    this.dataDir = this.path.join(process.cwd(), 'data', 'playlists');

    // Ensure data directory exists
    this.ensureDataDirectory();

    // Load existing playlists
    this.loadAllPlaylists();
  }

  // Ensure data directory exists
  ensureDataDirectory() {
    try {
      if (!this.fs.existsSync(this.dataDir)) {
        this.fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  // Load all playlists from disk
  loadAllPlaylists() {
    try {
      const files = this.fs.readdirSync(this.dataDir);

      files.forEach(file => {
        if (file.endsWith('.json')) {
          const playlistName = file.replace('.json', '');
          const playlist = this.loadPlaylist(playlistName);
          if (playlist) {
            this.playlists.set(playlistName, playlist);
          }
        }
      });
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  }

  // Load a specific playlist from disk
  loadPlaylist(name) {
    try {
      const filePath = this.path.join(this.dataDir, `${name}.json`);
      if (this.fs.existsSync(filePath)) {
        const data = this.fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error loading playlist ${name}:`, error);
    }
    return null;
  }

  // Save playlist to disk
  savePlaylist(name, playlist) {
    try {
      const filePath = this.path.join(this.dataDir, `${name}.json`);
      this.fs.writeFileSync(filePath, JSON.stringify(playlist, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error saving playlist ${name}:`, error);
      return false;
    }
  }

  // Create a new playlist
  createPlaylist(name) {
    if (!name || name.trim() === '') {
      return { success: false, message: 'Playlist name cannot be empty' };
    }

    if (this.playlists.has(name)) {
      return { success: false, message: `Playlist "${name}" already exists` };
    }

    const playlist = {
      name: name,
      description: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tracks: []
    };

    this.playlists.set(name, playlist);

    if (this.savePlaylist(name, playlist)) {
      return { success: true, message: `Playlist "${name}" created successfully` };
    } else {
      this.playlists.delete(name);
      return { success: false, message: 'Failed to save playlist' };
    }
  }

  // Add song to a specific playlist
  addSongToPlaylist(playlistName, songPath) {
    if (!this.playlists.has(playlistName)) {
      return { success: false, message: `Playlist "${playlistName}" not found` };
    }

    // Check if song file exists
    if (!this.fs.existsSync(songPath)) {
      return { success: false, message: `Song file not found: ${songPath}` };
    }

    const playlist = this.playlists.get(playlistName);

    // Check if song already in playlist
    const alreadyExists = playlist.tracks.some(track => track.path === songPath);
    if (alreadyExists) {
      return { success: false, message: 'Song already in playlist' };
    }

    // Create track object
    const track = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      path: songPath,
      title: this.path.basename(songPath),
      artist: 'Unknown',
      album: 'Unknown',
      duration: 0,
      added: new Date().toISOString()
    };

    playlist.tracks.push(track);
    playlist.modified = new Date().toISOString();

    if (this.savePlaylist(playlistName, playlist)) {
      return {
        success: true,
        message: `Added "${track.title}" to playlist "${playlistName}"`,
        track: track
      };
    } else {
      // Rollback on save failure
      playlist.tracks.pop();
      return { success: false, message: 'Failed to save playlist' };
    }
  }

  // Select a playlist (make it active)
  selectPlaylist(name) {
    if (!this.playlists.has(name)) {
      return { success: false, message: `Playlist "${name}" not found` };
    }

    this.selectedPlaylist = name;
    const playlist = this.playlists.get(name);

    return {
      success: true,
      message: `Playlist "${name}" selected (${playlist.tracks.length} tracks)`,
      playlist: playlist
    };
  }

  // Add song to currently selected playlist
  addSongToSelected(songPath) {
    if (!this.selectedPlaylist) {
      return { success: false, message: 'No playlist selected. Use "playlist [name]" to select a playlist first' };
    }

    return this.addSongToPlaylist(this.selectedPlaylist, songPath);
  }

  // Get currently selected playlist
  getSelectedPlaylist() {
    if (!this.selectedPlaylist) {
      return null;
    }

    return this.playlists.get(this.selectedPlaylist);
  }

  // Get selected playlist name
  getSelectedPlaylistName() {
    return this.selectedPlaylist;
  }

  // List all playlists
  listPlaylists() {
    const playlistList = Array.from(this.playlists.entries()).map(([name, playlist]) => ({
      name: name,
      trackCount: playlist.tracks.length,
      created: playlist.created,
      modified: playlist.modified,
      isSelected: name === this.selectedPlaylist
    }));

    return playlistList;
  }

  // Show playlist details
  showPlaylist(name) {
    if (!this.playlists.has(name)) {
      return { success: false, message: `Playlist "${name}" not found` };
    }

    const playlist = this.playlists.get(name);
    return { success: true, playlist: playlist };
  }

  // Delete a playlist
  deletePlaylist(name) {
    if (!this.playlists.has(name)) {
      return { success: false, message: `Playlist "${name}" not found` };
    }

    try {
      const filePath = this.path.join(this.dataDir, `${name}.json`);
      if (this.fs.existsSync(filePath)) {
        this.fs.unlinkSync(filePath);
      }

      this.playlists.delete(name);

      // Deselect if this was the selected playlist
      if (this.selectedPlaylist === name) {
        this.selectedPlaylist = null;
      }

      return { success: true, message: `Playlist "${name}" deleted` };
    } catch (error) {
      return { success: false, message: `Failed to delete playlist: ${error.message}` };
    }
  }

  // Remove track from playlist
  removeTrackFromPlaylist(playlistName, trackIndex) {
    if (!this.playlists.has(playlistName)) {
      return { success: false, message: `Playlist "${playlistName}" not found` };
    }

    const playlist = this.playlists.get(playlistName);

    if (trackIndex < 1 || trackIndex > playlist.tracks.length) {
      return { success: false, message: `Invalid track index: ${trackIndex}` };
    }

    const removedTrack = playlist.tracks.splice(trackIndex - 1, 1)[0];
    playlist.modified = new Date().toISOString();

    if (this.savePlaylist(playlistName, playlist)) {
      return {
        success: true,
        message: `Removed "${removedTrack.title}" from playlist "${playlistName}"`
      };
    } else {
      // Rollback
      playlist.tracks.splice(trackIndex - 1, 0, removedTrack);
      return { success: false, message: 'Failed to save playlist' };
    }
  }

  // Start playing playlist from beginning
  startPlaylist(playlistName) {
    if (!this.playlists.has(playlistName)) {
      return null;
    }

    const playlist = this.playlists.get(playlistName);
    if (playlist.tracks.length === 0) {
      return null;
    }

    this.currentTrackIndex = 0;
    return playlist.tracks[0];
  }

  // Get next track in currently selected playlist
  getNextTrack() {
    if (!this.selectedPlaylist) {
      return null;
    }

    const playlist = this.playlists.get(this.selectedPlaylist);
    if (!playlist || playlist.tracks.length === 0) {
      return null;
    }

    // Move to next track
    this.currentTrackIndex++;

    // Loop back to beginning if we've reached the end
    if (this.currentTrackIndex >= playlist.tracks.length) {
      this.currentTrackIndex = 0;
    }

    return playlist.tracks[this.currentTrackIndex];
  }

  // Get previous track in currently selected playlist
  getPreviousTrack() {
    if (!this.selectedPlaylist) {
      return null;
    }

    const playlist = this.playlists.get(this.selectedPlaylist);
    if (!playlist || playlist.tracks.length === 0) {
      return null;
    }

    // Move to previous track
    this.currentTrackIndex--;

    // Loop to end if we've gone before the beginning
    if (this.currentTrackIndex < 0) {
      this.currentTrackIndex = playlist.tracks.length - 1;
    }

    return playlist.tracks[this.currentTrackIndex];
  }

  // Get current track
  getCurrentTrack() {
    if (!this.selectedPlaylist || this.currentTrackIndex < 0) {
      return null;
    }

    const playlist = this.playlists.get(this.selectedPlaylist);
    if (!playlist || this.currentTrackIndex >= playlist.tracks.length) {
      return null;
    }

    return playlist.tracks[this.currentTrackIndex];
  }

  // Reset playlist position
  resetPlaylistPosition() {
    this.currentTrackIndex = -1;
  }

  // Get remaining tracks count
  getRemainingTracksCount() {
    if (!this.selectedPlaylist || this.currentTrackIndex < 0) {
      return 0;
    }

    const playlist = this.playlists.get(this.selectedPlaylist);
    if (!playlist) {
      return 0;
    }

    return playlist.tracks.length - this.currentTrackIndex - 1;
  }
}

// Make PlaylistOrchestrator available globally for browser context
if (typeof window !== 'undefined') {
  window.PlaylistOrchestrator = PlaylistOrchestrator;
}

// Also export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlaylistOrchestrator;
}
