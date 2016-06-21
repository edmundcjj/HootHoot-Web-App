/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Decode url to get station value
var search_query = window.location.search;
var station = [];
station = search_query.split('=');
var station_name = station[1];
window.onload = function(){
    document.getElementById("stn_name").innerHTML = station_name;
};

// Update state of station to "waiting_for_players"
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + station_name);
var state_ref = ref.child("state");
state_ref.update({
    "state": "waiting_for_players" 
});

// Retrieve and display player names of specific station
ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + station_name + "/PLAYERS");
        var values, player_count, list, pname, ppic, full_pname, ul, text_li;
        
        // Attach an asynchronous callback to read the data at our posts reference
	ref.on("value", function(snapshot) {
            values = snapshot.val();
            player_count = Object.keys(values).length;
            console.log("number of players: " + player_count);
            ul = document.getElementById("player_name");
            for (i = 0; i < player_count; i++) {
                // Extract out player nickname
                full_pname = Object.keys(values)[i];
                var temp = [];
                temp = full_pname.split("|");
                pname = temp[1];
                
                // Display extracted player nickname
                list = document.createElement("li");                        // Create a <li> node
                text_li = document.createTextNode(pname);                   // Create a text node
                list.appendChild(text_li);                                  // Append the text to <li>
                document.getElementById("player_name").appendChild(list);   // Append <li> to <ul> with id="player_name"
                console.log("Player names: " + pname);
            }
            
            // Update state of station to "starting" when player count > 0
            if (player_count >= 1){
                ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + station_name);
                var state_ref = ref.child("state");
                state_ref.update({
                    "state": "starting" 
                });
            }
        }, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});     

