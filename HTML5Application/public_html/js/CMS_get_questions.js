/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
        

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
    

