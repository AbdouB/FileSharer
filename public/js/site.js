$(document).ready(function () {

    //getting random space background from NASA APOD api
    /*
    var url = "https://api.nasa.gov/planetary/apod?api_key=7PAW6IOjYXqxRAbNg5H2V4nxvPuG0u0FgtF8sWyA";
    $.ajax({
        type: 'GET',
        url: url,
        timeout: 3000,
        success: function(result) {
            $('.bg').css('background', "url('" + result.url + "') no-repeat center center fixed");
            $('.bg').css('-moz-background-size', 'cover');
            $('.bg').css('-webkit-background-size', 'cover');
            $('.bg').css('-o-background-size', 'cover');
            $('.bg').css('background-size', 'cover');
        },
        error: function() {
            var back = ["#2c3e50", "#c0392b", "#16a085", "#27ae60", "#e74c3c", "#1abc9c"];
            var rand = back[Math.floor(Math.random() * back.length)];
            $('body').css('background', rand);
        }
    });

    */

    //show Modal after file upload
    $('#myModal').modal('show');

    //adding input to form when private option is selected
    $("#optionsPrivacy").change(function () {
        if ($("#optionsPrivacy input:radio:checked").val() === 'private') {
            $('#addInputHere').append('<div class="row"><div class="col-md-6 col-xs-6">' +
                '<input type="text" id="filePassword" class="form-control"' +
                'name="filePassword" placeholder="Please enter a password"></div></div>');
        } else {
            $('#filePassword').remove();
        }
    });

    //checking if password field is empty
    $("#optionsForm").submit(function (event) {
        if ($("#filePassword").length) {
            if ($('#filePassword').val() === '') {
                $("#addInputHere").addClass('has-error');
                event.preventDefault();
            }
        }
    });

    //checking if file extention is safe
    $("form").submit(function (event) {
        var fileExtension = $('input[type="file"]').val().toLowerCase().split('.').pop();
        var regex = new RegExp("bat|exe|cmd|sh|php|pl|cgi|386|dll|com|torrent|js|" +
            "app|jar|pif|vb|vbscript|wsf|asp|cer|csr|jsp|drv|" +
            "sys|ade|adp|bas|chm|cpl|crt|csh|fxp|hlp|hta|inf|" +
            "ins|isp|jse|htaccess|htpasswd|ksh|lnk|mdb|mde|mdt|" +
            "mdw|msc|msi|msp|mst|ops|pcd|prg|reg|scr|sct|shb|shs|" +
            "url|vbe|vbs|wsc|wsf|wsh");
        if ((regex.test(fileExtension))) {
            $('input[type="file"]').val('');
            alert('Please select a correct file format');
            event.preventDefault();
        }
    });


});