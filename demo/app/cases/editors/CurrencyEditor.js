

import CanvasView from 'demoPage/views/CanvasView';

export default function () {
    const model = new Backbone.Model({
        numberValue: 42
    });

    return new CanvasView({
        view: new Core.form.editors.NumberEditor({
            model,
            key: 'numberValue',
            changeMode: 'keydown', //default - 'blur', like browser behavior
            autocommit: true,
            min: 10000,
            max: 300000,
            step: 3,
            allowFloat: true,
            intlOptions: { //options for new Intl.NumberFormat([locales[, options]])
                minimumFractionDigits: 2
            }
        }),
        presentation: '{{numberValue}}',
        isEditor: true
    });
}
