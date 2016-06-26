/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS");
	var values, dropdown, count, option, selected_val;
        
        var query = ref.orderByChild("station_type").startAt("HOOTHOOT").endAt("HOOTHOOT");
        query.once("value", function(allStationsSnapshot) {
            values = allStationsSnapshot.val();
            count = Object.keys(values).length;
            dropdown = document.getElementById("stn_list");
            for (var i = 0; i < count; i++){
                var station_ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + Object.keys(values)[i] + "/station_name");
                station_ref.on("value", function(Stationsnapshot){
                    option = document.createElement("option");
                    option.text = Stationsnapshot.val();
                    dropdown.appendChild(option);
                });
            }
        });


