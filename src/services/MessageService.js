import WindowService from './WindowService';
import LocalizationService from './LocalizationService';

const iconIds = {
    NONE: 'none',
    QUESTION: 'question',
    ERROR: 'error'
};

export default {
    systemMessagesTypes: {
        unsavedChanges: 'unsavedChanges'
    },

    confirm(description) {
        return this.askYesNo(description, LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.CONFIRMATION'));
    },

    ask(options) {
        return this.askYesNo(
            options.description,
            options.title,
            options.yesText,
            options.noText
        );
    },

    askYesNo(description, text,
        yesText = LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.YES'),
        noText = LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.NO')
    ) {
        return this.showMessageDialog(
            description,
            text,
            [
                {
                    id: false,
                    text: noText,
                    default: true
                },
                {
                    id: true,
                    text: yesText
                }
            ],
            iconIds.QUESTION
        );
    },

    error(description, text = LocalizationService.get('CORE.SERVICES.MESSAGE.TITLE.ERROR')) {
        return this.showMessageDialog(
            description,
            text,
            [
                {
                    id: false,
                    text: LocalizationService.get('CORE.SERVICES.MESSAGE.BUTTONS.OK'),
                    default: true
                }
            ],
            iconIds.ERROR
        );
    },

    showMessageDialog(description, text, buttons, iconId = iconIds.NONE) {
        return new Promise(resolve => {
            const view = new Core.layout.Popup({
                size: {
                    width: 'auto',
                    height: 'auto',
                    'min-width': '300px'
                }, //don't use min-values if fullscreenToggleDisabled: false
                fullscreenToggleDisabled: true,
                header: text || description,
                onClose() {
                    resolve(false);
                    return true;
                },
                buttons: buttons.map(button => ({
                    id: button.id,
                    text: button.text,
                    customClass: button.customClass,
                    handler() {
                        if (button.beforeLeaveFn) {
                            button.beforeLeaveFn().then(() => {
                                WindowService.closePopup(this.openedPopupId);
                                this.openedPopupId = null;
                                resolve(true);
                            });
                        } else {
                            WindowService.closePopup(this.openedPopupId);
                            this.openedPopupId = null;
                            resolve(button.id);
                        }
                    }
                })),
                content: `<div class='systemMessageBody'>${description}</div>`
            });

            if (this.openedPopupId) {
                WindowService.closePopup(this.openedPopupId);
            }
            this.openedPopupId = WindowService.showPopup(view);
        });
    },

    showSystemMessage(messageConfiguration) {
        const buttons = [
            {
                id: false,
                text: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.STAY'),
                customClass: 'btn-small'
            },
            {
                id: true,
                text: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.LEAVE'),
                customClass: 'btn-small btn-outline'
            }
        ];

        if (messageConfiguration.beforeLeaveFn) {
            buttons.add({
                id: 'saveAndLeave',
                text: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.SAVEANDLEAVE'),
                customClass: 'btn-small',
                beforeLeaveFn: messageConfiguration.beforeLeaveFn
            });
        }

        const systemMessages = {
            unsavedChanges: {
                description: Localizer.get('CORE.SERVICES.MESSAGE.UNSAVEDCHANGES.DESCRIPTION'),
                buttons
            }
        };

        switch (messageConfiguration.type) {
            case this.systemMessagesTypes.unsavedChanges: {
                return this.showMessageDialog(systemMessages.unsavedChanges.description, systemMessages.unsavedChanges.text, systemMessages.unsavedChanges.buttons);
            }
            default:
                break;
        }
    }
};
