/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* 
    Created on : 1 Jun, 2016, 3:32:21 AM
    Author     : Chow Jie Jin Edmund
*/

//--------------------------------------------------------------------------- Variables ---------------------------------------------------------------------------------------------
// Global Variables
var questionBank = [];                                                                  // Pool of questions for a specific station
var curr_qns, interval;                                                                 // Variable that contains details of current question
var curr_qns_index = 0;                                                                 // Current index of current question
var qns_num_icon = 0;                                                                   // Qns number icon
var current_state = "";                                                                 // Current state of the station
var optionicon_list = [];                                                               // Array that contains icon_url for the different question options
var getready_qns1, getready_qns2, getready_qns3, getready_qns4, getready_qns5;          // Get Ready State qns number icons
var getready_qns6, getready_qns7, getready_qns8, getready_qns9, getready_qns10;         // Get Ready State qns number icons
var answering_qns1, answering_qns2, answering_qns3, answering_qns4, answering_qns5;     // Answering_questions State qns number icons
var answering_qns6, answering_qns7, answering_qns8, answering_qns9, answering_qns10;    // Answering_questions State qns number icons
var answered_qns1, answered_qns2, answered_qns3, answered_qns4, answered_qns5;          // Answered State qns number icons
var answered_qns6, answered_qns7, answered_qns8, answered_qns9, answered_qns10;         // Answered State qns number icons

// Decode url to get station name
var search_query = window.location.search;
var station = [];
station = search_query.split('=');
var station_name = station[2];
var decode_station = [];
decode_station = station_name.split('+');
station_name = decode_station[0] + " " + decode_station[1];

// Decode url to get station id
var station_id = station[1];
var decode_station_id = station_id.split("&");
station_id = decode_station_id[0];
    
// Constants for firebase url
var FB_STATION_URL = "https://mantrodev.firebaseio.com/STATIONS/" + station_id;
var FB_STATIONPLAYERS_URL = "https://mantrodev.firebaseio.com/STATIONS/" + station_id + "/PLAYERS";
var FB_STATIONCURRENTQUESTION_URL = "https://mantrodev.firebaseio.com/STATIONS/" + station_id + "/CURRENT_QUESTION";
var FB_STATIONQUESTIONHISTORY_URL = "https://mantrodev.firebaseio.com/STATIONS/" + station_id + "/QUESTION_HISTORY";
var FB_OPTIONICON_URL = "https://mantrodev.firebaseio.com/OPTION_ICONS";
var FB_STATIONUSERS_URL = "https://mantrodev.firebaseio.com/USERS";
var FB_STATIONLEADERBOARD_URL = "https://mantrodev.firebaseio.com/STATIONS/" + station_id + "/LEADERBOARD_OF_THE_DAY";
var station_monitor_players_ref = null;

// Constants for station states
var WAITING_STATE = "waiting";
var STARTING_STATE = "starting";
var GETREADY_STATE = "getready";
var ANSWERINGQUESTION_STATE = "answering_question";
var ANSWERED_STATE = "answered";
var LEADERBOARD_STATE = "leaderboard";
var GAMEOVER_STATE = "gameover";

// Audio Lists
var WAITING_AUDIO;
var STARTING_AUDIO;
var GET_READY_AUDIO;
var ANSWERING_AUDIO;
var ANSWERED_AUDIO;
var GAME_OVER_AUDIO;
var NEW_PLAYER_AUDIO;
//--------------------------------------------------------------------------- Variables ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for Audio ---------------------------------------------------------------------------------------------
// Start playing an audio sound for a particular state
function playAudio(audio)
{
    console.log("Playing " + current_state + " audio");
    audio.currentTime = 0;
    audio.play();
}

// Pause all audio sounds
function pauseAllAudios()
{
    console.log("Pausing all audios");
    WAITING_AUDIO = document.getElementById("waiting_audio");
    WAITING_AUDIO.loop = "true";
    STARTING_AUDIO = document.getElementById("starting_audio");
    GET_READY_AUDIO = document.getElementById("getready_audio");
    ANSWERING_AUDIO = document.getElementById("answering_audio");
    ANSWERED_AUDIO = document.getElementById("answered_audio");
    GAME_OVER_AUDIO = document.getElementById("gameover_audio");
    NEW_PLAYER_AUDIO = document.getElementById("newplayer_audio");
        
    WAITING_AUDIO.pause();
    STARTING_AUDIO.pause();
    GET_READY_AUDIO.pause();
    ANSWERING_AUDIO.pause();
    ANSWERED_AUDIO.pause();
    GAME_OVER_AUDIO.pause();
    NEW_PLAYER_AUDIO.pause();
}
//--------------------------------------------------------------------------- Functions for Audio ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for waiting state timer ---------------------------------------------------------------------------------------------
// 60 seconds countdown timer function for waiting state
function waiting_countdown_60sec_timer(ref1, ref2){
    // Reset get_ready state progress bar's width to 0px
    console.log("Before waiting reset");
    document.getElementById("waiting_skillbar-bar_width").style.width = "0%";
    console.log("After waiting reset");
    
    var seconds = 60,
    timer = 62000,
    second = 0;

    interval = setInterval(function() {
        console.log((seconds - second) + ' secs');
        if (second >= seconds) {
            clearInterval(interval);
            
            // Close firebase event listeners
            stop_waiting_for_players(ref1, ref2);
            
            // Call function to get questions from CMS
            get_qns_from_CMS();
        }
        second++;
    }, 1000);
    
    jQuery(document).ready(function(){
        jQuery('.waiting_skillbar').each(function(){
            jQuery(this).find('.waiting_skillbar-bar').animate({
              width:jQuery(this).attr('data-percent')
            },timer);
        });
    });
}

// Stop 60 seconds countdown timer function
function stop_waiting_countdown_60sec_timer(){
    clearInterval(interval);
}
//--------------------------------------------------------------------------- Functions for waiting state timer ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for getready state timer ---------------------------------------------------------------------------------------------
// 10 seconds countdown timer function for getready state
function get_ready_countdown_10sec_timer(){
    // Reset get_ready state progress bar's width to 0px
    console.log("Before getready reset");
    document.getElementById("get_ready_skillbar-bar_width").style.width = "0%";
    console.log("After getready reset");
    
    // Play music for get_ready state
    pauseAllAudios();
    playAudio(GET_READY_AUDIO);
    
    // 10 sec timer running
    var seconds = 10,
    timer = 12000,
    second = 0;

    interval = setInterval(function() {
        console.log((seconds - second) + ' secs');
        if (second >= seconds) {
            clearInterval(interval);
            
            // Clear display of <div id="getready">
            document.getElementById("get_ready").style.display = "none";

            // Make display of <div id="answering_questions"> visible
            document.getElementById("answering_questions").style.display = "block";
            
            // Call start_answering_qns function 
            start_answering_qns();
        }
        second++;
    }, 1000);
    
    // 10 sec progress bar
    jQuery(document).ready(function(){
        jQuery('.get_ready_skillbar').each(function(){
            jQuery(this).find('.get_ready_skillbar-bar').animate({
              width:jQuery(this).attr('data-percent')
            },timer);
        });
    });
}
//--------------------------------------------------------------------------- Functions for getready state timer ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for answering_question state timer ---------------------------------------------------------------------------------------------
// 20 seconds countdown timer function for answering state
function answering_countdown_20sec_timer(duration, ref1){
    // Reset get_ready state progress bar's width to 0px
    console.log("Before answering reset");
    document.getElementById("answering_skillbar-bar_width").style.width = "0%";
    console.log("After answering reset");
    
    // Play music for answering_question state
    pauseAllAudios();
    playAudio(ANSWERING_AUDIO);
    
    // 20 sec timer
    var seconds = duration,
    timer = 22000,
    second = 0;

    interval = setInterval(function() {
        if (second >= seconds) {
            clearInterval(interval);
            
            // Stop firebase event listeners related to answering_question state
            stop_answering_countdown_20sec_timer(ref1);
        }
        second++;
    }, 1000);
    
    // 20 sec progress bar
    jQuery(document).ready(function(){
        jQuery('.answering_skillbar').each(function(){
            jQuery(this).find('.answering_skillbar-bar').animate({
              width:jQuery(this).attr('data-percent')
            },timer);
        });
    });
}

