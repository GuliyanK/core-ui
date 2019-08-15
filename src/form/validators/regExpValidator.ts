import _ from 'underscore';

const defaultRegExp = function(options) {
    if (!options.regexp) {
        throw new Error('Missing required "regexp" option for "regexp" validator');
    }

    options = Object.assign(
        {
            type: 'regexp',
            match: true,
            message: 'Invalid'
        },
        options
    );

    return function regexp(value) {
        options.value = value;

        const err = {
            type: options.type,
            message: typeof options.message === 'function' ? options.message(options) : options.message
        };

        //Don't check empty values (add a 'required' validator for this)
        if (value === null || value === undefined || value === '') {
            return undefined;
        }

        //Create RegExp from string if it's valid
        if (typeof options.regexp === 'string') {
            options.regexp = new RegExp(options.regexp, options.flags);
        }

        if (options.match ? !options.regexp.test(value) : options.regexp.test(value)) {
            return err;
        }
        return undefined;
    };
};

export default function(options) {
    return _.wrap(defaultRegExp(options), (func, opts) => {
        const val = _.isObject(opts) ? opts.value : opts;
        return func(val);
    });
}
