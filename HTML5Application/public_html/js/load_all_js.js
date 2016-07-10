/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Global Variables
var questionBank = [];                      // Pool of questions for a specific station
var curr_qns, interval;                     // Variable that contains details of current question
var curr_qns_index = 0;                     // Current index of current question
var current_state = "";                     // Current state of the station
var optionicon_list = [];                   // Array that contains icon_url for the different question options

// Decode url to get station name
var search_query = window.location.search;
var station = [];
station = search_query.split('=');
var station_name = station[2];
var decode_station = [];
decode_station = station_name.split('+');
station_name = decode_station[0] + " " + decode_station[1];

var station_id = station[1];
var decode_station_id = station_id.split("&");
station_id = decode_station_id[0];
    
// Constants for firebase url
var FB_STATION_URL = "https://mantrodev.firebaseio.com/STATIONS/" + station_id;
var FB_stationPlayers_url = "https://mantrodev.firebaseio.com/STATIONS/" + station_id + "/PLAYERS";
var FB_stationCurrentQuestion_url = "https://mantrodev.firebaseio.com/STATIONS/" + station_id + "/CURRENT_QUESTION";
var FB_stationQuestionHistory_url = "https://mantrodev.firebaseio.com/STATIONS/" + station_id + "/QUESTION_HISTORY";
var FB_OPTIONICON_URL = "https://mantrodev.firebaseio.com/OPTION_ICONS";

// Constants for station states
var WAITING_STATE = "waiting";
var STARTING_STATE = "starting";
var GETREADY_STATE = "getready";
var ANSWERINGQUESTION_STATE = "answering_question";
var ANSWERED_STATE = "answered";
var LEADERBOARD_STATE = "leaderboard";
var GAMEOVER_STATE = "gameover";


// 60 seconds countdown timer function
function countdown_60sec_timer(ref1, ref2){
    var countdownElement = document.getElementById("waiting_for_player_seconds"),
    seconds = 15,
    second = 0;

    interval = setInterval(function() {
        countdownElement.innerHTML = (seconds - second) + ' secs';
        if (second >= seconds) {
            clearInterval(interval);
            
            // Close firebase event listeners
            stop_waiting_for_players(ref1, ref2);
            
            // Call function to get questions from CMS
            get_qns_from_CMS();
        }
        second++;
    }, 1000);
}

// Stop 60 seconds countdown timer function when state changed back to waiting
function stop_countdown_60sec_timer(){
    clearInterval(interval);
    document.getElementById("waiting_for_player_seconds").innerHTML = null;
}


// 10 seconds countdown timer function for getready state
function get_ready_countdown_10sec_timer(id, ref1){
    var countdownElement = document.getElementById(id),
    seconds = 10,
    second = 0;

    interval = setInterval(function() {
        countdownElement.innerHTML = (seconds - second) + ' secs';
        if (second >= seconds) {
            clearInterval(interval);
            
            // Stop all firebase event listeners related to getready state
            stop_get_ready(ref1);

            // Clear display of <div id="getready">
            document.getElementById("get_ready").style.display = "none";

            // Make display of <div id="answering_questions"> visible
            document.getElementById("answering_questions").style.display = "block";
            
            // Call start_answering_qns function 
            start_answering_qns();
        }
        second++;
    }, 1000);
}


// 20 seconds countdown timer function for answering state
function answering_countdown_20sec_timer(id, duration, ref1){
    var countdownElement = document.getElementById(id),
    seconds = duration,
    second = 0;

    interval = setInterval(function() {
        countdownElement.innerHTML = (seconds - second) + ' secs';
        if (second >= seconds) {
            clearInterval(interval);
            
            // Stop firebase event listeners related to answering_question state
            stop_answering_qns(ref1);
            
            // Clear display of <div id="getready">
            document.getElementById("answering_questions").style.display = "none";

            // Make display of <div id="answering_questions"> visible
            document.getElementById("answered").style.display = "block";
            
            // Call function for answered state
            start_answered();
        }
        second++;
    }, 1000);
}

function stop_answering_countdown_20sec_timer(ref1){
    
    // Stop firebase event listeners related to answering_question state
    stop_answering_qns(ref1);
    clearInterval(interval);
    
    // Clear display of <div id="getready">
    document.getElementById("answering_questions").style.display = "none";

    // Make display of <div id="answering_questions"> visible
    document.getElementById("answered").style.display = "block";

    // Call function for answered state
    start_answered();
}


