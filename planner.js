// index.js

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io');
var util = require('util');
var formidable = require("formidable");
var fs = require('fs');
var mysql = require("mysql");

app.use(express.static(__dirname + '/home/pi/www'));  
console.log(__dirname);

app.get('/', function(req, res) {
    console.log("Request cookie "+req.headers.cookie);
    checkCookie(req.headers.cookie, function(result){
        if (result == "Success"){
            res.sendFile(__dirname + '/planner.html');
        } else {
            res.sendFile(__dirname + '/loginpage.html');
    }
    });
});
//app.get('/planner', function(req, res) {
//    res.sendFile(__dirname + '/planner.html');
//});
//app.get('/timetable', function(req, res) {
//    res.sendFile(__dirname + '/planner.html');
//});

app.post('/login', function(req, res) {
	console.log("in POST in login");
    var sessionid = genSession();
    processTheForm("login",req, res,sessionid,function(result,uName,sessionid){
        console.log(result);
        if (result == "Success"){
            // generate & store the session ID
            res.sendFile(__dirname + '/planner.html');
            res.cookie('Session', sessionid);
              // To Write a Cookie
        } else{
            res.sendFile(__dirname + '/loginFail.html');
        }

    });
});

app.post('/newEvent', function(req, res) {
	console.log("in POST in newEvent");
    //var result;
    var sessionid;
    extractSessionfromCookie(req.headers.cookie, function(sessionID){
        sessionid = sessionID;
    });
	processTheForm("newEvent",req, res, sessionid,function(userEvents){
        console.log(userEvents);
        console.log("Return from the newEvent");

        // Now go and get the latest events from the DB and populate the table

        //res.sendFile(__dirname + '/planner.html');
        var data = [["Times", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                ["0600", "", "", "", "", "", "", ""],
                ["0700", "", "", "", "", "", "", ""],
                ["0800", "", "", "", "", "", "", ""],
                ["0900", "", "", "", "", "", "", ""],
                ["1000", "", "", "", "", "", "", ""],
                ["1100", "", "", "", "", "", "", ""],
                ["1200", "", "", "", "", "", "", ""]];
        
        var maxRows = 8;
        var maxCols = 8;
        var myTable = 'var data = [';
        for (var i = 0; i < maxRows; i++) {
           //iterate through rows
           //rows would be accessed using the "row" variable assigned in the for loop
           for (var j = 0; j < maxCols; j++) {
             //iterate through columns
             if (i > 0 && j > 0){
                data[i][j] = "FREE";   
             }
             if (j == 0){
                myTable = myTable + '[';
                myTable = myTable + '"' + data[i][j] + '"';
             } else {
                myTable = myTable + ',' + '"' + data[i][j] + '"';
             }
           }
            if (i != maxRows-1){
                myTable = myTable + '],';
            }
        }
        myTable = myTable + ']];';
        for (ev = 0; ev < userEvents.length; ev++){
            console.log(userEvents[ev].event_day);
        }

        pageTop(myTable,function(toppageData){
            pageBottom(myTable,function(bottompageData){
                res.write(toppageData + myTable + bottompageData);
                res.end();
            });
        });
    });    
});

function pageTop(tableD,callback){
    fs = require('fs')
    fs.readFile('/home/pi/www/plannerTop.html', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      callback(data,tableD);
    }); 
}

function pageBottom(tableD,callback){
    fs = require('fs')
    fs.readFile('/home/pi/www/plannerBottom.html', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      callback(data,tableD);
    }); 
}

app.post('/register', function(req, res) {
	console.log("in POST register");
	   processTheForm("register",req, res, sessionid,function(result,uName){
        console.log(result);
        if (result == "Success"){
            res.sendFile(__dirname + '/planner.html');
            res.cookie('Session', sessionid);
              // To Write a Cookie
        } else{
            res.sendFile(__dirname + '/registeredFail.html');
        }

    });
});

function extractSessionfromCookie(cookie,callback){
    var mySession = -999999;
    var patt = /[^"Session="](.+)?/g;
    var res = patt.exec(cookie);
    if (res != ""){
        console.log(res[0]);
        if (res[0] != ""){mySession = res[0];}
    }
    callback(mySession);
}


function checkCookie(cookie,callback){

    var con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "Steve",
                database: "Users"
    });
    var mySession = -999999;
    var patt = /[^"Session="](.+)?/g;
    var res = patt.exec(cookie);
    if (res != ""){
        console.log(res[0]);
        if (res[0] != ""){mySession = res[0];}
    }

    var queryString = 'SELECT sessionid FROM sessions';
 
    con.query(queryString, function(err, rows, dbfields) {
        var result = "Failure";
        if (err) throw err;

        var nameMatch = false;
     
        for (var i in rows) {
            console.log(rows[i]);
            if (mySession == rows[i].sessionid){
                        console.log("Cookie match");
                        result = "Success";
            } else {
                        console.log("No cookie match");
                        result = "Failure";
            }
        }
        callback(result);
    });
}

function genSession(){

    var sessionID = Math.floor((Math.random() * 100000000) + 1);

    return sessionID;
}


function processTheForm(myAction,req, res,sessionid,callback) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, formfields, files) {

// REGISTER ********************************************
       if (myAction == "register"){
            register(myAction,req, res,sessionid,callback,formfields);
        }
// REGISTER ************************************************************

// LOGIN ***************************************************************
        if (myAction == "login"){
            login(myAction,req, res,sessionid,callback,formfields);
        }
// LOGIN ***************************************************************

// EVENT ***************************************************************
        if (myAction == "newEvent"){
            console.log("Proces the form for an event")
            event(myAction,req, res,sessionid,callback,formfields);
        }
// EVENT ***************************************************************

    }); // form.parse
} // processTheForm

