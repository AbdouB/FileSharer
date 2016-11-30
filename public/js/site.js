$(document).ready(function () {
    var back = ["#2c3e50", "#c0392b", "#16a085", "#27ae60", "#e74c3c", "#1abc9c"];
    var rand = back[Math.floor(Math.random() * back.length)];
    $('body').css('background', rand);
});
