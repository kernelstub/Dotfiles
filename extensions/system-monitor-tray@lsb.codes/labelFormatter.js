export class LabelFormatter {

    constructor(settings) {
        this._settings = settings;
    }

    formatText(label, value, iconChar = '') {
        const boldLabels = this._settings.get_boolean('bold-labels');
        const boldPercentages = this._settings.get_boolean('bold-percentages');
        const showIcons = this._settings.get_boolean('show-icons');
        
        let text = '';
        
        if (showIcons && iconChar) {
            text = iconChar + ' ';
        } else {
            text = boldLabels ? `<b>${label}</b> ` : `${label} `;
        }
        
        text += boldPercentages ? `<b>${value}</b>` : value;
        return text;
    }

    formatPercentage(value) {
        const roundValues = this._settings.get_boolean('round-values');
        return roundValues ? Math.round(value).toString() : value.toFixed(1);
    }
}
