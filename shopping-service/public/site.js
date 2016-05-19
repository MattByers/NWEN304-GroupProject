$(document).ready(function (e) {
var ERROR_LOG = console.error.bind(console);
$.ajax({
    url: "/products",
    type: "GET"
}).then(redraw, ERROR_LOG);


//Create a new task todo
    $('#searchBox').on('click', '#searchButton', fucntion(){
    		var searchString = $('#searchText').val();
        	$.ajax({
                	url: "/products",
                	type: "GET",
                	dataType: "json",
                	data: {name: searchString}

    });});

});
