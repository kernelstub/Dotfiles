#!/bin/bash
set -e

OUTPUT_DIR="$HOME/dotfiles"

echo "📁 Creating dotfiles repo at $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

echo "🧹 Cleaning old files..."
rm -rf ./*

# ------------------
# 👤 Save username
# ------------------
echo "👤 Saving username..."
whoami > USERNAME

# ------------------
# 📄 Dotfiles
# ------------------
echo "📄 Copying dotfiles..."
mkdir -p dotfiles

cp ~/.bashrc dotfiles/ 2>/dev/null || true
cp ~/.zshrc dotfiles/ 2>/dev/null || true
cp ~/.profile dotfiles/ 2>/dev/null || true
cp ~/.gitconfig dotfiles/ 2>/dev/null || true

# ------------------
# ⚙️ .config
# ------------------
echo "⚙️ Copying ~/.config..."
cp -r ~/.config config

# ------------------
# 🧩 GNOME settings
# ------------------
echo "🧩 Exporting GNOME settings..."
mkdir -p gnome
dconf dump /org/gnome/ > gnome/gnome-settings.ini

# ------------------
# 🔌 Extensions
# ------------------
echo "🔌 Saving extensions..."
gnome-extensions list > gnome/extensions.txt
cp -r ~/.local/share/gnome-shell/extensions gnome/extensions

# ------------------
# 📦 Packages
# ------------------
echo "📦 Saving packages..."
dpkg --get-selections > packages.txt

# ------------------
# 🙈 .gitignore
# ------------------
cat <<EOF > .gitignore
.cache/
.local/share/keyrings/
*.log
config/google-chrome/
config/Code/Cache/
EOF

# ------------------
# 📝 README
# ------------------
cat <<EOF > README.md
# Dotfiles

## Install
\`\`\`bash
./install.sh
\`\`\`
EOF

echo "✅ Backup complete. Now push this to GitHub."
