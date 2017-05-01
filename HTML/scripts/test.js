var states= {};
Object.defineProperty(states, "email", {
	get: function() { return email; },
	set: function(val) {
		email= val;
		document.getElementById("forgot").style.display= email ? "none" : "inherit";
		document.getElementById("login").style.display= email ? "none" : "inherit";
		document.getElementById("signup").style.display= email ? "none" : "inherit";
		document.getElementById("console").style.display= email ? "inherit" : "none";
		document.getElementById("logout").style.display= email ? "inherit" : "none";
	}
});

window.onload= function() {
	// cloudillyGetApp();
	states.email= getCookie("consoleToken") ? jwt_decode(getCookie("consoleToken")).email : undefined;

	window.cloudilly= new Cloudilly();
	cloudilly.socketConnected(function(res) {
		console.log("SOCKET CONNECTED");
		console.log(res);
		document.getElementById("status").innerHTML= "Connected";
	});

	cloudilly.socketDisconnected(function() {
		console.log("SOCKET DISCONNECTED");
		document.getElementById("status").innerHTML= "Disconnected";
	});

	cloudilly.socketReceivedDevice(function(res) {
		console.log(res);
	});

	cloudilly.socketReceivedPost(function(res) {
		console.log(res);
	});
}

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

// NOTE: TEST COMMANDS
var connect= function() {
	document.getElementById("status").innerHTML= "Connecting";
	cloudilly.connect("cloudilly", "b24c16b0-a13e-4685-8ceb-daa4b42d036e");
}

var disconnect= function() {
	cloudilly.disconnect();
}

var listen= function() {
	cloudilly.listen("room", function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ LISTEN");
		console.log(res);
	});
}

var unlisten= function() {
	cloudilly.unlisten("room", function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ UNLISTEN");
		console.log(res);
	});
}

var join= function() {
	cloudilly.join("room", function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ JOIN");
		console.log(res);
	});
}

var unjoin= function() {
	cloudilly.unjoin("room", function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ UNJOIN");
		console.log(res);
	});
}

var update= function() {
	var payload= {}; payload.a= "A"; payload.b= "B";
	cloudilly.update(payload, function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ UPDATE");
		console.log(res);
	});
}

var post= function() {
	var payload= {}; payload.a= "A"; payload.b= "B";
	cloudilly.post("room", payload, function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ POST");
		console.log(res);
	});
}

var link= function() {
	cloudilly.link("room", function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ LINK");
		console.log(res);
	});
}

var unlink= function() {
	cloudilly.unlink("room", function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ UNLINK");
		console.log(res);
	});
}

var notify= function() {
	cloudilly.notify("THIS IS A TEST", "test", function(err, res) {
		err ? console.log("ERROR: Oops. Something wrong") : console.log("@@@@@@ NOTIFY");
		console.log(res);
	});
}

// NOTE: CONSOLE API
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
		location.href="/verify.html";
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
		location.href="/user/" + email.value;
  }
  xmlHttp.send(params);
}

var cloudillyClearCookies= function() {
	clearCookie("cloudillyToken");
	clearCookie("accessKeyId");
	clearCookie("secretAccessKey");
	clearCookie("sessionToken");
	console.log("CLEARED");
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
		location.href="/login.html";
  }
  xmlHttp.send(params);
}

var cloudillyChangePassword= function() {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var otp= parameters[6];

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
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];

  var params= "";
	params= params + "consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email, true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION

		var apps= Object.keys(res.apps);
		for(var i= 0; i< apps.length; i++) {
			var elApp= document.createElement("a");
			elApp.setAttribute("href", "/user/" + email + "/app/" + apps[i]);
			elApp.innerHTML= apps[i];
			document.getElementById("apps").appendChild(elApp);
		}
  }
  xmlHttp.send(params);
}

var cloudillyNewApp= function() {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];

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
		location.href="/user/" + email;
  }
  xmlHttp.send(params);
}

var cloudillyGetApp= function() {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var app= parameters[6];

  var params= "";
	params= params + "consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app, true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
		var app= res.app;
		document.getElementById("app").innerHTML= app.app;
		document.getElementById("maxTokens").innerHTML= app.maxTokens;
		document.getElementById("web").innerHTML= app.web;
		document.getElementById("ios").innerHTML= app.ios;
		if(app.iOSBunId) { document.getElementById("iOSBunId").value= app.iOSBunId; }
		document.getElementById("android").innerHTML= app.android;
		if(app.androidBunId) { document.getElementById("androidBunId").value= app.androidBunId; }
		document.getElementById("hook").innerHTML= app.hook;
  }
  xmlHttp.send(params);
}

var cloudillyChangeAccess= function(saas) {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var app= parameters[6];

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

var cloudillyUpdateBunId= function(saas) {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var app= parameters[6];

	var bunId= saas== "ios" ? document.getElementById("iOSBunId") : document.getElementById("androidBunId");
	if(bunId.value== "") { return; }

  var params= "";
	params= params + "saas=" + saas;
	params= params + "&bunId=" + bunId.value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/bunid", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
  }
  xmlHttp.send(params);
}

var cloudillyInsertValidDomain= function() {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var app= parameters[6];

	var insertValidDomain= document.getElementById("insertValidDomain");
	if(insertValidDomain.value== "") { return; }

  var params= "";
	params= params + "validDomain=" + insertValidDomain.value;
	params= params + "&consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/validdomain", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
  }
  xmlHttp.send(params);
}

var cloudillyRemoveValidDomain= function() {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var app= parameters[6];

	var removeValidDomain= document.getElementById("removeValidDomain");
	if(removeValidDomain.value== "") { return; }

  var params= "";
	params= params + "consoleToken=" + getCookie("consoleToken");

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", "https://4o03fvuqna.execute-api.us-east-2.amazonaws.com/stage/user/" + email + "/app/" + app + "/validdomain/" + removeValidDomain.value + "/delete", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
		console.log(res); // TODO: REMOVE BEFORE PRODUCTION
  }
  xmlHttp.send(params);
}

var getApnsInBase64= function() {
	var activeApns= document.getElementById("activeApns");
	var apnsFiles= document.getElementById("apnsFile").files;
	if(activeApns.value== "" || apnsFiles.length== 0) { return; }

	var apnsFiles= document.getElementById("apnsFile").files;
	var apnsFile= apnsFiles[0];
	var reader= new FileReader();
	reader.onload= function(readerEvent) { cloudillyUpdateAPNSPlatform(btoa(readerEvent.target.result), activeApns.value); }
	reader.readAsBinaryString(apnsFile);
}

var cloudillyUpdateAPNSPlatform= function(base64, activeApns) {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var app= parameters[6];

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
  }
  xmlHttp.send(params);
}

var cloudillyUpdateGCMPlatform= function() {
	var page= window.location.href;
	var parameters= page.split("/");
	var email= parameters[4];
	var app= parameters[6];

	var serverKey= document.getElementById("serverKey");
	if(serverKey.value== "") { return; }

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
  }
  xmlHttp.send(params);
}
