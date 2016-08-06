window.app = window.app || {};
window.app.fakeDataProvider = (function(){
    var dataProvider = {
        items: [],
        taiKhoans: [
            {
                ma: 1,
                tenTaiKhoan: "acb"
            },
            {
                ma: 2,
                tenTaiKhoan: "sacom"
            }
        ],
        mucChis: [
            {
                ma: 1,
                tenMucChi: "an sang"
            },
            {
                ma: 2,
                tenMucChi: "an toi"
            }
        ]
    };
    dataProvider.load = function(done, fail){
        var result = {}
        result.items = this.getItems();
        result.comboBoxItemSource = {};
        result.comboBoxItemSource.taiKhoans = this.taiKhoans;
        result.comboBoxItemSource.mucChis = this.mucChis;
        done(result);
    };
    
    dataProvider.add = function(item, done, fail){
        item.tenTaiKhoan = this.getValueFromKey(this.taiKhoans, item.maTaiKhoan, "ma", "tenTaiKhoan");
        item.tenMucChi = this.getValueFromKey(this.mucChis, item.maMucChi, "ma", "tenMucChi");
        item.ma = this.items.length;
        this.items.push(item);
        var result = {};
        result.items = this.getItems();
        done(result);
    };
    
    dataProvider.remove = function(item, done, fail){
        var index = this.findItemIndex(this.items, item.ma);
        this.items.splice(index, 1);
        var result = {};
        result.items = this.getItems();
        done(result);
    };
    
    dataProvider.update = function(item, done, fail){
        var index = this.findItemIndex(this.items, item.ma);
        item.tenTaiKhoan = this.getValueFromKey(this.taiKhoans, item.maTaiKhoan, "ma", "tenTaiKhoan");
        item.tenMucChi = this.getValueFromKey(this.mucChis, item.maMucChi, "ma", "tenMucChi");
        this.items[index] = item;
        var result = {};
        result.items = this.getItems();
        done(result);
    };
    
    dataProvider.getItems = function(){
        var result = [];
        for(var i=0; i<this.items.length; i++){
            var item = ko.unwrap(this.items[i]);
            result.push({
                ma: item.ma,
                soTien: ko.unwrap(item.soTien),
                ghiChu: ko.unwrap(item.ghiChu),
                maTaiKhoan: ko.unwrap(item.maTaiKhoan),
                tenTaiKhoan: ko.unwrap(item.tenTaiKhoan),
                maMucChi: ko.unwrap(item.maMucChi),
                tenMucChi: ko.unwrap(item.tenMucChi)
            });
        }
        return result;
    };
        
    dataProvider.getValueFromKey = function(items, key, keyName, valueName){
        items = ko.unwrap(items);
        key = ko.unwrap(key);
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item[keyName] === key) {
                return item[valueName];
            }
        }
        return "";
    };
     
    dataProvider.findItemIndex = function(items, key){
        for(var i=0; i< items.length; i++){
            if(items[i].ma === key){
                return i;
            }
        }
        return -1;
    };
    
    return dataProvider;
})();