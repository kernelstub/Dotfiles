import GLib from 'gi://GLib';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {StatReader} from './statReader.js';
import {LabelFormatter} from './labelFormatter.js';
import {SystemMonitorIndicator} from './systemMonitorIndicator.js';

export default class SystemMonitorExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._indicator = null;
        this._timeout = null;
        this._prevTotal = 0;
        this._prevIdle = 0;
        this._settings = null;
        this._formatter = null;
    }

    enable() {
        this._settings = this.getSettings();
        this._formatter = new LabelFormatter(this._settings);
        this._indicator = new SystemMonitorIndicator(this._settings);
        
        this._indicator.create(() => this._onSettingsChanged());
        this._startMonitoring();
    }

    disable() {
        this._stopMonitoring();
        
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        
        this._settings = null;
        this._formatter = null;
    }

    _startMonitoring() {
        this._stopMonitoring();
        
        this._updateStats();
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._updateStats();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _stopMonitoring() {
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }
    }

    _onSettingsChanged() {
        if (this._indicator && this._indicator.needsReposition()) {
            this.disable();
            this.enable();
        } else {
            this._indicator.updateAllVisibility();
            this._updateStats();
        }
    }

    _updateStats() {
        this._updateCPU();
        this._updateMemory();
        this._updateSwap();
        this._updateLoad();
        this._updateGPU();
    }


    _updateCPU() {
        StatReader.getCPUUsage(this._prevTotal, this._prevIdle).then(result => {
            if (result) {
                this._prevTotal = result.total;
                this._prevIdle = result.idle;
                
                const text = this._formatter.formatText(
                    'CPU:',
                    `${this._formatter.formatPercentage(result.usage)}%`,
                    '⚙'
                );
                this._indicator.updateCPU(text);
            }
        });
    }

    _updateMemory() {
        StatReader.getMemoryUsage().then(percent => {
            if (percent !== null) {
                const text = this._formatter.formatText(
                    'Mem:',
                    `${this._formatter.formatPercentage(percent)}%`,
                    '🗍'
                );
                this._indicator.updateMemory(text);
            }
        });
    }

    _updateSwap() {
        StatReader.getSwapUsage().then(percent => {
            if (percent !== null) {
                const text = this._formatter.formatText(
                    'Swap:',
                    `${this._formatter.formatPercentage(percent)}%`,
                    '💾'
                );
                this._indicator.updateSwap(text);
            }
        });
    }

    _updateLoad() {
        StatReader.getLoadAverage().then(result => {
            if (result) {
                const roundValues = this._settings.get_boolean('round-values');
                const load1Str = roundValues ? result.load.toFixed(1) : result.load.toFixed(2);
                const text = this._formatter.formatText(
                    'Load:',
                    `${this._formatter.formatPercentage(result.percent)}% (${load1Str})`,
                    '📊'
                );
                this._indicator.updateLoad(text);
            }
        });
    }

    _updateGPU() {
        StatReader.getGPUUsage().then(percent => {
            if (percent !== null) {
                const text = this._formatter.formatText(
                    'GPU:',
                    `${this._formatter.formatPercentage(percent)}%`,
                    '🎮'
                );
                this._indicator.updateGPU(text);
            }
        });
    }
}
