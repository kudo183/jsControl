﻿(function () {
    window.huy.log = function (text) {
        console.log(text);
    };

    ko.bindingHandlers.cbSelectedValue = {
        after: ['cbItems'],
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor());
            if (element._selectedValue === value) {
                return;
            }
            element._selectedValue = value;
            element._setSelectedValue(value);
            window.huy.log("cbSelectedValue update");
        }
    };
    ko.bindingHandlers.cbItems = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            window.huy.log("cbItems init");
            initComboBox(element, allBindings);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            window.huy.log("cbItems update");
            element._setItems(ko.unwrap(valueAccessor()));
        }
    };

    function initComboBox(element, allBindings) {
        window.huy.log("initComboBox");

        var comboBox = element;
        comboBox._listDiv = {};
        comboBox._input = {};
        comboBox._items = [];
        comboBox._filteredItems = [];
        comboBox._ul = {};
        comboBox._selectedItemIndex = -1;
        comboBox._selectedValue = undefined;
        comboBox._setItems = fnSetItems;
        comboBox._setSelectedValue = fnSetSelectedValue;

        $(comboBox).addClass("h-comboBox");
        var wrapper = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "h-wrapper");
        var inputWrapper = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "h-input-wrapper");
        comboBox._input = window.huy.control.utilsDOM.createElement("input", { type: "text" });
        var buttonWrapper = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "h-button-wrapper");
        comboBox._button = window.huy.control.utilsDOM.createElement("button", { tabindex: -1 }, undefined, "▼");
        comboBox._listDiv = window.huy.control.utilsDOM.createElement("div", { style: "display:none;" }, undefined, undefined, "h-boundlist-wrapper");
        comboBox._ul = window.huy.control.utilsDOM.createElement("ul", {});

        inputWrapper.appendChild(comboBox._input);
        wrapper.appendChild(inputWrapper);
        buttonWrapper.appendChild(comboBox._button);
        wrapper.appendChild(buttonWrapper);
        comboBox.appendChild(wrapper);
        comboBox._listDiv.appendChild(comboBox._ul);
        comboBox.appendChild(comboBox._listDiv);

        var hideListTimer;
        var selectItemTimer;

        comboBox._input.onkeydown = fnInputKeyDown;

        comboBox._input.oninput = fnOnInput;

        comboBox._input.onblur = fnInputOnBlur;

        comboBox._button.onclick = fnButtonOnClick;

        function fnOnInput() {
            window.huy.log("fnOnInput: " + this.value);

            filterItems(this.value);
            renderItems(comboBox._ul, comboBox._filteredItems);

            if (comboBox._filteredItems.length === 0) {
                $(this)[0].setCustomValidity("invalid");
            } else {
                $(this)[0].setCustomValidity("");
            }
        }

        function fnInputOnBlur() {
            window.huy.log("fnInputOnBlur");
            if ($(comboBox._listDiv).is(":visible") === true) {
                hideListTimer = setTimeout(setValueAndHideList, 300);

                window.huy.log("isValid when lostFocus:" + $(this)[0].validity.valid);
            }
        }

        function fnInputKeyDown(event) {
            switch (event.keyCode) {
                case 27://Esc
                    hideList();
                    break;
                case 9://Tab
                    setValueAndHideList();
                    break;
                case 13://Enter
                    setValueAndHideList();
                    $(comboBox._input).select();
                    break;
                case 38://Up
                    if ($(comboBox._listDiv).is(":visible") && comboBox._selectedItemIndex > 0) {
                        highlightItem(comboBox._selectedItemIndex - 1);
                    }
                    break;
                case 40://Down
                    if (comboBox._selectedItemIndex < comboBox._filteredItems.length - 1) {
                        highlightItem(comboBox._selectedItemIndex + 1);
                    }
                    break;
            }

            window.huy.log("onkeydown: " + event.keyCode);
        }

        function fnButtonOnClick() {
            window.huy.log("fnButtonOnClick");
            clearTimeout(hideListTimer);

            if ($(comboBox._listDiv).is(":visible")) {
                hideList();
            } else {
                renderItems(comboBox._ul, comboBox._filteredItems);
            }
            focusInputAndSelectAllText();
        }

        function fnSetSelectedValue(value) {
            window.huy.log("fnSetSelectedValue");
            var textValue = $(comboBox._input).val();
            if (typeof value === "undefined" && typeof textValue !== "undefined") {
                $(comboBox._input).val(undefined);
                comboBox._filteredItems = comboBox._items;
                return;
            }

            var filteredItems = [];
            for (var i = 0; i < comboBox._items.length; i++) {
                var itemValue = getItemValue(comboBox._items[i]);
                if (itemValue === value) {
                    filteredItems.push(comboBox._items[i]);
                }
            }

            if (filteredItems.length === 0) {
                return;
            } else {
                $(comboBox._input).val(getItemText(filteredItems[0]));
                comboBox._filteredItems = filteredItems;
            }
        }

        function fnSetItems(items) {
            window.huy.log("fnSetItems");
            $(comboBox._input).val(undefined);
            comboBox._items = items;

            element._setSelectedValue(element._selectedValue);
        }

        function setValueAndHideList() {
            window.huy.log("setValueAndHideList");
            var item = comboBox._filteredItems[comboBox._selectedItemIndex];
            var text = getItemText(item);
            $(comboBox._input).val(text);
            filterItems(text);

            var cbSelectedValue = allBindings.get("cbSelectedValue");
            element._selectedValue = getItemValue(item);
            cbSelectedValue(element._selectedValue);

            hideList();
        }

        function highlightItem(index) {
            window.huy.log("highlightItem");
            if (comboBox._selectedItemIndex === index) {
                return;
            }
            $(comboBox._ul).children().eq(comboBox._selectedItemIndex).removeClass("h-boundlist-selected");
            comboBox._selectedItemIndex = index;
            $(comboBox._ul).children().eq(comboBox._selectedItemIndex).addClass("h-boundlist-selected");
        }

        function hideList() {
            window.huy.log("hideList");
            clearTimeout(hideListTimer);
            $(comboBox._listDiv).hide();
            $(comboBox._ul).empty();
        }

        function focusInputAndSelectAllText() {
            $(comboBox._input).focus();
            $(comboBox._input).select();
        }

        function selectItem(li) {
            window.huy.log("selectItem:" + li.innerText);
            highlightItem(li._index);
            setValueAndHideList();
            focusInputAndSelectAllText();
        }

        function filterItems(value) {
            window.huy.log("filterItems");
            comboBox._filteredItems = [];
            for (var i = 0; i < comboBox._items.length; i++) {
                if (getItemText(comboBox._items[i]).search(new RegExp(value.replace("\\", "\\\\"), "i")) == 0) {
                    comboBox._filteredItems.push(comboBox._items[i]);
                }
            }
        }

        function renderItems(ul, items) {
            window.huy.log("renderItems");
            $(comboBox._ul).empty();

            for (var i = 0; i < items.length; i++) {
                var li = window.huy.control.utilsDOM.createElement("li", {}, undefined, getItemText(items[i]));
                li._index = i;
                li.onclick = function () {
                    window.huy.log("li onclick");
                    selectItem(this);
                };
                li.ontouchstart = function () {//for chrome tablet, chrome tablet onclick work incorrect
                    window.huy.log("li ontouchstart");
                    selectItemTimer = setTimeout(selectItem.bind(null, this), 300);
                };
                li.ontouchmove = function () {
                    window.huy.log("li ontouchmove");
                    clearTimeout(selectItemTimer);
                };

                li.onmouseover = function () {
                    window.huy.log("li onmouseover");
                    highlightItem(this._index);
                };
                ul.appendChild(li);
            }

            comboBox._selectedItemIndex = 0;
            $(comboBox._ul).children().eq(0).addClass("h-boundlist-selected");

            $(comboBox._listDiv).show();
        }

        function getItemText(item) {
            if (allBindings.has("cbItemText")) {
                var t = allBindings.get("cbItemText");
                var u = ko.unwrap(item);
                return u[t];
            } else {
                return ko.unwrap(item);
            }
            return ko.unwrap(item);
        }

        function getItemValue(item) {
            if (allBindings.has("cbItemValue")) {
                var t = allBindings.get("cbItemValue");
                var u = ko.unwrap(item);
                return u[t];
            } else {
                return ko.unwrap(item);
            }
            return ko.unwrap(item);
        }
    }
})();