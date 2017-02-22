var states= {};
Object.defineProperty(states, "email", {
  get: function() { return email; },
  set: function(val) {
    document.getElementById("login").style.display= val ? "none" : "inherit";
    document.getElementById("signup").style.display= val ? "none" : "inherit";
    document.getElementById("console").style.display= val ? "inherit" : "none";
    document.getElementById("logout").style.display= val ? "inherit" : "none";
    email= val;
  }
});

var checkEmail= function() {
  states.email= getCookie("consoleToken") ? jwt_decode(getCookie("consoleToken")).email : undefined;
}

// PAGE FUNCTIONS
var cloudillyChat= function() {
  console.log("@@@@@@ CONNECTING");
  window.cloudilly= new Cloudilly();
  var chatbox= document.getElementById("chatbox");
  cloudilly.socketConnected(function(res) {
    console.log("@@@@@@ CONNECTED");
    chatbox.innerHTML= chatbox.innerHTML + "CONNECTED AS " + res.device.toUpperCase() + "<br/>";
    cloudilly.join("room", function(err, res) {
      err ? console.log("Error: Oops. Something wrong") : console.log("@@@@@@ JOIN");
      console.log(res);
    });
  });

  cloudilly.socketDisconnected(function(err) {
    console.log("@@@@@@ DISCONNECTED");
    console.log(err);
    chatbox.innerHTML= chatbox.innerHTML + "DISCONNECTED<br/>";
  });

  cloudilly.socketReceivedDevice(function(res) {
    if(res.group!= "room") { return; }
    console.log(res);
    chatbox.innerHTML= res.isOnline ?
      chatbox.innerHTML + res.device.toUpperCase() + " JOINED ROOM<br/>" :
      chatbox.innerHTML + res.device.toUpperCase() + " LEFT ROOM<br/>";
  });

  cloudilly.socketReceivedPost(function(res) {
    console.log(res);
    chatbox.innerHTML= chatbox.innerHTML + res.device.toUpperCase() + ": " + res.payload.msg + "<br/>";
  });

  cloudilly.connect("cloudilly", "b24c16b0-a13e-4685-8ceb-daa4b42d036e");
  document.getElementById("chatbox").innerHTML = document.getElementById("chatbox").innerHTML + "CONNECTING ...<br/>";
}

var cloudillyPostMsg= function() {
  var payload= {}; payload.msg= document.getElementById("something").value;
  document.getElementById("something").value= "";
  cloudilly.post("room", payload, function(err, res) {
    err ? console.log("Error: Oops. Something wrong") : console.log("@@@@@@ POST");
    console.log(res);
  });
}

var cloudillyStopBlink= function() {
}

var cloudillyDocs= function() {
  $(function() {
    var toc= $("#toc").tocify({
      selectors: "h1, h2",
      context: "#context",
      scrollTo: 130,
      extendPage: false
    }).data("toc-tocify");
  });
}

var cloudillyNewUser= function() {
	var email= document.getElementById("email");
	var password= document.getElementById("password");
	var cfmpassword= document.getElementById("cfmpassword");
	if(email.value== "" || password.value== "") { return; }
	if(password.value!= cfmpassword.value) { return; }

  var params= "";
	params= params + "email=" + email.value;
	params= params + "&password=" + password.value;

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    location.href="/verify.html"; // TODO: NEED TO HANDLE ERROR
  }
  xmlHttp.send(params);
}

var cloudillyLogin= function() {
	var email= document.getElementById("email");
	var password= document.getElementById("password");
	if(email.value== "" || password.value== "") { return; }

  var params= "";
	params= params + "email=" + email.value;
	params= params + "&password=" + password.value;

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/login", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
    console.log(res); // TODO: REMOVE BEFORE PRODUCTION
		if(res.status) { setCookie("consoleToken", res.consoleToken, 86400000); }
		states.email= jwt_decode(getCookie("consoleToken")).email;
    location.href="/console.html?email=" + email.value; // TODO: NEED TO HANDLE ERROR
  }
  xmlHttp.send(params);
}

