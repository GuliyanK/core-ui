//@flow
import template from './templates/splitPanel.hbs';
import SplitPanelResizer from './SplitPanelResizer';

const orientationClasses = {
    vertical: 'split-panel_vertical',
    horizontal: 'split-panel_horizontal'
};

export default Marionette.View.extend({
    initialize() {
        this.regionModulesMap = [];
    },

    template: Handlebars.compile(template),

    className() {
        return `split-panel_container ${this.options.horizontal ? orientationClasses.horizontal : orientationClasses.vertical}`;
    },

    onRender() {
        const handlerRoutPairs = this.options.handlerRoutPairs;

        if (handlerRoutPairs && handlerRoutPairs.length) {
            this.__initializeViews(handlerRoutPairs);
        }
    },

    onAttach() {
        this.__initializeResizers();
    },

    __initializeViews(handlerRoutPairs) {
        handlerRoutPairs.forEach((pair, i) => {
            const regionEl = document.createElement('div');
            regionEl.className = `js-tile${i + 1}-region split-panel_tile`;

            this.el.append(regionEl);

            const region = this.addRegion(`js-tile${i + 1}-region`, {
                el: regionEl
            });
            this.regionModulesMap.push({
                pair,
                routeRegExp: pair.routeRegExp,
                region
            });
            setTimeout(() => pair.callback(pair.route));
        });
    },

    __initializeResizers() {
        for (let i = 0; i < this.regionModulesMap.length - 1; i++) { //after each, except last
            this.regionModulesMap[i].region.el.insertAdjacentElement(
                'afterEnd',
                new SplitPanelResizer({
                    firstPanel: this.regionModulesMap[i].region,
                    secondPanel: this.regionModulesMap[i + 1]?.region
                }).render().el
            );
        }
    }
});
