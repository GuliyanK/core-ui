export default {
    getSchema(schema: Array<any>) {
        const schemaPlain = {};
        this.__fillConfiguration(schema, schemaPlain);

        return schemaPlain;
    },

    __fillConfiguration(schemaTree: Array<any>, schemaPlain: Object) {
        schemaTree.forEach(item => {
            item.type && (item.type.includes('container') || item.type.includes('group'))
                ? this.__fillConfiguration(item.items, schemaPlain)
                : item.key && (schemaPlain[item.key] = Object.assign(_.omit(item, ['key']), { type: item.type.replace('-field', '').replace('-editor', '') }));
        });
    }
};