// Stop 20 seconds timer
function stop_answering_countdown_20sec_timer(ref1){ 
    // Stop firebase event listeners related to answering_question state
    stop_answering_qns(ref1);
    clearInterval(interval);
    
    // Retrieve posting time from current question node
    var station_qns_posttime_ref = new Firebase(FB_STATIONCURRENTQUESTION_URL);
    station_qns_posttime_ref.child("posting_time").once("value", function(snapshot){
        var posting_time = snapshot.val();
        update_player_score(posting_time);
    });    

}
//--------------------------------------------------------------------------- Functions for answering_question state timer ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for answered state timer ---------------------------------------------------------------------------------------------
// 10 seconds countdown timer function for answered state
function answered_countdown_10sec_timer(){
    // Reset get_ready state progress bar's width to 0px
    console.log("Before answered reset");
    document.getElementById("answered_skillbar-bar_width").style.width = "0%";
    console.log("After answered reset");
    
    // Play music for answered and leaderboard state
    pauseAllAudios();
    playAudio(ANSWERED_AUDIO);
    
    // 10 sec timer
    var seconds = 10,
    timer = 11000,
    second = 0;

    interval = setInterval(function() {
        if (second >= seconds) {
            clearInterval(interval);
            
            // Clear display of <div id="answered">
            document.getElementById("answered").style.display = "none";
            
            // If there is next question make display of <div id="leaderboard"> visible
            if (curr_qns_index !== questionBank.length){
                console.log(curr_qns_index + " " + questionBank.length);
                console.log("Go to leaderboard");
                document.getElementById("game_over").style.display = "none";
                for(var c = 1; c < 6; c++)
                {
                    document.getElementById("leaderboard_nickname_container" + c).style.visibility = "hidden";
                    document.getElementById("leaderboard_points" + c).style.visibility = "hidden";
                    document.getElementById("h2_leaderboard_nickname" + c).style.visibility = "hidden";
                    document.getElementById("leaderboard_player_icon" + c).style.visibility = "hidden";
                }
                document.getElementById("leaderboard").style.display = "block";
                        
                start_leaderboard();
            }
            
            // If there is no next question make display of <div id="leaderboard"> visible
            else{
                console.log(curr_qns_index + " " + questionBank.length);
                console.log("Go to game over");
                document.getElementById("leaderboard").style.display = "none";
                for(var count = 0; count < 4; count++)
                {
                    document.getElementById("gameover_nickname_container" + (count+1)).style.visibility = "hidden";
                    document.getElementById("gameover_player_icon" + (count+1)).style.visibility = "hidden";
                    document.getElementById("h2_gameover_nickname" + (count+1)).style.visibility = "hidden";
                    document.getElementById("gameover_points" + (count+1)).style.visibility = "hidden";
                    document.getElementById("gameover_rank_icon" + (count+1)).style.visibility = "hidden";
                }
                
                document.getElementById("gameover_nickname_container").style.visibility = "visible";
                document.getElementById("gameover_points_container").style.visibility = "visible";
                document.getElementById("game_over").style.display = "block";
                update_user_node();
                
                update_leaderboard_of_the_day();
            }
        }
        second++;
    }, 1000);
    
    // 10 sec progress bar
    jQuery(document).ready(function(){
        jQuery('.answered_skillbar').each(function(){
            jQuery(this).find('.answered_skillbar-bar').animate({
              width:jQuery(this).attr('data-percent')
            },timer);
        });
    });
}
//--------------------------------------------------------------------------- Functions for answered state timer ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for leaderboard state timer ---------------------------------------------------------------------------------------------
// 10 seconds countdown timer function for leaderboard state
function leaderboard_countdown_10sec_timer(ref1){
    // Reset get_ready state progress bar's width to 0px
    console.log("Before leaderboard reset");
    document.getElementById("leaderboard_skillbar-bar_width").style.width = "0%";
    console.log("After leaderboard reset");
    
    // 10 sec timer
    var seconds = 10,
    timer = 11000,
    second = 0;

    interval = setInterval(function() {
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
    
    // 10 sec progress bar
    jQuery(document).ready(function(){
        jQuery('.leaderboard_skillbar').each(function(){
            jQuery(this).find('.leaderboard_skillbar-bar').animate({
              width:jQuery(this).attr('data-percent')
            },timer);
        });
    });
}
//--------------------------------------------------------------------------- Functions for leaderboard state timer ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for gameover state timer ---------------------------------------------------------------------------------------------
// 10 seconds countdown timer function for gameover state before returning to waiting state
function game_over_countdown_10sec_timer(ref1){
    // Reset get_ready state progress bar's width to 0px
    console.log("Before gameover reset");
    document.getElementById("gameover_skillbar-bar_width").style.width = "0%";
    console.log("After gameover reset");
    
    // 10 sec timer
    var seconds = 10,
    timer = 11000,
    second = 0;

    interval = setInterval(function() {
        if (second >= seconds) {
            clearInterval(interval);
            
            // Stop firebase event listeners related to gameover state
            stop_game_over(ref1);
            
            // Hide all other states layout
            document.getElementById("get_ready").style.display = "none";
            document.getElementById("answering_questions").style.display = "none";
            document.getElementById("answered").style.display = "none";
            document.getElementById("leaderboard").style.display = "none";
            document.getElementById("game_over").style.display = "none";
            
            // Transit to waiting state
            document.getElementById("waiting_for_players").style.display = "block";
            
            // Remove any players in player list on web app
            document.getElementById("player_name").innerHTML = "";
            var p = document.getElementById("state_reference");
            p.innerHTML = "Waiting for players...";
            console.log("P = " + p.innerHTML);
            document.getElementById("waiting_skillbar-bar_width").setAttribute("style", "width:0%");
            
            // start function for waiting state
            start_waiting_for_players();
        }
        second++;
    }, 1000);
    
    // 10 sec progress bar
    jQuery(document).ready(function(){
        jQuery('.gameover_skillbar').each(function(){
            jQuery(this).find('.gameover_skillbar-bar').animate({
              width:jQuery(this).attr('data-percent')
            },timer);
        });
    });
}
//--------------------------------------------------------------------------- Functions for gameover state timer ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- CMS retrieve qns function ---------------------------------------------------------------------------------------------
// Function to retrieve all questions from Content Management System
function get_qns_from_CMS(){
    questionBank = [];
    curr_qns_index = 5;
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

                    // Update question history node
                    var station_ref = new Firebase(FB_STATION_URL).child("QUESTION_HISTORY");
                    station_ref.once("value", function(snapshot){
                        for (var i = 0; i < questionBank.length; i++){
                            var has_QUESTION_HISTORY = snapshot.child(questionBank[i].question_id).exists();
                            if (has_QUESTION_HISTORY === false){
                                station_ref.child(questionBank[i].question_id).set({
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
                    
                    // Make display of <div id="getready"> visible
                    document.getElementById("get_ready").style.display = "block";

                    // Call start_get_ready function 
                    start_get_ready();
            }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send(); 
}
//--------------------------------------------------------------------------- CMS retrieve qns function ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Remove player's answering duration  ---------------------------------------------------------------------------------------------
// Function to remove player's answer and answering_duration
function remove_players_ans_ansduration(){
    var stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
    stationPlayers_ref.once("value", function(AllPlayerssnapshot){
        AllPlayerssnapshot.forEach(function(PlayerSnapshot){
            stationPlayers_ref.child(PlayerSnapshot.key()).child("answer").remove();
            stationPlayers_ref.child(PlayerSnapshot.key()).child("answering_duration").remove();
            stationPlayers_ref.child(PlayerSnapshot.key()).child("score_gained").set(0);
            stationPlayers_ref.child(PlayerSnapshot.key()).child("is_correct_answer").set(false);
        });
    });
}
//--------------------------------------------------------------------------- Remove player's answering duration function ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Updating scores of players to user node function ---------------------------------------------------------------------------------------------
function update_user_node(){
    var stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
    stationPlayers_ref.once("value", function(AllPlayerSnapshot){
        AllPlayerSnapshot.forEach(function(PlayerSnapshot){
            console.log("Updating user's score....");
            var value = PlayerSnapshot.val();
            
            if (value.connected === true){
                var stationUser_score = new Firebase(FB_STATIONUSERS_URL).child(PlayerSnapshot.key()).child("scores").child(station_id).child("score");
                stationUser_score.once("value", function(snapshot){
                   var user_score = snapshot.val();
                   var current_high_score = value.score;
                   if (user_score !== null || user_score !== undefined){
                       current_high_score = user_score;
                       if (current_high_score < value.score){
                           current_high_score = value.score;
                       }
                   }
                   // Update score in users node with player score earned from the game
                   var stationPlayer_score_ref = new Firebase(FB_STATIONUSERS_URL).child(PlayerSnapshot.key()).child("scores").child(station_id).child("score");
                   stationPlayer_score_ref.set(current_high_score);

                   // Update total_correct_answer in users node with total_correct_answer earned from the game
                   var stationPlayer_total_correct_ref = new Firebase(FB_STATIONUSERS_URL).child(PlayerSnapshot.key()).child("scores").child(station_id).child("total_correct_answer");
                   stationPlayer_total_correct_ref.set(value.total_correct_answer);

                   // Update total_incorrect_answer in users node with total_incorrect_answer earned from the game
                   var stationPlayer_total_incorrect_ref = new Firebase(FB_STATIONUSERS_URL).child(PlayerSnapshot.key()).child("scores").child(station_id).child("total_incorrect_answer");
                   stationPlayer_total_incorrect_ref.set(value.total_incorrect_answer);
                });
            }
        });
    });
}
//--------------------------------------------------------------------------- Updating scores of players to user node function ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for waiting state ---------------------------------------------------------------------------------------------
// Function to make all qns number icons invisible
function initialize_qns_icons(){
    // Get Ready state
    getready_qns1 = document.getElementById("Qns_1_get_ready");
    getready_qns1.style.visibility = "hidden";
    getready_qns2 = document.getElementById("Qns_2_get_ready");
    getready_qns2.style.visibility = "hidden";
    getready_qns3 = document.getElementById("Qns_3_get_ready");
    getready_qns3.style.visibility = "hidden";
    getready_qns4 = document.getElementById("Qns_4_get_ready");
    getready_qns4.style.visibility = "hidden";
    getready_qns5 = document.getElementById("Qns_5_get_ready");
    getready_qns5.style.visibility = "hidden";
    getready_qns6 = document.getElementById("Qns_6_get_ready");
    getready_qns6.style.visibility = "hidden";
    getready_qns7 = document.getElementById("Qns_7_get_ready");
    getready_qns7.style.visibility = "hidden";
    getready_qns8 = document.getElementById("Qns_8_get_ready");
    getready_qns8.style.visibility = "hidden";
    getready_qns9 = document.getElementById("Qns_9_get_ready");
    getready_qns9.style.visibility = "hidden";
    getready_qns10 = document.getElementById("Qns_10_get_ready");
    getready_qns10.style.visibility = "hidden";
    
    // Answering_Question state
    answering_qns1 = document.getElementById("Qns_1_answering");
    answering_qns1.style.visibility = "hidden";
    answering_qns2 = document.getElementById("Qns_2_answering");
    answering_qns2.style.visibility = "hidden";
    answering_qns3 = document.getElementById("Qns_3_answering");
    answering_qns3.style.visibility = "hidden";
    answering_qns4 = document.getElementById("Qns_4_answering");
    answering_qns4.style.visibility = "hidden";
    answering_qns5 = document.getElementById("Qns_5_answering");
    answering_qns5.style.visibility = "hidden";
    answering_qns6 = document.getElementById("Qns_6_answering");
    answering_qns6.style.visibility = "hidden";
    answering_qns7 = document.getElementById("Qns_7_answering");
    answering_qns7.style.visibility = "hidden";
    answering_qns8 = document.getElementById("Qns_8_answering");
    answering_qns8.style.visibility = "hidden";
    answering_qns9 = document.getElementById("Qns_9_answering");
    answering_qns9.style.visibility = "hidden";
    answering_qns10 = document.getElementById("Qns_10_answering");
    answering_qns10.style.visibility = "hidden";
    
    // Answered state
    answered_qns1 = document.getElementById("Qns_1_answered");
    answered_qns1.style.visibility = "hidden";
    answered_qns2 = document.getElementById("Qns_2_answered");
    answered_qns2.style.visibility = "hidden";
    answered_qns3 = document.getElementById("Qns_3_answered");
    answered_qns3.style.visibility = "hidden";
    answered_qns4 = document.getElementById("Qns_4_answered");
    answered_qns4.style.visibility = "hidden";
    answered_qns5 = document.getElementById("Qns_5_answered");
    answered_qns5.style.visibility = "hidden";
    answered_qns6 = document.getElementById("Qns_6_answered");
    answered_qns6.style.visibility = "hidden";
    answered_qns7 = document.getElementById("Qns_7_answered");
    answered_qns7.style.visibility = "hidden";
    answered_qns8 = document.getElementById("Qns_8_answered");
    answered_qns8.style.visibility = "hidden";
    answered_qns9 = document.getElementById("Qns_9_answered");
    answered_qns9.style.visibility = "hidden";
    answered_qns10 = document.getElementById("Qns_10_answered");
    answered_qns10.style.visibility = "hidden";
}

// Start all functions related to waiting_for_players state
function start_waiting_for_players(){
    
    // Display station name
    window.onload = function(){
        // Set active to false when web application stop running or when there is no internet connection
	var stationactive_ref = new Firebase(FB_STATION_URL + "/active");
        stationactive_ref.onDisconnect().set(false);
        
        document.getElementById("stn_name").innerHTML = station_name;
        var optionicon_ref = new Firebase(FB_OPTIONICON_URL);
        optionicon_ref.on("value", function(snapshot){
            snapshot.forEach(function(childSnapshot) {
                optionicon_list.push(childSnapshot.val());
            });
        });
        
        // Update state of station to "waiting_for_players" when entering
        var station_ref = new Firebase(FB_STATION_URL);
        current_state = WAITING_STATE;
        station_ref.update({
            "state": current_state
        });
        
        // Stop 60 sec timer
        stop_waiting_countdown_60sec_timer();

        var p = document.getElementById("state_reference");
        p.innerHTML = "Waiting for players...";
        console.log("P = " + p.innerHTML);
        
        // Make all qns number icons invisible
        initialize_qns_icons();
    };
    
    var removePlayer_ref = new Firebase(FB_STATIONPLAYERS_URL);
    removePlayer_ref.remove(function(error){
        if(!error){
            // Update state of station to "waiting_for_players" when this function is run
            var station_ref = new Firebase(FB_STATION_URL);
            current_state = WAITING_STATE;
            station_ref.update({
                "state": current_state
            });

            // Play music for waiting state
            pauseAllAudios();
            playAudio(WAITING_AUDIO);

            var stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
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

                        pauseAllAudios();
                        playAudio(WAITING_AUDIO);

                        jQuery(document).ready(function(){
                            jQuery('.waiting_skillbar').each(function(){
                                jQuery(this).find('.waiting_skillbar-bar').stop();
                            });
                        });
                        document.getElementById("waiting_skillbar-bar_width").setAttribute("style", "width:0%");

                        var p = document.getElementById("state_reference");
                        p.innerHTML = "Waiting for players...";
                        stop_waiting_countdown_60sec_timer();
                    }
                });
            });

            // Retrieve & display new players as they are added to firebase
            AddChild = stationPlayers_ref.on("child_added", function(snapshot) {
                console.log("Child added");
                // Extract out player nickname
                newPlayer = snapshot.val();
                
                // Ignore the rest of the code in this function when the player is not connected or when player.connected node is undefined
                if (newPlayer.connected === null || newPlayer.connected === false) return;
                
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
                        var p = document.getElementById("state_reference");
                        p.innerHTML = "Game starting soon...";
                        console.log("P inner HTML = " + p.innerHTML);
                        if (current_state === WAITING_STATE){
                            waiting_countdown_60sec_timer(stationPlayers_ref, station_ref);
                            current_state = STARTING_STATE;

                            // Play music for waiting state
                            pauseAllAudios();
                            playAudio(STARTING_AUDIO);
                        }
                    }

                });

                // Add total_correct_answer and total_incorrect_answer child node for every player joined
                stationPlayer_ref = new Firebase(FB_STATIONPLAYERS_URL + "/" + snapshot.key());
                stationPlayer_ref.child("total_correct_answer").set(0);
                stationPlayer_ref.child("total_incorrect_answer").set(0);

                // Play a sound whenever a new player join the game
                playAudio(NEW_PLAYER_AUDIO);
            });
        }
        else
        {
            console.log("Players remove error");
        }
    });
}

