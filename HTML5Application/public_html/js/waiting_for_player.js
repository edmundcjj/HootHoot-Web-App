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

// Retrieve, display player nicknames & picture of specific station
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
            
            list = document.createElement("li");                        // Create a <li> element
            list.id = snapshot.key() + "";                              // Tag the id to li element
            
            var div = document.createElement("div");                    // Create <div> element
            user_icon = document.createElement("img");                  // Create <img> element
            user_icon.width = 50;                                       // Set picture width to 50
            user_icon.src = newPlayer.animal_icon.icon_url;             // Set picture source to icon_url obtained from firebase
            div.appendChild(user_icon);                                 // Append user_icon to <div> element
            
            text_li = document.createTextNode(pname);                   // Create a text node
            div.appendChild(text_li);                                   // Append the text to <li>
            
            list.appendChild(div);                                      // Append <div> element to <li> element
            document.getElementById("player_name").appendChild(list);   // Append <li> to <ul> with id="player_name"
        });
        
        // Update list of players after deletion
        ref.on("child_removed", function(snapshot) {
            // Snapshot of the deleted player values
            deletedPlayer = snapshot.val();
            
            // Remove player from list when deleted in firebase
            var ul = document.getElementById("player_name");
            var items = ul.getElementsByTagName("li");
            var k;
            for (k = 0; k < items.length; k++){
                if (snapshot.key() === ul.childNodes[k].id){
                   ul.removeChild(ul.childNodes[k]);
                }
            }
        });