// 10 seconds countdown timer function for answered state
function answered_countdown_10sec_timer(id){
    var countdownElement = document.getElementById(id),
    seconds = 20,
    second = 0;

    interval = setInterval(function() {
        countdownElement.innerHTML = (seconds - second) + ' secs';
        if (second >= seconds) {
            clearInterval(interval);
            
            // Clear display of <div id="answered">
            document.getElementById("answered").style.display = "none";
            
            // If there is next question make display of <div id="leaderboard"> visible
            if (curr_qns_index !== questionBank.length){
                console.log(curr_qns_index + " " + questionBank.length);
                console.log("Go to leaderboard");
                document.getElementById("leaderboard").style.display = "block";
                start_leaderboard();
            }
            // If there is no next question make display of <div id="leaderboard"> visible
            else{
                console.log(curr_qns_index + " " + questionBank.length);
                console.log("Go to game over");
                document.getElementById("game_over").style.display = "block";
                start_game_over();
            }
        }
        second++;
    }, 1000);
}


// 10 seconds countdown timer function for leaderboard state
function leaderboard_countdown_10sec_timer(id, ref1){
    var countdownElement = document.getElementById(id),
    seconds = 10,
    second = 0;

    interval = setInterval(function() {
        countdownElement.innerHTML = (seconds - second) + ' secs';
        if (second >= seconds) {
            clearInterval(interval);
            
            // Stop all firebase event listeners related to answered state
            stop_leaderboard(ref1);

            // Clear display of <div id="leaderboard">
            document.getElementById("leaderboard").style.display = "none";
            
            // Make display of <div id="get_ready">
            document.getElementById("get_ready").style.display = "block";
            
            // Call function to remove player's answer and answering_duration
            remove_players_ans_ansduration();
            
            // Call start_get_ready function
            start_get_ready();
        }
        second++;
    }, 1000);
}


// 60 seconds countdown timer function for gameover state before returning to waiting state
function game_over_countdown_60sec_timer(ref1){
    var seconds = 60,
    second = 0;

    interval = setInterval(function() {
        if (second >= seconds) {
            clearInterval(interval);
            
            // Stop firebase event listeners related to gameover state
            stop_game_over(ref1);
            
            // Transit to waiting state
            document.getElementById("waiting_for_players").style.display = "block";
            start_waiting_for_players();
        }
        second++;
    }, 1000);
}


// Function to retrieve all questions from CMS
function get_qns_from_CMS(){
    
        // Retrieve all questions from CMS and save it to QNS_BANK array
        var xmlhttp = new XMLHttpRequest();
        var url = 'http://hootsq-mantro.azurewebsites.net/api/Questions/GetQuestions?station_id=' + station_id;
        xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                        questionBank = JSON.parse(xmlhttp.responseText);
                        for (var i = 0; i < questionBank.length; i++){
                            questionBank[i]["question_no"] = i+1;
                        }
                        
                        // Clear display of <div id="waiting_for_players">
                        document.getElementById("waiting_for_players").style.display = "none";

                        // Make display of <div id="getready"> visible
                        document.getElementById("get_ready").style.display = "block";
                        
                        // Call start_get_ready function 
                        start_get_ready();
                }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send(); 
}


// Function to remove player's answer and answering_duration
function remove_players_ans_ansduration(){
    var stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    stationPlayers_ref.once("value", function(AllPlayerssnapshot){
        AllPlayerssnapshot.forEach(function(PlayerSnapshot){
            stationPlayers_ref.child(PlayerSnapshot.key()).child("answer").remove();
            stationPlayers_ref.child(PlayerSnapshot.key()).child("answering_duration").remove();
            stationPlayers_ref.child(PlayerSnapshot.key()).child("score_gained").set(0);
            stationPlayers_ref.child(PlayerSnapshot.key()).child("is_correct_answer").set(false);
        });
    });
}


