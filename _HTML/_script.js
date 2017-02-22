var app= "<INSERT_APP_IDENTIFIER>";
var access= "<INSERT_ACCESS_KEY>";

window.onload= function() {
  var chatbox= document.getElementById("chatbox");

  window.cloudilly= new Cloudilly();
  cloudilly.connect(app, access);
  chatbox.innerHTML= chatbox.innerHTML + "CONNECTING...<br/>";

  cloudilly.socketConnected(function(res) {
    console.log("@@@@@@ CONNECTED");
    chatbox.innerHTML= chatbox.innerHTML + "CONNECTED AS " + res.device + "<br/>";

    cloudilly.join("room", function(err, res) {
      err ? console.log("Error: Oops. Something wrong") : console.log("@@@@@@ JOIN");
      console.log(res);
    });
  });

  cloudilly.socketDisconnected(function() {
    console.log("@@@@@@ DISCONNECTED");
    chatbox.innerHTML= "DISCONNECTED<br/>";
  });

  cloudilly.socketReceivedDevice(function(res) {
    if(res.group!="room") { return; }
    chatbox.innerHTML= res.isOnline ? chatbox.innerHTML + res.device + " JOINED PUBLIC<br/>" : chatbox.innerHTML + res.device + " LEFT PUBLIC<br/>";
    console.log(res);
  });

  cloudilly.socketReceivedPost(function(res) {
    chatbox.innerHTML= chatbox.innerHTML + res.device + ": " + res.payload.msg + "<br/>";
    console.log(res);
  });
}

function send() {
  var input= document.getElementById("input").value; if(input== "") { return; }
  document.getElementById("input").value= ""; document.getElementById("input").focus();
  var payload= {}; payload.msg= input;
  cloudilly.post("room", payload, function(err, res) {
    if(err) { console.log("ERROR: " + res.msg); return; }
    console.log("@@@@@@ POST");
    console.log(res);
  });
}