// Stop all functions related to waiting_for_players state
function stop_waiting_for_players(FB_stationPlayer_ref, FB_station_ref){
    FB_stationPlayer_ref.off();
    FB_station_ref.off();
}
//--------------------------------------------------------------------------- Functions for waiting state ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for getready state ---------------------------------------------------------------------------------------------
// Function to toggle getready state qns number icons
function toggle_getready_qns_icons_invisibility(){
    getready_qns1.style.visibility = "visible";
    getready_qns2.style.visibility = "visible";
    getready_qns3.style.visibility = "visible";
    getready_qns4.style.visibility = "visible";
    getready_qns5.style.visibility = "visible";
    getready_qns6.style.visibility = "visible";
    getready_qns7.style.visibility = "visible";
    getready_qns8.style.visibility = "visible";
    getready_qns9.style.visibility = "visible";
    getready_qns10.style.visibility = "visible";
}

// Start all functions related to getready state
function start_get_ready(){
    
    // Local variables
    var stationqnshistory_ref, station_ref;
    
    // Toggle get ready state qns number icons to visible
    toggle_getready_qns_icons_invisibility();
    
    // Retrieve current question
    curr_qns = questionBank[curr_qns_index++];
        
    // Update firebase CURRENT_QUESTION node with one question from question bank
    station_ref = new Firebase(FB_STATION_URL);
    station_ref.once("value", function(){
        var qns_curr_ref = station_ref.child("CURRENT_QUESTION");
        qns_curr_ref.set({
            question_id: curr_qns.question_id,
            answering_duration: curr_qns.answering_duration,
            correct_answer: curr_qns.correct_option,
            option_type: curr_qns.option_type,
            options:{
                option_1: curr_qns.option_1,
                option_2: curr_qns.option_2,
                option_3: curr_qns.option_3,
                option_4: curr_qns.option_4
            },
            question: curr_qns.question_name,
            hint: curr_qns.hint
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
    qns_num_icon = curr_qns_index;
    console.log("Qns index = " + qns_num_icon);
    display_getready_qns_num_icons(qns_num_icon);
    var qns_name = document.getElementById("get_ready_h2_qns_name");
    qns_name.innerHTML = curr_qns.question_name;
    
    // Toggle visibility of option field depending on option type for answering_question state
    if (curr_qns.option_type === "TEXT"){
        // Show text option field
        document.getElementById("answering_option_1_text").style.visibility = "visible";
        document.getElementById("answering_option_2_text").style.visibility = "visible";
        document.getElementById("answering_option_3_text").style.visibility = "visible";
        document.getElementById("answering_option_4_text").style.visibility = "visible";
        // Hide image option field
        document.getElementById("answering_option_1_optionimg").style.visibility = "hidden";
        document.getElementById("answering_option_2_optionimg").style.visibility = "hidden";
        document.getElementById("answering_option_3_optionimg").style.visibility = "hidden";
        document.getElementById("answering_option_4_optionimg").style.visibility = "hidden";
    }
    else if (curr_qns.option_type === "IMAGE"){
        // Show image option field
        document.getElementById("answering_option_1_optionimg").style.visibility = "visible";
        document.getElementById("answering_option_2_optionimg").style.visibility = "visible";
        document.getElementById("answering_option_3_optionimg").style.visibility = "visible";
        document.getElementById("answering_option_4_optionimg").style.visibility = "visible";
        // Hide text option field
        document.getElementById("answering_option_1_text").style.visibility = "hidden";
        document.getElementById("answering_option_2_text").style.visibility = "hidden";
        document.getElementById("answering_option_3_text").style.visibility = "hidden";
        document.getElementById("answering_option_4_text").style.visibility = "hidden";
    }
        
    // Countdown timer of 10 secs for players to read
    get_ready_countdown_10sec_timer();
}

// Function to toggle qns number icon invisibility
function display_getready_qns_num_icons(getready_index){
    getready_index = getready_index - 1;
    switch (getready_index){
        // 0 questions answered, currently reading qns 1
        case 0:
            getready_qns1.src = "img/Qns_1_answered.png";
            getready_qns2.src = "img/Qns_2_not_yet_answered.png";
            getready_qns3.src = "img/Qns_3_not_yet_answered.png";
            getready_qns4.src = "img/Qns_4_not_yet_answered.png";
            getready_qns5.src = "img/Qns_5_not_yet_answered.png";
            getready_qns6.src = "img/Qns_6_not_yet_answered.png";
            getready_qns7.src = "img/Qns_7_not_yet_answered.png";
            getready_qns8.src = "img/Qns_8_not_yet_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 1 question answered, currently reading qns 2
        case 1:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_answered.png";
            getready_qns3.src = "img/Qns_3_not_yet_answered.png";
            getready_qns4.src = "img/Qns_4_not_yet_answered.png";
            getready_qns5.src = "img/Qns_5_not_yet_answered.png";
            getready_qns6.src = "img/Qns_6_not_yet_answered.png";
            getready_qns7.src = "img/Qns_7_not_yet_answered.png";
            getready_qns8.src = "img/Qns_8_not_yet_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
          
        // 2 questions answered, currently reading qns 3
        case 2:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_answered.png";
            getready_qns4.src = "img/Qns_4_not_yet_answered.png";
            getready_qns5.src = "img/Qns_5_not_yet_answered.png";
            getready_qns6.src = "img/Qns_6_not_yet_answered.png";
            getready_qns7.src = "img/Qns_7_not_yet_answered.png";
            getready_qns8.src = "img/Qns_8_not_yet_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 3 questions answered, currently reading qns 4    
        case 3:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_tick.png";
            getready_qns4.src = "img/Qns_4_answered.png";
            getready_qns5.src = "img/Qns_5_not_yet_answered.png";
            getready_qns6.src = "img/Qns_6_not_yet_answered.png";
            getready_qns7.src = "img/Qns_7_not_yet_answered.png";
            getready_qns8.src = "img/Qns_8_not_yet_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 4 questions answered, currently reading qns 5    
        case 4:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_tick.png";
            getready_qns4.src = "img/Qns_4_tick.png";
            getready_qns5.src = "img/Qns_5_answered.png";
            getready_qns6.src = "img/Qns_6_not_yet_answered.png";
            getready_qns7.src = "img/Qns_7_not_yet_answered.png";
            getready_qns8.src = "img/Qns_8_not_yet_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 5 questions answered, currently reading qns 6    
        case 5:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_tick.png";
            getready_qns4.src = "img/Qns_4_tick.png";
            getready_qns5.src = "img/Qns_5_tick.png";
            getready_qns6.src = "img/Qns_6_answered.png";
            getready_qns7.src = "img/Qns_7_not_yet_answered.png";
            getready_qns8.src = "img/Qns_8_not_yet_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 6 questions answered, currently reading qns 7
        case 6:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_tick.png";
            getready_qns4.src = "img/Qns_4_tick.png";
            getready_qns5.src = "img/Qns_5_tick.png";
            getready_qns6.src = "img/Qns_6_tick.png";
            getready_qns7.src = "img/Qns_7_answered.png";
            getready_qns8.src = "img/Qns_8_not_yet_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 7 questions answered, currently reading qns 8
        case 7:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_tick.png";
            getready_qns4.src = "img/Qns_4_tick.png";
            getready_qns5.src = "img/Qns_5_tick.png";
            getready_qns6.src = "img/Qns_6_tick.png";
            getready_qns7.src = "img/Qns_7_tick.png";
            getready_qns8.src = "img/Qns_8_answered.png";
            getready_qns9.src = "img/Qns_9_not_yet_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 8 questions answered, currently reading qns 9
        case 8:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_tick.png";
            getready_qns4.src = "img/Qns_4_tick.png";
            getready_qns5.src = "img/Qns_5_tick.png";
            getready_qns6.src = "img/Qns_6_tick.png";
            getready_qns7.src = "img/Qns_7_tick.png";
            getready_qns8.src = "img/Qns_8_tick.png";
            getready_qns9.src = "img/Qns_9_answered.png";
            getready_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 9 questions answered, currently reading qns 10
        case 9:
            getready_qns1.src = "img/Qns_1_tick.png";
            getready_qns2.src = "img/Qns_2_tick.png";
            getready_qns3.src = "img/Qns_3_tick.png";
            getready_qns4.src = "img/Qns_4_tick.png";
            getready_qns5.src = "img/Qns_5_tick.png";
            getready_qns6.src = "img/Qns_6_tick.png";
            getready_qns7.src = "img/Qns_7_tick.png";
            getready_qns8.src = "img/Qns_8_tick.png";
            getready_qns9.src = "img/Qns_9_tick.png";
            getready_qns10.src = "img/Qns_10_answered.png";
            break;
    }
}
//--------------------------------------------------------------------------- Functions for getready state ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for answering_question state ---------------------------------------------------------------------------------------------
// Function to toggle answering_question state qns number icons
function toggle_answering_qns_icons_visibility(){
    answering_qns1.style.visibility = "visible";
    answering_qns2.style.visibility = "visible";
    answering_qns3.style.visibility = "visible";
    answering_qns4.style.visibility = "visible";
    answering_qns5.style.visibility = "visible";
    answering_qns6.style.visibility = "visible";
    answering_qns7.style.visibility = "visible";
    answering_qns8.style.visibility = "visible";
    answering_qns9.style.visibility = "visible";
    answering_qns10.style.visibility = "visible";
}

// Start all functions related to answering questions state
function start_answering_qns(){
    
    // Local variables
    var posting_time = 0;
    var station_state_ref, station_qns_posttime_ref;
    
    // Toggle answering_question state qns number icons
    toggle_answering_qns_icons_visibility();
    
    // Change state to answering
    station_state_ref = new Firebase(FB_STATION_URL);
    current_state = ANSWERINGQUESTION_STATE;
    station_state_ref.update({
        "state": current_state
    });
    
    // Set current question posting time
    station_qns_posttime_ref = new Firebase(FB_STATIONCURRENTQUESTION_URL);
    posting_time = Firebase.ServerValue.TIMESTAMP;
    station_qns_posttime_ref.child("posting_time").set(posting_time);
    
    // Display current qns number
    qns_num_icon = curr_qns_index;
    console.log("qns index = " + qns_num_icon);
    display_answering_qns_icons(qns_num_icon);
    
    // Reset the number of answers to 0
    document.getElementById("ans_num").innerHTML = "0 answered";
    
    // Display current qns name
    document.getElementById("answering_h2_qns_name").innerHTML = curr_qns.question_name;
    
    // Display hint for current question
    document.getElementById("answering_h3_hint").innerHTML = "Hint: " + curr_qns.hint;            // Use this when hint in CMS has been populated with proper hint
    
    // Display current question options and toggle visibility of option field for answered state
    if (curr_qns.option_type === "TEXT"){
        document.getElementById("answering_option_1_text").innerHTML = curr_qns.option_1;
        document.getElementById("answering_option_2_text").innerHTML = curr_qns.option_2;
        document.getElementById("answering_option_3_text").innerHTML = curr_qns.option_3;
        document.getElementById("answering_option_4_text").innerHTML = curr_qns.option_4;
        
        // Show text option field for answered state
        document.getElementById("answered_option_1_text").style.visibility = "visible";
        document.getElementById("answered_option_2_text").style.visibility = "visible";
        document.getElementById("answered_option_3_text").style.visibility = "visible";
        document.getElementById("answered_option_4_text").style.visibility = "visible";
        
        // Hide image option field for answered state
        document.getElementById("answered_option_1_optionimg").style.visibility = "hidden";
        document.getElementById("answered_option_2_optionimg").style.visibility = "hidden";
        document.getElementById("answered_option_3_optionimg").style.visibility = "hidden";
        document.getElementById("answered_option_4_optionimg").style.visibility = "hidden";
    }
    else if (curr_qns.option_type === "IMAGE"){
        document.getElementById("answering_option_1_optionimg").src = curr_qns.option_1;
        document.getElementById("answering_option_2_optionimg").src = curr_qns.option_2;
        document.getElementById("answering_option_3_optionimg").src = curr_qns.option_3;
        document.getElementById("answering_option_4_optionimg").src = curr_qns.option_4;
        
        // Hide text option field for answered state
        document.getElementById("answered_option_1_text").style.visibility = "hidden";
        document.getElementById("answered_option_2_text").style.visibility = "hidden";
        document.getElementById("answered_option_3_text").style.visibility = "hidden";
        document.getElementById("answered_option_4_text").style.visibility = "hidden";
        
        // Show image option field for answered state
        document.getElementById("answered_option_1_optionimg").style.visibility = "visible";
        document.getElementById("answered_option_2_optionimg").style.visibility = "visible";
        document.getElementById("answered_option_3_optionimg").style.visibility = "visible";
        document.getElementById("answered_option_4_optionimg").style.visibility = "visible";
    }
    
    // Display current question option icons
    document.getElementById("answering_option_1_img").src = optionicon_list[0].icon_url;
    document.getElementById("answering_option_2_img").src = optionicon_list[1].icon_url;
    document.getElementById("answering_option_3_img").src = optionicon_list[2].icon_url;
    document.getElementById("answering_option_4_img").src = optionicon_list[3].icon_url;
    
    // Display options background colour
    document.getElementById("answering_option_1").style.backgroundColor = optionicon_list[0].bgcolor;
    document.getElementById("answering_option_2").style.backgroundColor = optionicon_list[1].bgcolor;
    document.getElementById("answering_option_3").style.backgroundColor = optionicon_list[2].bgcolor;
    document.getElementById("answering_option_4").style.backgroundColor = optionicon_list[3].bgcolor;
    
    update_answers_num();
}

// Function to display answering_question qns number icons
function display_answering_qns_icons(answering_index){
    switch (answering_index){
        // 0 questions answered, currently answering 1st qns
        case 1:
            answering_qns1.src = "img/Qns_1_answered.png";
            answering_qns2.src = "img/Qns_2_not_yet_answered.png";
            answering_qns3.src = "img/Qns_3_not_yet_answered.png";
            answering_qns4.src = "img/Qns_4_not_yet_answered.png";
            answering_qns5.src = "img/Qns_5_not_yet_answered.png";
            answering_qns6.src = "img/Qns_6_not_yet_answered.png";
            answering_qns7.src = "img/Qns_7_not_yet_answered.png";
            answering_qns8.src = "img/Qns_8_not_yet_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 1 question answered, currently answering 2nd qns
        case 2:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_answered.png";
            answering_qns3.src = "img/Qns_3_not_yet_answered.png";
            answering_qns4.src = "img/Qns_4_not_yet_answered.png";
            answering_qns5.src = "img/Qns_5_not_yet_answered.png";
            answering_qns6.src = "img/Qns_6_not_yet_answered.png";
            answering_qns7.src = "img/Qns_7_not_yet_answered.png";
            answering_qns8.src = "img/Qns_8_not_yet_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
          
        // 2 questions answered, currently answering 3rd qns
        case 3:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_answered.png";
            answering_qns4.src = "img/Qns_4_not_yet_answered.png";
            answering_qns5.src = "img/Qns_5_not_yet_answered.png";
            answering_qns6.src = "img/Qns_6_not_yet_answered.png";
            answering_qns7.src = "img/Qns_7_not_yet_answered.png";
            answering_qns8.src = "img/Qns_8_not_yet_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 3 questions answered, currenty answering 4th qns    
        case 4:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_tick.png";
            answering_qns4.src = "img/Qns_4_answered.png";
            answering_qns5.src = "img/Qns_5_not_yet_answered.png";
            answering_qns6.src = "img/Qns_6_not_yet_answered.png";
            answering_qns7.src = "img/Qns_7_not_yet_answered.png";
            answering_qns8.src = "img/Qns_8_not_yet_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 4 questions answered, currently answering 5th qns    
        case 5:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_tick.png";
            answering_qns4.src = "img/Qns_4_tick.png";
            answering_qns5.src = "img/Qns_5_answered.png";
            answering_qns6.src = "img/Qns_6_not_yet_answered.png";
            answering_qns7.src = "img/Qns_7_not_yet_answered.png";
            answering_qns8.src = "img/Qns_8_not_yet_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 5 questions answered, currently answering 6th qns    
        case 6:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_tick.png";
            answering_qns4.src = "img/Qns_4_tick.png";
            answering_qns5.src = "img/Qns_5_tick.png";
            answering_qns6.src = "img/Qns_6_answered.png";
            answering_qns7.src = "img/Qns_7_not_yet_answered.png";
            answering_qns8.src = "img/Qns_8_not_yet_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 6 questions answered, currently answering 7th qns
        case 7:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_tick.png";
            answering_qns4.src = "img/Qns_4_tick.png";
            answering_qns5.src = "img/Qns_5_tick.png";
            answering_qns6.src = "img/Qns_6_tick.png";
            answering_qns7.src = "img/Qns_7_answered.png";
            answering_qns8.src = "img/Qns_8_not_yet_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 7 questions answered, currently answering 8th qns
        case 8:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_tick.png";
            answering_qns4.src = "img/Qns_4_tick.png";
            answering_qns5.src = "img/Qns_5_tick.png";
            answering_qns6.src = "img/Qns_6_tick.png";
            answering_qns7.src = "img/Qns_7_tick.png";
            answering_qns8.src = "img/Qns_8_answered.png";
            answering_qns9.src = "img/Qns_9_not_yet_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 8 questions answered, curerntly answering 9th qns
        case 9:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_tick.png";
            answering_qns4.src = "img/Qns_4_tick.png";
            answering_qns5.src = "img/Qns_5_tick.png";
            answering_qns6.src = "img/Qns_6_tick.png";
            answering_qns7.src = "img/Qns_7_tick.png";
            answering_qns8.src = "img/Qns_8_tick.png";
            answering_qns9.src = "img/Qns_9_answered.png";
            answering_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 9 questions answered, currently answering last qns
        case 10:
            answering_qns1.src = "img/Qns_1_tick.png";
            answering_qns2.src = "img/Qns_2_tick.png";
            answering_qns3.src = "img/Qns_3_tick.png";
            answering_qns4.src = "img/Qns_4_tick.png";
            answering_qns5.src = "img/Qns_5_tick.png";
            answering_qns6.src = "img/Qns_6_tick.png";
            answering_qns7.src = "img/Qns_7_tick.png";
            answering_qns8.src = "img/Qns_8_tick.png";
            answering_qns9.src = "img/Qns_9_tick.png";
            answering_qns10.src = "img/Qns_10_answered.png";
            break;
    }
}

// Function to update number of answers during answering question state 
function update_answers_num(){
    
    // Local variables
    var checked_players = [];
    var answers = 0;
    var stationPlayers_ref;
    
    // Event when player has selected their answer
    stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
    stationPlayers_ref.on("value", function(snapshot){
        var values = snapshot.val();
        
        if(values === null){ return; }
        
        var player_count = Object.keys(values).length;
        console.log("There are " + player_count + " players");
        snapshot.forEach(function(childSnapshot) {
            var value = childSnapshot.val();
            if (value.answer !== undefined & value.answer !== null){
                if (!value.connected){
                    player_count = player_count - 1;
                    return;
                }
                if (checked_players.hasOwnProperty(childSnapshot.key())) return;
                checked_players[childSnapshot.key()] = childSnapshot.key();
                
                // Update number of answers answered by players
                document.getElementById("ans_num").innerHTML = ++answers + " answered";
                
                // Go to answered state if all players have answered
                if (player_count === answers){
                    stop_answering_countdown_20sec_timer(stationPlayers_ref);
                }
            }
        });
    });
    
    // Display 20sec countdown timer
    answering_countdown_20sec_timer(curr_qns.answering_duration, stationPlayers_ref);
}

// Function to update player score
function update_player_score(posting_time){
    
    // Local variables
    var checked_players = [];
    var player_score = 0, player_gained_score = 0, player_count = 0, total_players = 0;
    var total_correct = 0, total_incorrect = 0;
    var stationPlayer_ref, stationPlayers_ref;
    
    // Reset the number of answers to 0
    document.getElementById("ans_num").innerHTML = "0 answers";
    
    // Event when player has selected their answer
    stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
    stationPlayers_ref.once("value", function(snapshot){
        
        if(snapshot.val() === null){ return; 
        }
        
        total_players = Object.keys(snapshot.val()).length;
        snapshot.forEach(function(childSnapshot) {
            console.log("Inside every player");
            var value = childSnapshot.val();
              
            if (checked_players.hasOwnProperty(childSnapshot.key())) return;
            checked_players[childSnapshot.key()] = childSnapshot.key();
            player_count = player_count + 1;
            
            stationPlayer_ref = new Firebase(FB_STATIONPLAYERS_URL + "/" + childSnapshot.key());
            
            // When player has selected an option
            if (value.answer !== undefined & value.answer !== null){
                console.log("answer not null");
                
                if (value.answer === curr_qns.correct_option)
                {
                    console.log("answer correct");
                    stationPlayer_ref.child("is_correct_answer").set(true);
                    if (value.total_correct_answer === null || value.total_correct_answer === undefined) {
                        stationPlayer_ref.child("total_correct_answer").set(1);
                        total_correct = total_correct + 1;
                    }
                    else{
                        stationPlayer_ref.child("total_correct_answer").set(++value.total_correct_answer);
                        total_correct = total_correct + 1;
                    }
                    
                    // Calculate score for player for current question and update Firebase
                    player_gained_score = (1 - ((parseInt(value.answering_time) - parseInt(posting_time)) / parseInt(curr_qns.answering_duration * 1000))) * 1000;
                    if(player_gained_score < 0){
                            player_gained_score = 10;
                    }
                    stationPlayer_ref.child("score_gained").set(parseInt(player_gained_score));
                    player_score = parseInt(value.score);
                    stationPlayer_ref.child("score").set(parseInt(player_score + player_gained_score));
                }
                // Update is_correct_answer to false when it is not the correct option
                else
                {
                    console.log("answer incorrect");
                    stationPlayer_ref.child("is_correct_answer").set(false);
                    stationPlayer_ref.child("total_incorrect_answer").set(++value.total_incorrect_answer);
                    stationPlayer_ref.child("score_gained").set(0);
                    total_incorrect = total_incorrect + 1;
                }
            }
            // When player has not selected an option
            else
            {
                console.log("answer null");
                stationPlayer_ref.child("is_correct_answer").set(false);
                if (value.total_correct_answer === null || value.total_correct_answer === undefined) {
                    stationPlayer_ref.child("total_incorrect_answer").set(1);
                    total_incorrect = total_incorrect + 1;
                }
                else{
                    stationPlayer_ref.child("total_incorrect_answer").set(++value.total_incorrect_answer);
                    total_incorrect = total_incorrect + 1;
                }
                stationPlayer_ref.child("score_gained").set(0);
            }
            
            if (player_count === total_players){
                console.log("state changed");
                // Clear display of <div id="getready">
                document.getElementById("answering_questions").style.display = "none";
                
                // Hide all the ticks for answered when state = answering_question
                document.getElementById("answered_option_1_tick").style.visibility = "hidden";
                document.getElementById("answered_option_2_tick").style.visibility = "hidden";
                document.getElementById("answered_option_3_tick").style.visibility = "hidden";
                document.getElementById("answered_option_4_tick").style.visibility = "hidden";

                // Make display of <div id="answering_questions"> visible
                document.getElementById("answered").style.display = "block";
                
                console.log("Before answering_question state");
                
                // Update question history node with number of correct and incorrect answers of current question
                update_question_history(total_correct, total_incorrect);
                
                // Call function for answered state
                start_answered();
            }
        });
        
    });
}

// Function to update question history node with the number of correct and incorrect answers of current question
function update_question_history(correct, incorrect){
    var stationqnshistory_correct_ref = new Firebase(FB_STATIONQUESTIONHISTORY_URL + "/" + curr_qns.question_id);
    stationqnshistory_correct_ref.once("value", function(snapshot){
        var value = snapshot.val();
        stationqnshistory_correct_ref.child("total_correct_answer").set(value.total_correct_answer + correct);
        stationqnshistory_correct_ref.child("total_incorrect_answer").set(value.total_incorrect_answer + incorrect);
    });
    
    
}

// Stop all functions related to answering questions state
function stop_answering_qns(Players_ref){
    Players_ref.off();
}
//--------------------------------------------------------------------------- Functions for answering_question state ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for answered state ---------------------------------------------------------------------------------------------
// Function to toggle invisibility for answered state qns number icons
function toggle_answered_qns_icons_visibility(){
    answered_qns1.style.visibility = "visible";
    answered_qns2.style.visibility = "visible";
    answered_qns3.style.visibility = "visible";
    answered_qns4.style.visibility = "visible";
    answered_qns5.style.visibility = "visible";
    answered_qns6.style.visibility = "visible";
    answered_qns7.style.visibility = "visible";
    answered_qns8.style.visibility = "visible";
    answered_qns9.style.visibility = "visible";
    answered_qns10.style.visibility = "visible";
}

// Start all functions related to answered state
function start_answered(){
    console.log("In Answering_question state");
    
    // Local variable
    var curr_option1_stats = 0;
    var curr_option2_stats = 0;
    var curr_option3_stats = 0;
    var curr_option4_stats = 0;
    var stationPlayers_ref, stationCurrentQns_ref, station_state_ref;
    
    // Toggle answered state qns number icons visiblity
    toggle_answered_qns_icons_visibility();
    
    // Change station state to answered
    station_state_ref = new Firebase(FB_STATION_URL);
    current_state = ANSWERED_STATE;
    station_state_ref.update({
        "state": current_state 
    });
    
    // Display current qns number
    qns_num_icon = curr_qns_index;
    console.log("qns index = " + qns_num_icon);
    display_answered_qns_icons(qns_num_icon);
    
    // Display option field depending on option type for answered state
    if (curr_qns.option_type === "TEXT"){
        document.getElementById("answered_option_1_text").innerHTML = curr_qns.option_1;
        document.getElementById("answered_option_2_text").innerHTML = curr_qns.option_2;
        document.getElementById("answered_option_3_text").innerHTML = curr_qns.option_3;
        document.getElementById("answered_option_4_text").innerHTML = curr_qns.option_4;
    }
    else if (curr_qns.option_type === "IMAGE"){
        document.getElementById("answered_option_1_optionimg").src = curr_qns.option_1;
        document.getElementById("answered_option_2_optionimg").src = curr_qns.option_2;
        document.getElementById("answered_option_3_optionimg").src = curr_qns.option_3;
        document.getElementById("answered_option_4_optionimg").src = curr_qns.option_4;
    }
    
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
    stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
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
            document.getElementById("answered_option_1_stats").innerHTML = curr_option1_stats + " answered";
            document.getElementById("answered_option_2_stats").innerHTML = curr_option2_stats + " answered";
            document.getElementById("answered_option_3_stats").innerHTML = curr_option3_stats + " answered";
            document.getElementById("answered_option_4_stats").innerHTML = curr_option4_stats + " answered";
        });
    });
    
    // Display correct answer with a tick beside the correct option
    stationCurrentQns_ref = new Firebase(FB_STATIONCURRENTQUESTION_URL);
    stationCurrentQns_ref.once("value", function(snapshot){
        var value = snapshot.val();
        if (value.correct_answer === "option_1"){
            document.getElementById("answered_option_1_tick").style.visibility = "visible";
        }
        else if (value.correct_answer === "option_2"){
            document.getElementById("answered_option_2_tick").style.visibility = "visible";
        }
        else if (value.correct_answer === "option_3"){
            document.getElementById("answered_option_3_tick").style.visibility = "visible";
        }
        else if (value.correct_answer === "option_4"){
            document.getElementById("answered_option_4_tick").style.visibility = "visible";
        }
    });
    
    // Display 10 second countdown timer before changing to next state
    answered_countdown_10sec_timer();
}

