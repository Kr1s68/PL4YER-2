class PlaylistOrchestrator {
  constructor() {
    this.fs = require('fs');
    this.path = require('path');

    // State management
    this.selectedPlaylist = null; // Currently selected playlist name
    this.playlists = new Map(); // In-memory cache of playlists
    this.currentTrackIndex = -1; // Current playing track index in selected playlist
    this.shuffleEnabled = false; // Global shuffle state

    // Data directory
    this.dataDir = this.path.join(process.cwd(), 'data', 'playlists');
    this.configFile = this.path.join(process.cwd(), 'data', 'config.json');

    // Ensure data directory exists
    this.ensureDataDirectory();

    // Load configuration (including shuffle state)
    this.loadConfig();

    // Load existing playlists
    this.loadAllPlaylists();
  }

  // Ensure data directory exists
  ensureDataDirectory() {
    try {
      const dataRootDir = this.path.join(process.cwd(), 'data');
      if (!this.fs.existsSync(dataRootDir)) {
        this.fs.mkdirSync(dataRootDir, { recursive: true });
      }
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
      shuffled: false,
      originalTrackOrder: [],
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

  // ========== Configuration Management ==========

  // Load configuration from disk
  loadConfig() {
    try {
      if (this.fs.existsSync(this.configFile)) {
        const data = this.fs.readFileSync(this.configFile, 'utf8');
        const config = JSON.parse(data);
        this.shuffleEnabled = config.shuffleEnabled || false;
      } else {
        // Create default config if it doesn't exist
        this.saveConfig();
      }
    } catch (error) {
      console.error('Error loading config:', error);
      this.shuffleEnabled = false;
    }
  }

  // Save configuration to disk
  saveConfig() {
    try {
      const config = {
        shuffleEnabled: this.shuffleEnabled
      };
      this.fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  // ========== Shuffle Functionality ==========

  // Get current shuffle state
  getShuffleState() {
    return this.shuffleEnabled;
  }

  // Enable shuffle mode globally
  enableShuffle() {
    this.shuffleEnabled = true;
    this.saveConfig();

    // If a playlist is currently selected, shuffle it
    if (this.selectedPlaylist) {
      const currentTrack = this.getCurrentTrack();
      const result = this.shufflePlaylist(this.selectedPlaylist, currentTrack);

      if (result.success) {
        return {
          success: true,
          shuffledPlaylist: this.selectedPlaylist,
          trackCount: result.trackCount
        };
      }
    }

    return { success: true };
  }

  // Disable shuffle mode globally
  disableShuffle() {
    this.shuffleEnabled = false;
    this.saveConfig();

    let restoredCount = 0;

    // Restore original order for all shuffled playlists
    this.playlists.forEach((playlist, name) => {
      if (playlist.shuffled) {
        this.unshufflePlaylist(name);
        restoredCount++;
      }
    });

    return {
      success: true,
      restoredCount: restoredCount
    };
  }

  // Shuffle a specific playlist using Fisher-Yates algorithm
  shufflePlaylist(playlistName, currentTrack = null) {
    if (!this.playlists.has(playlistName)) {
      return { success: false, message: `Playlist "${playlistName}" not found` };
    }

    const playlist = this.playlists.get(playlistName);

    if (playlist.tracks.length === 0) {
      return { success: false, message: 'Playlist is empty' };
    }

    if (playlist.tracks.length === 1) {
      return { success: false, message: 'Playlist has only one track, no need to shuffle' };
    }

    // If already shuffled, restore original order first
    if (playlist.shuffled && playlist.originalTrackOrder) {
      playlist.tracks = [...playlist.originalTrackOrder];
    }

    // Save original track order before shuffling
    playlist.originalTrackOrder = [...playlist.tracks];

    // Shuffle the tracks
    playlist.tracks = this.fisherYatesShuffle(playlist.tracks, currentTrack);
    playlist.shuffled = true;
    playlist.modified = new Date().toISOString();

    // Reset current track index to 0 (where current track is now)
    if (currentTrack && playlistName === this.selectedPlaylist) {
      this.currentTrackIndex = 0;
    }

    // Save to disk
    if (this.savePlaylist(playlistName, playlist)) {
      return {
        success: true,
        trackCount: playlist.tracks.length
      };
    } else {
      // Rollback on save failure
      playlist.tracks = [...playlist.originalTrackOrder];
      playlist.shuffled = false;
      delete playlist.originalTrackOrder;
      return { success: false, message: 'Failed to save playlist' };
    }
  }

  // Restore original order for a playlist
  unshufflePlaylist(playlistName) {
    if (!this.playlists.has(playlistName)) {
      return { success: false, message: `Playlist "${playlistName}" not found` };
    }

    const playlist = this.playlists.get(playlistName);

    if (!playlist.shuffled) {
      return { success: false, message: 'Playlist is not shuffled' };
    }

    if (playlist.originalTrackOrder && playlist.originalTrackOrder.length > 0) {
      playlist.tracks = [...playlist.originalTrackOrder];
    }

    playlist.shuffled = false;
    playlist.originalTrackOrder = [];
    playlist.modified = new Date().toISOString();

    // Reset current track index
    if (playlistName === this.selectedPlaylist) {
      this.currentTrackIndex = -1;
    }

    // Save to disk
    this.savePlaylist(playlistName, playlist);

    return { success: true };
  }

  // Fisher-Yates shuffle algorithm
  fisherYatesShuffle(array, currentItem = null) {
    // Create a copy to avoid mutating original
    const shuffled = [...array];
    let currentIndex = -1;

    // If currentItem exists, find it and remove it temporarily
    if (currentItem) {
      currentIndex = shuffled.findIndex(track => track.path === currentItem.path);
      if (currentIndex !== -1) {
        shuffled.splice(currentIndex, 1);
      }
    }

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // If currentItem exists, put it at position 0
    if (currentItem && currentIndex !== -1) {
      shuffled.unshift(currentItem);
    }

    return shuffled;
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
