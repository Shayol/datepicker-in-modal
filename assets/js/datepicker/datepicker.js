var PICKER_DATA_JSON = 'pickerdata.json';


var ranges = {
    "past-30-days": {
        start: new Date(new Date().getFullYear(),
            new Date().getMonth(), new Date().getDate() - 29),
        end: new Date()
    },

    "this-month": {
        start: new Date(new Date().getFullYear(),
            new Date().getMonth(), 1),
        end: new Date()
    },

    "last-month": {
        start: new Date(new Date().getFullYear(),
            new Date().getMonth() - 1, 1),
        end: new Date(new Date().getFullYear(),
            new Date().getMonth(), 0)
    },

    "this-year": {
        start: new Date(new Date().getFullYear(),
            0, 1),
        end: new Date()
    }
};

window.addEventListener('load', function () {

    var Picker = function () {

        var wrapper;
        var settings;
        var func; //user provided callback function

        var to; //current right calendar

        var yearTo;
        var monthTo;

        var dayTo; //object holds full day to

        var from; //current left calendar

        var yearFrom;
        var monthFrom;

        var dayFrom; //object holds full day from

        var inputFrom;
        var inputTo;

        var allowedMin;
        var allowedMax;

        var calAll;
        var cleaveFrom;
        var cleaveFrom;

        var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];

        var RE = /^(\d{4})-(\d{2})-(\d{2})$/;

        function init(obj, options, cb) {

            wrapper = obj;

            settings = options || {};

            func = cb;

            var cookieStart = getCookie("datepickerstart");
            var cookieEnd = getCookie("datepickerend");

            if (cookieStart) {
                cookieStart = new Date(cookieStart);
            }

            if (cookieEnd) {
                cookieEnd = new Date(cookieEnd);
            }

            allowedMin = parseDate(settings.allowedMin) || new Date(2010, 0);
            allowedMax = parseDate(settings.allowedMax) || new Date();

            dayTo = cookieEnd || parseDate(settings.end) || new Date();
            dayTo = new Date(dayTo.getFullYear(), dayTo.getMonth(), dayTo.getDate());

            if (dayTo > allowedMax || dayTo < allowedMin) {
                dayTo = new Date(allowedMax.getFullYear(), allowedMax.getMonth(), allowedMax.getDate());
            }

            to = new Date(dayTo.getFullYear(), dayTo.getMonth());

            yearTo = to.getFullYear();
            monthTo = to.getMonth();


            dayFrom = cookieStart || parseDate(settings.start);

            if (!dayFrom) {
                dayFrom = new Date(yearTo, monthTo, dayTo.getDate());
                dayFrom.setDate(dayFrom.getDate() - 29); //start date - 30 days ago
            }

            if (dayFrom < allowedMin || dayFrom > allowedMax) { //only dates since last transaction allowed
                dayFrom = new Date(allowedMin.getFullYear(), allowedMin.getMonth(), allowedMin.getDate());
            }

            from = new Date(dayTo.getFullYear(), dayTo.getMonth() - 1);

            yearFrom = from.getFullYear();
            monthFrom = from.getMonth();

            render();
        }


        function render() {
            // wrapper.innerHTML = '';
            wrapper.innerHTML = '<div class="modal-content S SModal SModalDatePicker">'
                + '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>'
                + '<div class="Content">'
                + '<div class="FromToInputs">'
                + '<div class="InputDate">'
                + 'From<input class="from" type="text" maxlength="10">'
                + '</div>'
                + '<div class="InputDate">'
                + 'To<input class="to" type="text" maxlength="10">'
                + '</div>'
                + '</div>'
                + '<div class="ModalTitle">Pick a date range</div>'
                + '<div class="Container noselect">'
                + '<span class="Previous icon-arrow-left12"></span>'
                + '<span class="Next icon-arrow-right13"></span>'
                + '<div class="calendar-wrapper">'
                + '<div class="calendar__all">'
                + createCalendars()
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '<div class="SaveCancelButtons">'
                + '<button type="button" data-dismiss="modal" class="btn done btn-primary pull-right">Done</button>'
                + '</div>'
                + '</div>';

            inputFrom = wrapper.getElementsByTagName('input')[0];
            inputTo = wrapper.getElementsByTagName('input')[1];
            calAll = wrapper.querySelector(".calendar__all");


            addDayListener();
            addNextPrevListener();
            updateInputFrom();
            updateInputTo();
            addInputListener();
            checkPrev();
            checkNext();
            doneListener();
            positionCalendar();

            calAll.style.transition = "left 0.4s";

            setTimeout(function () { inputFrom.focus(); }, 500); //place cursor on load in from input           

        }

        function positionCalendar(moveToDayFrom) {
            var id;
            if (moveToDayFrom) {
                id = new Date(dayFrom.getFullYear(), dayFrom.getMonth());
            }
            else {
                id = new Date(yearFrom, monthFrom);
            }
            var cal = wrapper.querySelector("#n-" + +id);
            if (cal && calAll.children.length > 2) {
                if (cal.dataset.number == calAll.children.length - 1) {
                    calAll.style.left = "-" + 322 * (cal.dataset.number - 1) + "px";
                }
                else {
                    calAll.style.left = "-" + 322 * cal.dataset.number + "px";
                }
            }
        }

        function parseDate(arg) {

            if (Object.prototype.toString.call(arg) === '[object Date]') {
                return arg;
            }
            if (RE.test(arg)) {
                var arr = arg.split("-");
                var year = parseInt(arr[0]);
                var month = parseInt(arr[1]);
                var day = parseInt(arr[2]);

                return new Date(year, month - 1, day);
            }
            else {
                return null;
            }
        }

        function update(e) {
            var el = e.target;
            var input = new Date(parseInt(el.dataset.value));

            validateInput(input);

            updateInputFrom();

            updateInputTo();

            updateCalendar();
            positionCalendar();
            addDayListener();
            setCookie();

        }

        function validateInput(input) {
            if (dayFrom && dayTo && (dayFrom - dayTo != 0)) {
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());

                inputFrom.focus();

            }
            else if (dayFrom - dayTo == 0) {

                if (input < dayFrom) {
                    dayTo = new Date(dayFrom.getFullYear(), dayFrom.getMonth(), dayFrom.getDate());
                    dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                }

                else if (input > dayFrom) {
                    dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                }

                inputTo.focus();
            }

        }

        function validateFrom(input) {
            if (allowedMin > input && (dayTo - dayFrom) != 0) {

                dayFrom = new Date(allowedMin.getFullYear(), allowedMin.getMonth(), allowedMin.getDate());
            }

            else if (allowedMin > input && (dayTo - dayFrom) == 0) {
                dayTo = new Date(allowedMin.getFullYear(), allowedMin.getMonth(), allowedMin.getDate());
                dayFrom = new Date(allowedMin.getFullYear(), allowedMin.getMonth(), allowedMin.getDate());
            }

            else if ((allowedMax < input) && (dayTo - dayFrom) != 0) {
                dayFrom = new Date(dayTo.getFullYear(), dayTo.getMonth(), dayTo.getDate());
                dayTo = new Date(allowedMax.getFullYear(), allowedMax.getMonth(), allowedMax.getDate());
            }
            else if ((allowedMax < input) && (dayTo - dayFrom) == 0) {
                dayTo = new Date(allowedMax.getFullYear(), allowedMax.getMonth(), allowedMax.getDate());
                dayFrom = new Date(allowedMax.getFullYear(), allowedMax.getMonth(), allowedMax.getDate());
            }
            else if ((input > dayTo) && (dayTo - dayFrom) != 0) {
                dayFrom = new Date(dayTo.getFullYear(), dayTo.getMonth(), dayTo.getDate());
                dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());

            }

            else if ((dayTo - dayFrom) == 0) {
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
            }
            else {
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
            }

            updateInputFrom();
            updateInputTo();
        }

        function validateTo(input) {

            if (allowedMin > input) {
                dayTo = new Date(dayFrom.getFullYear(), dayFrom.getMonth(), dayFrom.getDate());
                dayFrom = new Date(allowedMin.getFullYear(), allowedMin.getMonth(), allowedMin.getDate());
            }

            else if (allowedMax < input) {
                dayTo = new Date(allowedMax.getFullYear(), allowedMax.getMonth(), allowedMax.getDate());
            }

            else if (input < dayFrom) {
                dayTo = new Date(dayFrom.getFullYear(), dayFrom.getMonth(), dayFrom.getDate());
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
            }

            else {
                dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
            }
            updateInputTo();
            updateInputFrom();
        }

        function setCookie() {
            if (dayFrom && dayTo) {
                document.cookie = "datepickerstart=" + +dayFrom + ";";
                document.cookie = "datepickerend=" + +dayTo + ";";
            }

            else if (dayFrom) {
                document.cookie = "datepickerstart=" + +dayFrom + ";";
                document.cookie = "datepickerend=" + +dayFrom + ";";
            }
        }

        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return parseInt(c.substring(name.length, c.length));
                }
            }
            return false;
        }

        function updateInputFrom() {
            inputFrom.value = dayFrom.getFullYear() + "-" + ("0" + (dayFrom.getMonth() + 1)).slice(-2)
                + "-" + ("0" + dayFrom.getDate()).slice(-2);
            wrapper.querySelector(".done").classList.remove("Disabled");
        }

        function updateInputTo() {
            if (dayFrom && dayTo) {
                inputTo.value = dayTo.getFullYear() + "-" + ("0" + (dayTo.getMonth() + 1)).slice(-2)
                    + "-" + ("0" + dayTo.getDate()).slice(-2);
            }
            wrapper.querySelector(".done").classList.remove("Disabled");

        }

        function updateVars() {
            to = new Date(dayTo.getFullYear(), dayTo.getMonth());

            yearTo = to.getFullYear();
            monthTo = to.getMonth();

            from = new Date(dayTo.getFullYear(), dayTo.getMonth() - 1);

            yearFrom = from.getFullYear();
            monthFrom = from.getMonth();
        }

        function highlight(e) {

            var thisDay = parseInt(e.target.dataset.value);

            var hoverDays = wrapper.getElementsByClassName('hoverable');
            var start = wrapper.querySelector(".Selected");
            for (var i = 0; i < hoverDays.length; i++) {
                var day = parseInt(hoverDays[i].dataset.value)
                if (day <= thisDay) {
                    start.parentNode.classList.add("From");
                    hoverDays[i].parentNode.classList.add('Included');
                    hoverDays[i].addEventListener('mouseout', function () {

                        for (var i = 0; i < hoverDays.length; i++) {
                            start.parentNode.classList.remove("From");
                            hoverDays[i].parentNode.classList.remove('Included');
                        }
                    });
                }
                else {
                    hoverDays[i].parentNode.classList.remove('Included');
                }
            }

        }

        function checkPrev() {
            var id = new Date(yearFrom, monthFrom - 1);
            var cal = wrapper.querySelector("#n-" + +id);

            if (cal) {
                var days = cal.querySelectorAll(".available");

                if (days.length == 0) {
                    wrapper.querySelector(".Previous").classList.add("Disabled");
                }
                else {
                    wrapper.querySelector(".Previous").classList.remove("Disabled");
                }
            }

            else {
                wrapper.querySelector(".Previous").classList.add("Disabled");
            }
        }

        function checkNext() {

            var id = new Date(yearTo, monthTo + 1);
            var cal = wrapper.querySelector("#n-" + +id);

            if (cal) {
                var days = cal.querySelectorAll(".available");

                if (days.length == 0) {
                    wrapper.querySelector(".Next").classList.add("Disabled");
                }
                else {
                    wrapper.querySelector(".Next").classList.remove("Disabled");
                }
            }

            else {
                wrapper.querySelector(".Next").classList.add("Disabled");
            }
        }

        function handleFromInput(value) {

            var input = testValue(value);

            if (input) {

                validateFrom(input);
                updateVars();
                positionCalendar('left');
                updateCalendar()
                addDayListener();
                setCookie();
                checkPrev();
                checkNext();
                wrapper.querySelector(".done").classList.remove("Disabled");
            }
        }

        function handleToInput(value) {

            var input = testValue(value);

            if (input) {
                validateTo(input);
                updateVars();
                positionCalendar();
                updateCalendar()
                addDayListener();
                setCookie();
                checkPrev();
                checkNext();
                wrapper.querySelector(".done").classList.remove("Disabled");
            }

        }


        function testValue(value) {
            if (value.length == 10) {
                if (RE.test(value)) {
                    var arr = value.split("-");
                    var year = parseInt(arr[0]);
                    var month = parseInt(arr[1]);
                    var day = parseInt(arr[2]);

                    var input = new Date(year, month - 1, day);
                    return input;
                }
                else {
                    updateInputFrom();
                    updateInputTo();
                }
            }
            else {
                wrapper.querySelector(".done").classList.add("Disabled");
            }
            return false;
        }

        function addInputListener() {
            
            inputTo.addEventListener('focusout', updateInputTo);
            inputFrom.addEventListener('focusout', updateInputFrom);


            cleaveFrom = new Cleave('input.from', {
                blocks: [4, 2, 2],
                numericOnly: true,
                delimiter: '-',
                onValueChanged: function (e) {
                    handleFromInput(e.target.value);
                    console.log(e.target);
                }

            });

            cleaveTo = new Cleave('input.to', {
                blocks: [4, 2, 2],
                numericOnly: true,
                delimiter: '-',
                onValueChanged: function (e) {
                    handleToInput(e.target.value);
                    console.log(e.target);
                }
            });


        }

        function addDayListener() {

            var calDays = wrapper.getElementsByClassName("available");

            for (var n = 0; n < calDays.length; n++) {
                calDays[n].addEventListener('click', update);

                if (calDays[n].className.indexOf('hoverable') != -1)
                    calDays[n].addEventListener('mouseenter', highlight);
            }

        }

        function addNextPrevListener() {
            wrapper.querySelector(".Previous").addEventListener('click', function () {

                to = new Date(yearTo, monthTo - 1);
                yearTo = to.getFullYear();
                monthTo = to.getMonth();

                from = new Date(yearFrom, monthFrom - 1);
                yearFrom = from.getFullYear();
                monthFrom = from.getMonth();

                positionCalendar();
                checkPrev();
                checkNext();

            });
            wrapper.querySelector(".Next").addEventListener('click', function () {
                from = new Date(yearFrom, monthFrom + 1);
                yearFrom = from.getFullYear();;
                monthFrom = from.getMonth();

                to = new Date(yearTo, monthTo + 1);
                yearTo = to.getFullYear();
                monthTo = to.getMonth();

                positionCalendar();
                checkNext();
                checkPrev();

            });
        }

        function createCalendars() {

            var year = allowedMin.getFullYear();
            var month = allowedMin.getMonth();
            var maxYear = allowedMax.getFullYear();
            var maxMonth = allowedMax.getMonth();
            var result = '';
            var y = 0;

            while (true) {

                var current = new Date(year, month + y);
                var currYear = current.getFullYear();
                var currMonth = current.getMonth();
                result += buildCalendar(currYear, currMonth, y);
                if (currYear == maxYear && currMonth == maxMonth) {
                    break;
                }
                ++y
            }

            return result;
        }

        function updateCalendar() {


            var days = wrapper.querySelectorAll("i");

            for (var i = 0; i < days.length; i++) {
                var selection = '';
                var wrapperDiv = '';

                var currentDay = new Date(parseInt(days[i].dataset.value));


                if (currentDay < allowedMin || currentDay > allowedMax) {
                    wrapperDiv = 'Disabled';
                }

                else if (dayTo && (currentDay - dayFrom == 0)) {
                    selection = 'Selected available';

                    if (dayTo - dayFrom != 0) {
                        wrapperDiv = 'From';
                    }
                }

                else if (currentDay - dayFrom == 0) {
                    selection = 'Selected available';
                    wrapperDiv = 'From'
                }

                else if (dayTo && (currentDay - dayTo == 0)) {
                    selection = 'Selected available';
                    wrapperDiv = 'To';
                }

                else if (dayTo && (currentDay - dayFrom > 0 && dayTo - currentDay > 0)) {
                    selection = 'available';
                    wrapperDiv = 'Included';
                }

                else if ((dayFrom - dayTo == 0) && (currentDay > dayFrom)) {
                    selection = 'hoverable available';
                }

                else {
                    selection = 'available';
                }

                days[i].className = selection;
                days[i].parentNode.className = wrapperDiv;

            }

        }

        function buildCalendar(year, month, n) {

            setCookie();
            var id = new Date(year, month);

            var calendar = '<div class="CalendarContainer" data-number="' + n + '"  id="n-' + +id + '">'
                + '<div class="Month">' + MONTHS[month] + ' ' + year + '</div>'
                + '<div class="Calendar">';

            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);

            var offset = firstDay.getDay();
            var days = lastDay.getDate();

            offset = offset == 0 ? 7 : offset; // 0 is Sunday

            for (var n = 1; n < offset; n++) {
                calendar += '<div class="Disabled"><em></em></div>';
            }

            for (var i = 1; i <= days; i++) {
                var selection = '';
                var wrapperDiv = '';

                var currentDay = new Date(year, month, i);
                var currentOffset = currentDay.getDay();
                var currentOffset = currentOffset == 0 ? 7 : currentOffset;

                if (currentDay < allowedMin || currentDay > allowedMax) {
                    wrapperDiv = 'Disabled';
                }

                else if (dayTo && (currentDay - dayFrom == 0)) {
                    selection = 'Selected available';

                    if (dayTo - dayFrom != 0) {
                        wrapperDiv = 'From';
                    }
                }

                else if (currentDay - dayFrom == 0) {
                    selection = 'Selected available';
                    wrapperDiv = 'From'
                }

                else if (dayTo && (currentDay - dayTo == 0)) {
                    selection = 'Selected available';
                    wrapperDiv = 'To';
                }

                else if (dayTo && (currentDay - dayFrom > 0 && dayTo - currentDay > 0)) {
                    selection = 'available';
                    wrapperDiv = 'Included';
                }

                else if ((dayFrom - dayTo == 0) && (currentDay > dayFrom)) {
                    selection = 'hoverable available';
                }

                else {
                    selection = 'available';
                }

                calendar += '<div class="' + wrapperDiv + '"><i class="' + selection + '" data-value="' + +currentDay + '">' + i + '</i></div>';

            }

            calendar += '</div></div>';

            return calendar;
        }

        function doneListener() {
            wrapper.querySelector(".done").addEventListener('click', function () {
                if (dayFrom && dayTo) {
                    var startDate = dayFrom.getFullYear() + "-" + ("0" + (dayFrom.getMonth() + 1)).slice(-2)
                        + "-" + ("0" + dayFrom.getDate()).slice(-2);
                    var endDate = dayTo.getFullYear() + "-" + ("0" + (dayTo.getMonth() + 1)).slice(-2)
                        + "-" + ("0" + dayTo.getDate()).slice(-2);
                    func(startDate, endDate);
                }
            });
        }

        return {
            init: init
        }

    };

    document.querySelector(".custom-interval").addEventListener('click', addCalendar);

    function addCalendar(e) {

        var start = null;
        var end = null;
        var range;
        var allowedMin = null;
        var allowedMax = null;

        var active = e.target.parentNode.parentNode.querySelector(".active");

        var classNames = active.className.split(" ");


        for (var i = 0; i < classNames.length; i++) {
            range = ranges[classNames[i]];
            if (range) {
                start = range.start;
                end = range.end;
                break;
            }
        }

        fetch(PICKER_DATA_JSON)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                var calend = new Picker();

                allowedMin = data["first_transaction"];
                allowedMax = data["last_transaction"];

                calend.init(document.querySelector("#modal_date_picker .width-calendars"), {
                    allowedMin: allowedMin,
                    allowedMax: allowedMax,
                    start: start, end: end
                },

                    //callback function that receives start and end in YYYY-MM-DD format 
                    function (start, end) {
                        console.log(start, end)
                    });
            });

    }






});