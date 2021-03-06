window.states= {};
Object.defineProperty(states, "email", {
  get: function() { return email; },
  set: function(val) {
    document.getElementById("loginMenu").style.display= val ? "none" : "inherit";
    document.getElementById("signupMenu").style.display= val ? "none" : "inherit";
    document.getElementById("consoleMenu").style.display= val ? "inherit" : "none";
    document.getElementById("logoutMenu").style.display= val ? "inherit" : "none";
    email= val;
  }
});

/* ERROR REPORTING WITHIN INPUT */
var addError= function(id, error) {
  var element= document.getElementById(id);
  element.setAttribute("placeholder", error);
  element.className= element.className+ " error";
}

var clearError= function(id) {
  var element= document.getElementById(id);
  var original= element.getAttribute("original");
  element.classList.remove("error");
  element.setAttribute("placeholder", original);
}

/* LOGOUT */
var consoleLogout= function() {
	clearCookie("consoleToken");
	states.email= undefined;
	location.href="/index.html";
}

/* SIGNUP */
var consoleSignUp= function() {
  var signupBtn= document.getElementById("signupBtn"); var email= document.getElementById("email");
	var password= document.getElementById("password"); var cfmpassword= document.getElementById("cfmpassword");
  if(email.value== "") { addError("email", "Email"); }
  if(password.value== "") { addError("password", "Password"); }
  if(cfmpassword.value== "") { addError("cfmpassword", "Confirm password"); }
	if(email.value== "" || password.value== "") { return; }
  if(password.value!= cfmpassword.value) {
    addError("password", "Passwords not identical");
    addError("cfmpassword", "Passwords not identical");
    password.value= ""; cfmpassword.value= "";
    return;
  }
  signupBtn.innerHTML= "Processing";
  var spinner= new Spinner({ lines: 11, length: 3, width: 2, radius: 4, left: "20px" }).spin(signupBtn);
  var params= ""; params= params + "email=" + email.value; params= params + "&password=" + password.value;
  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText); // 404::USER_ALREADY_EXIST
    if(res.status== "success") { location.href="/verify.html"; return; }
    spinner.stop(); signupBtn.innerHTML= "Register";
    addError("email", "Email already registered");
    email.value= ""; password.value= "";
    cfmpassword.value= ""; email.focus();
    console.log(res); // TODO: REMOVE BEFORE PRODUCTION
  }
  xmlHttp.send(params);
}

/* LOGIN */
var consoleLogin= function() {
  var loginBtn= document.getElementById("loginBtn");
	var email= document.getElementById("email");
	var password= document.getElementById("password");
  if(email.value== "") { addError("email", "Email"); }
  if(password.value== "") { addError("password", "Password"); }
	if(email.value== "" || password.value== "") { return; }
  loginBtn.innerHTML= "Processing";
  var spinner= new Spinner({ lines: 11, length: 3, width: 2, radius: 4, left: "20px" }).spin(loginBtn);
  var params= ""; params= params + "email=" + email.value; params= params + "&password=" + password.value;
  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/login", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
    console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    if(res.status) { setCookie("consoleToken", res.consoleToken, 86400000); }
    states.email= jwt_decode(getCookie("consoleToken")).email;
    if(res.status== "success") { setCookie("consoleToken", res.consoleToken, 86400000); location.href="/user/" + email.value; return; }
    spinner.stop(); loginBtn.innerHTML= "Login";
    addError("email", "Wrong email");
    addError("password", "Wrong password");
    email.value= ""; password.value= "";
    email.focus();
    console.log(res); // TODO: REMOVE BEFORE PRODUCTION
  }
  xmlHttp.send(params);
}

/* INDEX: CHAT */
function indexOpenTab(event, tab) {
  var tabcontent= document.getElementsByClassName("tab-content");
  for(var i= 0; i< tabcontent.length; i++) { tabcontent[i].style.display= "none"; }
  var tablinks= document.getElementsByClassName("tab-links");
  for(i= 0; i< tablinks.length; i++) { tablinks[i].className= tablinks[i].className.replace(" active", ""); }
  document.getElementById(tab).style.display= "block";
  event.currentTarget.className += " active";
}

var indexChat= function() {
  console.log("@@@@@@ CONNECTING");
  window.cloudilly= new Cloudilly();
  var chatbox= document.getElementById("chatbox");
  cloudilly.socketConnected(function(res) {
    console.log("@@@@@@ CONNECTED");
    chatbox.innerHTML= chatbox.innerHTML + "<p>Connected as " + res.device + "</p>";

    cloudilly.join("room", function(err, res) {
      err ? console.log("Error: Oops. Something wrong") : console.log("@@@@@@ JOIN");
      if(err && res.msg== "401::EXCEEDED_THROTTLE_LIMITS") { chatbox.innerHTML= chatbox.innerHTML + "<p style='color:#FF0000;'>EXCEEDED THROTTLE LIMITS</p>"; }
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
      chatbox.innerHTML + "<p>" + res.device + " has joined room</p>" :
      chatbox.innerHTML + "<p>" + res.device + " has left room</p>";
  });

  cloudilly.socketReceivedPost(function(res) {
    console.log(res);
    chatbox.innerHTML= chatbox.innerHTML + "<p>" + res.device + ": " + res.payload.msg + "</p>";
    chatbox.scrollTop= chatbox.scrollHeight;
  });

  cloudilly.connect("cloudilly", "b24c16b0-a13e-4685-8ceb-daa4b42d036e");
  document.getElementById("chatbox").innerHTML = document.getElementById("chatbox").innerHTML + "<p>Connecting ...</p>";
}

var indexPostMsg= function() {
  var message= document.getElementById("something").value;
  document.getElementById("something").value= "";
  var payload= {}; payload.msg= message;
  cloudilly.post("room", payload, function(err, res) {
    err ? console.log("Error: Oops. Something wrong") : console.log("@@@@@@ POST");
    if(err && res.msg== "401::EXCEEDED_THROTTLE_LIMITS") { chatbox.innerHTML= chatbox.innerHTML + "<p style='color:#FF0000;'>EXCEEDED THROTTLE LIMITS</p>"; }
    console.log(res);
    return false;
  });
}

/* MENU */
var initMenu= function() {
  states.email= getCookie("consoleToken") ? jwt_decode(getCookie("consoleToken")).email : undefined;
}

/* UTILS */
var getCookie= function(cname) {
  var name= cname + "="; var ca= document.cookie.split(";");
  for(var i= 0; i< ca.length; i++) {
    var c= ca[i];
    while(c.charAt(0)== " ") { c= c.substring(1); }
    if(c.indexOf(name)== 0) { return c.substring(name.length, c.length); }
  }
}

var setCookie= function(cname, cvalue, cduration) {
	var d= new Date(Date.now() + cduration);
	var expires= "expires=" + d.toUTCString();
	var path= "path=/";
	document.cookie= cname + "=" + cvalue + "; " + expires + ";" + path + ";";
}

var clearCookie= function(cname) {
	document.cookie= cname + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}
