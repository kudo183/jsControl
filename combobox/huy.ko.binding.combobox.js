(function () {
    ko.bindingHandlers.cbSelectedValue = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            console.log("cbSelectedValue init: " + element.id);
            initComboBox(element, allBindings);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            element._setSelectedValue(ko.unwrap(valueAccessor()));
            console.log("cbSelectedValue update");
        }
    };
    ko.bindingHandlers.cbItems = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            console.log("cbItems init");
            initComboBox(element, allBindings);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            console.log("cbItems update");
            element._setItems(ko.unwrap(valueAccessor()));
            element._setSelectedValue(ko.unwrap(allBindings.get("cbSelectedValue")));
        }
    };

    function initComboBox(element, allBindings) {
        if (element._isInitialized === true) {
            return;
        }

        console.log("initComboBox");

        element._isInitialized = true;
        var comboBox = element;
        comboBox._listDiv = {};
        comboBox._input = {};
        comboBox._items = [];
        comboBox._filteredItems = [];
        comboBox._ul = {};
        comboBox._selectedItemIndex = -1;
        comboBox._isInitialized = true;
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

        comboBox._input.onkeydown = fnInputKeyDown;

        comboBox._input.oninput = fnOnInput;

        comboBox._input.onblur = fnInputOnBlur;

        comboBox._button.onclick = fnButtonOnClick;

        function fnOnInput() {
            console.log("enter handleInput: " + this.value);

            filterItems(this.value);

            if (comboBox._filteredItems.length === 0) {
                $(this)[0].setCustomValidity("invalid");
            } else {
                $(this)[0].setCustomValidity("");
            }

            $(comboBox._listDiv).show();
            console.log("exit handleInput: " + this.value);
        }

        function fnInputOnBlur() {
            if ($(comboBox._listDiv).is(":visible") === true) {
                hideListTimer = setTimeout(setValueAndHideList, 300)

                console.log("isValid when lostFocus:" + $(this)[0].validity.valid);
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
                    if ($(comboBox._listDiv).is(":visible") === false) {
                        $(comboBox._listDiv).show();
                    } else if (comboBox._selectedItemIndex < comboBox._filteredItems.length - 1) {
                        highlightItem(comboBox._selectedItemIndex + 1);
                    }
                    break;
            }

            console.log("onkeydown: " + event.keyCode);
        }

        function fnButtonOnClick() {
            clearTimeout(hideListTimer);
            $(comboBox._listDiv).toggle();
            focusInputAndSelectAllText();
            console.log("toggleList");
        }

        function fnSetSelectedValue(value) {
            var textValue = $(comboBox._input).val();
            if (typeof value === "undefined" && typeof textValue !== "undefined") {
                $(comboBox._input).val(undefined);
                comboBox._filteredItems = comboBox._items;
                renderItems(comboBox._ul, comboBox._filteredItems);
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
                renderItems(comboBox._ul, comboBox._filteredItems);
            }
        }

        function fnSetItems(items) {
            $(comboBox._input).val(undefined);
            comboBox._items = items;
            comboBox._filteredItems = items;
            renderItems(comboBox._ul, items);
        }

        function setValueAndHideList() {
            setValueFromSelectedItem();
            hideList();
        }

        function setValueFromSelectedItem() {
            var item = comboBox._filteredItems[comboBox._selectedItemIndex];
            var text = getItemText(item);
            $(comboBox._input).val(text);
            filterItems(text);

            var cbSelectedValue = allBindings.get("cbSelectedValue");
            cbSelectedValue(getItemValue(item));
        }

        function highlightItem(index) {
            if (comboBox._selectedItemIndex === index) {
                return;
            }
            $(comboBox._ul).children().eq(comboBox._selectedItemIndex).removeClass("h-boundlist-selected");
            comboBox._selectedItemIndex = index;
            $(comboBox._ul).children().eq(comboBox._selectedItemIndex).addClass("h-boundlist-selected");
        }

        function hideList() {
            clearTimeout(hideListTimer);
            $(comboBox._listDiv).hide();
            console.log("hide");
        }

        function focusInputAndSelectAllText() {
            $(comboBox._input).focus();
            $(comboBox._input).select();
        }

        function selectItem(li) {
            highlightItem(li._index);
            setValueAndHideList();
            focusInputAndSelectAllText();
            console.log("selectItem:" + li.innerText);
        }

        function filterItems(value) {
            comboBox._filteredItems = [];
            for (var i = 0; i < comboBox._items.length; i++) {
                if (getItemText(comboBox._items[i]).search(new RegExp(value.replace("\\", "\\\\"), "i")) == 0) {
                    comboBox._filteredItems.push(comboBox._items[i]);
                }
            }
            renderItems(comboBox._ul, comboBox._filteredItems);
        }

        function renderItems(ul, items) {
            $(comboBox._ul).empty();

            for (var i = 0; i < items.length; i++) {
                var li = window.huy.control.utilsDOM.createElement("li", {}, undefined, getItemText(items[i]));
                li._index = i;
                li.onclick = function () {
                    selectItem(this);
                };
                li.onmouseover = function () {
                    highlightItem(this._index);
                };
                ul.appendChild(li);
            }

            comboBox._selectedItemIndex = 0;
            $(comboBox._ul).children().eq(0).addClass("h-boundlist-selected");
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