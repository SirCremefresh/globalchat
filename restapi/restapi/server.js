var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' | WEBSOCKET | Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(61910, function() {
    console.log((new Date()) + ' | WEBSOCKET | Server is listening on port 61910');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

/*
 *    VARIABLES
 */
var all_active_connections = {};
var global_counter = 0;
var online_users = 0;


/*
 *    OPEN DATABASE CONNECTION
 */
var mysql = require('mysql');
var sqlconnection = mysql.createConnection({
  host     : 'mysql22.webland.ch',
  user     : 'd041e_donatow',
  password : '123_Ftp!',
  database : 'd041e_donatow'
});
sqlconnection.connect(function(err) {
  if (err) {
    console.error((new Date()) + ' | MYSQL | Connection error: ' + err.stack);
    return;
  }

  console.log((new Date()) + ' | MYSQL | Connection successful with threadID: ' + sqlconnection.threadId);
});


/*
 *    START WEBSOCKET APPLICATION
 */
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' | WEBSOCKET | Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    /*
     *    ON SUCCESSFULL CONNECTION
     */
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' | WEBSOCKET | Connection accepted from: ' + connection.remoteAddress);

      /*   MAKE USER VARIABLES */
        // THE SESSION-ID IS RETURNED TO THE USER AND IS SAVED TO THE DATABASE
        // IT IS USED TO DISPLAY THE MESSAGES ON THE RIGHT SIDE OF CHAT
        var session_id = Math.floor(Math.random() * 10000000);

        // THE ID IS ONLY SERVER-SIDE USED FOR IDENTIFYING THE USER, ADDING
        // HIM TO THE LIST OF ALL USERS AND REMOVING HIM
        var id = global_counter++;

        // ADD USER TO ALL-USERS
        all_active_connections[id] = connection;

      /*   SEND THE SESSION-ID TO THE USER */
        // MAKE A OBJECT WITH THINGS TO RETURN
        var returnToUser = {"type" : "sessionid", "sessionid" : session_id};

        // JSON-STRINGIFY AND SEND TO USER
        connection.sendUTF(JSON.stringify(returnToUser));

      /*   MAKE DATABASE ENTRY */
        // MAKE A DATABASE ENTRY WITH THE USER-IP, SESSION-ID AND THE ACTION
        // IN THIS CASE THE ACTION IS CONNECT, WHICH IS CALLED ON A NEW USER CONNECTION
        sqlconnection.query('INSERT INTO useractivity ( sessionid, userip, action) VALUES (?,?,?)',[session_id, connection.remoteAddress, "connect"], function(err, results) {

          if (err) {
            console.error((new Date()) + ' | MYSQL | Writing to database error: ' + err.stack);
            return;
          }

          console.log((new Date()) + ' | MYSQL | Logged new connection successfully to database! UserIP:' + connection.remoteAddress);
        });

      /*    SEND LATEST 20 MESSAGES */
        //  LOAD THE MESSAGES FROM THE DATABASE AND PUT INTO OBJECTS WHICH ARE JSON STRINGIFYED AND RETURNED
        var messages = {};
        sqlconnection.query('SELECT id, message FROM message WHERE id BETWEEN (SELECT MAX( id ) - 20 FROM message) AND (SELECT MAX( id ) FROM message)', function(err, rows) {
            if (err) throw err;
            for(var i = 0; i < rows.length; i++) {
              messages[rows[i].id] = {'content': rows[i].message, 'sessionid': session_id};
            }
            var messageToReturn = {'type': "messagepacket",'messages': messages};
            connection.send(JSON.stringify(messageToReturn));
        });



    /*
     *    ON RECIVE MESSAGE
     */
    connection.on('message', function(message) {

          if (message.type === 'utf8') {

               var data = JSON.parse(message.utf8Data);
               // VALIDATE THE MESSAGE
               if(!(typeof data.content === 'undefined' || data.content == null)) {
                 if(!(data.content.toString() == "")) {
                     if(unescape(encodeURIComponent(data.content)).length <= 200) {

                       /* SEND THE MESSAGE TO ALL CONNECTED CLIENTS */
                       for(var i = 0; i < Object.keys(all_active_connections).length; i++) {
                         var currentconn = all_active_connections[i];

                         if(currentconn != null) {
                           console.log(message.utf8Data);
                           currentconn.sendUTF(message.utf8Data);
                         }
                     }

                     /* MAKE DATABASE ENTRY WITH MESSAGE */
                     sqlconnection.query('INSERT INTO message (userip, message, sessionid) VALUES (?,?,?)',[connection.remoteAddress, data.content, session_id], function(err, results) {

                       if (err) {
                         console.error((new Date()) + ' | MYSQL | Writing message to database error: ' + err.stack);
                         return;
                       }
                     });

                   }
               }
           }
         }
      });


    /*
     *    ON CLOSE CONNECTION
     */
    connection.on('close', function(reasonCode, description) {
      // REMOVE ALL_ACTIVE_CONNECTIONS ENTRY
      all_active_connections[id] = null;

      /*   MAKE DATABASE ENTRY */
        // MAKE A DATABASE ENTRY WITH THE USER-IP, SESSION-ID AND THE ACTION
        // IN THIS CASE THE ACTION IS DISCONNECT, WHICH IS CALLED WHEN THE CLIENT DISCONNECTS
        sqlconnection.query('INSERT INTO useractivity ( sessionid, userip, action) VALUES (?,?,?)',[session_id, connection.remoteAddress, "disconnect"], function(err, results) {

          if (err) {
            console.error((new Date()) + ' | MYSQL | Writing to database error: ' + err.stack);
            return;
          }

          console.log((new Date()) + ' | MYSQL | Logged closed connection successfully to database! UserIP:' + connection.remoteAddress);
        });
      console.log((new Date()) + ' | WEBSOCKET | Client ' + connection.remoteAddress + ' disconnected.');
    });

});
