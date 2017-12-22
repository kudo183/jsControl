window.app = window.app || {};
window.app.fakeDataProvider = window.app.fakeDataProvider || {};

window.app.fakeDataProvider.referenceDataManager = {};
window.app.fakeDataProvider.referenceDataManager.get = function () {
    return [
        {
            itemText: "text1",
            itemValue: 1
        },
        {
            itemText: "text2",
            itemValue: 2
        }
    ]
}

window.app.fakeDataProvider.create = function (settings) {
    var dataProvider = {
        _needLoadReferenceData: true,
        getItemId: getItemId,
        setItemId: setItemId,
        toDto: toDto,
        processNewAddedItem: processNewAddedItem,
        getItemsAjax: getItemsAjax,
        saveChangesAjax: saveChangesAjax
    };

    return dataProvider;

    function getItemId(item) {
        return item[settings.keyProperty];
    }

    function setItemId(item, newId) {
        item[settings.keyProperty](newId);
    }

    function toDto(item) {
        var dto = {};
        for (var i = 0; i < settings.itemProperties.length; i++) {
            var propName = settings.itemProperties[i].name;
            dto[propName] = ko.unwrap(item[propName]);
        }
        return dto;
    }

    function processNewAddedItem(item) {

        if (settings.itemsSources != undefined) {
            for (var i = 0; i < settings.itemsSources.length; i++) {
                var itemsSource = settings.itemsSources[i];
                item[itemsSource.name] = window.app.fakeDataProvider.referenceDataManager.get(itemsSource.controller);
            }
        }
    }

    function getItemsAjax(filter, done, fail) {
        filter.pageSize = filter.pageSize || 30;

        var data = {
            items: [],
            totalItemCount:15,
            pageIndex: 1,
            pageCount: 1
        };
        var d = new Date();
        d.setHours(0, 0, 0, 0);
        for (var i = 1; i <= 15; i++) {
            d.setDate(d.getDate() + 1);
            data.items.push({
                column1: i,
                column2: "text " + i,
                column3: (i & 1) === 0,
                column4: i,
                column5: new Date(d),
            });
        }
        done(processResponseData(data));
    }

    function saveChangesAjax(changes, done, fail) {
    }

    function processResponseData(data) {
        var result = {
            items: [],
            totalItemCount: data.totalItemCount,
            pageIndex: data.pageIndex,
            pageCount: data.pageCount
        };
        var dataItems = data.items;
        for (var i = 0; i < dataItems.length; i++) {
            var item = dataItems[i];
            var dto = {};
            for (var j = 0; j < settings.itemProperties.length; j++) {
                var prop = settings.itemProperties[j];
                if (prop.type === "date") {
                    dto[prop.name] = ko.observable(huypq.dateTimeUtils.createUTCDate(item[prop.name]))
                } else {
                    dto[prop.name] = ko.observable(item[prop.name]);
                }
            }
            if (settings.itemsSources != undefined) {
                for (var j = 0; j < settings.itemsSources.length; j++) {
                    var itemsSource = settings.itemsSources[j];
                    dto[itemsSource.name] = window.app.fakeDataProvider.referenceDataManager.get(itemsSource.controller);
                }
            }
            result.items.push(dto);
        }

        return result;
    }
}