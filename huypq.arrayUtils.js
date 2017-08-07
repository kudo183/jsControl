window.huypq = window.huypq || {};
window.huypq.arrayUtils = (function () {

    var arrayUtils = {
        sort: sort,
		sortNumber: sortNumber
    };
    return arrayUtils;

    function sort(arr, sortProperty, isAscending) {
        arr.sort(function (a, b) {
            var nameA = a[sortProperty].toUpperCase(); // ignore upper and lowercase
            var nameB = b[sortProperty].toUpperCase(); // ignore upper and lowercase
            if (isAscending === true) {
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
            } else {
                if (nameA < nameB) {
                    return 1;
                }
                if (nameA > nameB) {
                    return -1;
                }
            }
            // names must be equal
            return 0;
        });
    }	
	
    function sortNumber(arr, sortProperty, isAscending) {
        arr.sort(function (a, b) {
            if (isAscending === true) {
                return a[sortProperty] - b[sortProperty];
            } else {
                return b[sortProperty] - a[sortProperty];
            }
            // names must be equal
            return 0;
        });
    }
})();