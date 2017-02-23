function openTab(event, tab) {
  var tabcontent= document.getElementsByClassName("tabcontent");
  for(var i= 0; i< tabcontent.length; i++) { tabcontent[i].style.display= "none"; }
  var tablinks= document.getElementsByClassName("tablinks");
  for(i= 0; i< tablinks.length; i++) { tablinks[i].className= tablinks[i].className.replace(" active", ""); }
  document.getElementById(tab).style.display= "block";
  event.currentTarget.className += " active";
}

var chat= function() {
  console.log("@@@@@@ CONNECTING");
  window.cloudilly= new Cloudilly();
  var chatbox= document.getElementById("chatbox");
  cloudilly.socketConnected(function(res) {
    console.log("@@@@@@ CONNECTED");
    chatbox.innerHTML= chatbox.innerHTML + "<p>Connected as " + res.device.toUpperCase() + "</p>";
    cloudilly.join("room", function(err, res) {
      err ? console.log("Error: Oops. Something wrong") : console.log("@@@@@@ JOIN");
      console.log(res);
    });
  });

  cloudilly.socketDisconnected(function(err) {
    console.log("@@@@@@ DISCONNECTED");
    console.log(err);
    chatbox.innerHTML= chatbox.innerHTML + "<p>Disconnected</p><br/>";
  });

  cloudilly.socketReceivedDevice(function(res) {
    if(res.group!= "room") { return; }
    console.log(res);
    chatbox.innerHTML= res.isOnline ?
      "<p>" + chatbox.innerHTML + res.device.toUpperCase() + " has joined room</p>" :
      "<p>" + chatbox.innerHTML + res.device.toUpperCase() + " has left room</p>";
  });

  cloudilly.socketReceivedPost(function(res) {
    console.log(res);
    chatbox.innerHTML= chatbox.innerHTML + res.device.toUpperCase() + ": " + res.payload.msg + "<br/>";
  });

  cloudilly.connect("cloudilly", "b24c16b0-a13e-4685-8ceb-daa4b42d036e");
  document.getElementById("chatbox").innerHTML = document.getElementById("chatbox").innerHTML + "<p>Connecting ...</p>";
}

var post= function() {
  var message= document.getElementById("something").value;
  document.getElementById("something").value= "";
  var payload= {}; payload.msg= message;
  cloudilly.post("room", payload, function(err, res) {
    err ? console.log("Error: Oops. Something wrong") : console.log("@@@@@@ POST");
    console.log(res);
    return false;
  });
}
