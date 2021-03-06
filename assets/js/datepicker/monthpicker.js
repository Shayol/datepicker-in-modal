var MONTH_DATA_JSON = 'monthdata.json';


window.addEventListener('load', function () {
    var Monthpicker = function () {

        var month;

        var wrapper;
        var currentYear;
        var currentPosition;
        var minMonth;
        var maxMonth = new Date();
        var settings;
        var prev;
        var next;
        var callback;
        var container;
        var cals;


        function init(obj, options, cb) {
            wrapper = obj;
            settings = options || {};
            callback = cb;


            minMonth = settings.minMonth || new Date(1970, 0);

            month = settings.defaultMonth || new Date(new Date().getFullYear(), new Date().getMonth());

            if (month < minMonth) { //parseminMonth
                month = new Date(minMonth.getFullYear(), minMonth.getMonth());
            }

            currentYear = month.getFullYear();

            render()
        }

        function render() {
            wrapper.innerHTML = "<span class='Previous icon-arrow-left12'></span>"
                + "<span class='Next icon-arrow-right13'></span>"
                + "<div class='CalendarContainer'>"
                + "<div class='cal-wrapper'>"
                + buildCalendars()
                + "</div>"
                + "</div>";
            yearDiv = wrapper.querySelector(".Year");
            monthList = wrapper.querySelectorAll("i");
            prev = wrapper.querySelector(".Previous");
            next = wrapper.querySelector(".Next");
            container = wrapper.querySelector(".cal-wrapper");

            cals = wrapper.querySelectorAll(".year-container");

            updateCalendar();
            setPosition();
            addMonthListener();
            addPrevNextListener();
            checkDisabledPrevNext();
        }

        function buildCalendars() {

            var startYear = new Date().getFullYear() - 7;

            var str = '';

            for (var i = 0; i < 11; i++) {

                var yearNow = startYear + i;

                str += "<div class='year-container'>"
                    +"<div class='Year'>"
                    + yearNow
                    + "</div>"
                    + "<div class='Calendar noselect'>"
                    + "<div><i>Jan</i></div>"
                    + "<div><i>Feb</i></div>"
                    + "<div><i>Mar</i></div>"
                    + "<div><i>Apr</i></div>"
                    + "<div><i>May</i></div>"
                    + "<div><i>Jun</i></div>"
                    + "<div><i>Jul</i></div>"
                    + "<div><i>Aug</i></div>"
                    + "<div><i>Sep</i></div>"
                    + "<div><i>Oct</i></div>"
                    + "<div><i>Nov</i></div>"
                    + "<div><i>Dec</i></div>"
                    + "</div>"
                    + "</div>";
            }

            return str;

        }

        function setPosition() {
            for (var i = 0; i < cals.length; i++) {
                var year = parseInt(cals[i].querySelector(".Year").innerText);
                if (currentYear == year) {
                    currentPosition = i;
                }
             }
             container.style.left = "-" + 284 * currentPosition + "px";
             container.style.width = 284 * cals.length + "px";
        }

        function addMonthListener() {
            var allMonthes = wrapper.querySelectorAll(".Calendar div");
            for (var i = 0; i < allMonthes.length; i++) {
                allMonthes[i].addEventListener('click', function (e) {
                    month = new Date(currentYear, i);

                    updateCalendar();

                    var result = month.getFullYear() + "-" + ("0" + (month.getMonth() + 1)).slice(-2);
                    callback(result);
                    document.querySelector("#modal_month_picker .close").click();
                });
            }
        }

        function addPrevNextListener() {
            prev.addEventListener('click', function (e) {
                next.classList.remove("Disabled");
                currentYear = currentYear - 1;
                currentPosition -= 1;


                container.style.left = "-" + 284 * currentPosition + "px";

                if (currentYear == minMonth.getFullYear()) {
                    prev.classList.add("Disabled");
                }
            });
            next.addEventListener('click', function (e) {
                prev.classList.remove("Disabled");
                currentYear = currentYear + 1;

                currentPosition += 1;

                container.style.left = "-" + 284 * currentPosition + "px";

                if (currentYear == maxMonth.getFullYear()) {
                    next.classList.add("Disabled");
                }

            });
        }

        function checkDisabledPrevNext() {
            if (currentYear == minMonth.getFullYear()) {
                prev.classList.add("Disabled");
            }
            if (currentYear == maxMonth.getFullYear()) {
                next.classList.add("Disabled");
            }
        }

        function updateCalendar(year) {

            for (var n = 0; n < cals.length; n++) {
                var year = parseInt(cals[n].querySelector(".Year").innerText);
                var monthInYear = cals[n].querySelectorAll("i");

                for (var i = 0; i < 12; i++) {
                    var thisMonth = new Date(year, i);
                    if (thisMonth - month == 0) {
                        monthInYear[i].className = "Selected";
                    }
                    else if (thisMonth < minMonth || thisMonth > maxMonth) {
                        monthInYear[i].className = "Disabled";
                    }
                    else {
                        monthInYear[i].className = "";
                    }
                }
            }

        }


        return {
            init: init
        }
    }

    document.querySelector(".custom-month").addEventListener('click', addMonthPicker);


    function addMonthPicker(e) {

        var active = e.target.parentNode.parentNode.querySelectorAll("li");
        var defaultMonth = null;
        var index = null;
        var minMonth = null;

        for (var i = 0; i < active.length; i++) {
            if (active[i].className.indexOf("active") != -1) {
                index = i;
                break;
            }
        }

        if (index != null) {
            defaultMonth = new Date();
            defaultMonth = new Date(defaultMonth.getFullYear(), defaultMonth.getMonth() - index);
        }

        fetch(MONTH_DATA_JSON)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var monthcalendar = new Monthpicker();

                var min = data["min_income_month"];
                var arr = min.split("-");
                minMonth = new Date(parseInt(arr[0]), parseInt(arr[1]) - 1);

                monthcalendar.init(document.querySelector("#modal_month_picker .Container"), { minMonth: minMonth, defaultMonth: defaultMonth },
                    function (month) { console.log(month) });

            });

    }

});

// 