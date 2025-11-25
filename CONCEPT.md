# PL4YER - Console Audio Player Concept

## Project Overview

PL4YER is a local audio file player built as an Electron desktop application with a console-based interface. It combines the power of modern web technologies with the elegance and efficiency of a command-line interface, providing users with a unique and streamlined audio playback experience.

## Vision

Create a minimalist yet powerful audio player that allows users to manage and play their local music library through an intuitive console interface. PL4YER aims to be:
- **Fast**: Quick command execution and responsive playback
- **Lightweight**: Minimal resource usage
- **Flexible**: Powerful playlist and queue management
- **Local-first**: All data stored locally, no cloud dependency

## Core Features

### 1. Audio File Browsing
- Browse local directories for audio files
- Support for common audio formats (MP3, WAV, OGG, FLAC, M4A)
- Display file metadata (title, artist, album, duration)
- Search functionality for finding specific tracks
- Recursive directory scanning

### 2. Playback Controls
- **Play**: Start playback of selected audio file
- **Pause/Resume**: Pause and resume playback
- **Stop**: Stop playback completely
- **Skip**: Move to next/previous track in queue
- **Seek**: Jump to specific time in track
- **Volume**: Adjust playback volume (0-100%)
- **Mute/Unmute**: Toggle audio muting

### 3. Playlist Management
- Create custom playlists
- Add/remove tracks from playlists
- Save playlists to JSON files
- Load existing playlists
- Edit playlist metadata (name, description)
- Delete playlists
- Display playlist contents

### 4. Queue System
- Dynamic playback queue
- Add tracks to queue on-the-fly
- View current queue
- Reorder queue items
- Clear queue
- Save/load queue states
- Auto-play next track in queue

### 5. Data Persistence
- Playlists saved as JSON files in local directory
- Queue states saved automatically
- User preferences and settings stored locally
- Recent tracks history
- Favorite tracks list

## Technical Architecture

### Technology Stack
- **Electron**: Cross-platform desktop application framework
- **Node.js**: Backend processing and file system operations
- **HTML5 Audio API**: Audio playback engine
- **JavaScript**: Application logic
- **CSS3**: Styled console interface

### Application Structure

```
PL4YER-2/
├── src/
│   ├── index.html           # Main UI
│   ├── styles.css           # Application styles
│   ├── main.js              # Electron main process
│   ├── preload.js           # Electron preload script
│   ├── commandProcessor.js  # Command handling
│   ├── audioPlayer.js       # Audio playback engine (to be created)
│   ├── fileManager.js       # File system operations (to be created)
│   ├── playlistManager.js   # Playlist operations (to be created)
│   └── queueManager.js      # Queue operations (to be created)
├── data/
│   ├── playlists/           # Saved playlists (JSON)
│   ├── queues/              # Saved queues (JSON)
│   └── config.json          # User settings
└── CONCEPT.md               # This file
```

### Component Design

#### AudioPlayer
Handles all audio playback operations:
- Load audio files
- Control playback state
- Manage volume
- Emit playback events
- Track progress

#### FileManager
Manages file system operations:
- Scan directories for audio files
- Read file metadata
- Validate file formats
- Cache file listings

#### PlaylistManager
Handles playlist operations:
- Create/read/update/delete playlists
- Validate playlist structure
- Persist to JSON files
- Load playlist data

#### QueueManager
Manages playback queue:
- Add/remove tracks
- Reorder queue
- Track current position
- Auto-advance functionality
- Persist queue state

#### CommandProcessor
Processes user commands (already implemented):
- Parse command input
- Route to appropriate handler
- Return formatted output
- Maintain command history

## Command Interface

### File Browsing Commands
```
browse [path]              - List audio files in directory
scan [path]                - Scan directory recursively
search <query>             - Search for tracks by name/artist
info <file>                - Display file metadata
```

### Playback Commands
```
play <file|index>          - Play specified file or queue index
pause                      - Pause playback
resume                     - Resume playback
stop                       - Stop playback
next                       - Skip to next track
prev                       - Skip to previous track
seek <time>                - Seek to time (e.g., "2:30" or "150")
volume <0-100>             - Set volume level
mute                       - Toggle mute
status                     - Show current playback status
```

### Queue Commands
```
queue add <file>           - Add file to queue
queue remove <index>       - Remove item from queue
queue clear                - Clear entire queue
queue show                 - Display current queue
queue save <name>          - Save queue to file
queue load <name>          - Load saved queue
queue shuffle              - Shuffle queue order
```

### Playlist Commands
```
playlist create <name>     - Create new playlist
playlist add <name> <file> - Add track to playlist
playlist remove <name> <id>- Remove track from playlist
playlist show <name>       - Display playlist contents
playlist list              - List all playlists
playlist delete <name>     - Delete playlist
playlist play <name>       - Load playlist into queue and play
playlist rename <old> <new>- Rename playlist
```

### Utility Commands
```
help                       - Show available commands
clear                      - Clear console
version                    - Show version information
history                    - Show recently played tracks
favorites                  - Show favorite tracks
favorite add <file>        - Add track to favorites
config <key> <value>       - Set configuration option
exit                       - Exit application
```

