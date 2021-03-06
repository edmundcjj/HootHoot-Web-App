/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* 
    Created on : 1 Jun, 2016, 3:32:21 AM
    Author     : Chow Jie Jin Edmund
*/

//Constants for Firebase URL
var FB_STATION_URL = "https://mantrodev.firebaseio.com/STATIONS/";
var FB_STATIONPLAYERS_URL =  "/PLAYERS";
var FB_STATIONIDPLAYER_URL;
//Constants for Firebase URL


// Retrieve all the stations of type "HOOT HOOT"
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS");
	var values, dropdown, count, option, selected_val;
        
        var query = ref.orderByChild("station_type").startAt("HOOT HOOT").endAt("HOOT HOOT");
        query.once("value", function(allStationsSnapshot) {
            dropdown = document.getElementById("stn_list");
            allStationsSnapshot.forEach(function(childSnapshot) {
                values = childSnapshot.val();
                console.log(values);
                if (values.active) return;                  // Skip below code if active = true
                option = document.createElement("option");
                option.text = values.station_name;
                option.value = childSnapshot.key();
                dropdown.appendChild(option);
            });
            onOptionChange();
        });
// Retrieve all the stations of type "HOOT HOOT"


// Function to erase any existing players when first launched
function onSubmit(){
	var selected_index = document.getElementById("stn_list").selectedIndex;
	var station_id = document.getElementsByTagName("option")[selected_index].value;
	
	var station_ref = new Firebase(FB_STATION_URL).child(station_id).child("active");
	station_ref.once("value", function(datasnapshot){
            var isActive = datasnapshot.val();

            // Check if the selected station is active
            if(isActive){
                    alert("The selected station is already in operation");
            }
            else{	
                    var removePlayer_ref = new Firebase(FB_STATIONIDPLAYER_URL);
                    removePlayer_ref.remove(function(error){
                            if(!error){
                                // Set active to true when station is selected
                                var station_ref = new Firebase(FB_STATION_URL).child(station_id).child("active").set(true);

                                document.getElementById("station_form").submit();
                            }
                            else
                            {
                                alert("Players remove error");
                            }
                    });
            }
	});
}
// Function to erase any existing players when first launched


// Retrieve station names and station ids from form submission
function onOptionChange(){
    var hidden_input = document.getElementById("station_name");
    var selected_index = document.getElementById("stn_list").selectedIndex;
    hidden_input.value = document.getElementsByTagName("option")[selected_index].text;
    var station_id = document.getElementsByTagName("option")[selected_index].value;
    console.log("The value is " + hidden_input.value);
    FB_STATIONIDPLAYER_URL = FB_STATION_URL + station_id + FB_STATIONPLAYERS_URL;
}
// Retrieve station names and station ids from form submission