// Start all functions related to waiting_for_players state
function start_waiting_for_players(){
    
    // Display station name
    window.onload = function(){
        document.getElementById("stn_name").innerHTML = station_name;
        var optionicon_ref = new Firebase(FB_OPTIONICON_URL);
        optionicon_ref.on("value", function(snapshot){
            snapshot.forEach(function(childSnapshot) {
                optionicon_list.push(childSnapshot.val());
            });
        });
        
        // Remove any unwanted players before listening to any new incoming players
        stop_countdown_60sec_timer();
        var removePlayer_ref = new Firebase(FB_stationPlayers_url);
        removePlayer_ref.remove();
        
        var p = document.getElementById("state_ref");
        p.innerHTML = "Waiting for players...";
    };

    // Update state of station to "waiting_for_players" when entering
    // waiting_for_players.html for the first time
    var station_ref = new Firebase(FB_STATION_URL);
    current_state = WAITING_STATE;
    station_ref.update({
        "state": current_state
    });
    
    var stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    var stationPlayer_ref;
    var newPlayer, deletedPlayer, player_count, list, pname, text_li, user_icon, values;
    var AddChild, RemoveChild;
    
    // Update list of players after deletion
    RemoveChild = stationPlayers_ref.on("child_removed", function(snapshot) {
        console.log("Child removed");
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
        stationPlayers_ref.once("value", function(snapshot) {
            values = snapshot.val();
            if (values !== null){
                player_count = Object.keys(values).length;
            }
            else{
                player_count = 0;
            }
            if (player_count < 1){
                current_state = WAITING_STATE;
                station_ref.update({
                    "state": current_state
                });
                var p = document.getElementById("state_ref");
                p.innerHTML = "Waiting for players...";
                stop_countdown_60sec_timer();
            }
        });
    });

    // Retrieve & display new players as they are added to firebase
    AddChild = stationPlayers_ref.on("child_added", function(snapshot) {
        console.log("Child added");
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
        stationPlayers_ref.once("value", function(snapshot) {
            values = snapshot.val();
            player_count = Object.keys(values).length;
            if (player_count >= 1){
                station_ref.update({
                    "state": STARTING_STATE 
                });
                console.log("Changing state");
                var p = document.getElementById("state_ref");
                p.innerHTML = "Game starting soon...";
                console.log("P inner HTML = " + p.innerHTML);
                if (current_state === WAITING_STATE){
                    countdown_60sec_timer(stationPlayers_ref, station_ref);
                    current_state = STARTING_STATE;
                }
            }
            
        });
        
        // Add total_correct_answer and total_incorrect_answer child node for every player joined
        stationPlayer_ref = new Firebase(FB_stationPlayers_url + "/" + snapshot.key());
        stationPlayer_ref.child("total_correct_answer").set(0);
        stationPlayer_ref.child("total_incorrect_answer").set(0);
    });
}

// Stop all functions related to waiting_for_players state
function stop_waiting_for_players(FB_stationPlayer_ref, FB_station_ref){
    FB_stationPlayer_ref.off();
    FB_station_ref.off();
}


// Start all functions related to getready state
function start_get_ready(){
    
    // Local variables
    var station_ref;
    
    // Check if station node has QUESTION_HISTORY node
    station_ref = new Firebase(FB_STATION_URL);
    station_ref.once("value", function(snapshot){
        // Create QUESTION_HISTORY node and push list of questions retrieved from CMS
        var has_QUESTION_HISTORY = snapshot.child("QUESTION_HISTORY").exists();
        if (has_QUESTION_HISTORY === false){
            console.log("No question history node");
            var qns_history_ref = station_ref.child("QUESTION_HISTORY");
            for (var i = 0; i < questionBank.length; i++){
                qns_history_ref.child(questionBank[i].question_id).set({
                    correct_answer: questionBank[i].correct_option,
                    options:{
                        option_1: questionBank[i].option_1,
                        option_2: questionBank[i].option_2,
                        option_3: questionBank[i].option_3,
                        option_4: questionBank[i].option_4
                    },
                    question: questionBank[i].question_name,
                    total_correct_answer: 0,
                    total_incorrect_answer: 0
                });
            }
        }
    });

    // Update firebase CURRENT_QUESTION node with a random question from question bank
    curr_qns = questionBank[curr_qns_index++];
    station_ref.on("value", function(){
        var qns_curr_ref = station_ref.child("CURRENT_QUESTION");
        qns_curr_ref.set({
            question_id: curr_qns.question_id,
            answering_duration: curr_qns.answering_duration,
            correct_answer: curr_qns.correct_option,
            options:{
                option_1: curr_qns.option_1,
                option_2: curr_qns.option_2,
                option_3: curr_qns.option_3,
                option_4: curr_qns.option_4
            },
            question: curr_qns.question_name,
            question_no: curr_qns.question_no
        },function(error){
            if (!error){
                // Change station state to getready
                var station_state_ref = new Firebase(FB_STATION_URL);
                current_state = GETREADY_STATE;
                station_state_ref.update({
                    "state": current_state 
                });
            }
        });
    });

    // Display current question on web app
    var qns_number = document.getElementById("get_ready_h1_qns_header");
    qns_number.innerHTML = "QUESTION " + curr_qns.question_no;
    var qns_name = document.getElementById("get_ready_h2_qns_name");
    qns_name.innerHTML = curr_qns.question_name;

    // Countdown timer of 10 secs for players to read
    get_ready_countdown_10sec_timer("get_ready_h3_timer", station_ref);
}

