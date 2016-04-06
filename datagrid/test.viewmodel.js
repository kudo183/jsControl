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
			createItem("11",true,10,10,"51"),
			createItem("21",false,11,10,"52")
		);
		root.items(items);
		console.log("load");
	}
	
	function save(){
		console.log("save");
	}
	
	function addNewItem(root){
				root.items.push(createItem("", true, 10, 10, ""));
		console.log("addNewItem");
	}
	
	function createItem(col1, col2, col3, col4, col5){
		return {
			column1:ko.observable(col1),
			column2:ko.observable(col2),
			column3:ko.observable(col3),
			column4:ko.observable(col4),
			column5:ko.observable(col5),
		};
	}
})();