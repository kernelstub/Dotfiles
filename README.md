<img width="2879" height="1799" alt="image" src="https://github.com/user-attachments/assets/484b4c64-0cc1-40a1-ac71-dd9d73f85c38" />

## Features

- GNOME Shell extensions
- GTK themes and Colloid theme support
- Icons and cursor themes
- App configuration files (`~/.config`)
- Wallpapers
- Fonts
- Automatic GNOME settings via `dconf`

## Installation

The repository can be installed directly using a single command:

```bash
bash <(curl -s https://raw.githubusercontent.com/kernelstub/Dotfiles/main/install.sh)
````

This will:

1. Clone the repository to a temporary folder if needed
2. Install dependencies for your system (supports `apt`, `pacman`, and `dnf`)
3. Sync extensions, themes, icons, configs, wallpapers, and fonts
4. Apply GNOME settings
5. Enable extensions and apply the Colloid theme
6. Set the first wallpaper found in the repository

Logs are saved to `~/gnome-dotfiles-install.log`.

### Optional

* Run multiple times safely (idempotent)
* Automatically removes old Colloid themes and icons before syncing

## Supported Systems

* Anything with GNOME 42+

## Notes

* Log out and log back in after installation to fully apply GNOME settings.