// Stop all functions related to answered state
function stop_answered(){}

// Function to display answered state qns number icons
function display_answered_qns_icons(answered_index){
    switch (answered_index){
        // 1 qns answered
        case 1:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_not_yet_answered.png";
            answered_qns3.src = "img/Qns_3_not_yet_answered.png";
            answered_qns4.src = "img/Qns_4_not_yet_answered.png";
            answered_qns5.src = "img/Qns_5_not_yet_answered.png";
            answered_qns6.src = "img/Qns_6_not_yet_answered.png";
            answered_qns7.src = "img/Qns_7_not_yet_answered.png";
            answered_qns8.src = "img/Qns_8_not_yet_answered.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 2 qns answered
        case 2:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_not_yet_answered.png";
            answered_qns4.src = "img/Qns_4_not_yet_answered.png";
            answered_qns5.src = "img/Qns_5_not_yet_answered.png";
            answered_qns6.src = "img/Qns_6_not_yet_answered.png";
            answered_qns7.src = "img/Qns_7_not_yet_answered.png";
            answered_qns8.src = "img/Qns_8_not_yet_answered.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
          
        // 3 qns answered
        case 3:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_not_yet_answered.png";
            answered_qns5.src = "img/Qns_5_not_yet_answered.png";
            answered_qns6.src = "img/Qns_6_not_yet_answered.png";
            answered_qns7.src = "img/Qns_7_not_yet_answered.png";
            answered_qns8.src = "img/Qns_8_not_yet_answered.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 4 qns answered
        case 4:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_tick.png";
            answered_qns5.src = "img/Qns_5_not_yet_answered.png";
            answered_qns6.src = "img/Qns_6_not_yet_answered.png";
            answered_qns7.src = "img/Qns_7_not_yet_answered.png";
            answered_qns8.src = "img/Qns_8_not_yet_answered.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 5 qns answered
        case 5:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_tick.png";
            answered_qns5.src = "img/Qns_5_tick.png";
            answered_qns6.src = "img/Qns_6_not_yet_answered.png";
            answered_qns7.src = "img/Qns_7_not_yet_answered.png";
            answered_qns8.src = "img/Qns_8_not_yet_answered.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 6 qns answered
        case 6:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_tick.png";
            answered_qns5.src = "img/Qns_5_tick.png";
            answered_qns6.src = "img/Qns_6_tick.png";
            answered_qns7.src = "img/Qns_7_not_yet_answered.png";
            answered_qns8.src = "img/Qns_8_not_yet_answered.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 7 qns answered
        case 7:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_tick.png";
            answered_qns5.src = "img/Qns_5_tick.png";
            answered_qns6.src = "img/Qns_6_tick.png";
            answered_qns7.src = "img/Qns_7_tick.png";
            answered_qns8.src = "img/Qns_8_not_yet_answered.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 8 qns answered
        case 8:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_tick.png";
            answered_qns5.src = "img/Qns_5_tick.png";
            answered_qns6.src = "img/Qns_6_tick.png";
            answered_qns7.src = "img/Qns_7_tick.png";
            answered_qns8.src = "img/Qns_8_tick.png";
            answered_qns9.src = "img/Qns_9_not_yet_answered.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // 9 qns answered
        case 9:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_tick.png";
            answered_qns5.src = "img/Qns_5_tick.png";
            answered_qns6.src = "img/Qns_6_tick.png";
            answered_qns7.src = "img/Qns_7_tick.png";
            answered_qns8.src = "img/Qns_8_tick.png";
            answered_qns9.src = "img/Qns_9_tick.png";
            answered_qns10.src = "img/Qns_10_not_yet_answered.png";
            break;
            
        // All qns answered
        case 10:
            answered_qns1.src = "img/Qns_1_tick.png";
            answered_qns2.src = "img/Qns_2_tick.png";
            answered_qns3.src = "img/Qns_3_tick.png";
            answered_qns4.src = "img/Qns_4_tick.png";
            answered_qns5.src = "img/Qns_5_tick.png";
            answered_qns6.src = "img/Qns_6_tick.png";
            answered_qns7.src = "img/Qns_7_tick.png";
            answered_qns8.src = "img/Qns_8_tick.png";
            answered_qns9.src = "img/Qns_9_tick.png";
            answered_qns10.src = "img/Qns_10_tick.png";
            break;
    }
}
//--------------------------------------------------------------------------- Functions for answered state ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for leaderboard state ---------------------------------------------------------------------------------------------
// Start all functions related to leaderboard state
function start_leaderboard(){
    
    // Local variable
    var all_scores = [];
    var station_state_ref, stationPlayers_ref;
        
    // Change station state to gameover
    station_state_ref = new Firebase(FB_STATION_URL);
    current_state = LEADERBOARD_STATE;
    station_state_ref.update({
        "state": current_state 
    });
    
    // Retrieve all player scores
    stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
    stationPlayers_ref.orderByChild("score").limitToLast(5).once("value", function(All_Players_Snapshot){
        All_Players_Snapshot.forEach(function(Player_Snapshot){
            var value = Player_Snapshot.val();
            if (!value.connected) return;
            var score = {icon_url: value.icon_url, nickname: value.nickname, score: value.score};
            all_scores.push(score);
        });
        
        // Sort the array of player's score based on descending order
        bubbleSort(all_scores, 'score');
        
        console.log("Before displaying nickname, icons and score");
        for(var count = 0; count < all_scores.length; count++)
        {
            console.log("After displaying nickname, icons and score");
            document.getElementById("leaderboard_nickname_container" + (count+1)).style.visibility = "visible";
            document.getElementById("leaderboard_player_icon" + (count+1)).style.visibility = "visible";
            document.getElementById("h2_leaderboard_nickname" + (count+1)).style.visibility = "visible";
            document.getElementById("leaderboard_points" + (count+1)).style.visibility = "visible";
            document.getElementById("leaderboard_player_icon" + (count+1)).src = all_scores[count].icon_url;
            document.getElementById("h2_leaderboard_nickname" + (count+1)).innerHTML = all_scores[count].nickname;
            document.getElementById("leaderboard_points" + (count+1)).innerHTML = all_scores[count].score + " points";
        }
    });
    
    // Call 10 second countdown timer function for leaderboard state
    leaderboard_countdown_10sec_timer(stationPlayers_ref);
}

