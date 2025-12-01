# PL4YER - Console Audio Player

A minimalist local audio player built with Electron, featuring a unique console-based interface for managing and playing your music library. PL4YER combines the power of modern web technologies with the elegance and efficiency of a command-line interface.

## Features

### Audio Playback
- Play local audio files (MP3, WAV, OGG, FLAC, M4A)
- Pause/Resume playback
- Visual timeline with progress bar
- Seek by clicking on timeline
- Currently playing track display

### Playlist Management
- Create and manage multiple playlists
- Add/remove tracks from playlists
- Select and play entire playlists
- Auto-advance to next track
- Persistent playlist storage (JSON format)
- Side drawer UI for playlist visualization
- Real-time current track highlighting

### File Management
- Browse audio files in current directory
- List files with metadata (size, index)
- Play by filename or index number
- File path resolution and partial matching

### YouTube Download
- Download YouTube videos as MP3 files
- Uses yt-dlp for reliable downloads
- Progress tracking
- Custom filename support
- Automatic conversion to MP3

### Console Interface
- Clean, retro-style terminal UI
- Command history (Arrow Up/Down navigation)
- Syntax-highlighted output (success, error, info)
- Clear command output
- Help system with command reference

## Installation

### Prerequisites

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Python** (for YouTube downloads - optional)
   - Download from [python.org](https://www.python.org/downloads/)

3. **yt-dlp** (for YouTube downloads - optional)
   ```bash
   pip install yt-dlp
   ```

### Setup

1. Clone or download this repository
   ```bash
   git clone <repository-url>
   cd PL4YER-2
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the application
   ```bash
   npm start
   ```

## Usage

### Quick Start

1. Launch PL4YER using `npm start`
2. Type `help` to see available commands
3. Type `list` to see audio files in the current directory
4. Type `play 1` to play the first file
5. Create a playlist with `playlist -n "My Playlist"`
6. Add songs with `add <filename>` or `add <index>`

### Command Reference

#### General Commands

| Command | Description |
|---------|-------------|
| `help` | Show help message with all commands |
| `clear` | Clear the console output |
| `date` | Show current date and time |
| `version` | Show version information (Node, Electron, Chrome) |
| `echo <message>` | Echo a message |
| `calc <expression>` | Calculate mathematical expression |
| `debug` | Show debug information and API status |

#### Audio Commands

| Command | Description |
|---------|-------------|
| `list` | List all audio files in current directory |
| `play <file\|#>` | Play audio file by name or index (alias: `p`) |
| `pause` | Pause current playback |
| `resume` | Resume paused playback |
| `download <url> [name]` | Download YouTube video as MP3 (alias: `dl`) |

#### Playlist Commands

| Command | Description |
|---------|-------------|
| `playlist -n <name>` | Create a new playlist |
| `playlist <name>` | Select/activate a playlist |
| `playlist -list` | List all playlists |
| `playlist -show <name>` | Show playlist details and tracks |
| `playlist -add <playlist> <song>` | Add song to specified playlist |
| `playlist -rm <playlist> <#>` | Remove track from playlist by index |
| `playlist -del <name>` | Delete a playlist |
| `add <song>` | Add song to currently selected playlist |
| `play` (or `p`) | Play currently selected playlist |

### Workflow Examples

#### Playing Music

```
> list
Found 3 audio files in: E:\PL4YER-2
[1] song1.mp3 (3.45 MB)
[2] song2.mp3 (4.12 MB)
[3] song3.mp3 (5.01 MB)

> play 1
Now playing: song1.mp3

> pause
Playback paused

> resume
Playback resumed
```

#### Creating and Using Playlists

```
> playlist -n "Favorites"
Playlist "Favorites" created successfully

> playlist Favorites
Playlist "Favorites" selected (0 tracks)

> list
Found 3 audio files...

> add 1
Added "song1.mp3" to playlist "Favorites"

> add 2
Added "song2.mp3" to playlist "Favorites"

> play
Playing playlist: Favorites
Now playing: song1.mp3
Tracks in queue: 2
```

#### Downloading from YouTube

```
> download https://youtube.com/watch?v=xxxxx my-song
Using yt-dlp 2024.x.x
Starting download...
Progress: 10%
Progress: 20%
...
Progress: 100%
Converting to MP3...
Download complete!
Use "list" to see it in your library

> list
Found 4 audio files in: E:\PL4YER-2
[1] my-song.mp3 (3.21 MB)
...
```

## Project Structure

```
PL4YER-2/
├── src/
│   ├── index.html              # Main UI interface
│   ├── styles.css              # Application styles
│   ├── main.js                 # Electron main process
│   ├── preload.js              # Electron preload script
│   ├── commandProcessor.js     # Command parsing & routing
│   ├── commandHandler.js       # Command implementation
│   └── PlaylistOrchestrator.js # Playlist management system
├── data/
│   └── playlists/              # Stored playlists (JSON files)
├── package.json                # Project dependencies
└── CONCEPT.md                  # Project concept document
```

## Technical Details

### Technology Stack
- **Electron**: Cross-platform desktop application framework
- **Node.js**: Backend processing and file system operations
- **HTML5 Audio API**: Audio playback engine
- **JavaScript (ES6+)**: Application logic
- **CSS3**: Styled console interface

### Key Components

#### CommandProcessor
- Parses user input
- Maintains command history
- Routes commands to appropriate handlers
- Supports arrow key navigation

#### CommandHandler
- Implements all command functionality
- Manages audio playback
- Handles file system operations
- Integrates with yt-dlp for downloads

#### PlaylistOrchestrator
- Creates and manages playlists
- Handles track queue
- Provides auto-advance functionality
- Persists playlists to JSON files

### Data Storage

Playlists are stored as JSON files in `data/playlists/` directory:

```json
{
  "name": "My Playlist",
  "description": "",
  "created": "2025-12-01T...",
  "modified": "2025-12-01T...",
  "tracks": [
    {
      "id": "track-xxx",
      "path": "E:\\Music\\song.mp3",
      "title": "song.mp3",
      "artist": "Unknown",
      "album": "Unknown",
      "duration": 0,
      "added": "2025-12-01T..."
    }
  ]
}
```

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# The app will open with DevTools available (F12)
```

### Adding New Commands

1. Add command handler in [commandHandler.js](src/commandHandler.js)
2. Add command routing in [commandProcessor.js](src/commandProcessor.js)
3. Update help text in `handleHelp()` method

### Modifying UI

- Main interface: [index.html](src/index.html)
- Styling: [styles.css](src/styles.css)
- Audio timeline and drawer are fully integrated

## Requirements

- **Platform**: Windows, macOS, or Linux
- **Node.js**: v16.x or higher
- **Electron**: v39.x (included in dependencies)
- **Python**: 3.x (optional, for YouTube downloads)
- **yt-dlp**: Latest version (optional, for YouTube downloads)

## Known Features

- Auto-advance through playlists
- Playlist drawer with real-time track highlighting
- Timeline with click-to-seek functionality
- Command history with arrow key navigation
- Persistent playlist storage
- YouTube download with progress tracking

## Version History

- **v0.0.1** - Initial release
  - Basic audio playback
  - Console interface
  - Playlist management
  - YouTube download support
  - Auto-advance functionality

## Future Enhancements

Potential features for future versions:
- Volume controls via commands
- Shuffle and repeat modes
- Track metadata reading (ID3 tags)
- Search functionality
- Queue management
- Favorites system
- Keyboard shortcuts
- Multiple audio format support improvements

## License

ISC

## Author

PL4YER Team

---

**Note**: This is a local-first application. All data is stored on your machine, and no telemetry or cloud services are used.
