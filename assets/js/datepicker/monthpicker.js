window.addEventListener('load', function () {
    var Monthpicker = function () {

        var month;

        var wrapper;
        var currentYear;
        var yearDiv;
        var minMonth;
        var settings;
        var prev;
        var next;
        var callback;


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
                + "<div class='Year'>"
                + 2018
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
            yearDiv = wrapper.querySelector(".Year");
            monthList = wrapper.querySelectorAll("i");
            prev = wrapper.querySelector(".Previous");
            next = wrapper.querySelector(".Next");

            updateCalendar(currentYear);
            addMonthListener();
            addPrevNextListener();
            checkDisabledPrevNext();
        }

        function addMonthListener() {
            var allMonthes = wrapper.querySelectorAll(".Calendar div");
            for (var i = 0; i < 12; i++) {
                allMonthes[i].addEventListener('click', function (e) {
                    month = new Date(currentYear, i);
                    updateCalendar(currentYear);

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
                updateCalendar(currentYear);
                if (currentYear == minMonth.getFullYear()) {
                    prev.classList.add("Disabled");
                }
            })
            next.addEventListener('click', function (e) {
                prev.classList.remove("Disabled");
                currentYear = currentYear + 1;
                updateCalendar(currentYear);
                if (currentYear == new Date().getFullYear()) {
                    next.classList.add("Disabled");
                }

            })
        }

        function checkDisabledPrevNext() {
            if (currentYear == minMonth.getFullYear()) {
                prev.classList.add("Disabled");
            }
            if (currentYear == new Date().getFullYear()) {
                next.classList.add("Disabled");
            }
        }

        function updateCalendar(year) {

            yearDiv.innerHTML = currentYear;

            for (var i = 0; i < 12; i++) {
                var thisMonth = new Date(currentYear, i);
                if (thisMonth - month == 0) {
                    monthList[i].parentNode.className = "Selected";
                }
                else if (thisMonth < minMonth) {
                    monthList[i].parentNode.className = "Disabled";
                }
                else {
                    monthList[i].parentNode.className = "";
                }
            }

        }


        return {
            init: init
        }
    }

    document.querySelector(".custom-month").addEventListener('click', addMonthPicker);


    function addMonthPicker(e) {

        var index;

        var active = e.target.parentNode.parentNode.querySelectorAll("li");



        fetch('monthdata.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var monthcalendar = new Monthpicker();

            var min = data["min_income_month"];
            var arr = min.split("-");
            var minMonth = new Date(arr[0],arr[1]);

            monthcalendar.init(document.querySelector("#modal_month_picker .Container"), { minMonth: minMonth },
                function (month) { console.log(month) });

        });

    }

});

// , defaultMonth: defaultMonth