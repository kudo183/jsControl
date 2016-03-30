window.app = window.app || {};
window.app.viewModel = window.app.viewModel || {};
window.app.viewModel.testViewModel = (function () {
    var viewModel = huy.control.dataGrid.createViewModel(load, save, addNewItem);
	viewModel.columns.push({
        headerText: "Col1",
		type: "span",
        cellValueProperty: "column1",
		readOnly: true,
		filterValue: ko.observable()
    });
	viewModel.columns.push({
        headerText: "Col2",
        type: "checkBox",
        cellValueProperty: "column2",
        readOnly: false,
		filterValue: ko.observable()
    });
	viewModel.columns.push({
        headerText: "Col3",
        type: "comboBox",
        cellValueProperty: "column3",
		readOnly: false,
        items: [{
            itemText: "list10",
            itemValue: 10
        }, {
            itemText: "list11",
            itemValue: 11
        }],
        itemText: "itemText",
        itemValue: "itemValue",
        caption: "...",
		filterValue: ko.observable()
    });
	viewModel.columns.push({
        headerText: "Col4",
        type: "template",
		filterTemplate:"filterTemplate",
		cellTemplate:"cellTemplate",
        cellValueProperty: "column4",
		readOnly: false,
        items: [{
            itemText: "list10",
            itemValue: 10
        }, {
            itemText: "list11",
            itemValue: 11
        }],
        itemText: "itemText",
        itemValue: "itemValue",
        caption: "...",
		filterValue: ko.observable()
    });
	document.write('<script type="text/html" id="cellTemplate"><select data-bind="optionsCaption: caption, options:items, optionsText: itemText, optionsValue: itemValue, value: $parent[cellValueProperty]"></select></script>');
	document.write('<script type="text/html" id="filterTemplate"><select data-bind="optionsCaption: caption, options:items, optionsText: itemText, optionsValue: itemValue, value: filterValue"></select></script>');
	
	viewModel.columns.push({
        headerText: "Col5",
        type: "textBox",
		cellValueProperty: "column5",
		readOnly: false,
		filterValue: ko.observable()
    });
	return viewModel;
	
	function load(root){
		var items = [];
		items.push(
			{column1:"11", column2:true, column3: 10, column4: 10, column5:"51"},
			{column1:"21", column2:false, column3: 11, column4: 10, column5:"52"}
		);
		root.items(items);
		console.log("load");
	}
	
	function save(){
		console.log("save");
	}
	
	function addNewItem(root){
				root.items.push({column1:"", column2:true, column3: 10, column4: 10, column5:""});
		console.log("addNewItem");
	}
	
})();