var cloudillyLogout= function() {
	clearCookie("consoleToken");
	states.email= undefined;
	location.href="/index.html";
}

var cloudillyForgotPassword= function() {
	var email= document.getElementById("email");
	if(email.value== "") { return; }

  var params= "";
	params= params + "email=" + email.value;

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/forgotpassword", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
		location.href="/verify.html";
  }
  xmlHttp.send(params);
}

var cloudillyChangePassword= function() {
  var email= getParameterByName("email");
  var otp= getParameterByName("otp");

	var password= document.getElementById("password");
	var cfmpassword= document.getElementById("cfmpassword");
	if(password.value!= cfmpassword.value || password.value== "") { return; }

  var params= "";
	params= params + "otp=" + otp;
	params= params + "&email=" + email;
	params= params + "&password=" + password.value;

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/changepassword", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
		location.href="/login.html";
  }
  xmlHttp.send(params);
}

var cloudillyGetUser= function() {
  var email= getParameterByName("email");
  var params= "";
	params= params + "consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email, true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION

		var apps= res.apps;
    if(apps.length== 0) { location.href= "/create.html?email=" + email; return; }

		for(var i= 0; i< apps.length; i++) {
      var app= apps[i]; var identifier= app["app"]; var description= app["description"];
      var tr= document.createElement("tr");
      tr.setAttribute("class", "app");
      tr.setAttribute("onclick", "location.href='/app.html?email=" + email + "&app=" + identifier + "'");
      var td1= document.createElement("td");
      var p1= document.createElement("p");
      var a1= document.createElement("a");
      a1.innerHTML= identifier;
      p1.appendChild(a1);
      td1.appendChild(p1);
      var td2= document.createElement("td");
      var p2= document.createElement("p");
      p2.innerHTML= description ? description : "";
      td2.appendChild(p2);
      tr.appendChild(td1);
      tr.appendChild(td2);
      document.getElementById("apps").appendChild(tr);
    }
  }
  xmlHttp.send(params);
}

var cloudillyNewApp= function() {
  var email= getParameterByName("email");
	var app= document.getElementById("app");
	if(app.value== "") { return; }

	var params= "";
	params= params + "app=" + app.value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    location.href= "/app.html?email=" + email + "&app=" + app.value;
  }
  xmlHttp.send(params);
}

var cloudillyGetApp= function() {
  var email= getParameterByName("email");
  var app= getParameterByName("app");
  addFileUploadAPNSListener();

  var params= "";
	params= params + "consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app, true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    states.app= res.app;
		document.getElementById("app").innerHTML= states.app.app;
    states.app.description== "" || !states.app.description ? showDescriptionInput() : showDescription();
    document.getElementById("maxConcurrentTokens").innerHTML= states.app.maxConcurrentTokens;
    document.getElementById("web").innerHTML= states.app.web;
    var validDomains= Object.keys(states.app.validDomains);
		validDomains.length== 0 ? showInsertValidDomain() : showValidDomains(validDomains);
    document.getElementById("ios").innerHTML= states.app.ios;
    states.app.iOSBunID== "" || !states.app.iOSBunID ? showIOSBunIDInput() : showIOSBunID();
    showAPNS();
    document.getElementById("android").innerHTML= states.app.android;
    states.app.androidBunID== "" || !states.app.androidBunID ? showAndroidBunIDInput() : showAndroidBunID();
    states.app.GCMServerKey== "" || !states.app.GCMServerKey ? showAndroidServerKeyInput() : showAndroidServerKey();
    document.getElementById("hook").innerHTML= states.app.hook;
  }
  xmlHttp.send(params);
}

