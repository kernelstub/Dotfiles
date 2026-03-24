import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export class StatReader {

    static async readFile(path) {
        return new Promise((resolve, reject) => {
            let file = Gio.File.new_for_path(path);
            file.load_contents_async(null, (sourceObject, result) => {
                try {
                    let [success, contents] = sourceObject.load_contents_finish(result);
                    if (success) {
                        resolve(new TextDecoder().decode(contents));
                    } else {
                        reject(new Error('Failed to read file'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    static async getCPUUsage(prevTotal, prevIdle) {
        try {
            const content = await this.readFile('/proc/stat');
            const lines = content.split('\n');
            const cpuLine = lines[0];
            
            if (cpuLine.startsWith('cpu ')) {
                const values = cpuLine.split(/\s+/).slice(1).map(v => parseInt(v));
                const idle = values[3] + values[4];
                const total = values.reduce((a, b) => a + b, 0);
                
                if (prevTotal !== 0) {
                    const diffIdle = idle - prevIdle;
                    const diffTotal = total - prevTotal;
                    const usage = ((diffTotal - diffIdle) / diffTotal) * 100;
                    return { usage, total, idle };
                }
                return { usage: 0, total, idle };
            }
        } catch (e) {
            logError(e, 'Error reading CPU stats');
        }
        return null;
    }

    static async getMemoryUsage() {
        try {
            const content = await this.readFile('/proc/meminfo');
            const lines = content.split('\n');
            
            let memTotal = 0, memAvailable = 0;
            
            for (let line of lines) {
                if (line.startsWith('MemTotal:')) {
                    memTotal = parseInt(line.split(/\s+/)[1]);
                } else if (line.startsWith('MemAvailable:')) {
                    memAvailable = parseInt(line.split(/\s+/)[1]);
                }
            }
            
            if (memTotal > 0) {
                const memUsed = memTotal - memAvailable;
                return (memUsed / memTotal) * 100;
            }
        } catch (e) {
            logError(e, 'Error reading memory stats');
        }
        return null;
    }

    static async getSwapUsage() {
        try {
            const content = await this.readFile('/proc/meminfo');
            const lines = content.split('\n');
            
            let swapTotal = 0, swapFree = 0;
            
            for (let line of lines) {
                if (line.startsWith('SwapTotal:')) {
                    swapTotal = parseInt(line.split(/\s+/)[1]);
                } else if (line.startsWith('SwapFree:')) {
                    swapFree = parseInt(line.split(/\s+/)[1]);
                }
            }
            
            if (swapTotal > 0) {
                const swapUsed = swapTotal - swapFree;
                return (swapUsed / swapTotal) * 100;
            }
            return 0;
        } catch (e) {
            logError(e, 'Error reading swap stats');
        }
        return null;
    }

    static async getLoadAverage() {
        try {
            const content = await this.readFile('/proc/loadavg');
            const values = content.trim().split(/\s+/);
            const load1 = parseFloat(values[0]);
            
            const cpuContent = await this.readFile('/proc/cpuinfo');
            const processors = cpuContent.match(/^processor/gm);
            const cores = processors ? processors.length : 1;
            
            return { load: load1, percent: (load1 / cores) * 100 };
        } catch (e) {
            logError(e, 'Error reading load stats');
        }
        return null;
    }

    static async getGPUUsage() {
        try {
            // Try NVIDIA first
            const nvidiaSmi = Gio.File.new_for_path('/usr/bin/nvidia-smi');
            if (nvidiaSmi.query_exists(null)) {
                return await this._getNvidiaGPUUsage();
            }
            
            // Try AMD
            const amdSmi = Gio.File.new_for_path('/sys/class/drm/card0/device/gpu_busy_percent');
            if (amdSmi.query_exists(null)) {
                return await this._getAMDGPUUsage();
            }
            
            // Try Intel
            const intelSmi = Gio.File.new_for_path('/sys/class/drm/card0/gt_cur_freq_mhz');
            if (intelSmi.query_exists(null)) {
                return await this._getIntelGPUUsage();
            }
        } catch (e) {
            logError(e, 'Error reading GPU stats');
        }
        return null;
    }

    static async _getNvidiaGPUUsage() {
        return new Promise((resolve) => {
            try {
                const [success, pid] = GLib.spawn_async(
                    null,
                    ['nvidia-smi', '--query-gpu=utilization.gpu', '--format=csv,noheader,nounits'],
                    null,
                    GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                    null
                );

                if (!success) {
                    resolve(null);
                    return;
                }

                GLib.spawn_close_pid(pid);

                const [, stdout] = GLib.spawn_command_line_sync('nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits');
                const output = new TextDecoder().decode(stdout).trim();
                const usage = parseFloat(output);
                
                if (!isNaN(usage)) {
                    resolve(usage);
                } else {
                    resolve(null);
                }
            } catch (e) {
                resolve(null);
            }
        });
    }

    static async _getAMDGPUUsage() {
        try {
            const content = await this.readFile('/sys/class/drm/card0/device/gpu_busy_percent');
            const usage = parseInt(content.trim());
            return !isNaN(usage) ? usage : null;
        } catch (e) {
            return null;
        }
    }

    static async _getIntelGPUUsage() {
        try {
            // Intel integrated graphics usage is more complex to read
            // This is a simplified approach that reads frequency
            const curFreqContent = await this.readFile('/sys/class/drm/card0/gt_cur_freq_mhz');
            const maxFreqContent = await this.readFile('/sys/class/drm/card0/gt_max_freq_mhz');
            
            const curFreq = parseInt(curFreqContent.trim());
            const maxFreq = parseInt(maxFreqContent.trim());
            
            if (!isNaN(curFreq) && !isNaN(maxFreq) && maxFreq > 0) {
                return (curFreq / maxFreq) * 100;
            }
        } catch (e) {
            // Files might not exist
        }
        return null;
    }
}