## Data Structures

### Playlist JSON Format
```json
{
  "name": "My Playlist",
  "description": "My favorite tracks",
  "created": "2025-11-25T12:00:00Z",
  "modified": "2025-11-25T12:00:00Z",
  "tracks": [
    {
      "id": "track-1",
      "path": "E:\\Music\\song1.mp3",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "duration": 245,
      "added": "2025-11-25T12:00:00Z"
    }
  ]
}
```

### Queue JSON Format
```json
{
  "name": "Current Queue",
  "created": "2025-11-25T12:00:00Z",
  "currentIndex": 0,
  "repeat": false,
  "shuffle": false,
  "tracks": [
    {
      "queueId": "queue-1",
      "path": "E:\\Music\\song1.mp3",
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 245
    }
  ]
}
```

### Configuration Format
```json
{
  "version": "1.0.0",
  "audioDirectory": "E:\\Music",
  "defaultVolume": 80,
  "autoPlay": true,
  "repeatMode": "none",
  "theme": "dark",
  "historyLimit": 50,
  "dataDirectory": "./data"
}
```

## User Workflow Examples

### Example 1: Playing Music
```
> browse E:\Music
Found 42 audio files
[1] song1.mp3 - Artist - Song Title (3:45)
[2] song2.mp3 - Artist - Another Song (4:12)
...

> play 1
Now playing: Artist - Song Title

> volume 75
Volume set to 75%

> pause
Playback paused

> resume
Playback resumed
```

### Example 2: Creating a Playlist
```
> playlist create "Chill Vibes"
Playlist "Chill Vibes" created

> playlist add "Chill Vibes" E:\Music\song1.mp3
Added to playlist: Song Title

> playlist add "Chill Vibes" E:\Music\song2.mp3
Added to playlist: Another Song

> playlist show "Chill Vibes"
Playlist: Chill Vibes (2 tracks)
[1] Song Title - Artist (3:45)
[2] Another Song - Artist (4:12)

> playlist play "Chill Vibes"
Loaded 2 tracks into queue. Starting playback...
```

### Example 3: Queue Management
```
> queue add E:\Music\song1.mp3
Added to queue: Song Title

> queue add E:\Music\song2.mp3
Added to queue: Another Song

> queue show
Current Queue (2 tracks):
[1] Song Title - Artist (3:45) [NOW PLAYING]
[2] Another Song - Artist (4:12)

> next
Skipped to: Another Song

> queue save "evening-mix"
Queue saved as "evening-mix"
```

## Implementation Phases

### Phase 1: Core Audio Playback (Foundation)
- Implement AudioPlayer class
- Basic play/pause/stop functionality
- Volume control
- Integration with CommandProcessor

### Phase 2: File Management
- Implement FileManager class
- Directory browsing
- File metadata reading
- Search functionality

### Phase 3: Queue System
- Implement QueueManager class
- Queue operations (add, remove, reorder)
- Auto-advance functionality
- Queue persistence

### Phase 4: Playlist Management
- Implement PlaylistManager class
- CRUD operations for playlists
- JSON persistence
- Playlist playback integration

### Phase 5: Advanced Features
- Track history
- Favorites system
- Shuffle and repeat modes
- Configuration management

### Phase 6: Polish & Enhancement
- Error handling improvements
- Performance optimization
- Enhanced metadata display
- User preferences

## Future Enhancements

### Potential Features for Version 2.0+
- **Visualizer**: Audio spectrum analyzer
- **Equalizer**: Audio frequency controls
- **Lyrics Display**: Show synchronized lyrics
- **Album Art**: Display album artwork
- **Smart Playlists**: Auto-generated based on criteria
- **Statistics**: Play counts, most played tracks
- **Remote Control**: Control via mobile app
- **Plugin System**: Extensibility for custom features
- **Themes**: Multiple UI theme options
- **Hotkeys**: Keyboard shortcuts for commands
- **Notifications**: Desktop notifications for track changes
- **Integration**: Last.fm scrobbling, Discord presence

## Design Principles

1. **Simplicity**: Keep the interface clean and commands intuitive
2. **Performance**: Prioritize fast response times
3. **Reliability**: Ensure stable playback and data integrity
4. **Modularity**: Build reusable, maintainable components
5. **User Control**: Give users full control over their library
6. **Privacy**: No telemetry, no cloud storage unless explicitly enabled

## Target Audience

- Power users who prefer keyboard-driven interfaces
- Developers and tech enthusiasts
- Users who want full control over their music library
- Anyone seeking a lightweight alternative to bloated music players
- Retro computing and terminal interface fans

## Success Metrics

- Fast command execution (< 100ms response time)
- Stable audio playback (no stuttering or crashes)
- Efficient memory usage (< 200MB idle)
- Intuitive command syntax (minimal learning curve)
- Reliable data persistence (no playlist corruption)

---

**Project Status**: In Development
**Current Version**: 0.1.0 (Console Interface)
**Last Updated**: 2025-11-25