function showValidDomains(validDomains) {
	document.getElementById("web-domains-array").innerHTML= "";
	document.getElementById("web-domains-div-input").style.display= "none";
	document.getElementById("web-domains-div-array").style.display= "inherit";
	document.getElementById("web-domains-div-insert").style.display= "none";
	document.getElementById("web-domains-div-add").style.display= "inherit";
	validDomains.forEach(function(validDomain) {
		var a= document.createElement("a");
		a.setAttribute("id", validDomain);
		a.setAttribute("onclick", "cloudillyRemoveValidDomain('" + validDomain + "')");
		a.setAttribute("class", "button button-3d button-large noleftmargin center");
		a.innerHTML= validDomain;
		document.getElementById("web-domains-array").appendChild(a);
	});
}

function showInsertValidDomain(focus) {
  document.getElementById("web-domains-div-input").style.display= "inherit";
  document.getElementById("web-domains-div-array").style.display= "none";
  document.getElementById("web-domains-div-insert").style.display= "inherit";
  document.getElementById("web-domains-div-add").style.display= "none";
  if(focus) { document.getElementById("web-domains-input").focus(); }
}

var cloudillyInsertValidDomain= function() {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

  var validDomain= document.getElementById("web-domains-input");
  var validDomains= Object.keys(states.app.validDomains);
	if(validDomain.value== "") { if(validDomains.length> 0) { showValidDomains(validDomains); }; return; }

  var params= "";
	params= params + "validDomain=" + validDomain.value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/validdomain", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION

    states.app.validDomains[validDomain.value]= Math.round(new Date().getTime()).toString();
    var validDomains= Object.keys(states.app.validDomains);
		showValidDomains(validDomains);
		document.getElementById("web-domains-input").value= "";
  }
  xmlHttp.send(params);
}

var cloudillyRemoveValidDomain= function(validDomain) {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

  var params= "";
	params= params + "consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/validdomain/" + encodeURIComponent(validDomain) + "/delete", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    delete states.app.validDomains[validDomain];
    var validDomains= Object.keys(states.app.validDomains);
		validDomains.length== 0 ? showInsertValidDomain() : showValidDomains(validDomains);
  }
  xmlHttp.send(params);
}

function showDescription() {
  document.getElementById("app-description-div-input").style.display= "none";
  document.getElementById("app-description-div-panel").style.display= "inherit";
  document.getElementById("app-description-div-update").style.display= "none";
  document.getElementById("app-description-div-amend").style.display= "inherit";
  document.getElementById("app-description-panel").innerHTML= states.app.description;
}

function showDescriptionInput(focus) {
	document.getElementById("app-description-div-input").style.display= "inherit";
	document.getElementById("app-description-div-panel").style.display= "none";
	document.getElementById("app-description-div-update").style.display= "inherit";
	document.getElementById("app-description-div-amend").style.display= "none";
	document.getElementById("app-description-input").value= states.app.description ? states.app.description : "";
	if(focus) { document.getElementById("app-description-input").focus(); }
}

function cloudillyChangeDescription() {
	if(document.getElementById("app-description-input").value== "") { if(states.app.description!= "") { showDescriptionInput(); }; return; }

  var email= getParameterByName("email");
  var app= getParameterByName("app");

  var params= "";
	params= params + "description=" + document.getElementById("app-description-input").value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/description", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    states.app.description= document.getElementById("app-description-input").value;
		showDescription();
  }
  xmlHttp.send(params);
}

var cloudillyChangeMaxConcurrentTokens= function() {
}

var cloudillyChangeAccess= function(saas) {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

  var params= "";
	params= params + "saas=" + saas;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/access", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
		document.getElementById(saas).innerHTML= res.access;
  }
  xmlHttp.send(params);
}

var cloudillyUpdateIOSBunID= function() {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

	var bunID= document.getElementById("ios-bundleid-input");
  if(bunID.value== "") { if(states.app.iOSBunID && states.app.iOSBunID!= "") { showIOSBunID(); }; return; }

  var params= "";
	params= params + "saas=ios";
	params= params + "&bunID=" + bunID.value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/bunid", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    states.app.iOSBunID= bunID.value;
		showIOSBunID();
  }
  xmlHttp.send(params);
}

