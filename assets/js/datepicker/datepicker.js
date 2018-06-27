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
        var calBoth;

        var allowedMin;
        var allowedMax;

        var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];

        var RE = /(\d{4})-(\d{2})-(\d{2})/;

        function init(obj, options, cb) {

            wrapper = obj;

            settings = options || {};

            func = cb;

            var optionsStart = parseDate(settings.start);
            var optionsEnd = parseDate(settings.end);


            var cookieStart = getCookie("datepickerstart");
            var cookieEnd = getCookie("datepickerend");

            if (cookieStart) {
                cookieStart = new Date(cookieStart);
            }

            if (cookieEnd) {
                cookieEnd = new Date(cookieEnd);
            }

            allowedMin = parseDate(settings.allowedMin) || new Date(2000, 0);
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
                + '<div class="calendar__both">'
                + updateCalendar(yearFrom, monthFrom, 'from')
                + updateCalendar(yearTo, monthTo, 'to')
                + '</div>'
                + '</div>'
                + '</div>'
                + '<div class="SaveCancelButtons">'
                + '<button type="button" data-dismiss="modal" class="btn done btn-primary pull-right">Done</button>'
                + '</div>'
                + '</div>';

            inputFrom = wrapper.getElementsByTagName('input')[0];
            inputTo = wrapper.getElementsByTagName('input')[1];
            calBoth = wrapper.querySelector(".calendar__both");


            addDayListener();
            addNextPrevListener();
            updateInputFrom();
            updateInputTo();
            addInputListener();
            checkPrev();
            checkNext();
            doneListener();
            setTimeout(function () { inputFrom.focus(); }, 500); //place cursor on load in from input
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
            var input = new Date(parseInt(el.value));

            validateInput(input);

            updateInputFrom();

            updateInputTo();

            calBoth.innerHTML = updateCalendar(yearFrom, monthFrom, 'from')
                + updateCalendar(yearTo, monthTo, 'to');
            addDayListener();
            inputTo.focus();

        }

        function validateInput(input) {
            if (dayFrom && dayTo) {

                if ((input - dayFrom == 0) || (input - dayTo == 0)) {
                    dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());

                    dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                }

                if (input < dayFrom) {
                    dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                }

                if (input > dayTo) {
                    dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                }

                if (input > dayFrom && input < dayTo) {
                    if ((input - dayFrom) < (dayTo - input)) {
                        dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                    }
                    else {
                        dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                    }
                }

            }
            else if (dayFrom && !dayTo) {

                if (input < dayFrom) {
                    dayTo = new Date(dayFrom.getFullYear(), dayFrom.getMonth(), dayFrom.getDate());
                    dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                }

                else if (input > dayFrom) {
                    dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                }
            }

            if (!dayTo) {
                inputTo.focus();
            }

        }

        function validateFrom(input) {
            if (input > dayTo) {
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                updateInputFrom();
                updateInputTo();
            }
            else {
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
            }
        }

        function validateTo(input) {
            if (input < dayFrom) {
                dayTo = new Date(dayFrom.getFullYear(), dayFrom.getMonth(), dayFrom.getDate());
                updateInputTo();
            }

            else {
                dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
            }
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
            if (dayTo) {
                inputTo.value = dayTo.getFullYear() + "-" + ("0" + (dayTo.getMonth() + 1)).slice(-2)
                    + "-" + ("0" + dayTo.getDate()).slice(-2);
            }
            else {
                inputTo.value = '';
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

            calBoth.innerHTML = updateCalendar(yearFrom, monthFrom, 'from')
                + updateCalendar(yearTo, monthTo, 'to');
        }

        function highlight(e) {

            var thisDay = parseInt(e.target.value);

            var hoverDays = wrapper.getElementsByClassName('hoverable');
            var start = wrapper.querySelector(".selected");
            for (var i = 0; i < hoverDays.length; i++) {
                var day = parseInt(hoverDays[i].value)
                if (day <= thisDay) {
                    start.parentNode.classList.add("wrapper-start");
                    hoverDays[i].classList.add('inrange');
                    hoverDays[i].parentNode.classList.add('wrapper-inrange');
                    hoverDays[i].addEventListener('mouseout', function () {

                        for (var i = 0; i < hoverDays.length; i++) {
                            start.parentNode.classList.remove("wrapper-start");
                            hoverDays[i].classList.remove('inrange');
                            hoverDays[i].parentNode.classList.remove('wrapper-inrange');
                        }
                    });
                }
                else {
                    hoverDays[i].classList.remove('inrange');
                    hoverDays[i].parentNode.classList.remove('wrapper-inrange');
                }
            }

        }

        function checkPrev() {
            if (calBoth.children[0].querySelector(".disabled")) {
                wrapper.querySelector(".Previous").classList.add("Disabled");
            }
            else {
                wrapper.querySelector(".Previous").classList.remove("Disabled");
            }
        }

        function checkNext() {
            if (calBoth.children[calBoth.children.length - 1].querySelector(".disabled")) {
                wrapper.querySelector(".Next").classList.add("Disabled");
            }
            else {
                wrapper.querySelector(".Next").classList.remove("Disabled");
            }
        }

        function handleInput(e) {

            if (e.target.value.length == 10) {
                if (RE.test(e.target.value)) {

                    var arr = e.target.value.split("-");
                    var year = parseInt(arr[0]);
                    var month = parseInt(arr[1]);
                    var day = parseInt(arr[2]);

                    var input = new Date(year, month - 1, day);

                    if (e.target == inputFrom) {
                        if (allowedMin > input || allowedMax < input) {
                            updateInputFrom();
                            return;
                        }

                        validateFrom(input);

                        updateVars();

                        inputTo.focus(); //after entering start data focus on end input
                    }

                    else if (e.target == inputTo) {
                        if (allowedMin > input || allowedMax < input) {
                            updateInputTo();
                            return;
                        }

                        validateTo(input);

                        updateVars();
                    }
                    calBoth.innerHTML = updateCalendar(yearFrom, monthFrom, 'from')
                        + updateCalendar(yearTo, monthTo, 'to');
                    addDayListener();
                    addDayListener();
                    checkPrev();
                    checkNext();

                }
                else {
                    updateInputFrom();
                    updateInputTo();
                }
            }

            else {
                wrapper.querySelector(".done").classList.add("Disabled");
            }
        }

        function addInputListener() {
            inputFrom.addEventListener('input', handleInput);
            inputTo.addEventListener('input', handleInput);
            inputTo.addEventListener('focusout', updateInputTo);
            inputFrom.addEventListener('focusout', updateInputFrom);


            var cleaveFrom = new Cleave('input.from', {
                date: true,
                datePattern: ['Y', 'm', 'd'],
                delimiter: '-'

            });

            var cleaveTo = new Cleave('input.to', {
                date: true,
                datePattern: ['Y', 'm', 'd'],
                delimiter: '-'

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
                var newNode = document.createElement('div');
                newNode.innerHTML = updateCalendar(yearFrom, monthFrom, 'left');

                calBoth.insertBefore(newNode, calBoth.children[0]);
                calBoth.children[0].style.left = "-50%";
                window.getComputedStyle(calBoth.children[0]).left; // nessary for animation due to batching reflows by browsers https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
                calBoth.children[0].style.left = "0%";
                calBoth.children[1].style.left = "50%";
                calBoth.children[2].style.left = "100%";

                setTimeout(function () {
                    calBoth.removeChild(calBoth.children[2]);
                    checkPrev();
                    checkNext();
                }, 300);
                addDayListener();


            });
            wrapper.querySelector(".Next").addEventListener('click', function () {
                from = new Date(yearFrom, monthFrom + 1);
                yearFrom = from.getFullYear();;
                monthFrom = from.getMonth();

                to = new Date(yearTo, monthTo + 1);
                yearTo = to.getFullYear();
                monthTo = to.getMonth();

                var newNode = document.createElement('div');
                newNode.innerHTML = updateCalendar(yearTo, monthTo, 'right');

                calBoth.appendChild(newNode);
                calBoth.children[2].style.left = "100%";
                window.getComputedStyle(calBoth.children[2]).left; // nessary for animation due to batching reflows by browsers https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
                calBoth.children[2].style.left = "50%";
                calBoth.children[1].style.left = "0%";
                calBoth.children[0].style.left = "-50%";

                setTimeout(function () {
                    calBoth.removeChild(calBoth.children[0]);
                    checkNext();
                    checkPrev();
                }, 300);

                addDayListener();

            });
        }


        function updateCalendar(year, month, toOrFrom) {

            setCookie();

            var calendar = '<div class="CalendarContainer calendar__' + toOrFrom + '"' + '>'
                + '<div class="Month">' + MONTHS[month] + ' ' + year + '</div>'
                + '<div class="Calendar">';

            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);

            var offset = firstDay.getDay();
            var days = lastDay.getDate();

            offset = offset == 0 ? 7 : offset; // 0 is Sunday

            for (var i = 1; i <= days; i++) {
                var selection = '';
                var wrapperDiv = '';

                var currentDay = new Date(year, month, i);
                var currentOffset = currentDay.getDay();
                var currentOffset = currentOffset == 0 ? 7 : currentOffset;

                if (currentDay < allowedMin || currentDay > allowedMax) {
                    selection = 'disabled'; //used to check also if Previous Next buttons should be disabled
                }

                else if (dayTo && (currentDay - dayFrom == 0)) {
                    selection = 'selected start available';

                    if (dayTo - dayFrom != 0) {
                        wrapperDiv = 'start';
                    }
                }

                else if (currentDay - dayFrom == 0) {
                    selection = 'selected start available';
                }

                else if (dayTo && (currentDay - dayTo == 0)) {
                    selection = 'selected end available';
                    wrapperDiv = 'end';
                }

                else if (dayTo && (currentDay - dayFrom > 0 && dayTo - currentDay > 0)) {
                    selection = 'inrange available';
                    wrapperDiv = 'inrange';
                }

                else if ((dayFrom - dayTo == 0) && (currentDay > dayFrom)) {
                    selection = 'hoverable available';
                }

                else {
                    selection = 'available';
                }

                if (i == 1) {
                    calendar += '<div class="wrapper-' + wrapperDiv + '"' + 'style="-ms-grid-column:' + offset + ';grid-column-start:' + offset + ';"><button class="day ' + toOrFrom + ' ' + selection + '" value="' + +currentDay + '">' + i + '</button></div>';
                }
                else {
                    var row = Math.ceil((i + offset - 1) / 7);
                    calendar += '<div class="wrapper-' + wrapperDiv + '"' + 'style="-ms-grid-column:' + currentOffset + ';-ms-grid-row:' + row + ';"><button class="day ' + toOrFrom + ' ' + selection + '" value="' + +currentDay + '">' + i + '</button></div>';
                }

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
                        var target = $("li > a[data-target='#modal_date_picker']"),
                            parent = target.parent('li'),
                            ul = parent.parent('ul'),
                            button = $(ul.data('button'));

                        // target.data('from', start);
                        // target.data('to', end);
                        // button.html(start + ' - ' + end + ' <span class="caret"></span>');
                        // ul.parent().off('hide.bs.dropdown');
                        // ul.dropdown('toggle');

                        // if (ul.attr('id') === 'top-spendings-date')
                        //     topSpendingsCallback();
                        // else {
                        //     var modal = $('#modal_all_transactions');
                        //     modal.data('from', start)
                        //         .data('to', end);

                        //     loadItems(modal, 0, 50, true, false);
                        // }
                    });
            });

    }






});