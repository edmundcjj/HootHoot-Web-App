/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS");
	var values, dropdown, count, option, selected_val;
	// Attach an asynchronous callback to read the data at our posts reference
	ref.on("value", function(snapshot) {
		values = snapshot.val();
		count = Object.keys(values).length;
                dropdown = document.getElementById("stn_list");
		for (i = 0; i < count; i++) {
                    option = document.createElement("option");
                    option.text = Object.keys(values)[i];
                    dropdown.appendChild(option);
                    console.log(Object.keys(values)[i]);
		}
                
                console.log("Value selected is: " + dropdown.options[dropdown.selectedIndex].value);
                selected_val = dropdown.options[dropdown.selectedIndex].value;
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});        


