/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS");
	var values;
	// Attach an asynchronous callback to read the data at our posts reference
	ref.on("value", function(snapshot) {
		values = snapshot.val();
		var count = Object.keys(values).length;
                var select = document.getElementById("list");
		for (i = 0; i < count; i++) {
                    var option = document.createElement("option");
                    option.text = Object.keys(values)[i];
                    select.appendChild(option);
                    //var a = document.createElement("a");
                    //a.setAttribute('href', "#");
                    //a.innerHTML = Object.keys(values)[i];
                    //var li = document.createElement("li");
                    //li.appendChild(a);
                    //ul.appendChild(li);
                    console.log(Object.keys(values)[i]);
		}
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});


