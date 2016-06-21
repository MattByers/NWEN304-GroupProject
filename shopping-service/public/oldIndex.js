// $(document).ready(function (e) {
// var ERROR_LOG = console.error.bind(console);

// $.ajax({

//     url: "/products",
//     type: "GET",

//     success: function(result){
//           redraw(result.data);
//     }

// });



// //Create a new task todo
//     $('#searchButton').on('click', function(){

//     		var searchString = $('#searchText').val();
//         	$.ajax({
//                 	url: "/products",
//                 	type: "PUT",
//                 	dataType: "json",
//                 	data: {name: searchString},

//                 	success: function(result){
//                 		redraw(result.data);
//                 	},
//                 	error: function(result){
//                 		alert("This isnt working");
//                 	}

//     });});

//    function redraw(data){
//             var taskHTML = '<img src ="';

//             taskHTML += data[0].imageurl;
//             taskHTML += '"/>'
//             var $newTask = $(taskHTML);
//             $('#display').prepend($newTask);
//     }

// });
