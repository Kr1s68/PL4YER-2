# Build Resources

This directory contains resources needed for building distributable versions of PL4YER.

## Icons Required

To build installers, you need to provide icon files for each platform:

### Windows (icon.ico)
- **Format**: `.ico` file
- **Size**: 256x256 pixels (multi-resolution recommended)
- **Tools**:
  - [icoconvert.com](https://icoconvert.com/) - Free online converter
  - GIMP with ICO plugin
  - Photoshop

### macOS (icon.icns)
- **Format**: `.icns` file
- **Size**: 512x512 pixels or higher
- **Tools**:
  - [icnsconverter.com](https://icnsconverter.com/) - Free online converter
  - `iconutil` (Mac built-in command line tool)
  - Image2icon (Mac app)

### Linux (icon.png)
- **Format**: `.png` file
- **Size**: 512x512 pixels
- **Requirements**: Transparent background recommended

## Creating Icons

### Quick Start (Online Tools)

1. **Create a source image**: Design a 1024x1024 PNG with transparent background
2. **Convert for each platform**:
   - Windows: Upload to [icoconvert.com](https://icoconvert.com/)
   - macOS: Upload to [icnsconverter.com](https://icnsconverter.com/)
   - Linux: Resize to 512x512 PNG

### Manual Process

#### For Windows (.ico):
```bash
# Using ImageMagick
magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

#### For macOS (.icns):
```bash
# 1. Create an iconset directory
mkdir MyIcon.iconset

# 2. Generate all required sizes
sips -z 16 16     icon.png --out MyIcon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out MyIcon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out MyIcon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out MyIcon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out MyIcon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out MyIcon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out MyIcon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out MyIcon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out MyIcon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out MyIcon.iconset/icon_512x512@2x.png

# 3. Convert to icns
iconutil -c icns MyIcon.iconset
```

#### For Linux (.png):
```bash
# Using ImageMagick
magick convert icon.png -resize 512x512 icon.png
```

## Design Tips

- **Keep it simple**: Icons should be recognizable at small sizes
- **Use bold shapes**: Thin lines don't scale well
- **Test at different sizes**: Make sure it looks good at 16x16 and 512x512
- **Transparent background**: Allows icon to blend with different themes
- **Consistent branding**: Use colors and shapes that represent your app

## Icon Ideas for PL4YER

Since PL4YER is a console-based audio player, consider:
- Play button (▶) with terminal/console elements
- Waveform visualization
- Vintage cassette or vinyl record
- Combination of music note and terminal prompt (>)
- Minimalist geometric design in retro terminal colors

## Placeholder Icons

If you want to test building without custom icons, electron-builder will use default Electron icons, but this is not recommended for distribution.

## Resources

- [Electron Icon Requirements](https://www.electron.build/icons)
- [App Icon Generator](https://www.appicon.co/)
- [Free Icon Tools](https://favicon.io/)
