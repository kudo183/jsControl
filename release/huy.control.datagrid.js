window.huy = window.huy || {};
window.huy.control = window.huy.control || {};
window.huy.control.dataGrid = (function () {
    var dataGrid = {
        createView: createView,
        createViewModel: createViewModel
    };
    return dataGrid;

    function createViewModel(dataProvider) {
        var viewModel = {
            items: ko.observableArray(),
            itemsRemoved: [],
            itemsAdded: [],
            currentSelectedItem: ko.observable(),
            previousSelectedItem: {},
            _rowClicked: function(root, index, item) {
                root.previousSelectedItem = ko.unwrap(root.currentSelectedItem);
                root.currentSelectedItem(item);
                console.log(JSON.stringify(ko.toJS(item)));
                console.log(index);
                return true;
            },
            addColumn: addColumn,
            _columns: [],
            enablePaging: ko.observable(true),
            paging: createPagingObject(),
            buttons: [
                {
                    text: "Add",
                    action: function (root){
                        var item = {};
                        for(var i=1; i<root._columns.length; i++){
                            item[root._columns[i].cellValueProperty] = ko.observable();
                            console.log(root._columns[i].cellValueProperty);
                        }
                        root.items.push(item);
                        root.itemsAdded.push(item);
                    }
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
            _dataProvider: dataProvider,
            _isSkipLoadFunction: false,
            load: load,
            toString: toString
        };

        viewModel._columns.push({
            headerText: "",
            type: "action",
            text: "x",
            readOnly: true,
            filterValue: ko.observable(),
            action: function (root, item) {
                if (item === "filter") {
                    root._isSkipLoadFunction = true;
                    for (var i = 0; i < root._columns.length; i++) {
                        root._columns[i].filterValue(undefined);
                    }
                    root._isSkipLoadFunction = false;
                    root.load(root)
                } else {
                    root.itemsRemoved.push(item);
                    root.items.remove(item);
                }
            }
        });
        
        viewModel.paging.currentPageIndex.subscribe(function(){viewModel.load(viewModel)});
        
        return viewModel;
    
        function load(root){
            if(root._isSkipLoadFunction === true){
                return;
            }
            console.log("load");
            var filter = {};
            filter.whereOptions = [];
            for(var i=0; i<root._columns.length; i++){
                var c = root._columns[i];
                var v = ko.unwrap(c.filterValue);
                if(v !== undefined){
                    filter.whereOptions.push({
                        predicate: "=",
                        propertyPath: c.cellValueProperty,
                        value: v
                    })
                }
            }
            filter.orderOptions = [];
            for(var i=0; i<root._columns.length; i++){
                var c = root._columns[i];
                if(c.order === 1){
                    filter.orderOptions.push({propertyPath: c.cellValueProperty, isAscending: true})
                }else if(c.order === -1){
                    filter.orderOptions.push({propertyPath: c.cellValueProperty, isAscending: false})
                }
            }
            filter.pageIndex = root.paging.currentPageIndex();
            
            root._dataProvider.getItemsAjax(filter, function(result){
                root.items(result.items);
                for(var i=0; i<result.items.length; i++){
                    var item = result.items[i];
                    for(var j=0; j<root._columns.length; j++){
                        if(root._columns[j].readOnly === false){
                            addChangeTracking(item, root._columns[j].cellValueProperty);
                        }
                    }
                }
                root._isSkipLoadFunction = true;
                root.paging.pageCount(result.pageCount);
                root.paging.currentPageIndex(result.pageIndex);
                root._isSkipLoadFunction = false;
            }, function(error){
                console.log("getItems error: " + JSON.stringify(error));
            });         
        }
        
        function addChangeTracking(item, property){
            item[property].subscribe(function(){
                item._changed = true;
            });
        }
        
        function save(root){
            console.log("save")
            var changes = [];

            var uItems = ko.unwrap(root.items);
            var i, item;

            for (i = 0; i < uItems.length; i++) {
                item = uItems[i];
                if (ko.unwrap(root._dataProvider.getItemId(item)) !== 0 &&
                    item._changed === true) {
                    changes.push({ actionType: "~", data: root._dataProvider.toEntity(item) });
                }
            }

            var itemsAdded = root.itemsAdded;
            for (i = 0; i < itemsAdded.length; i++) {
                item = itemsAdded[i];
                changes.push({ actionType: "+", data: root._dataProvider.toEntity(item) });
            }

            var itemsRemoved = root.itemsRemoved;
            for (i = 0; i < itemsRemoved.length; i++) {
                item = itemsRemoved[i];
                changes.push({ actionType: "-", data: root._dataProvider.toEntity(item) });
            }
            
            root._dataProvider.saveChangesAjax(changes, function(result){
                for (i = 0; i < itemsAdded.length; i++) {
                    root._dataProvider.setItemId(root.itemsAdded[i], result[i]);
                }

                root.itemsRemoved = [];
                root.itemsAdded = [];
                for (i = 0; i < uItems.length; i++) {
                    uItems[i]._changed = false;
                }
            });
        }
        
        function addColumn(column){
            viewModel._columns.push(column);
            column.filterValue.subscribe(function(){viewModel.load(viewModel)});
        }
        
        function createPagingObject(){
            return {
                currentPageIndex: ko.observable(1),
                pageCount: ko.observable(0),
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
                }
            };
        }
        
        function toString(){
            var i = 0, text = "";
            text = text + "previousSelectedItem:\n";
            text = text + JSON.stringify(ko.toJS(this.previousSelectedItem)) + "\n";
            text = text + "currentSelectedItem:\n";
            text = text + JSON.stringify(ko.toJS(this.currentSelectedItem)) + "\n";
            text = text + "filters value:\n";
            for (i = 0; i < this._columns.length; i++) {
                text = text + (i + 1) + ". " + ko.toJS(this._columns[i].filterValue) + "\n";
            }
            text = text + "items:\n";
            var data = ko.unwrap(this.items);
            for (i = 0; i < data.length; i++) {
                text = text + (i + 1) + ". " + JSON.stringify(ko.toJS(data[i])) + "\n";
            }
            text = text + "itemsRemoved:\n";
            for (i = 0; i < this.itemsRemoved.length; i++) {
                text = text + (i + 1) + ". " + JSON.stringify(ko.toJS(this.itemsRemoved[i])) + "\n";
            }
            text = text + "columns:\n";
            for (i = 0; i < this._columns.length; i++) {
                text = text + (i + 1) + ". " + JSON.stringify(ko.toJS(this._columns[i])) + "\n";
            }
            return text;
        }
    }
    
    function createView(id, style) {
        var view = window.huy.control.utilsDOM.createElement("div", { id: id });
        view.appendChild(createHeader());
        view.appendChild(createColumnFilter());
        view.appendChild(createGridViewContent(style));
        view.appendChild(createBottomToolbar());
        return view;

        function createHeader() {
            var view = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "gridHeader");
            var koItems = window.huy.control.utilsDOM.createComment("ko foreach: _columns");
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
            row = window.huy.control.utilsDOM.createElement("div", {}, "foreach: _columns", undefined, "gridColumnFilter");

            //readonly text
            cell = createColumnFilterCellDiv();
            addColumnFilterCell(row, cell, "value:filterValue", 'span', "input", {});

            //text text
            cell = createColumnFilterCellDiv();
            addColumnFilterCell(row, cell, "value:filterValue", 'textBox', "input", {});

            //checkBox
            cell = createColumnFilterCellDiv();
            addColumnFilterCell(row, cell, "checked:filterValue", 'checkBox', "input", { type: "checkbox" });

            //comboBox
            cell = createColumnFilterCellDiv();
            addColumnFilterCell(row, cell, "cbSelectedValue: filterValue, cbItems: items, cbItemText: itemText, cbItemValue: itemValue"
            , 'comboBox', "div", {});
            
            //date
            cell = createColumnFilterCellDiv();
            addColumnFilterCell(row, cell, "datepicker:filterValue", 'date', "input", {});
            
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
                row = window.huy.control.utilsDOM.createElement(
                "div", {}, "click: function(data, event){return $root._rowClicked($root, $index(), data, event)}, foreach: $parent._columns, css: css", undefined, "row");
            } else {
                row = window.huy.control.utilsDOM.createElement(
                "div", {}, "click: function(data, event){return $root._rowClicked($root, $index(), data, event)}, foreach: $parent._columns", undefined, "row");
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
            
            //date
            cell = createCellDiv();
            addCell(row, cell, "datepicker:$parent[cellValueProperty], disable:readOnly", 'date', "input", {});

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
        
        function addColumnFilterCell(row, cell, cellDataBind, type, htmlElement, attrs) {
            var cellContent = window.huy.control.utilsDOM.createElement(htmlElement, attrs, cellDataBind);
            var s = "ko if:type==='{0}'";
            row.appendChild(window.huy.control.utilsDOM.createComment(s.replace("{0}", type)));
            var wrapper = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "h-wrapper");
            var buttonWrapper = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "h-button-wrapper");
            var inputWrapper = window.huy.control.utilsDOM.createElement("div", {}, undefined, undefined, "h-input-wrapper");
            var xButton = window.huy.control.utilsDOM.createElement("button", {}, "click: function(data, event) { data.filterValue(undefined); }", "x");
            
            buttonWrapper.appendChild(xButton);
            inputWrapper.appendChild(cellContent);
            wrapper.appendChild(buttonWrapper);
            wrapper.appendChild(inputWrapper);
            
            row.appendChild(cell);
            cell.appendChild(wrapper);
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
    }
    
})();
