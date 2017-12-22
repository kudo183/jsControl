window.app = window.app || {};
window.app.viewModel = window.app.viewModel || {};
window.app.viewModel.testViewModel = (function () {
    var viewModel = huypq.control.dataGrid.createViewModel(window.app.fakeDataProvider.create({
        keyProperty: "column1",
        itemProperties: [
            { name: "column1", type: "int" },
            { name: "column2", type: "text" },
            { name: "column3", type: "bool" },
            { name: "column4", type: "int" },
            { name: "column5", type: "date" }
        ],
        itemsSources: [
            { name: "column4ItemsSource", controller: "column4" }
        ],
    }));

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
        filterValue: ko.observable(),
        defaultValue: "text"
    });
    viewModel.addColumn({
        headerText: "Col3",
        type: "checkBox",
        cellValueProperty: "column3",
        readOnly: false,
        order: 0,
        filterValue: ko.observable(),
        defaultValue: true
    });
    
    viewModel.addColumn({
        headerText: "Col4",
        type: "comboBox",
        cellValueProperty: "column4",
        readOnly: false,
        itemsSourceName: "column4ItemsSource",
        itemText: "itemText",
        itemValue: "itemValue",
        //caption: "...",
        order: 0,
        filterValue: ko.observable(),
        filterItemsSource: window.app.fakeDataProvider.referenceDataManager.get("column4")
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
    
    viewModel.addCustomFilters([
        {
            type: "textBox",
            propertyPath: "column2",
            filterValue: ko.observable("test")
        },
        {
            type: "date",
            propertyPath: "column5",
            filterValue: ko.observable()
        },
        {
            type: "checkBox",
            propertyPath: "column3",
            filterValue: ko.observable()
        },
        //{
        //    type: "comboBox",
        //    propertyPath: "column4",
        //    itemsSourceName: "column4ItemsSource",
        //    itemText: "itemText",
        //    itemValue: "itemValue",
        //    filterValue: ko.observable()
        //}
    ]);
    return viewModel;   
})();