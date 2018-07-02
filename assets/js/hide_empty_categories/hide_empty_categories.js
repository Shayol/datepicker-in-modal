//hide or show top spending categories with 0 sum on click

window.addEventListener('load', function () {
    var toggleChoice = getCookie('totalspendingshidempty');
    var toggleButton = $('.ContainerTotalSpendings .toggleEmpty');

    function toggleHideEmpty() {
        if (toggleChoice == 'show') {
            $('.ContainerTotalSpendings .Empty').css("display", "inline-block");
            toggleButton.text('Hide empty');
        }
    }
    toggleHideEmpty();


    toggleButton.on("click", function (e) {
        if (toggleButton.text() == 'Hide empty') {
            $('.ContainerTotalSpendings .Empty').hide();
            document.cookie = "totalspendingshidempty=hide; expires=Fri, 31 Dec 9999 12:00:00 UTC";
            toggleButton.text('Show empty');
        }
        else {
            toggleButton.text('Hide empty');
            $('.ContainerTotalSpendings .Empty').css("display", "inline-block");
            document.cookie = "totalspendingshidempty=show; expires=Fri, 31 Dec 9999 12:00:00 UTC";
        }
    });

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
                console.log(c.substring(name.length, c.length))
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
});

