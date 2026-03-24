#!/bin/bash
set -e

echo "🚀 Installing GNOME dotfiles..."

# ------------------
# 📦 Dependencies
# ------------------
echo "📦 Installing dependencies..."

if command -v apt >/dev/null; then
    sudo apt update
    sudo apt install -y gnome-shell-extensions curl jq dconf-cli
elif command -v pacman >/dev/null; then
    sudo pacman -Sy --noconfirm gnome-shell-extensions curl jq dconf
elif command -v dnf >/dev/null; then
    sudo dnf install -y gnome-extensions-app curl jq dconf
fi

# ------------------
# 🔌 Install extensions
# ------------------
echo "🔌 Installing GNOME extensions..."

while read -r ext; do
    echo "→ $ext"
    gnome-extensions install "$ext" 2>/dev/null || true
done < extensions.txt

# ------------------
# 📂 Fallback: copy extensions
# ------------------
echo "📂 Copying extension files..."

mkdir -p ~/.local/share/gnome-shell/extensions
cp -r extensions/* ~/.local/share/gnome-shell/extensions/ 2>/dev/null || true

# ------------------
# 🎨 GTK Themes
# ------------------
echo "🎨 Installing GTK themes..."

mkdir -p ~/.themes
cp -r GTK/Theme/* ~/.themes/

# ------------------
# 🖱️ Icons & cursors
# ------------------
echo "🖱️ Installing icons & cursors..."

mkdir -p ~/.icons
cp -r GTK/Icons/* ~/.icons/

# ------------------
# ⚙️ App configs (~/.config)
# ------------------
echo "⚙️ Installing app configs..."

mkdir -p ~/.config

# Copy everything from repo config → ~/.config
cp -r config/* ~/.config/

# ------------------
# 🖼️ Wallpapers
# ------------------
echo "🖼️ Installing wallpapers..."

mkdir -p ~/Pictures/Wallpapers
cp -r Wallpapers/* ~/Pictures/Wallpapers/ 2>/dev/null || true

# ------------------
# 🧩 Apply GNOME settings
# ------------------
echo "🧩 Applying GNOME settings..."

dconf load /org/gnome/ < gnome-settings.ini

# ------------------
# ✅ Enable extensions
# ------------------
echo "✅ Enabling extensions..."

while read -r ext; do
    gnome-extensions enable "$ext" 2>/dev/null || true
done < extensions.txt

# ------------------
# 🎯 Force theme (safety)
# ------------------
echo "🎯 Applying theme..."

gsettings set org.gnome.desktop.interface gtk-theme "Colloid-Dark"
gsettings set org.gnome.desktop.interface icon-theme "Colloid"
gsettings set org.gnome.desktop.interface cursor-theme "Colloid-dark-cursors"

# ------------------
# 🖼️ Set wallpaper (optional)
# ------------------
FIRST_WALLPAPER=$(find ~/Pictures/Wallpapers -type f | head -n 1)

if [ -n "$FIRST_WALLPAPER" ]; then
    echo "🖼️ Setting wallpaper..."
    gsettings set org.gnome.desktop.background picture-uri "file://$FIRST_WALLPAPER"
fi

# ------------------
# 🎉 Done
# ------------------
echo ""
echo "🎉 Installation complete!"
echo "⚠️ Log out and log back in to fully apply everything."
