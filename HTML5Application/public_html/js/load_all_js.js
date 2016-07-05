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
var decode_station = [];
decode_station = station_name.split('+');
station_name = decode_station[0] + "_" + decode_station[1];
    
// Constants for firebase url
var FB_station_url = "https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name;
var FB_stationPlayers_url = "https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name + "/PLAYERS";
var FB_stationState_url = "https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name + "/state";
var FB_stationCurrentQuestion_url = "https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name + "/CURRENT_QUESTION";
var FB_stationQuestionHistory_url = "https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name + "/QUESTION_HISTORY";


// 60 seconds countdown timer function
function countdown_60sec_timer(){
    var countdownElement = document.getElementById("waiting_for_player_seconds"),
    seconds = 10,
    second = 0,
    interval;

    interval = setInterval(function() {
        countdownElement.innerHTML = (seconds - second) + ' secs';
        if (second >= seconds) {
            clearInterval(interval);
            // Clear display of <div id="waiting_for_players">
            document.getElementById("waiting_for_players").style.display = "none";

            // Make display of <div id="get_ready"> visible
            document.getElementById("get_ready").style.display = "block";
        }
        second++;
    }, 1000);
}


// 5 seconds countdown timer function
function countdown_5sec_timer(){
    var countdownElement = document.getElementById("waiting_for_player_seconds"),
    seconds = 5,
    second = 0,
    interval;

    interval = setInterval(function() {
        countdownElement.innerHTML = (seconds - second) + ' secs';
        if (second >= seconds) {
            clearInterval(interval);
            // Clear display of <div id="waiting_for_players">
                //document.getElementById("waiting_for_players").style.display = "none";

            // Make display of <div id="get_ready"> visible
                //document.getElementById("get_ready").style.display = "block";
        }
        second++;
    }, 1000);
}


// Start all functions related to waiting_for_players state
function start_waiting_for_players(){
    
    // Display station name
    window.onload = function(){
        document.getElementById("stn_name").innerHTML = station_name;
    };

    // Update state of station to "waiting_for_players" when entering
    // waiting_for_players.html for the first time
    var station_ref = new Firebase(FB_station_url);
    station_ref.update({
        "state": "waiting_for_players" 
    });
    station_ref.on("value", function() {
        var p = document.getElementById("state_ref");
        p.textContent = "Waiting for players...";
    });
    
    var stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    var newPlayer, deletedPlayer, player_count, list, pname, text_li, user_icon, values;
    var change_to_waiting, change_to_starting, AddChild, RemoveChild;
    
    // Update list of players after deletion
    RemoveChild = stationPlayers_ref.on("child_removed", function(snapshot) {
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
        //ref = new Firebase(FB_stationPlayers_url);
        change_to_waiting = stationPlayers_ref.on("value", function(snapshot) {
            values = snapshot.val();
            player_count = Object.keys(values).length;
            //ref = new Firebase(FB_station_url);
            if (player_count < 1){
                station_ref.update({
                    "state": "waiting_for_players" 
                });
                station_ref.on("value", function() {
                    //var state_val = snapshot.val();
                    var p = document.getElementById("state_ref");
                    p.textContent = "Waiting for players...";
                });
            }
        });
    });

    // Retrieve & display new players as they are added to firebase
    AddChild = stationPlayers_ref.on("child_added", function(snapshot) {
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
        // Start countdown timer when state = starting
        //ref = new Firebase(FB_stationPlayers_url);
        change_to_starting = stationPlayers_ref.on("value", function(snapshot) {
            values = snapshot.val();
            player_count = Object.keys(values).length;
            //ref = new Firebase(FB_station_url);
            if (player_count >= 1){
                station_ref.update({
                    "state": "starting" 
                });
                station_ref.on("value", function() {
                    var p = document.getElementById("state_ref");
                    p.textContent = "Game starting soon...";
                });
                countdown_60sec_timer();
                // Close firebase event listeners
                stop_waiting_for_players(stationPlayers_ref, station_ref);
            }
        });
    });
}

// Stop all functions related to waiting_for_players state
function stop_waiting_for_players(FB_stationPlayer_ref, FB_station_ref){
    FB_stationPlayer_ref.off();
    FB_station_ref.off();
    
}


// Start all functions related to get_ready state
function start_get_ready(){
    
    // Local variables
    var qns;
    
    // Retrieve all questions from CMS and save it to QNS_BANK array
    var xmlhttp = new XMLHttpRequest();
    var url = 'http://hootsq-mantro.azurewebsites.net/api/Questions/GetQuestions';
    var questionBank = [];
    var question_ids = [];
    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    questionBank = JSON.parse(xmlhttp.responseText);
                    if(questionBank.length > 0)
                    {
                        console.log(questionBank);
                        for (var j = 0; j < questionBank.length; j++){
                            question_ids.push(questionBank[j].question_id);
                        }
                        console.log(question_ids);
                    }
            }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    
    // Push list of questions retrieved from CMS into firebase QUESTION_HISTORY node
    var qns_history = new Firebase(FB_stationQuestionHistory_url);
    qns_history.on("value", function(snapshot){
        qns = snapshot.val();
        console.log("question length = " +  Object.keys(qns).length);
        console.log(snapshot.val());
        
        // Check if the question id from questionBank is inside QUESTION_HISTORY node
        for (var i = 0; i < questionBank.length; i++){
        
        }
    });
    
    // Update firebase CURRENT_QUESTION node with any question
    
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


// Start all functions related to leaderboard state
function start_leaderboard(){
    
}

// Stop all functions related to leaderboard state
function stop_leaderboard(){
    
}


// Start all functions related to game over state
function start_game_over(){
    
}

// Stop all functions related to game over state
function stop_game_over(){
    
}



