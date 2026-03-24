import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SystemMonitorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
        const page = new Adw.PreferencesPage();
        window.add(page);
        
        const group = new Adw.PreferencesGroup({
            title: 'Appearance Settings',
            description: 'Configure how the system monitor appears'
        });
        page.add(group);
        
        const positionRow = new Adw.ComboRow({
            title: 'Panel Position',
            subtitle: 'Position of the indicator in the top panel',
            model: new Gtk.StringList({
                strings: ['Left', 'Center', 'Right']
            })
        });
        
        const currentPosition = settings.get_string('position');
        positionRow.selected = ['left', 'center', 'right'].indexOf(currentPosition);
        
        positionRow.connect('notify::selected', (widget) => {
            const positions = ['left', 'center', 'right'];
            settings.set_string('position', positions[widget.selected]);
        });
        group.add(positionRow);
        
        const iconsRow = new Adw.SwitchRow({
            title: 'Show Icons',
            subtitle: 'Display icons instead of text labels'
        });
        settings.bind('show-icons', iconsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(iconsRow);
        
        const boldLabelsRow = new Adw.SwitchRow({
            title: 'Bold Labels',
            subtitle: 'Display labels in bold text'
        });
        settings.bind('bold-labels', boldLabelsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(boldLabelsRow);
        
        const boldPercentagesRow = new Adw.SwitchRow({
            title: 'Bold Percentages',
            subtitle: 'Display percentage values in bold'
        });
        settings.bind('bold-percentages', boldPercentagesRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(boldPercentagesRow);
        
        const roundValuesRow = new Adw.SwitchRow({
            title: 'Round Values',
            subtitle: 'Round percentages to whole numbers (e.g., 13% instead of 12.5%)'
        });
        settings.bind('round-values', roundValuesRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(roundValuesRow);
        
        const visibilityGroup = new Adw.PreferencesGroup({
            title: 'Visibility Settings',
            description: 'Show or hide individual indicators'
        });
        page.add(visibilityGroup);
        
        const showCpuRow = new Adw.SwitchRow({
            title: 'Show CPU',
            subtitle: 'Display CPU usage indicator'
        });
        settings.bind('show-cpu', showCpuRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        visibilityGroup.add(showCpuRow);
        
        const showMemoryRow = new Adw.SwitchRow({
            title: 'Show Memory',
            subtitle: 'Display memory usage indicator'
        });
        settings.bind('show-memory', showMemoryRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        visibilityGroup.add(showMemoryRow);
        
        const showSwapRow = new Adw.SwitchRow({
            title: 'Show Swap',
            subtitle: 'Display swap usage indicator'
        });
        settings.bind('show-swap', showSwapRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        visibilityGroup.add(showSwapRow);
        
        const showLoadRow = new Adw.SwitchRow({
            title: 'Show Load',
            subtitle: 'Display system load indicator'
        });
        settings.bind('show-load', showLoadRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        visibilityGroup.add(showLoadRow);
        
        const showGpuRow = new Adw.SwitchRow({
            title: 'Show GPU',
            subtitle: 'Display GPU usage indicator (NVIDIA, AMD, Intel)'
        });
        settings.bind('show-gpu', showGpuRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        visibilityGroup.add(showGpuRow);
        
        const supportGroup = new Adw.PreferencesGroup({
            title: 'Support',
            description: 'Help support future updates and development'
        });
        page.add(supportGroup);
        
        const donationRow = new Adw.ActionRow({
            title: 'Support Future Updates',
            subtitle: 'Consider supporting this extension via PayPal',
            activatable: true
        });
        
        const donateButton = new Gtk.Button({
            label: 'Donate',
            valign: Gtk.Align.CENTER,
            css_classes: ['suggested-action']
        });
        
        donateButton.connect('clicked', () => {
            Gtk.show_uri(window, 'https://www.paypal.com/paypalme/leandrosb3', Gdk.CURRENT_TIME);
        });
        
        donationRow.add_suffix(donateButton);
        donationRow.activatable_widget = donateButton;
        supportGroup.add(donationRow);
    }
}