// Stop all functions related to leaderboard state
function stop_leaderboard(Players_ref){
    Players_ref.off();
}
//--------------------------------------------------------------------------- Functions for leaderboard state ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for both leaderboard and gameover states ---------------------------------------------------------------------------------------------
// Function to sort player's score in descending order using bubble sort
function bubbleSort(a, par)
{
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < a.length-1; i++) {
            if (a[i][par] < a[i+1][par]) {
                var temp = a[i];
                a[i] = a[i+1];
                a[i+1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
}
//--------------------------------------------------------------------------- Functions for both leaderboard and gameover states ---------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------- Functions for gameover states ---------------------------------------------------------------------------------------------
// Start all functions related to game over state
function start_game_over(){
    
    if (station_monitor_players_ref !== null){
        station_monitor_players_ref.off();
    }
    
    // Local variable
    var all_scores = [];
    var leaderboard_scores = [];
    var station_state_ref, stationPlayers_ref,stationleaderboard_ref;
    
    // Retrieve all player scores
    stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
    stationPlayers_ref.orderByChild("score").once("value", function(All_Players_Snapshot){
        All_Players_Snapshot.forEach(function(Player_Snapshot){
            var value = Player_Snapshot.val();
            console.log("Value = " + Player_Snapshot.val());
            var score = {icon_url: value.icon_url, nickname: value.nickname, score: value.score};
            all_scores.push(score);
            console.log("Score = " + all_scores);
        });
        
        // Sort the array of player's score based on descending order
        bubbleSort(all_scores, 'score');
        
        // Display top scorer nickname and score
        document.getElementById("gameover_player_icon").src = all_scores[0].icon_url;
        document.getElementById("h2_game_over_nickname").innerHTML = all_scores[0].nickname;
        document.getElementById("game_over_points").innerHTML = all_scores[0].score + " points";
        
        stationleaderboard_ref = new Firebase(FB_STATIONLEADERBOARD_URL);
        stationleaderboard_ref.orderByChild("score").limitToLast(4).once("value", function(All_Players_Snapshot){
            All_Players_Snapshot.forEach(function(Player_Snapshot){
                var value = Player_Snapshot.val();
                console.log("Value = " + Player_Snapshot.val());
                var score = {icon_url: value.icon_url, nickname: value.nickname, score: value.score};
                leaderboard_scores.push(score);
                console.log("Score = " + leaderboard_scores);
        });
        
            // Sort the array of player's score based on descending order
            bubbleSort(leaderboard_scores, 'score');
            
            for(var count = 0; count < leaderboard_scores.length; count++){
                console.log("After displaying nickname, icons and score");
                document.getElementById("gameover_nickname_container" + (count+1)).style.visibility = "visible";
                document.getElementById("gameover_player_icon" + (count+1)).style.visibility = "visible";
                document.getElementById("h2_gameover_nickname" + (count+1)).style.visibility = "visible";
                document.getElementById("gameover_points" + (count+1)).style.visibility = "visible";
                document.getElementById("gameover_rank_icon" + (count+1)).style.visibility = "visible";
                document.getElementById("gameover_player_icon" + (count+1)).src = leaderboard_scores[count].icon_url;
                document.getElementById("h2_gameover_nickname" + (count+1)).innerHTML = leaderboard_scores[count].nickname;
                document.getElementById("gameover_points" + (count+1)).innerHTML = leaderboard_scores[count].score + " points";
            }
            
            // Change station state to gameover
            station_state_ref = new Firebase(FB_STATION_URL);
            current_state = GAMEOVER_STATE;
            station_state_ref.update({
                "state": current_state 
            });
        });
    });
    
    
    // Play music for gameover state
    pauseAllAudios();
    playAudio(GAME_OVER_AUDIO);
    
    // Call countdown timer function
    game_over_countdown_10sec_timer(stationPlayers_ref);
}

// Stop all functions related to game over state
function stop_game_over(Players_ref){
    Players_ref.off();
}

// Function to update leaderboard node for all players
function update_leaderboard_of_the_day(){
    var stationPlayers_ref = new Firebase(FB_STATIONPLAYERS_URL);
    stationPlayers_ref.once("value", function(AllPlayerSnapshot){
        AllPlayerSnapshot.forEach(function(PlayerSnapshot){
            var value = PlayerSnapshot.val();
            
            if (value.connected === true){
                var stationUser_score = new Firebase(FB_STATIONLEADERBOARD_URL).child(PlayerSnapshot.key());
                stationUser_score.once("value", function(snapshot){
                    var previous_player = snapshot.val();
                    // Store player details into leaderboard if player does not exist in leaderboard node
                    if (previous_player === null || previous_player === undefined) {
                        stationUser_score.set({
                            icon_url: value.icon_url,
                            nickname: value.nickname,
                            score: value.score
                        });
                    }
                    // Player exist in leadeboard, compare score with players in player node and update if lesser
                    else{
                        var current_high_score = value.score;
                        if (current_high_score < previous_player.score){
                            current_high_score = previous_player.score;
                        }
                        stationUser_score.child("score").set(current_high_score);
                    }
                });
            }
        });
        
        start_game_over();
    });
}
//--------------------------------------------------------------------------- Functions for gameover states ---------------------------------------------------------------------------------------------