// Stop all functions related to getready state
function stop_get_ready(station_ref){
    station_ref.off();
}


// Start all functions related to answering questions state
function start_answering_qns(){
    
    // Local variables
    var posting_time = 0;
    var station_state_ref, station_qns_posttime_ref;
    
    // Change state to answering
    station_state_ref = new Firebase(FB_STATION_URL);
    current_state = ANSWERINGQUESTION_STATE;
    station_state_ref.update({
        "state": current_state
    });
    
    // Set current question posting time
    station_qns_posttime_ref = new Firebase(FB_stationCurrentQuestion_url);
    posting_time = Firebase.ServerValue.TIMESTAMP;
    station_qns_posttime_ref.child("posting_time").set(posting_time);
    
    // Display current qns number
    document.getElementById("answering_h1_qns_header").innerHTML = "QUESTION " + curr_qns.question_no;
    
    // Display current qns name
    document.getElementById("answering_h2_qns_name").innerHTML = curr_qns.question_name;
    
    // Display current question options
    document.getElementById("answering_option_1_text").innerHTML = curr_qns.option_1;
    document.getElementById("answering_option_2_text").innerHTML = curr_qns.option_2;
    document.getElementById("answering_option_3_text").innerHTML = curr_qns.option_3;
    document.getElementById("answering_option_4_text").innerHTML = curr_qns.option_4;
    
    // Display current question option icons
    document.getElementById("answering_option_1_img").src = optionicon_list[0].icon_url;
    document.getElementById("answering_option_2_img").src = optionicon_list[1].icon_url;
    document.getElementById("answering_option_3_img").src = optionicon_list[2].icon_url;
    document.getElementById("answering_option_4_img").src = optionicon_list[3].icon_url;
    
    // Display option background colour
    document.getElementById("answering_option_1").style.backgroundColor = optionicon_list[0].bgcolor;
    document.getElementById("answering_option_2").style.backgroundColor = optionicon_list[1].bgcolor;
    document.getElementById("answering_option_3").style.backgroundColor = optionicon_list[2].bgcolor;
    document.getElementById("answering_option_4").style.backgroundColor = optionicon_list[3].bgcolor;
        
    // Retrieve posting time from current question node
    station_qns_posttime_ref.child("posting_time").once("value", function(snapshot){
        posting_time = snapshot.val();
        update_player_score(posting_time);
    });
}

// Function to update player score after choosing an option
function update_player_score(posting_time){
    
    // Local variables
    var checked_players = [];
    var answers = 0, player_score = 0, player_count = 0, player_gained_score = 0;
    var stationPlayer_ref, stationPlayers_ref, stationPlayer_scoreGained_ref;
    
    // Event when player has selected their answer
    stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    stationPlayers_ref.on("value", function(snapshot){
        var values = snapshot.val();
        player_count = Object.keys(values).length;
        snapshot.forEach(function(childSnapshot) {
            var value = childSnapshot.val();
            if (value.answer !== undefined & value.answer !== null){
                if (checked_players.hasOwnProperty(childSnapshot.key())) return;
                checked_players[childSnapshot.key()] = childSnapshot.key();
                
                // Retrieve total score for each player
                stationPlayer_scoreGained_ref = new Firebase(FB_stationPlayers_url + "/" + childSnapshot.key() + "/score");
                stationPlayer_scoreGained_ref.once("value", function(snapshot){
                    player_score = snapshot.val();
                    
                    // Update number of answers answered by players
                    document.getElementById("ans_num").innerHTML = ++answers + "answers";

                    stationPlayer_ref = new Firebase(FB_stationPlayers_url + "/" + childSnapshot.key());

                    // Update is_correct_answer to true when it is the correct option
                    if (value.answer === curr_qns.correct_option){
                        stationPlayer_ref.child("is_correct_answer").set(true);
                        stationPlayer_ref.child("total_correct_answer").set(++value.total_correct_answer);

                        // Calculate score for player for current question and update Firebase
                        player_gained_score = (1 - ((parseInt(value.answering_time) - parseInt(posting_time)) / parseInt(curr_qns.answering_duration * 1000))) * 1000;
                        stationPlayer_ref.child("score_gained").set(player_gained_score);
                        stationPlayer_ref.child("score").set(player_score + player_gained_score);
                    }
                    // Update is_correct_answer to false when it is not the correct option
                    else{
                        stationPlayer_ref.child("is_correct_answer").set(false);
                        stationPlayer_ref.child("total_incorrect_answer").set(++value.total_incorrect_answer);
                    }

                    // Go to answered state if all players have answered
                    if (player_count === answers){
                        stop_answering_countdown_20sec_timer(stationPlayers_ref);
                    }
                });
            }
        });
    });
    
    // Display 20sec countdown timer
    answering_countdown_20sec_timer("h3_answering_countdown_timer", curr_qns.answering_duration, stationPlayers_ref);
}

