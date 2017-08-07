window.huypq = window.huypq || {};
window.huypq.dateTimeUtils = (function () {

    var dateTimeUtils = {
        getCurrentDate: getCurrentDate,
        createUTCDate: createUTCDate
    };
    return dateTimeUtils;

    function getCurrentDate() {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today;
    }

    function createUTCDate(dateString) {// dateString: yyyy-mm-ddThh:mm:ss
        var date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date;
    }
})();