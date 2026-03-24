#!/bin/bash
set -e

echo "🚀 Starting dotfiles install..."

# ------------------
# 👤 Username fix
# ------------------
if [ -f USERNAME ]; then
    OLD_USER=$(cat USERNAME)
    NEW_USER=$(whoami)

    echo "🔄 Replacing username $OLD_USER → $NEW_USER"
    grep -rl "$OLD_USER" . 2>/dev/null | xargs sed -i "s|$OLD_USER|$NEW_USER|g" || true
fi

# ------------------
# 📄 Dotfiles
# ------------------
echo "📄 Restoring dotfiles..."
cp -f dotfiles/.bashrc ~/.bashrc 2>/dev/null || true
cp -f dotfiles/.zshrc ~/.zshrc 2>/dev/null || true
cp -f dotfiles/.profile ~/.profile 2>/dev/null || true
cp -f dotfiles/.gitconfig ~/.gitconfig 2>/dev/null || true

# ------------------
# ⚙️ .config
# ------------------
echo "⚙️ Restoring ~/.config..."
mkdir -p ~/.config
cp -r config/* ~/.config/

# ------------------
# 🔌 Extensions
# ------------------
echo "🔌 Restoring GNOME extensions..."
mkdir -p ~/.local/share/gnome-shell/
cp -r gnome/extensions ~/.local/share/gnome-shell/

# ------------------
# 🧩 GNOME settings
# ------------------
echo "🧩 Restoring GNOME settings..."
dconf load /org/gnome/ < gnome/gnome-settings.ini

# ------------------
# 📦 Packages (optional)
# ------------------
read -p "Install saved packages? (y/n): " INSTALL_PKGS
if [ "$INSTALL_PKGS" = "y" ]; then
    sudo dpkg --set-selections < packages.txt
    sudo apt-get update
    sudo apt-get -y dselect-upgrade
fi

# ------------------
# 🔐 Fix permissions
# ------------------
echo "🔐 Fixing permissions..."
chown -R "$(whoami)":"$(whoami)" ~/.config
chown -R "$(whoami)":"$(whoami)" ~/.local/share/gnome-shell

# ------------------
# ✅ Done
# ------------------
echo "✅ Done!"
echo "⚠️ Log out and back in for GNOME changes to fully apply."
