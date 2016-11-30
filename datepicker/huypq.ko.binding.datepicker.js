(function () {
    var log = window.huypq.log || function (text) { };
    //var log = console.log;
    var info = console.log;

    //http://jsfiddle.net/rniemeyer/x82ac/
    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().datepickerOptions || {
                dateFormat: "dd/mm/yy",
                showButtonPanel: true,
                changeMonth: true,
                changeYear: true
            };
            $(element).datepicker(options);
            log("datepicker options: " + JSON.stringify(options));
            //handle the field changing
            ko.utils.registerEventHandler(element, "change", function () {
                var observable = valueAccessor();
                date = $(element).datepicker("getDate");
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                info("datepicker selected date: " + JSON.stringify(date));
                observable(date);
            });

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).datepicker("destroy");
            });

        },
        //update the control when the view model changes
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                current = $(element).datepicker("getDate");

            if (value - current !== 0) {
                $(element).datepicker("setDate", value);
                log("datepicker update when model changed: " + JSON.stringify(value));
            }
        }
    };
})();