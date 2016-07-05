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
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/HH_" + station_name);

// When state changed to starting then display countdown timer
ref.on("child_changed", function(snapshot) {

    console.log("State changed to - " + snapshot.val());

    // Set duration of the countdown timer
    var deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);

    // Initialize the timer
    initializeTimer('clockdiv', deadline);

    // Function to get time left in countdown timer
    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        return {
          'seconds': seconds
        };
    }

    // Function to display the clock
    function initializeTimer(id, endtime) {
        var clock = document.getElementById(id);
        var secondsSpan = clock.querySelector('.seconds');

        // Function to update the value inside the countdown timer
        function updateClock() {
            var t = getTimeRemaining(endtime);

            secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

            // Redirect to <div id="get_ready"> when countdown timer
            // hits 0 and state = "starting"
            if (t.seconds <= 0) {
                ref = new Firebase(FB_stationState_url);
                ref.on("value", function(snapshot) {
                    var values = snapshot.val();
                    if (values.toString() === "starting"){
                        // Clear display of <div id="waiting_for_players">
                        document.getElementById("waiting_for_players").style.display = "none";

                        // Make display of <div id="get_ready"> visible
                        document.getElementById("get_ready").style.display = "block";
                    }
                    clearInterval(timeinterval);
                });
            }
        }

        // Update the countdown timer every second
        var timeinterval = setInterval(updateClock, 1000);
    }
});