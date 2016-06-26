/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Function to get time left in countdown timer
function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    return {
      'total': t,
      'seconds': seconds
    };
}

// Function to display the countdown timer
function initializeClock(id, endtime) {
    var clock = document.getElementById(id);
    var secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
      var t = getTimeRemaining(endtime);

      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

        if (t.seconds <= 0) {
              //clearInterval(timeinterval);
              console.log(window.location.pathname);
              var url_array = [];
              url_array = window.location.pathname.split("/");
              console.log(url_array);
              var new_url = "http://localhost:8383//" + url_array[1] + "/Questions.html";
              console.log(new_url);
              window.location.assign = new_url;
        }
    }

    updateClock();
    
    // Update seconds in countdown timer every second
    var timeinterval = setInterval(updateClock, 1000);
}

// Decode url to obtain station name
function decode_url(){
    // Decode url to get station name
    var search_query = window.location.search;
    var station = [];
    station = search_query.split('=');
    var station_name = station[1];
    window.onload = function(){
        document.getElementById("stn_name").innerHTML = station_name;
    };
    return station_name;
}

// Display countdown timer only when state = starting
var station_name = decode_url();
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + station_name + "/state");
    ref.on("value", function(snapshot) {
        var values = snapshot.val();
        if (values.toString() === "starting"){
            var deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);
            initializeClock('clockdiv', deadline);
        }
    });