import Component from '@ember/component';
import { warn } from '@ember/debug';
import { observer, computed } from '@ember/object';
import { inject } from '@ember/service';

import layout from '../../templates/components/widgets/tr-widget';

export default Component.extend({
    layout,

    routing: inject.service('-routing'),

    tagName: 'div',
    classNames: 'tr-board-widget',
    classNameBindings: 'widgetLayoutClassNames',
    isEditing: false,

    type: null,
    id: null,
    boardId: null,

    data: null,
    _contentDidChange: observer('data', function() {
        let data = this.get('data');

        if(!data) return;

        let content = this.get('data.object'),
            identifier = this.getIdentifier();

        if(!content[identifier]) {
            content[identifier] = { identifier: identifier, position: {
                x: 0,
                y: 0,
                width: this.get('minWidth'),
                height: this.get('minHeight')
            }};
        }

        this.set('x', content[identifier].position.x);
        this.set('y', content[identifier].position.y);
        this.set('width', content[identifier].position.width);
        this.set('height', content[identifier].position.height);
    }),//.on('init'),

    _init: false,
    _size: 160,
    _gridSize: 168,

    onChange: null,
    onIsEditingChanged: observer('isEditing', function() {
        if(this.get('isEditing')) {
            let self = this;
            this.$()
                .resizable({
                    resize: function(event, ui) {
                        let minWidth = self.get('minWidth'),
                            maxWidth = self.get('maxWidth'),
                            minHeight = self.get('minHeight'),
                            maxHeight = self.get('maxHeight');

                        let currentW = $(ui.element).outerWidth(),
                            width = parseInt((currentW+8) / 168);
                        self.$(ui.element).css('width', '');
                        width = width < minWidth ? minWidth : (width > maxWidth ? maxWidth : width);
                        self.set('width', width);

                        let currentH = $(ui.element).outerHeight(),
                            height = parseInt((currentH+8) / 168);
                        self.$(ui.element).css('height', '');
                        height = height < minHeight ? minHeight : (height > maxHeight ? maxHeight : height);
                        self.set('height', height);

                        self.triggerOnChange();
                    }
                })
                .draggable({
                    grid: [ self._gridSize, self._gridSize],
                    //stack: '#' + this.get('elementId') + '>.tr-board-widget'
                    stop: function(event, ui) {

                        let currentX = ui.position.left;
                        self.set('x', parseInt((currentX-8) / 168));

                        let currentY = ui.position.top;
                        self.set('y', parseInt((currentY-8) / 168));

                        self.triggerOnChange();
                    }
                });
            this.set('_init', true);
        } else {
            if(this.get('_init'))
            {
                try {
                    this.$().resizable('destroy');
                    this.$().draggable('destroy');
                } catch(ex) {
                    warn(ex);
                }
            }
        }
    }),
    willDestroyElement() {
        this._super();
        this.set('_init', false);
        if(this.get('_init'))
        {
            try {
                this.$().resizable('destroy');
                this.$().draggable('destroy');
            } catch(ex) {
                warn(ex);
            }
        }
    },

    _resizeTrigger: observer('x', 'y', 'width', 'height', function() {
       if(this.onResize) this.onResize();
    }),
    widgetLayoutClassNames: computed('x', 'y', 'width', 'height', {
        get() {
            let x = this.get('x'),
                y = this.get('y'),
                width = this.get('width'),
                height = this.get('height'),
                size = this.get('_size');

            //console.log(width + " x " + height);

            this.set('absWidth', width * size + ((width - 1) * 8));
            this.set('absHeight', height * size + ((height - 1) * 8));
            this.set('absX', (x * size) + (x + 1) * 8);
            this.set('absY', (y * size) + (y + 1) * 8);

            return `tr-board-widget-x-${x} tr-board-widget-y-${y} tr-board-widget-w-${width} tr-board-widget-h-${height}`;
        }
    }),

    getIdentifier() {
        let boardId = this.get('boardId'),
            type = this.get('type'),
            id = this.get('id');

        let str = `widget___${boardId}___${id}___${type}`;

        str = str.replace(new RegExp('[.-]', 'g'),'');

        return str;
    },
    getPosition() {
        return {
            x: this.get('x'),
            y: this.get('y'),
            width: this.get('width'),
            height: this.get('height')
        };
    },
    triggerOnChange() {
        let fun = this.get('onChange');
        if(!fun) return;

        let identifier = this.getIdentifier(),
            position = this.getPosition();

        fun(identifier, position);
    },

    onResize: null,

    x: 0,
    y: 0,

    width: 1,
    minWidth: 1,
    maxWidth: 4,

    height: 1,
    minHeight: 1,
    maxHeight: 4,

    absX: 0,
    absY: 0,
    absWidth: 160,
    absHeight: 160,
    absPadding: 8,

    _updateStyle: observer('absX', 'absY', 'absWidth', 'absHeight', function() {
        this.$().css('left', this.get('absX'));
        this.$().css('top', this.get('absY'));
        this.$().css('width', this.get('absWidth'));
        this.$().css('height', this.get('absHeight'));
    }).on('didInsertElement')
});
