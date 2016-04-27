window.app = window.app || {};
window.app.viewModel = window.app.viewModel || {};
window.app.viewModel.testViewModel = (function () {
    var viewModel = huy.control.dataGrid.createViewModel(window.app.fakeDataProvider);
    viewModel.addColumn({
        headerText: "Col1",
        type: "span",
        cellValueProperty: "column1",
        readOnly: true,
        order: 0,
        filterValue: ko.observable()
    });
    viewModel.addColumn({
        headerText: "Col2",
        type: "textBox",
        cellValueProperty: "column2",
        readOnly: false,
        order: 0,
        filterValue: ko.observable()
    });
    viewModel.addColumn({
        headerText: "Col3",
        type: "checkBox",
        cellValueProperty: "column3",
        readOnly: false,
        order: 0,
        filterValue: ko.observable()
    });
    
    var items = [];
    for(var i=1; i<=105;i++){
        items.push({itemText:"item " + i, itemValue: i});
    }
    viewModel.addColumn({
        headerText: "Col4",
        type: "comboBox",
        cellValueProperty: "column4",
        readOnly: false,
        items: items,
        itemText: "itemText",
        itemValue: "itemValue",
        caption: "...",
        filterValue: ko.observable()
    });
    viewModel.addColumn({
        headerText: "Col5",
        type: "date",
        cellValueProperty: "column5",
        readOnly: false,
        filterValue: ko.observable()
    });
    // viewModel.addColumn({
        // headerText: "Col4",
        // type: "template",
        // filterTemplate:"filterTemplate",
        // cellTemplate:"cellTemplate",
        // cellValueProperty: "column4",
        // readOnly: false,
        // items: [{
            // itemText: "list10",
            // itemValue: 10
        // }, {
            // itemText: "list11",
            // itemValue: 11
        // }],
        // itemText: "itemText",
        // itemValue: "itemValue",
        // caption: "...",
        // filterValue: ko.observable()
    // });
    // document.write('<script type="text/html" id="cellTemplate"><select data-bind="optionsCaption: caption, options:items, optionsText: itemText, optionsValue: itemValue, value: $parent[cellValueProperty]"></select></script>');
    // document.write('<script type="text/html" id="filterTemplate"><select data-bind="optionsCaption: caption, options:items, optionsText: itemText, optionsValue: itemValue, value: filterValue"></select></script>');
    
    return viewModel;   
})();