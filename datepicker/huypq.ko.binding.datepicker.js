window.huypq = window.huypq || {};
window.huypq.datepickerLog = window.huypq.datepickerLog || function (logLevel, msg) {
    if (logLevel === "INFO") {
        console.log(msg);
    } else if (typeof (window.huypq.log) !== "undefined") {
        window.huypq.log(msg);
    }
};

(function (logger) {

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
            logger("datepicker options: " + JSON.stringify(options));
            //handle the field changing
            ko.utils.registerEventHandler(element, "change", function () {
                var observable = valueAccessor();
                date = $(element).datepicker("getDate");

                //convert datepicker value to UTC
                if (date !== null) {
                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                }

                logger("INFO", "datepicker selected date: " + JSON.stringify(date));
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

            //convert datepicker value to UTC
            if (current !== null) {
                current.setMinutes(current.getMinutes() - current.getTimezoneOffset());
            }

            if (value - current !== 0) {
                $(element).datepicker("setDate", value);
                logger("datepicker update when model changed: " + JSON.stringify(value));
            }
        }
    };
})(window.huypq.datepickerLog);