import Ember from 'ember';
import Editor from './tr-editor';
import layout from '../templates/components/tr-button-editor';

export default Editor.extend({
    layout,
    i18nProperties: ['placeholder'],

    routing: Ember.inject.service('-routing'),

    classNames: 'tr-button-editor',
    classNameBindings: ['highlight:is-highlight', 'isOn:is-on:is-off', 'styleClassName', 'isBusy'],
    //placeholder: Ember.String.htmlSafe("&nbsp;"),
    placeholder: null,
    buttonClass: null,

    highlight: false,
    text: null,

    type: 'button',

    /**
     * Style: button, toggle
     */
    style: 'button',
    styleClassName: Ember.computed('style', {
        get() {
            var style = (this.get('style') || '').toString().toLowerCase();
            if(style === 'toggle') return 'tr-button-editor-toggle';
            return 'tr-button-editor-button';
        }
    }),

    isOn: false,

    onClick: null,

    route: null,
    routeParams: null,

    actions: {
        onClick(value) {
            if(this.get('_isBusyDisabled') === true || this.get('isDisabled')) {
                return;
            }

            let onClick = this.get('onClick');
            if(onClick){
                onClick(value);
            }

            let route = this.get('route'),
                routeParams = this.get('routeParams');
            if(route) {
                this.get('routing').transitionTo(route, routeParams);
            }
        }
    }
});
