/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Start all functions related to waiting_for_players state
function start_waiting_for_players(){
    // Decode url to get station name
    var search_query = window.location.search;
    var station = [];
    station = search_query.split('=');
    var station_name = station[1];
    var decode_station = [];
    decode_station = station_name.split('+');
    station_name = decode_station[0] + "_" + decode_station[1];
    window.onload = function(){
        document.getElementById("stn_name").innerHTML = station_name;
    };

    // Constants for firebase url
    var FB_station_url = "https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name;
    var FB_stationPlayers_url = "https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name + "/PLAYERS";


    // Update state of station to "waiting_for_players" when entering
    // waiting_for_players.html for the first time
    var ref = new Firebase(FB_station_url);
    ref.update({
        "state": "waiting_for_players" 
    });
    ref.on("value", function(snapshot) {
        var state_val = snapshot.val();
        var p = document.getElementById("state_ref");
        p.textContent = state_val.state;
    });

    // Retrieve & display player list
    ref = new Firebase(FB_stationPlayers_url);
    var existingPlayer, newPlayer, editedPlayer, deletedPlayer, player_count, list, pname, text_li, user_icon, values;

    // Retrieve & display new players as they are added to firebase
    ref.on("child_added", function(snapshot) {
        // Extract out player nickname
        newPlayer = snapshot.val();

        list = document.createElement("li");                        // Create a <li> element
        list.id = snapshot.key() + "";                              // Tag the id to li element

        var div = document.createElement("div");                    // Create <div> element
        user_icon = document.createElement("img");                  // Create <img> element
        user_icon.width = 50;                                       // Set picture width to 50
        user_icon.src = newPlayer.icon_url;                         // Set picture source to icon_url obtained from firebase
        div.appendChild(user_icon);                                 // Append user_icon to <div> element

        pname = newPlayer.nickname;
        text_li = document.createTextNode(pname);                   // Create a text node
        div.appendChild(text_li);                                   // Append the text to <li>

        list.appendChild(div);                                      // Append <div> element to <li> element
        document.getElementById("player_name").appendChild(list);   // Append <li> to <ul> with id="player_name"

        // Update state of station to "starting" when player count > 0
        ref = new Firebase(FB_stationPlayers_url);
        ref.on("value", function(snapshot) {
            values = snapshot.val();
            player_count = Object.keys(values).length;
            ref = new Firebase(FB_station_url);
            if (player_count >= 1){
                ref.update({
                    "state": "starting" 
                });
                ref.on("value", function(snapshot) {
                    var state_val = snapshot.val();
                    var p = document.getElementById("state_ref");
                    p.textContent = state_val.state;
                });
            }
        });
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
        // Update state of station to "waiting_for_players" when player count < 1
        ref = new Firebase(FB_stationPlayers_url);
        ref.on("value", function(snapshot) {
            values = snapshot.val();
            player_count = Object.keys(values).length;
            ref = new Firebase(FB_station_url);
            if (player_count < 1){
                ref.update({
                    "state": "waiting_for_players" 
                });
                ref.on("value", function(snapshot) {
                    var state_val = snapshot.val();
                    var p = document.getElementById("state_ref");
                    p.textContent = state_val.state;
                });
            }
        });
    });
}

// Stop all functions related to waiting_for_players state
function stop_waiting_for_players(){
    
}


// Start all functions related to get_ready state
function start_get_ready(){
    
    // Retrieve all questions from CMS and save it to QNS_BANK array
    var xmlhttp = new XMLHttpRequest();
    var url = 'http://hootsq-mantro.azurewebsites.net/api/Questions/GetQuestions';
    var questionBank = [];
    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    questionBank = JSON.parse(xmlhttp.responseText);
                    if(questionBank.length > 0)
                    {
                        console.log(questionBank);
                    }
            }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    
    // Push full list of questions retrieved from CMS into firebase question history
    
}

// Stop all functions related to get_ready state
function stop_get_ready(){
    
}


// Start all functions related to answering questions state
function start_answering_qns(){
    
}

// Stop all functions related to answering questions state
function stop_answering_qns(){
    
}


// Start all functions related to answered state
function start_answered(){
    
}

// Stop all functions related to answered state
function stop_answered(){
    
}


// Start all functions related to game over state
function start_game_over(){
    
}

// Stop all functions related to game over state
function stop_game_over(){
    
}


// Start all functions related to leaderboard state
function start_leaderboard(){
    
}

// Stop all functions related to leaderboard state
function stop_leaderboard(){
    
}



