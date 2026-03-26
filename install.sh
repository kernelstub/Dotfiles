#!/bin/bash
set -Eeuo pipefail

LOG_FILE="$HOME/gnome-dotfiles-install.log"

log()   { echo "[$(date '+%Y-%m-%d %H:%M:%S')] → $*" | tee -a "$LOG_FILE"; }
warn()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] → $*" | tee -a "$LOG_FILE"; }
error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] → $*" | tee -a "$LOG_FILE" >&2; }

trap 'error "Script failed at line $LINENO"' ERR

log "Starting GNOME dotfiles installation..."

# ------------------
# Clone repo if running from curl
# ------------------
if [ ! -f ".git/config" ]; then
    TEMP_DIR=$(mktemp -d)
    log "Cloning repo into $TEMP_DIR"
    git clone --depth 1 https://github.com/kernelstub/Dotfiles.git "$TEMP_DIR"
    cd "$TEMP_DIR"
else
    log "Running inside existing repo"
fi

# ------------------
# Detect package manager
# ------------------
# if command -v apt >/dev/null; then
#     PKG_MANAGER="apt"
#     sudo apt update
# elif command -v pacman >/dev/null; then
#     PKG_MANAGER="pacman"
# elif command -v dnf >/dev/null; then
#     PKG_MANAGER="dnf"
# else
#     error "No supported package manager found"
#     exit 1
# fi

install_pkg() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log "Installing dependency: $1"
        case "$PKG_MANAGER" in
            apt) sudo apt install -y "$1" ;;
            pacman) sudo pacman -S --noconfirm "$1" ;;
            dnf) sudo dnf install -y "$1" ;;
        esac
    else
        log "Dependency already installed: $1"
    fi
}

# ------------------
# Dependencies
# ------------------
install_pkg curl
install_pkg jq
install_pkg dconf

if [ "$PKG_MANAGER" = "apt" ]; then
    install_pkg gnome-shell-extensions
elif [ "$PKG_MANAGER" = "pacman" ]; then
    install_pkg gnome-shell-extensions
elif [ "$PKG_MANAGER" = "dnf" ]; then
    install_pkg gnome-extensions-app
fi

# ------------------
# Copy extension files
# ------------------
EXT_DIR="$HOME/.local/share/gnome-shell/extensions"
mkdir -p "$EXT_DIR"
if [ -d extensions ]; then
    log "Syncing extension files..."
    rsync -a --ignore-existing extensions/ "$EXT_DIR/" || warn "Extension sync failed"
fi

# ------------------
# GTK Themes
# ------------------
if [ -d system/Theme ]; then
    log "Installing GTK themes..."
    mkdir -p ~/.themes
    find ~/.themes -maxdepth 1 -type d -name "Colloid*" -exec rm -rf {} + 2>/dev/null || true
    rsync -a system/Theme/ ~/.themes/
fi

# ------------------
# Icons & cursors
# ------------------
if [ -d system/Icons ]; then
    log "Installing icons & cursors..."
    mkdir -p ~/.icons
    find ~/.icons -maxdepth 1 -type d -name "Colloid*" -exec rm -rf {} + 2>/dev/null || true
    rsync -a system/Icons/ ~/.icons/
fi

# ------------------
# App configs
# ------------------
if [ -d config ]; then
    log "Syncing config files..."
    mkdir -p ~/.config
    rsync -a config/ ~/.config/
fi

# ------------------
# Wallpapers
# ------------------
if [ -d wallpapers ]; then
    log "Installing wallpapers..."
    mkdir -p ~/Pictures/Wallpapers
    rsync -a wallpapers/ ~/Pictures/Wallpapers/
fi

# ------------------
# Fonts
# ------------------
if [ -d fonts ]; then
    log "Installing fonts..."
    mkdir -p ~/.local/share/fonts
    rsync -a fonts/ ~/.local/share/fonts/
    fc-cache -f >/dev/null 2>&1
fi

# ------------------
# GNOME settings
# ------------------
if [ -f gnome-settings.ini ]; then
    log "Applying GNOME settings..."
    dconf load /org/gnome/ < gnome-settings.ini || warn "dconf failed"
fi

# ------------------
# Enable extensions
# ------------------
if [ -f extensions.txt ]; then
    log "Enabling extensions..."
    while read -r ext; do
        [ -z "$ext" ] && continue
        if gnome-extensions list --enabled | grep -q "$ext"; then
            log "Already enabled: $ext"
        else
            gnome-extensions enable "$ext" 2>/dev/null || warn "Failed to enable $ext"
        fi
    done < extensions.txt
fi

# ------------------
# Apply theme
# ------------------
log "Applying theme settings..."
gsettings set org.gnome.desktop.interface gtk-theme "Colloid-Dark" || warn "GTK theme failed"
gsettings set org.gnome.desktop.interface icon-theme "Colloid-Grey-Dark" || warn "Icon theme failed"
gsettings set org.gnome.desktop.interface cursor-theme "Colloid-dark-cursors" || warn "Cursor theme failed"

# ------------------
# Wallpaper
# ------------------
FIRST_WALLPAPER=$(find ~/Pictures/Wallpapers -type f 2>/dev/null | head -n 1)
if [ -n "$FIRST_WALLPAPER" ]; then
    log "Setting wallpaper..."
    gsettings set org.gnome.desktop.background picture-uri "file://$FIRST_WALLPAPER" || warn "Wallpaper failed"
else
    warn "No wallpaper found"
fi

# ------------------
# Done
# ------------------
log "Installation complete"
log "Log out and back in to fully apply everything"
