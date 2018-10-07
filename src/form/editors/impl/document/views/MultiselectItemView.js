//@flow
import dropdown from 'dropdown';
import template from '../templates/MultiselectItem.html';
import DocumentRevisionButtonView from './DocumentRevisionButtonView';
import DocumentRevisionPanelView from './DocumentRevisionPanelView';
import DocumentItemController from '../controllers/DocumentItemController';
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';

const savedDocumentPrefix = 'document';

const fileIconClasses = {
    image: 'jpeg jpg jif jfif png gif tif tiff bmp',
    word: 'docx doc rtf',
    excel: 'xls xlsx xlsm xlsb',
    pdf: 'pdf'
};

export default Marionette.View.extend({
    initialize(options) {
        this.revisionCollection = new Backbone.Collection();
        const controller = new DocumentItemController({ view: this });
        this.reqres = controller.reqres;

        this.attachmentsController = options.attachmentsController;
    },

    regions: {
        reviseRegion: '.js-revise-button-region'
    },

    tagName: 'li',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.model.get('text') || this.model.get('name'),
            icon: this.__getExtIcon()
        };
    },

    className: 'task-links__i',

    ui: {
        remove: '.js-bubble-delete',
        revise: '.js-revise-button-region',
        link: '.js-link'
    },

    triggers: {
        'click @ui.remove': 'remove'
    },

    events: {
        'click @ui.revise': '__getDocumentRevision',
        'click @ui.link': '__showPreview',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave'
    },

    __getExtIcon() {
        const ext = this.model.get('ext');
        let icon;

        if (ext) {
            Object.keys(fileIconClasses).forEach(key => {
                if (fileIconClasses[key].indexOf(ext.toLowerCase()) !== -1) {
                    icon = key;
                }
            });
        }

        return icon || 'file';
    },

    __getDocumentRevision() {
        this.reqres.request('document:revise', this.model.get('id')).then(revisionList => {
            this.revisionCollection.reset(revisionList.sort((a, b) => a.version - b.version));
            this.isRevisionOpen = true;
            this.documentRevisionPopout.open();
        });
    },

    __showPreview() {
        return this.attachmentsController.showGallery(this.model);
    },

    __onMouseenter() {
        if (this.options.allowDelete) {
            this.el.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
        }
        if (this.model.get('id').indexOf(savedDocumentPrefix) > -1 && this.options.showRevision) {
            if (!this.isRevisonButtonShown) {
                this.documentRevisionPopout = new dropdown.factory.createDropdown({
                    buttonView: DocumentRevisionButtonView,
                    panelView: DocumentRevisionPanelView,
                    panelViewOptions: { collection: this.revisionCollection },
                    popoutFlow: 'right',
                    autoOpen: false,
                    panelMinWidth: 'none'
                });
                this.documentRevisionPopout.on('close', () => (this.isRevisionOpen = false));
                this.showChildView('reviseRegion', this.documentRevisionPopout);
                this.isRevisonButtonShown = true;
            } else {
                this.ui.revise.show();
            }
        }
    },

    __onMouseleave() {
        if (this.options.allowDelete) {
            this.el.removeChild(this.el.lastElementChild);
        }
        if (!this.isRevisionOpen) {
            this.ui.revise.hide();
        }
    }
});
