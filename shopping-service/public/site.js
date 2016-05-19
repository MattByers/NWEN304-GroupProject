$(document).ready(function (e) {
var ERROR_LOG = console.error.bind(console);
$.ajax({
    url: "/",
    type: "GET"
}).then(redraw, ERROR_LOG);

});