function event(myAction,req, res,sessionid,callback,formfields){

    console.log("In login newEvent "+formfields);

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Steve",
        database: "Users"
    });

    var queryString = 'SELECT user_id FROM sessions WHERE sessionid = '+sessionid;
    con.query(queryString, function(err, rows, dbfields) {
        var result = "Failure";
        if (err) throw err;
        var userID = rows[0].user_id;

        var myevent = { start_time: formfields.startTime, end_time: formfields.endTime, color: formfields.favcolor, description: formfields.eventText, user_id: userID ,event_day: formfields.day };
        console.log(myevent);
        queryString = 'INSERT INTO events SET ?'
        con.query(queryString, myevent, function(err,res){
            queryString = 'SELECT * FROM events WHERE user_id = '+userID;
            con.query(queryString, function(err, rows, dbfields) {
                var result = "Failure";
                if (err) throw err;
                var userEvents = rows;

                callback(userEvents);
            }); // con.query 3
        }); // con.query 2
    }); // con.query 1
} // event


function login(myAction,req, res,sessionid,callback,formfields){

console.log("In login section");

            var con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "Steve",
                database: "Users"
            });

            var uName = "";

            var queryString = 'SELECT username,password FROM user';
 
            con.query(queryString, function(err, rows, dbfields) {
                var result = "Failure";
                if (err) throw err;

                var userMatch = false;
     
                for (var i in rows) {
                    console.log('usernames: ', rows[i]);
                    if (formfields.usrname == rows[i].username && formfields.psw == rows[i].password){
                        console.log("Authenticated User");
                        userMatch = true;
                        result = "Success";
                        uName = formfields.usrname;
                    } else {
                        console.log("UNauthenticated User");
                        
                    }

                }
                if (!userMatch){
                    callback(result,uName,sessionid);
                }

                if (userMatch) {

                    // check to see if session exists for user
                    // if one doesnt we can create one. If it does we need to use that and pass it back
                    // for the cookie creation.

                        var queryString = 'SELECT user_id FROM user WHERE username = '+'"'+formfields.usrname+'"';

                        console.log(queryString);        
     
                        con.query(queryString, function(err, rows, dbfields) {
                            var result = "Failure";
                            if (err) throw err;

                            var queryString = 'SELECT sessionid FROM sessions WHERE user_id = '+rows[0].user_id;
                            console.log("query for login:"+queryString);

                            var userID = rows[0].user_id;

                            con.query(queryString, function(err, rows2, dbfields) {
                                var result = "Failure";
                                if (err) throw err;

                                console.log(rows2);

                                if (rows2.length > 0){

                                    var result = "Success"

                                    // we need to use the existing session id
                                    sessionid = rows2[0].sessionid;

                                    con.end(function(err) {
                                    // The connection is terminated gracefully
                                    // Ensures all previously enqueued queries are still
                                    // before sending a COM_QUIT packet to the MySQL server.
                                    });

                                    callback(result,uName,sessionid);

                                } else {

                                    var result = "Success"

                                    var mySession = { sessionid: sessionid, user_id: userID };

                                    con.query('INSERT INTO sessions SET ?', mySession, function(err,res){
                                        if(err) throw err;

                                            console.log("Session created");

                                            console.log('Last insert ID:', res.insertId);

                                            con.end(function(err) {
                                          // The connection is terminated gracefully
                                          // Ensures all previously enqueued queries are still
                                          // before sending a COM_QUIT packet to the MySQL server.
                                            });

                                            //callback(result,uName);
                                            callback(result,uName,sessionid);

                                    });
                                    
                                }

                        });

                });

        }

    }); //con.query(queryString, function(err, rows, dbfields)


}


function register(myAction,req, res,sessionid,callback,formfields){

            var con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "Steve",
                database: "Users"
            });

            var uName = "";

            con.connect(function(err){
            if(err){
                console.log('Error connecting to Db');
            return;
            }
                console.log('Connection established');
            });

            var queryString = 'SELECT username FROM user';
 
            con.query(queryString, function(err, rows, dbfields) {
                var result = "Failure";
                if (err) throw err;

                var nameMatch = false;
     
                for (var i in rows) {
                    console.log('usernames: ', rows[i]);
                    if (formfields.usrname == rows[i].username){
                        console.log("User not allowed");
                        nameMatch = true;
                    } else {
                        console.log("User allowed");
                        result = "Success";
                        uName = formfields.usrname;
                    }
                }

                if (!nameMatch){
                    var myUser = { username: formfields.usrname, password: formfields.psw };

                    con.query('INSERT INTO user SET ?', myUser, function(err,res){
                        if(err) throw err;

                        console.log('Last insert ID:', res.insertId);


                        var queryString = 'SELECT user_id FROM user WHERE username = '+'"'+formfields.usrname+'"';

                        console.log(queryString);        
     
                        con.query(queryString, function(err, rows, dbfields) {
                            var result = "Failure";
                            if (err) throw err;

                            var mySession = { sessionid: sessionid, user_id: rows[0].user_id };

                            con.query('INSERT INTO sessions SET ?', mySession, function(err,res){
                                if(err) throw err;

                                    console.log("Session created");

                                    console.log('Last insert ID:', res.insertId);

                                    con.end(function(err) {
                                  // The connection is terminated gracefully
                                  // Ensures all previously enqueued queries are still
                                  // before sending a COM_QUIT packet to the MySQL server.
                                    });
                                
                            });

                        });

                            callback(result,uName);
                        
                    });


                } else {
                    console.log("failed registration");
                    callback(result,uName);

                }

            });


}

server.listen(23456);

console.log("Starting");

