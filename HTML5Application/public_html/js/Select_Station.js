/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS");
	var values, dropdown, count, option, selected_val;
        
        var query = ref.orderByChild("station_type").startAt("HOOTHOOT").endAt("HOOTHOOT");
        query.once("value", function(allStationsSnapshot) {
            allStationsSnapshot.forEach(function(StationsSnapshot) {
                values = allStationsSnapshot.val();
		count = Object.keys(values).length;
                dropdown = document.getElementById("stn_list");
		for (i = 0; i < count; i++) {
                    option = document.createElement("option");
                    option.text = StationsSnapshot.key();
                    dropdown.appendChild(option);
		}
                selected_val = dropdown.options[dropdown.selectedIndex].value;
            });
        });


