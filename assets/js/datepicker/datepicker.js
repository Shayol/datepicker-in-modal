window.addEventListener('load', function () {
    var Picker = function () {

        var wrapper;
        var settings;

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

        var MONTHS = ["January","February","March","April","May","June","July",
        "August","September","October","November","December"];

        function init(obj, options, cb) {

            wrapper = obj;

            settings = options || {};

            allowedMin = settings.allowedMin || new Date(2000,0);
            allowedMax = new Date();
            allowedMax = new Date(allowedMax.getFullYear(),allowedMax.getMonth(),allowedMax.getDate());

            dayTo = settings.end || new Date();
            dayTo = new Date(dayTo.getFullYear(),dayTo.getMonth(),dayTo.getDate());            

            to =  new Date(dayTo.getFullYear(), dayTo.getMonth());

            yearTo = to.getFullYear();
            monthTo = to.getMonth();

            if (settings.start) {
                dayFrom = settings.start;
            }

            else {
                dayFrom = new Date(yearTo, monthTo, dayTo.getDate());
                dayFrom.setDate(dayFrom.getDate() - 30); //start date - 30 days ago
            }

            if(dayFrom < allowedMin) { //only dates since last transaction allowed
                dayFrom = new Date(allowedMin.getFullYear(),allowedMin.getMonth(),allowedMin.getDate());
            }

            from = new Date(dayTo.getFullYear(),dayTo.getMonth()-1);

            yearFrom = from.getFullYear();
            monthFrom = from.getMonth();            

            render();
        }

        function update(e) {
            var el = e.target;
            var input = new Date(parseInt(el.value));

            if(dayFrom && dayTo) {
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                dayTo = null;
                updateInputTo();
                updateInputFrom();
            }
            else if(dayFrom && dayFrom - input < 0) {
                dayTo = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                updateInputTo();
            }

            else if(dayFrom && dayFrom - input > 0) {
                dayTo = new Date(dayFrom.getFullYear(), dayFrom.getMonth(),dayFrom.getDate());
                dayFrom = new Date(input.getFullYear(), input.getMonth(), input.getDate());
                updateInputFrom();
                updateInputTo();
            }
   
            wrapper.getElementsByClassName("calendar__both")[0].innerHTML = updateCalendar(yearFrom, monthFrom, 'from')
                                    + updateCalendar(yearTo, monthTo, 'to');
            addDayListener();
        };


        function render() {
            // wrapper.innerHTML = '';
            wrapper.innerHTML = '<div class="modal-content S SModal SModalDatePicker">' 
                                + '<button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>'
                                + '<div class="Content">'
                                + '<div class="FromToInputs">'
                                + '<div class="InputDate">'
                                +    'From<input class="from" type="text" maxlength="10">'
                                + '</div>'
                                + '<div class="InputDate">'
                                +    'To<input class="to" type="text" maxlength="10">'
                                + '</div>'
                                + '</div>'
                                + '<div class="ModalTitle">Pick a date range</div>'
                                + '<div class="Container noselect">'
                                +   '<span class="Previous icon-arrow-left12"></span>'
                                +   '<span class="Next icon-arrow-right13"></span>'    
                                + '<div class="calendar__both">' 
                                +   updateCalendar(yearFrom, monthFrom, 'from') 
                                +   updateCalendar(yearTo, monthTo, 'to')
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '<div class="SaveCancelButtons">'
                                +   '<button type="button" class="btn btn-primary pull-right">Done</button>'
                                + '</div>'
                                + '</div>';

            inputFrom = wrapper.getElementsByTagName('input')[0];
            inputTo = wrapper.getElementsByTagName('input')[1];
            calBoth = wrapper.getElementsByClassName("calendar__both")[0];

            inputFrom.focus();  //place cursor on load in from input

            addDayListener();
            addNextPrevListener();
            updateInputFrom();
            updateInputTo();
            addInputListener();
        }

        function updateInputFrom() {
            inputFrom.value = dayFrom.getFullYear() + "-" + ("0" + (dayFrom.getMonth() + 1)).slice(-2)
                + "-" + ("0" + dayFrom.getDate()).slice(-2);
        }

        function updateInputTo() {
            if(dayTo) {
                inputTo.value = dayTo.getFullYear() + "-" + ("0" + (dayTo.getMonth() + 1)).slice(-2)
                + "-" + ("0" + dayTo.getDate()).slice(-2);
            }
            else {
                inputTo.value = '';
            }
            
        }

        function highlight(e) {

            var thisDay = parseInt(e.target.value);

            var hoverDays = wrapper.getElementsByClassName('hoverable');
            for(var i=0; i<hoverDays.length;i++) {
                var day = parseInt(hoverDays[i].value)
                if(day <= thisDay) {
                    hoverDays[i].classList.add('inrange'); 
                }
                else {
                    hoverDays[i].classList.remove('inrange'); 
                }
            }

        }

        function addInputListener() {
            inputFrom.addEventListener('input', handleInput);
            inputTo.addEventListener('input', handleInput);

            function handleInput(e) {
                if (e.target.value.length == 10) {
                    var arr = e.target.value.split("-");    // handle input, errors properly
                    var year = parseInt(arr[0]);
                    var month = parseInt(arr[1]);
                    var day = parseInt(arr[2]);

                    if (year >= allowedMin.getFullYear() && year <= allowedMax.getFullYear() + 1) {
                        if (month >= 0 && month < 12) {
                            if (day > 0 && day < 32) {

                                if (e.target == inputFrom) {
                                    if(allowedMin > new Date(year, month - 1, day)) {
                                        updateInputFrom();
                                        return;
                                    }

                                    dayFrom = new Date(year, month - 1, day); 

                                    from = new Date(year, month - 1);
                                    yearFrom = from.getFullYear();
                                    monthFrom = from.getMonth();

                                    

                                    to = new Date(yearFrom, monthFrom + 1);
                                    yearTo = to.getFullYear();
                                    monthTo = to.getMonth();

                                    wrapper.getElementsByClassName("calendar__both")[0].innerHTML = updateCalendar(yearFrom, monthFrom, 'from')
                                        + updateCalendar(yearTo, monthTo, 'to');
                                        addDayListener();

                                        inputTo.focus(); //after entering start data focus on end input
                                }

                                else if (e.target == inputTo) {
                                    if(allowedMax < new Date(year, month - 1, day)) {
                                        updateInputTo();
                                        return;
                                    }
                                    to = new Date(year, month - 1, day);
                                    yearTo = to.getFullYear();
                                    monthTo = to.getMonth();
                                    dayTo = new Date(yearTo, monthTo, to.getDate());

                                    from = new Date(yearTo, monthTo - 1, 1);
                                    yearFrom = from.getFullYear();
                                    monthFrom = from.getMonth();

                                    wrapper.getElementsByClassName("calendar__both")[0].innerHTML = updateCalendar(yearFrom, monthFrom, 'from')
                                        + updateCalendar(yearTo, monthTo, 'to');
                                    addDayListener();
                                }

                            }
                        }
                    }

                }
            }
        }

        function addDayListener() {

                var calDays = wrapper.getElementsByClassName("available");

                for (var n = 0; n < calDays.length; n++) {
                    calDays[n].addEventListener('click', update);

                    if(calDays[n].className.indexOf('hoverable') != -1)
                        calDays[n].addEventListener('mouseenter', highlight);
                }

        }

        function addNextPrevListener() {
            wrapper.getElementsByClassName("Previous")[0].addEventListener('click', function () {
                to = new Date(yearTo, monthTo-1);
                yearTo = to.getFullYear();
                monthTo = to.getMonth();

                from = new Date(yearFrom, monthFrom-1);
                yearFrom = from.getFullYear();
                monthFrom = from.getMonth();
                var newNode = document.createElement('div');
                newNode.innerHTML = updateCalendar(yearFrom, monthFrom, 'left');
                
                calBoth.insertBefore(newNode, calBoth.children[0]);
                calBoth.children[0].style.left = "-50%";
                window.getComputedStyle(calBoth.children[0]).left; // nessary for animation due to batching reflows by browsers https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
                calBoth.children[0].style.left = "0%";
                calBoth.children[1].style.left = "53.47%";
                calBoth.children[2].style.left = "100%";

                setTimeout(function() {
                    calBoth.removeChild(calBoth.children[2]);
                },700);
                addDayListener();
            });
            wrapper.getElementsByClassName("Next")[0].addEventListener('click', function () {
                from = new Date(yearFrom, monthFrom+ 1);
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
                calBoth.children[2].style.left = "53.47%";
                calBoth.children[1].style.left = "0%";
                calBoth.children[0].style.left = "-50%";

                setTimeout(function() {
                    calBoth.removeChild(calBoth.children[0]);
                },700);

                addDayListener();
            });
        }


        function updateCalendar(year, month, toOrFrom) {

            var calendar = '<div class="CalendarContainer calendar__' + toOrFrom + '"' + '>' 
                            +   '<div class="Month">' + MONTHS[month] + ' ' + year + '</div>'
                            +        '<div class="Calendar">';

            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);

            var offset = firstDay.getDay();
            var days = lastDay.getDate();

            offset = offset == 0 ? 7 : offset; // 0 is Sunday

            for (var i = 1; i <= days; i++) {
                var selection = '';

                var currentDay = new Date(year, month, i);

                if (currentDay < allowedMin || currentDay > allowedMax) {
                    selection = 'disabled';
                }

                else if (currentDay - dayFrom == 0) {
                    selection = 'selected start available';
                }

                else if (dayTo && (currentDay - dayTo == 0)) {
                    selection = 'selected end available';
                }

                else if (dayTo && (currentDay - dayFrom > 0 && dayTo - currentDay > 0)) {
                    selection = 'inrange available';
                }

                else if(!dayTo && currentDay > dayFrom) {
                    selection = 'hoverable available'
                }

                else {
                    selection = 'available';
                }

                if (i == 1) {
                    calendar += `<button class='day ${toOrFrom} ${selection}' style='grid-column-start:${offset};' value='${+currentDay}'>${i}</button>`;
                }
                else {
                    calendar += `<button class='day ${toOrFrom} ${selection}' value='${+currentDay}'>${i}</button>`;
                }

            }

            calendar += '</div></div>';

            return calendar;
        }

        return {
            init: init
        }

    };

    var calend = new Picker();

    var allowedMin = new Date(2018,3,10);

    calend.init(document.querySelector(".width-calendars"),{allowedMin: allowedMin});

});