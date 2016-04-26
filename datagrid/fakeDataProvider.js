window.app = window.app || {};
window.app.fakeDataProvider = (function(){
    var dataProvider = {
        _items: [],
        _getCopyOfItems: getCopyOfItems,
        pageSize:12,
        getItemId: getItemId,
        setItemId: setItemId,
        toEntity: toEntity,
        getItems : getItems,
        getItemsAjax : getItemsAjax,
        saveChanges: saveChanges,
        saveChangesAjax: saveChangesAjax
    };
    
    for(var i=1; i<=105;i++){
        dataProvider._items.push({
            column1:ko.observable(i),
            column2:ko.observable("text " + i),
            column3:ko.observable((i&1) === 0),
            column4:ko.observable(i),
            column5:ko.observable(new Date()),
        });
    }
    return dataProvider;
    
    function getCopyOfItems(){
        var result = [];
        for(var i=0; i<this._items.length;i++){
            var item = this._items[i];
            result.push({
                column1:ko.observable(item.column1()),
                column2:ko.observable(item.column2()),
                column3:ko.observable(item.column3()),
                column4:ko.observable(item.column4()),
                column5:ko.observable(item.column5()),
            });
        }
        return result;
    }
    
    function getItemId(item){
        return item.column1;
    }
    
    function setItemId(item, newId){
        item.column1(newId);
    }
    
    function toEntity(item){
        return {
            column1:ko.unwrap(item.column1),
            column2:ko.unwrap(item.column2),
            column3:ko.unwrap(item.column3),
            column4:ko.unwrap(item.column4),
            column5:ko.unwrap(item.column5),
        };
    }
    
    function getItems(filter){
        var result = {
            items:[],
            totalItemCount:0,
            pageIndex:filter.pageIndex,
            pageCount:0
        };
        
        var pageIndex = result.pageIndex;
        if(pageIndex < 1){
            pageIndex = 1;
        }
        
        var filteredItems = filterItem(this._getCopyOfItems(), filter.whereOptions);
        filteredItems = orderItems(filteredItems, filter.orderOptions);
        
        result.totalItemCount = filteredItems.length;
        result.pageCount = Math.floor((result.totalItemCount + this.pageSize) / this.pageSize);
        if(pageIndex > result.pageCount){
            pageIndex = result.pageCount;
        }
        
        var itemIndex = (pageIndex - 1) * this.pageSize;
        var take = (itemIndex + this.pageSize) <= result.totalItemCount ? this.pageSize : result.totalItemCount - itemIndex;
        for(var i=0; i < take; i++){
            result.items.push(filteredItems[itemIndex + i]);
        }
        
        result.pageIndex = pageIndex;
        return result;          
    }
    
    function getItemsAjax(filter, done, fail){
        var result = this.getItems(filter);
        done(result);       
    }
    
    function saveChanges(changes){
        for(var i=0; i<changes.length; i++){
            console.log(JSON.stringify(changes[i]));
        }
        return [1000];
    }
    
    function saveChangesAjax(changes, done, fail){
        var result = this.saveChanges(changes);
        done(result);
    }
    
    function filterItem(items, whereOptions){
        var result = []
        for(var i=0; i<items.length; i++){
            var item = items[i];
            var isValid = true;
            for(var j=0; j<whereOptions.length; j++){
                var w = whereOptions[j];
                if(ko.unwrap(item[w.propertyPath]) != w.value){
                    isValid = false;
                    break;
                }
            }
            if(isValid === true){
                result.push(items[i]);
            }
        }
        return result;
    }
    
    function orderItems(items, orderOptions){
        var result = []
        for(var i=0; i<items.length; i++){
            result.push(items[i]);
        }
        
        if(orderOptions.length === 0){
            return result;
        }
        
        result.sort(function(a, b){
            for(var j=0; j<orderOptions.length; j++){
                var p = orderOptions[j].propertyPath;
                var d = orderOptions[j].isAscending;
                if(d){
                    if(ko.unwrap(a[p]) < ko.unwrap(b[p])){
                        return -1;
                    }
                    if(ko.unwrap(a[p]) > ko.unwrap(b[p])){
                        return 1;
                    }
                }else{
                    if(ko.unwrap(a[p]) < ko.unwrap(b[p])){
                        return 1;
                    }
                    if(ko.unwrap(a[p]) > ko.unwrap(b[p])){
                        return -1;
                    }
                }
            }
            return 0;
        });
        
        return result;
    }
})();