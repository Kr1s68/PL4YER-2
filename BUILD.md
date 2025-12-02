# Building and Distributing PL4YER

This guide explains how to build distributable installers for PL4YER.

## Prerequisites

### 1. Node.js and npm
- **Installed**: ✓ (Already have from development)

### 2. Application Icons
- Create icon files for each platform in the `build/` directory
- See [build/README.md](build/README.md) for detailed instructions
- **Optional for testing**: electron-builder will use default icons if none provided

### 3. Platform-Specific Requirements

#### Windows
- **To build on**: Windows (recommended) or Linux/Mac with Wine
- **Installer types**: NSIS (installer), Portable (no install required)
- **Code signing** (optional but recommended):
  - Purchase code signing certificate (~$100-300/year)
  - Without it, users will see SmartScreen warnings

#### macOS
- **To build on**: macOS only
- **Installer types**: DMG, ZIP
- **Code signing** (required for distribution):
  - Apple Developer account ($99/year)
  - Certificate and notarization required

#### Linux
- **To build on**: Any platform
- **Installer types**: AppImage (universal), .deb (Debian/Ubuntu)
- **No code signing required**

## Build Commands

### Build for Your Current Platform
```bash
npm run build
```
Output: `dist/` directory with installers

### Build for Specific Platforms

#### Windows
```bash
npm run build:win
```
Creates:
- `dist/PL4YER Setup 0.1.0.exe` (NSIS installer)
- `dist/PL4YER 0.1.0.exe` (Portable executable)

#### macOS
```bash
npm run build:mac
```
Creates:
- `dist/PL4YER-0.1.0.dmg`
- `dist/PL4YER-0.1.0-mac.zip`

#### Linux
```bash
npm run build:linux
```
Creates:
- `dist/PL4YER-0.1.0.AppImage`
- `dist/pl4yer-2_0.1.0_amd64.deb`

### Build for All Platforms (Advanced)
```bash
npm run build:all
```
**Note**: Building for macOS requires macOS. Building Windows on Linux requires Wine.

## Before Building

### 1. Update Version Number
Edit `package.json`:
```json
{
  "version": "0.1.0"  // Change this
}
```

### 2. Update Author Information
Edit `package.json`:
```json
{
  "author": "Your Name <your.email@example.com>"
}
```

### 3. Add Icons (Recommended)
Place these files in the `build/` directory:
- `icon.ico` (Windows)
- `icon.icns` (macOS)
- `icon.png` (Linux)

See [build/README.md](build/README.md) for instructions.

### 4. Test Your App
```bash
npm start
```
Make sure everything works before building!

## Build Configuration

The build settings are in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.pl4yer.app",
    "productName": "PL4YER",
    "directories": {
      "output": "dist",
      "buildResources": "build"
    }
  }
}
```

### What Gets Packaged

**Included**:
- All files in `src/`
- `package.json`
- Node.js runtime
- Electron framework

**Excluded**:
- `node_modules/` (dev dependencies)
- `songs/` (user's music library)
- `data/playlists/` (user's playlists)
- `.git/` (version control)

**Note**: The app will create `data/` and `songs/` directories on first run.

## Distribution

### Option 1: GitHub Releases (Recommended for Open Source)

1. **Create a new release on GitHub**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Upload installers**:
   - Go to GitHub → Releases → Create new release
   - Upload files from `dist/` directory
   - Write release notes

3. **Users download**:
   - Windows: `PL4YER Setup 0.1.0.exe`
   - macOS: `PL4YER-0.1.0.dmg`
   - Linux: `PL4YER-0.1.0.AppImage`

### Option 2: Direct Download (Website/Cloud Storage)

Upload installers to:
- Your website
- Google Drive / Dropbox (public links)
- SourceForge
- itch.io

### Option 3: App Stores

#### Microsoft Store (Windows)
- Register for Partner Center ($19 one-time)
- Submit APPX/MSIX build
- Review process: ~24-48 hours

#### Snap Store (Linux)
```bash
snapcraft
snapcraft upload --release=stable
```

## Code Signing

### Windows Code Signing

1. **Get a certificate**:
   - Purchase from: Sectigo, DigiCert, etc.
   - Cost: ~$100-300/year

2. **Configure in package.json**:
   ```json
   {
     "win": {
       "certificateFile": "path/to/cert.pfx",
       "certificatePassword": "your-password"
     }
   }
   ```

3. **Build**:
   ```bash
   npm run build:win
   ```

### macOS Code Signing and Notarization

1. **Join Apple Developer Program** ($99/year)

2. **Get certificates**:
   - Developer ID Application certificate
   - Developer ID Installer certificate

3. **Configure environment**:
   ```bash
   export APPLEID="your.email@example.com"
   export APPLEIDPASS="app-specific-password"
   ```

4. **Update package.json**:
   ```json
   {
     "mac": {
       "hardenedRuntime": true,
       "gatekeeperAssess": false,
       "entitlements": "build/entitlements.mac.plist",
       "entitlementsInherit": "build/entitlements.mac.plist"
     },
     "afterSign": "scripts/notarize.js"
   }
   ```

5. **Build and notarize**:
   ```bash
   npm run build:mac
   ```

## Troubleshooting

### "Cannot find icon.ico"
- Either add icons to `build/` directory
- Or remove icon configuration from `package.json`

### Build fails on Linux for Windows target
- Install Wine: `sudo apt install wine64`
- Or build on Windows machine

### Build size is too large
- Check what's being included in `package.json` → `build.files`
- Exclude unnecessary files with `!pattern`

### "Missing dependencies" error
- Make sure all dependencies are in `dependencies`, not `devDependencies`
- Run `npm install` before building

## Advanced Configuration

### Auto-Updates

Add to `package.json`:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "pl4yer-2"
    }
  }
}
```

Add to `src/main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

### Custom Installer

Customize NSIS installer:
```json
{
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "installerIcon": "build/installer-icon.ico",
    "uninstallerIcon": "build/uninstaller-icon.ico",
    "installerHeader": "build/installer-header.bmp"
  }
}
```

## File Sizes

Typical installer sizes:
- Windows NSIS: ~100-150 MB
- Windows Portable: ~150-200 MB
- macOS DMG: ~100-150 MB
- Linux AppImage: ~100-150 MB

The Electron framework adds ~80-100 MB to your app size.

## Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Publishing Guide](https://www.electron.build/configuration/publish)
- [Icon Requirements](https://www.electron.build/icons)

## Quick Checklist

Before releasing:
- [ ] Update version in package.json
- [ ] Update author information
- [ ] Add application icons
- [ ] Test the app thoroughly
- [ ] Build for target platforms
- [ ] Test the installers
- [ ] Write release notes
- [ ] Upload to distribution platform
- [ ] Announce the release

## Getting Help

If you encounter issues:
1. Check electron-builder logs in console
2. Review [build/README.md](build/README.md) for icon setup
3. Visit [Electron Builder Issues](https://github.com/electron-userland/electron-builder/issues)
4. Check Electron documentation