function showIOSBunID() {
	document.getElementById("ios-bundleid-div-input").style.display= "none";
	document.getElementById("ios-bundleid-div-panel").style.display= "inherit";
	document.getElementById("ios-bundleid-div-update").style.display= "none";
	document.getElementById("ios-bundleid-div-amend").style.display= "inherit";
	document.getElementById("ios-bundleid-panel").innerHTML= states.app.iOSBunID;
}

function showIOSBunIDInput(focus) {
	document.getElementById("ios-bundleid-div-input").style.display= "inherit";
	document.getElementById("ios-bundleid-div-panel").style.display= "none";
	document.getElementById("ios-bundleid-div-update").style.display= "inherit";
	document.getElementById("ios-bundleid-div-amend").style.display= "none";
	document.getElementById("ios-bundleid-input").value= states.app.iOSBunID ? states.app.iOSBunID : "";
	if(focus) { document.getElementById("ios-bundleid-input").focus(); }
}

function showAPNS() {
	var sandbox= document.getElementById("ios-apns-sandbox"); var production= document.getElementById("ios-apns-production");
	var highlight= "button button-3d button-large button-blue noleftmargin center"; var normal= "button button-3d button-large noleftmargin center";
	states.app.activeAPNS== "APNS_SANDBOX" ? sandbox.setAttribute("class", highlight) : sandbox.setAttribute("class", normal);
	states.app.activeAPNS== "APNS" ? production.setAttribute("class", highlight) : production.setAttribute("class", normal);
}

function amendAPNS(active) {
	document.getElementById("ios-apns-active").value= active;
	document.getElementById("ios-apns-div-environment").style.display= "none";
	document.getElementById("ios-apns-div-upload").style.display= "inherit";
}

function cancelUpdateAPNS() {
	document.getElementById("ios-apns-div-environment").style.display= "inherit";
	document.getElementById("ios-apns-div-upload").style.display= "none";
	document.getElementById("ios-apns-upload").innerHTML= "SELECT .P12 FILE";
	document.getElementById("ios-apns-form").reset();
	showAPNS();
}

function fileUploadAPNS() {
	document.getElementById("ios-apns-file").click();
}

function addFileUploadAPNSListener() {
	document.getElementById("ios-apns-file").addEventListener("change", function() {
    var reader= new FileReader();
    var activeAPNS= document.getElementById("ios-apns-active");
    var apnsFile= document.getElementById("ios-apns-file").files[0];
		if(!apnsFile || !apnsFile.type.match("application/x-pkcs12")) { showApnsError(); return; }
		document.getElementById("ios-apns-upload").innerHTML= "UPLOADING";
  	reader.onload= function(readerEvent) { cloudillyUpdateAPNSPlatform(btoa(readerEvent.target.result), activeAPNS.value); }
  	reader.readAsBinaryString(apnsFile);
	}, false);
}

function showApnsError() {
	document.getElementById("ios-apns-upload").innerHTML= "APNS FILE MUST BE IN .P12 FORMAT";
	document.getElementById("ios-apns-upload").setAttribute("class", "button button-3d button-large button-red noleftmargin center");
	setTimeout(function() {
		document.getElementById("ios-apns-upload").innerHTML= "SELECT .P12 FILE";
		document.getElementById("ios-apns-upload").setAttribute("class", "button button-3d button-large noleftmargin center");
	}, 2000);
}

var cloudillyUpdateAPNSPlatform= function(base64, activeApns) {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

  var params= "";
	params= params + "apnsFile=" + encodeURIComponent(base64);
	params= params + "&activeApns=" + activeApns;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/apns", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    states.app.activeAPNS= document.getElementById("ios-apns-active").value;
    cancelUpdateAPNS();
  }
  xmlHttp.send(params);
}