// Stop all functions related to answering questions state
function stop_answering_qns(Players_ref){
    Players_ref.off();
}


// Start all functions related to answered state
function start_answered(){
    
    // Local variable
    var curr_option1_stats = 0;
    var curr_option2_stats = 0;
    var curr_option3_stats = 0;
    var curr_option4_stats = 0;
    var stationPlayers_ref, stationCurrentQns_ref, station_state_ref;
    
    // Change station state to answered
    station_state_ref = new Firebase(FB_STATION_URL);
    current_state = ANSWERED_STATE;
    station_state_ref.update({
        "state": current_state 
    });
    
    // Display current qns number
    document.getElementById("answered_h1_qns_header").innerHTML = "QUESTION " + curr_qns.question_no;
    
    // Display current qns name
    document.getElementById("answered_h2_qns_name").innerHTML = curr_qns.question_name;
    
    // Display current question options
    document.getElementById("answered_option_1_text").innerHTML = curr_qns.option_1;
    document.getElementById("answered_option_2_text").innerHTML = curr_qns.option_2;
    document.getElementById("answered_option_3_text").innerHTML = curr_qns.option_3;
    document.getElementById("answered_option_4_text").innerHTML = curr_qns.option_4;
    
    // Display current question option icons
    document.getElementById("answered_option_1_icon").src = optionicon_list[0].icon_url;
    document.getElementById("answered_option_2_icon").src = optionicon_list[1].icon_url;
    document.getElementById("answered_option_3_icon").src = optionicon_list[2].icon_url;
    document.getElementById("answered_option_4_icon").src = optionicon_list[3].icon_url;
    document.getElementById("answered_option_1_img").src = optionicon_list[0].icon_url;
    document.getElementById("answered_option_2_img").src = optionicon_list[1].icon_url;
    document.getElementById("answered_option_3_img").src = optionicon_list[2].icon_url;
    document.getElementById("answered_option_4_img").src = optionicon_list[3].icon_url;
    
    // Display option icons background colour
    document.getElementById("answered_option_1").style.backgroundColor = optionicon_list[0].bgcolor;
    document.getElementById("answered_option_2").style.backgroundColor = optionicon_list[1].bgcolor;
    document.getElementById("answered_option_3").style.backgroundColor = optionicon_list[2].bgcolor;
    document.getElementById("answered_option_4").style.backgroundColor = optionicon_list[3].bgcolor;
    document.getElementById("answered_option_1_icon").style.backgroundColor = optionicon_list[0].bgcolor;
    document.getElementById("answered_option_2_icon").style.backgroundColor = optionicon_list[1].bgcolor;
    document.getElementById("answered_option_3_icon").style.backgroundColor = optionicon_list[2].bgcolor;
    document.getElementById("answered_option_4_icon").style.backgroundColor = optionicon_list[3].bgcolor;
    
    // Retrieve option statistics
    stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    stationPlayers_ref.once("value", function(snapshot){
        snapshot.forEach(function(childSnapshot) {
            var value = childSnapshot.val();
            if (value.answer === "option_1"){
                curr_option1_stats++;
            }
            else if (value.answer === "option_2"){
                curr_option2_stats++;
            }
            else if (value.answer === "option_3"){
                curr_option3_stats++;
            }
            else if (value.answer === "option_4"){
                curr_option4_stats++;
            }
            console.log("Option 1 stats = " + curr_option1_stats);
            console.log("Option 2 stats = " + curr_option2_stats);
            console.log("Option 3 stats = " + curr_option3_stats);
            console.log("Option 4 stats = " + curr_option4_stats);
            
            // Display option icon statistics
            document.getElementById("answered_option_1_stats").innerHTML = curr_option1_stats;
            document.getElementById("answered_option_2_stats").innerHTML = curr_option2_stats;
            document.getElementById("answered_option_3_stats").innerHTML = curr_option3_stats;
            document.getElementById("answered_option_4_stats").innerHTML = curr_option4_stats;
            
        });
    });
    
    // Set all correct option tick to hidden
    document.getElementById("answered_option_1_correct").style.visibility = "hidden";
    document.getElementById("answered_option_2_correct").style.visibility = "hidden";
    document.getElementById("answered_option_3_correct").style.visibility = "hidden";
    document.getElementById("answered_option_4_correct").style.visibility = "hidden";
    
    // Display correct answer with a tick beside the correct option
    stationCurrentQns_ref = new Firebase(FB_stationCurrentQuestion_url);
    stationCurrentQns_ref.once("value", function(snapshot){
        var value = snapshot.val();
        if (value.correct_answer === "option_1"){
            document.getElementById("answered_option_1_correct").style.visibility = "visible";
        }
        else if (value.correct_answer === "option_2"){
            document.getElementById("answered_option_2_correct").style.visibility = "visible";
        }
        else if (value.correct_answer === "option_3"){
            document.getElementById("answered_option_3_correct").style.visibility = "visible";
        }
        else if (value.correct_answer === "option_4"){
            document.getElementById("answered_option_4_correct").style.visibility = "visible";
        }
    });
    
    // Display 10 second countdown timer before changing to next state
    answered_countdown_10sec_timer("answered_countdown_timer");
}

