$(document).ready(function (e) {
var ERROR_LOG = console.error.bind(console);
$.ajax({
    url: "/products",
    type: "GET"
}).then(redraw, ERROR_LOG);


//Create a new task todo
    $('#searchButton').on('click', function(){
    		alert("CLICKED");
    		var searchString = $('#searchText').val();
        	$.ajax({
                	url: "/products",
                	type: "PUT",
                	dataType: "json",
                	data: {name: searchString}

                	success: function(result){

                		redraw(result.data);
                	}

    });});

   function redraw(data){
            var taskHTML = '<img src ="';
            taskHTML += data[0].imageURL;
            taskHTML += '"/>'
            var $newTask = $(taskHTML);
            $('#display').prepend($newTask);
    }

});
