/**
 * @license
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Copyright (c) 2011-2013 Jos de Jong, http://jsoneditoronline.org
 *
 * @author  Jos de Jong, <wjosdejong@gmail.com>
 */


/**
 * @constructor JSONEditor.AppendNode
 * @extends JSONEditor.Node
 * @param {JSONEditor} editor
 * Create a new AppendNode. This is a special node which is created at the
 * end of the list with childs for an object or array
 */
JSONEditor.AppendNode = function (editor) {
    this.editor = editor;
    this.dom = {};
};

JSONEditor.AppendNode.prototype = new JSONEditor.Node();

/**
 * Return a table row with an append button.
 * @return {Element} dom   TR element
 */
JSONEditor.AppendNode.prototype.getDom = function () {
    // TODO: do not create the DOM for the appendNode when in viewer mode
    // TODO: implement a new solution for the append node
    var dom = this.dom;

    if (dom.tr) {
        return dom.tr;
    }

    // a row for the append button
    var trAppend = document.createElement('tr');
    trAppend.node = this;
    dom.tr = trAppend;

    // when in viewer mode, don't create the contents for the append node
    // but return here.
    if (!this.editor.editable) {
        return trAppend;
    }

    // TODO: consistent naming

    // a cell for the dragarea column
    var tdDrag = document.createElement('td');
    tdDrag.className = 'jsoneditor-td';
    dom.tdDrag = tdDrag;

    // create context menu
    var tdMenu = document.createElement('td');
    tdMenu.className = 'jsoneditor-td';
    var menu = document.createElement('button');
    menu.className = 'jsoneditor-contextmenu';
    dom.menu = menu;
    dom.tdMenu = tdMenu;
    tdMenu.appendChild(dom.menu);

    // a cell for the contents (showing text 'empty')
    var tdAppend = document.createElement('td');
    var domText = document.createElement('div');
    domText.innerHTML = '(empty)';
    domText.className = 'jsoneditor-readonly';
    tdAppend.appendChild(domText);
    tdAppend.className = 'jsoneditor-td';
    dom.td = tdAppend;
    dom.text = domText;

    this.updateDom();

    return trAppend;
};

/**
 * Update the HTML dom of the Node
 */
JSONEditor.AppendNode.prototype.updateDom = function () {
    var dom = this.dom;
    var tdAppend = dom.td;
    if (tdAppend) {
        tdAppend.style.paddingLeft = (this.getLevel() * 24 + 26) + 'px';
        // TODO: not so nice hard coded offset
    }

    var domText = dom.text;
    if (domText) {
        domText.innerHTML = '(empty ' + this.parent.type + ')';
    }

    // attach or detach the contents of the append node:
    // hide when the parent has childs, show when the parent has no childs
    var trAppend = dom.tr;
    if (!this.isVisible()) {
        if (dom.tr.firstChild) {
            trAppend.removeChild(dom.tdDrag);
            trAppend.removeChild(dom.tdMenu);
            trAppend.removeChild(tdAppend);
        }
    }
    else {
        if (!dom.tr.firstChild) {
            trAppend.appendChild(dom.tdDrag);
            trAppend.appendChild(dom.tdMenu);
            trAppend.appendChild(tdAppend);
        }
    }
};

/**
 * Check whether the AppendNode is currently visible.
 * the AppendNode is visible when its parent has no childs (i.e. is empty).
 * @return {boolean} isVisible
 */
JSONEditor.AppendNode.prototype.isVisible = function () {
    return (this.parent.childs.length == 0);
};

/**
 * Show a contextmenu for this node
 * @param {function} [onClose]   Callback method called when the context menu
 *                               is being closed.
 */
JSONEditor.AppendNode.prototype.showContextMenu = function (onClose) {
    var node = this;
    var titles = JSONEditor.Node.TYPE_TITLES;
    var items = [
        // create append button
        {
            'text': 'Append',
            'title': 'Append a new field with type \'auto\'',
            'submenuTitle': 'Select the type of the field to be appended',
            'className': 'jsoneditor-insert',
            'click': function () {
                node._onAppend('field', 'value', 'auto');
            },
            'submenu': [
                {
                    'text': 'Auto',
                    'className': 'jsoneditor-type-auto',
                    'title': titles.auto,
                    'click': function () {
                        node._onAppend('field', 'value', 'auto');
                    }
                },
                {
                    'text': 'Array',
                    'className': 'jsoneditor-type-array',
                    'title': titles.array,
                    'click': function () {
                        node._onAppend('field', []);
                    }
                },
                {
                    'text': 'Object',
                    'className': 'jsoneditor-type-object',
                    'title': titles.object,
                    'click': function () {
                        node._onAppend('field', {});
                    }
                },
                {
                    'text': 'String',
                    'className': 'jsoneditor-type-string',
                    'title': titles.string,
                    'click': function () {
                        // TODO: settings type string does not work, will become auto
                        node._onAppend('field', 'value', 'string');
                    }
                }
            ]
        }
    ];

    var menu = new JSONEditor.ContextMenu(items, {close: onClose});
    menu.show(this.dom.menu);
};

/**
 * Handle an event. The event is catched centrally by the editor
 * @param {Event} event
 */
JSONEditor.AppendNode.prototype.onEvent = function (event) {
    var type = event.type;
    var target = event.target || event.srcElement;
    var dom = this.dom;

    // highlight the append nodes parent
    var menu = dom.menu;
    if (target == menu) {
        if (type == 'mouseover') {
            this.editor.highlighter.highlight(this.parent);
        }
        else if (type == 'mouseout') {
            this.editor.highlighter.unhighlight();
        }
    }

    // context menu events
    if (type == 'click' && target == dom.menu) {
        var highlighter = this.editor.highlighter;
        highlighter.highlight(this.parent);
        highlighter.lock();
        this.showContextMenu(function () {
            highlighter.unlock();
            highlighter.unhighlight();
        });
    }
};