function showAndroidBunID() {
	document.getElementById("android-bundleid-div-input").style.display= "none";
	document.getElementById("android-bundleid-div-panel").style.display= "inherit";
	document.getElementById("android-bundleid-div-update").style.display= "none";
	document.getElementById("android-bundleid-div-amend").style.display= "inherit";
	document.getElementById("android-bundleid-panel").innerHTML= states.app.androidBunID;
}

function showAndroidBunIDInput(focus) {
	document.getElementById("android-bundleid-div-input").style.display= "inherit";
	document.getElementById("android-bundleid-div-panel").style.display= "none";
	document.getElementById("android-bundleid-div-update").style.display= "inherit";
	document.getElementById("android-bundleid-div-amend").style.display= "none";
	document.getElementById("android-bundleid-input").value= states.app.androidBunID ? states.app.androidBunID : "";
	if(focus) { document.getElementById("android-bundleid-input").focus(); }
}

var cloudillyUpdateAndroidBunID= function() {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

	var bunID= document.getElementById("android-bundleid-input");
  if(bunID.value== "") { if(states.app.androidBunID && states.app.androidBunID!= "") { showAndroidBunID(); }; return; }

  var params= "";
	params= params + "saas=android";
	params= params + "&bunID=" + bunID.value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/bunid", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    states.app.androidBunID= bunID.value;
		showAndroidBunID();
  }
  xmlHttp.send(params);
}

function showAndroidServerKey() {
	document.getElementById("android-serverkey-div-input").style.display= "none";
	document.getElementById("android-serverkey-div-panel").style.display= "inherit";
	document.getElementById("android-serverkey-div-update").style.display= "none";
	document.getElementById("android-serverkey-div-amend").style.display= "inherit";
	document.getElementById("android-serverkey-panel").innerHTML= states.app.GCMServerKey;
}

function showAndroidServerKeyInput(focus) {
	document.getElementById("android-serverkey-div-input").style.display= "inherit";
	document.getElementById("android-serverkey-div-panel").style.display= "none";
	document.getElementById("android-serverkey-div-update").style.display= "inherit";
	document.getElementById("android-serverkey-div-amend").style.display= "none";
	document.getElementById("android-serverkey-input").value= states.app.GCMServerKey ? states.app.GCMServerKey : "";
	if(focus) { document.getElementById("android-serverkey-input").focus(); }
}

var cloudillyUpdateGCMPlatform= function() {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

	var serverKey= document.getElementById("android-serverkey-input");
  if(serverKey.value== "") { if(states.app.GCMServerKey && states.app.GCMServerKey!= "") { showAndroidServerKey(); }; return; }

  var params= "";
	params= params + "serverKey=" + serverKey.value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/gcm", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
    states.app.GCMServerKey= serverKey.value;
    showAndroidServerKey();
  }
  xmlHttp.send(params);
}

var cloudillyGenerateJS= function() {
  var email= getParameterByName("email");
  var app= getParameterByName("app");

  var params= "";
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/javascript", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var bytes= base64ToArrayBuffer(JSON.parse(xmlHttp.responseText));
    var blob= new Blob([bytes], {type: "application/zip"});
    var url= window.URL.createObjectURL(blob);
    var a= document.createElement("a");
    document.body.appendChild(a);
    a.style= "display:none";
    a.href= url;
    a.download= "js.zip";
    a.click();
    window.URL.revokeObjectURL(url);
  }
  xmlHttp.send(params);
}

function base64ToArrayBuffer(base64) {
  var string= window.atob(base64);
  var length= string.length;
  var bytes= new Uint8Array(length);
  for(var i= 0; i< length; i++) {
    var ascii= string.charCodeAt(i);
    bytes[i]= ascii;
  }
  return bytes;
}

// UTIL
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

function getParameterByName(name) {
  var url= window.location.href;
  name= name.replace(/[\[\]]/g, "\\$&");
  var regex= new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results= regex.exec(url);
  if(!results) { return null; };
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
