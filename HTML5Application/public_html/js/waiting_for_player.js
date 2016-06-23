/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Decode url to get station name
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

// Retrieve and display player nicknames of specific station
ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + station_name + "/PLAYERS");
        var newPlayer, editedPlayer, deletedPlayer, player_count, list, pname, text_li;
        
        // Update state of station to "starting" when player count > 0
        ref.on("value", function(snapshot) {
            values = snapshot.val();
            player_count = Object.keys(values).length;
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
            
        // Retrieve & display new players as they are added to firebase
        ref.on("child_added", function(snapshot, prevChildKey) {
            // Extract out player nickname
            newPlayer = snapshot.val();
            pname = newPlayer.nickname;
            
            // Display extracted player nickname
            list = document.createElement("li");                        // Create a <li> node
            text_li = document.createTextNode(pname);                   // Create a text node
            list.appendChild(text_li);                                  // Append the text to <li>
            document.getElementById("player_name").appendChild(list);   // Append <li> to <ul> with id="player_name"
            
            // Extract animal icon url
            ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + station_name + "/PLAYERS/" + newPlayer + "/animal_icon/icon_url");
            ref.on("value", function(snapshot) {
                var url = snapshot.val();
                console.log("url = " + url);
            }, function (errorObject) {
              console.log("The read failed: " + errorObject.code);
            });

        }, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
        
        // Retrieve & display updated player nicknames
        ref.on("child_changed", function(snapshot) {
            // Extract out player nickname
            editedPlayer = snapshot.val();
            pname = editedPlayer.nickname;
            
            // Update player nickname in list
            
        }, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
        
        // Retrieve & update display of deleted players
        ref.on("child_removed", function(snapshot) {
            // Extract out player nickname
            deletedPlayer = snapshot.val();
            pname = deletedPlayer.nickname;
            
            // Remove player nickname from list
            
        }, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
        
// Retrieve and display player display picture of specific station

