window.huy = window.huy || {};
window.huy.control = window.huy.control || {};
window.huy.control.dataGrid = (function () {
    var dataGrid = {
        createView: createView,
        createViewModel: createViewModel
    };
    return dataGrid;

    function createViewModel(load, save, addNewItem) {
        var viewModel = {
            items: ko.observableArray(),
            itemsRemoved: [],
            currentSelectedItem: ko.observable(),
            previousSelectedItem: { },
            rowClicked: function(root, item) {
                root.previousSelectedItem = ko.utils.unwrapObservable(root.currentSelectedItem);
                root.currentSelectedItem(item);
                console.log(JSON.stringify(ko.toJS(item)));
                return true;
            },
            columns: [],
            enablePaging: ko.observable(false),
            paging: {
                currentPageIndex: ko.observable(1),
                pageCount: ko.observable(10),
                next: function(root) {
                    var index = Number(root.paging.currentPageIndex());
                    if (index < root.paging.pageCount()) {
                        root.paging.currentPageIndex(index + 1);
                    }
                },
                prev: function(root) {
                    var index = Number(root.paging.currentPageIndex());
                    if (index > 1) {
                        root.paging.currentPageIndex(index - 1);
                    }
                },
                first: function(root) {
                    root.paging.currentPageIndex(1);
                },
                last: function(root) {
                    root.paging.currentPageIndex(root.paging.pageCount());
                },
            },
            buttons: [
                {
                    text: "Add",
                    action: addNewItem
                },
                {
                    text: "Save",
                    action: save
                },
                {
                    text: "Load",
                    action: load
                }
            ],
            load: load,
            save: save,
            addNewItem: addNewItem,
            toString: toString
        };

        viewModel.columns.push({
            headerText: "",
            type: "action",
            text: "x",
            readOnly: false,
            filterValue: ko.observable(),
            action: function (root, item) {
                if (item === "filter") {
                    root._isClearingFilter = true;
                    for (var i = 0; i < root.columns.length; i++) {
                        root.columns[i].filterValue(undefined);
                    }
                    root._isClearingFilter = false;
                } else {
                    root.itemsRemoved.push(item);
                    root.items.remove(item);
                }
            }
        });
        return viewModel;
    }

    function createView(id, style) {
        var view = window.huy.control.utilsDOM.createElement("div", { id: id });
        view.appendChild(createHeader());
        view.appendChild(createColumnFilter());
        view.appendChild(createGridViewContent(style));
        view.appendChild(createBottomToolbar());
        return view;
    }

    function createHeader() {
        var view = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "gridHeader");
        var koItems = window.huy.control.utilsDOM.createComment("ko foreach: columns");
        var cell = window.huy.control.utilsDOM.createElement("div", {}, "css: 'col'+($index()+1)", undefined, "cell");
        var cellText = window.huy.control.utilsDOM.createElement("span", {}, "text: headerText");
        var endKoItems = window.huy.control.utilsDOM.createComment("/ko");

        view.appendChild(koItems);
        view.appendChild(cell);
        cell.appendChild(cellText);
        view.appendChild(endKoItems);
        return view;
    }

    function createColumnFilter() {
        var row, cell;
        row = window.huy.control.utilsDOM.createElement("div", {}, "foreach: columns", undefined, "gridColumnFilter");

        //readonly text
        cell = createColumnFilterCellDiv();
        addCell(row, cell, "textInput:filterValue", 'span', "input", {});

        //text text
        cell = createColumnFilterCellDiv();
        addCell(row, cell, "textInput:filterValue", 'textBox', "input", {});

        //checkBox
        cell = createColumnFilterCellDiv();
        addCell(row, cell, "checked:filterValue", 'checkBox', "input", { type: "checkbox" });

        //comboBox
        cell = createColumnFilterCellDiv();
        addCell(row, cell, "optionsCaption: caption, options:items, optionsText: itemText, optionsValue: itemValue, value:filterValue"
        , 'comboBox', "select", {});

        //action
        cell = createColumnFilterCellDiv();
        addCell(row, cell, "text:text, click: function(data, event) { action($root, 'filter', data, event) }"
        , 'action', "button", {});

        //template
        cell = window.huy.control.utilsDOM.createElement("div", {}, "css:'col'+($index()+1) + ' columnFilter', template: {name: filterTemplate}", undefined, "cell");
        row.appendChild(window.huy.control.utilsDOM.createComment("ko if:type==='template'"));
        row.appendChild(cell);
        row.appendChild(window.huy.control.utilsDOM.createComment("/ko"));

        return row;
    }

    function createGridViewContent(style) {
        var view = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "gridBody");
        var koItems = window.huy.control.utilsDOM.createComment(" ko foreach: items ");
        var endKoItems = window.huy.control.utilsDOM.createComment(" /ko ");

        view.appendChild(koItems);
        view.appendChild(createGridRow(style));
        view.appendChild(endKoItems);

        return view;
    }

    function createBottomToolbar() {
        var view = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "gridBottomToolbar");
        var koWithPaging = window.huy.control.utilsDOM.createComment("ko with: paging");
        var isEnable = window.huy.control.utilsDOM.createElement("input", { type: "checkbox" }, "checked: $parent.enablePaging", undefined, undefined);
        var first = window.huy.control.utilsDOM.createElement("button", {}, "enable: $parent.enablePaging, click: function(data, event){first($root, data, event)}", "|<", undefined);
        var last = window.huy.control.utilsDOM.createElement("button", {}, "enable: $parent.enablePaging, click: function(data, event){last($root, data, event)}", ">|", undefined);
        var pageIndex = window.huy.control.utilsDOM.createElement("input", { size: 2 }, "enable: $parent.enablePaging, value: currentPageIndex", undefined, undefined);
        var pageCount = window.huy.control.utilsDOM.createElement("span", {}, "text:'/'+pageCount()", undefined, undefined);
        var prev = window.huy.control.utilsDOM.createElement("button", {}, "enable: $parent.enablePaging, click: function(data, event){prev($root, data, event)}", "<", undefined);
        var next = window.huy.control.utilsDOM.createElement("button", {}, "enable: $parent.enablePaging, click: function(data, event){next($root, data, event)}", ">", undefined);
        var endKoWithPaging = window.huy.control.utilsDOM.createComment("/ko");
        var koButtons = window.huy.control.utilsDOM.createComment("ko foreach:buttons");
        var button = window.huy.control.utilsDOM.createElement("button", {}, "text:text, click: function(data, event){action($root, data, event)}");
        var endKoButtons = window.huy.control.utilsDOM.createComment("/ko");

        view.appendChild(koWithPaging);
        view.appendChild(isEnable);
        view.appendChild(first);
        view.appendChild(last);
        view.appendChild(pageIndex);
        view.appendChild(pageCount);
        view.appendChild(prev);
        view.appendChild(next);
        view.appendChild(endKoWithPaging);
        view.appendChild(koButtons);
        view.appendChild(button);
        view.appendChild(endKoButtons);
        return view;
    }

    function createGridRow(style) {
        var row, cell;
        if (style === "row") {
            row = window.huy.control.utilsDOM.createElement("div", {}, "click: function(data, event){return $root.rowClicked($root, data, event)}, foreach: $parent.columns, css: css", undefined, "row");
        } else {
            row = window.huy.control.utilsDOM.createElement("div", {}, "click: function(data, event){return $root.rowClicked($root, data, event)}, foreach: $parent.columns", undefined, "row");
        }

        //readonly text
        cell = createCellDiv();
        addCell(row, cell, "text:$parent[cellValueProperty]", 'span', "span", {});

        //text
        cell = createCellDiv();
        addCell(row, cell, "textInput:$parent[cellValueProperty], disable:readOnly", 'textBox', "input", {});

        //checkBox
        cell = createCellDiv();
        addCell(row, cell, "checked:$parent[cellValueProperty], disable:readOnly", 'checkBox', "input", { type: "checkbox" });

        //comboBox
        cell = createCellDiv();
        addCell(row, cell, "cbSelectedValue: $parent[cellValueProperty], cbItems: items, cbItemText: itemText, cbItemValue: itemValue"
        , 'comboBox', "div", {});
		
        //action
        cell = createCellDiv();
        addCell(row, cell, "text:text, click: function(data, event) { action($root, $parent, data, event) }"
        , 'action', "button", {});

        //template
        cell = window.huy.control.utilsDOM.createElement("div", {}, "css:'col'+($index()+1), template: {name: cellTemplate}", undefined, "cell");
        row.appendChild(window.huy.control.utilsDOM.createComment("ko if:type==='template'"));
        row.appendChild(cell);
        row.appendChild(window.huy.control.utilsDOM.createComment("/ko"));

        return row;
    }

    function addCell(row, cell, cellDataBind, type, htmlElement, attrs) {
        var cellContent = window.huy.control.utilsDOM.createElement(htmlElement, attrs, cellDataBind);
        var s = "ko if:type==='{0}'";
        row.appendChild(window.huy.control.utilsDOM.createComment(s.replace("{0}", type)));
        row.appendChild(cell);
        cell.appendChild(cellContent);
        row.appendChild(window.huy.control.utilsDOM.createComment("/ko"));
    }

    function createCellDiv() {
        //css class ex: 'col1 readonly'
        return window.huy.control.utilsDOM.createElement("div", {}, "css:'col'+($index()+1) + (readOnly?' readonly':'')", undefined, "cell");
    }

    function createColumnFilterCellDiv() {
        //css class ex:'col1 columnFilter'
        return window.huy.control.utilsDOM.createElement("div", {}, "css:'col'+($index()+1) + ' columnFilter'", undefined, "cell");
    }
	
	function toString(){
		var i = 0, text = "";
		text = text + "previousSelectedItem:\n";
		text = text + JSON.stringify(this.previousSelectedItem) + "\n";
		text = text + "currentSelectedItem:\n";
		text = text + JSON.stringify(ko.utils.unwrapObservable(this.currentSelectedItem)) + "\n";
		text = text + "filters value:\n";
		for (i = 0; i < this.columns.length; i++) {
			text = text + (i + 1) + ". " + ko.utils.unwrapObservable(this.columns[i].filterValue) + "\n";
		}
		text = text + "items:\n";
		var data = ko.utils.unwrapObservable(this.items);
		for (i = 0; i < data.length; i++) {
			text = text + (i + 1) + ". " + JSON.stringify(data[i]) + "\n";
		}
		text = text + "itemsRemoved:\n";
		for (i = 0; i < this.itemsRemoved.length; i++) {
			text = text + (i + 1) + ". " + JSON.stringify(this.itemsRemoved[i]) + "\n";
		}
		text = text + "columns:\n";
		for (i = 0; i < this.columns.length; i++) {
			text = text + (i + 1) + ". " + JSON.stringify(this.columns[i]) + "\n";
		}
		return text;
	}
})();