// Stop all functions related to answered state
function stop_answered(){
}


// Start all functions related to leaderboard state
function start_leaderboard(){
    
    // Local variable
    var highest_score = 0;
    var station_state_ref;
    
    // Change station state to gameover
    station_state_ref = new Firebase(FB_STATION_URL);
    current_state = LEADERBOARD_STATE;
    station_state_ref.update({
        "state": current_state 
    });
    
    // Retrieve highest score
    stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    stationPlayers_ref.on("value", function(snapshot){
        snapshot.forEach(function(childSnapshot) {
            var value = childSnapshot.val();
            if (value.score > highest_score){
                highest_score = value.score;
            }
        });
    });
    
    // Retrieve player with current highest score and display
    stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    stationPlayers_ref.on("value", function(snapshot){
        snapshot.forEach(function(childSnapshot) {
            var value = childSnapshot.val();
            if (value.score === highest_score){
                document.getElementById("h2_leaderboard_nickname").innerHTML = value.nickname;
                document.getElementById("leaderboard_points").innerHTML = value.score + " points";
                document.getElementById("leaderboard_correct").innerHTML = value.total_correct_answer + " correct";
                document.getElementById("leaderboard_incorrect").innerHTML = value.total_incorrect_answer + " incorrect";
            }
        });
    });
    
    // Call 10 second countdown timer function for leaderboard state
    leaderboard_countdown_10sec_timer("h2_leaderboard_timer", stationPlayers_ref);
}

// Stop all functions related to leaderboard state
function stop_leaderboard(Players_ref){
    Players_ref.off();
}


// Start all functions related to game over state
function start_game_over(){
    
    // Local variable
    var highest_score = 0;
    var station_state_ref, stationPlayers_ref;
    
    // Change station state to gameover
    station_state_ref = new Firebase(FB_STATION_URL);
    current_state = GAMEOVER_STATE;
    station_state_ref.update({
        "state": current_state 
    });
    
    // Retrieve highest score
    stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    stationPlayers_ref.on("value", function(snapshot){
        snapshot.forEach(function(childSnapshot) {
            var value = childSnapshot.val();
            if (value.score > highest_score){
                highest_score = value.score;
            }
        });
    });
    
    // Retrieve player with the highest score and display
    stationPlayers_ref = new Firebase(FB_stationPlayers_url);
    stationPlayers_ref.on("value", function(snapshot){
        snapshot.forEach(function(childSnapshot) {
            var value = childSnapshot.val();
            if (value.score === highest_score){
                document.getElementById("h2_game_over_nickname").innerHTML = value.nickname;
                document.getElementById("game_over_points").innerHTML = value.score + " points";
                document.getElementById("game_over_correct").innerHTML = value.total_correct_answer + " correct";
                document.getElementById("game_over_incorrect").innerHTML = value.total_correct_answer + " incorrect";
            }
        });
    });
    
    // Call countdown timer function
    game_over_countdown_60sec_timer(stationPlayers_ref);
}

// Stop all functions related to game over state
function stop_game_over(Players_ref){
    Players_ref.off();
}



