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
        var newPlayer, editedPlayer, deletedPlayer, player_count, list, pname, text_li, user_icon;
        
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
            list.id = snapshot.key() + "";                              // Tag the id to li element
            document.getElementById("player_name").appendChild(list);   // Append <li> to <ul> with id="player_name"
            
            // Extract animal icon url
            user_icon = document.createElement("img");
            user_icon.src = newPlayer.animal_icon.icon_url;
            document.getElementById("player_name").appendChild(user_icon);
        });
        
        // Update list of players after deletion
        ref.on("child_removed", function(snapshot) {
            // Extract out player nickname
            deletedPlayer = snapshot.val();
            
            // Remove player nickname from list
            var ul = document.getElementById("player_name");
            var items = ul.getElementsByTagName("li");
            var k;
            for (k = 0; k < items.length; k++){
                if (snapshot.key() === ul.childNodes[k].id){
                   ul.removeChild(ul.childNodes[k]);
                }
            }
        });
        

