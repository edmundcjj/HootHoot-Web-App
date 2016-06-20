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
console.log(station_name);
window.onload = function(){
    document.getElementById("stn_name").innerHTML = station_name;
};

// Retrieve player names of specific station
var ref = new Firebase("https://mantrodev.firebaseio.com/STATIONS/" + station_name);

