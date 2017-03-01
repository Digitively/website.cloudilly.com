var Cloudilly= function() {
  var self= this;
  self.loadScript.call(self, "https://cdn.cloudilly.com/aws-sdk-sts.js", function() {
    self.loadScript.call(self, "https://cdnjs.cloudflare.com/ajax/libs/async/2.1.4/async.js", function() {
      self.loadScript.call(self, "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.1/moment.min.js", function() {
        self.loadScript.call(self, "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/core-min.js", function() {
          self.loadScript.call(self, "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/hmac-min.js", function() {
            self.loadScript.call(self, "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/sha256-min.js", function() {
              self.loadScript.call(self, "https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.2/mqttws31.min.js", function() {
                self.loadScript.call(self, "https://cdn.cloudilly.com/jwt-decode.min.js", function() {
                  self.status= "UNKNOWN"; self.app= ""; self.access= ""; self.saas= "web"; self.version= 2;
                  self.client= undefined; self.tasks= {}; self.callbacks= {};
                  self.iotRegion= "us-east-2"; self.iotEndpoint= "aur48b9xoo0gq.iot.us-east-2.amazonaws.com";
                  self.apiGateway= "https://w0dkurct78.execute-api.us-east-2.amazonaws.com/stage/";
                  self.accessKeyId= self.getCookie.call(self, "accessKeyId");
                  self.secretAccessKey= self.getCookie.call(self, "secretAccessKey");
                  self.sessionToken= self.getCookie.call(self, "sessionToken");
                  self.cloudillyToken= self.getCookie.call(self, "cloudillyToken");
                  var decoded= self.cloudillyToken ? jwt_decode(self.cloudillyToken) : undefined;
                  self.device= decoded ? decoded.device : undefined;
                  self.session= self.getSession.call(self);
                });
              });
            });
          });
        });
      });
    });
  });
};

// NOTE: CORE METHODS
Cloudilly.prototype.connect= function(app, access) {
  var self= this;
  if(!self.status) { setTimeout(function() { self.connect.call(self, app, access); }, 50); return; } // TODO: VERY DIRTY
  if(self.status== "CONNECTING" || self.status== "CONNECTED") { return; }
  self.status= "CONNECTING";
  self.app= app; self.access= access;
  self.getCredentials.call(self, function(err) {
    if(err) { console.log(err); return; }
    self.connectToIOT.call(self);
  });
}

Cloudilly.prototype.disconnect= function() {
  if(this.status== "DISCONNECTED") { return; }
  this.client.disconnect();
}

Cloudilly.prototype.listen= function(group, callback) {
  var body= {}; body.action= "listen"; body.group= group;
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.unlisten= function(group, callback) {
  var body= {}; body.action= "unlisten"; body.group= group;
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.join= function(group, callback) {
  var body= {}; body.action= "join"; body.group= group;
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.unjoin= function(group, callback) {
  var body= {}; body.action= "unjoin"; body.group= group;
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.update= function(payload, callback) {
  var body= {}; body.action= "update"; body.payload= JSON.stringify(payload);
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.post= function(group, payload, callback) {
  var body= {}; body.action= "post"; body.group= group; body.payload= JSON.stringify(payload);
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.link= function(group, callback) {
  var body= {}; body.action= "link"; body.group= group;
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.unlink= function(group, callback) {
  var body= {}; body.action= "unlink"; body.group= group;
  this.writeTask.call(this, body, callback);
}

Cloudilly.prototype.notify= function(group, payload, callback) {
  var body= {}; body.action= "notify"; body.group= group; body.payload= payload;
  this.writeTask.call(this, body, callback);
}

// NOTE: UTILS
Cloudilly.prototype.setCookie= function(cname, cvalue, cduration, callback) {
  if(!cvalue) { callback(); return; }
	var d= new Date(Date.now() + cduration); var expires= "expires=" + d.toUTCString();
  var path= "path=/"; document.cookie= cname + "=" + cvalue + "; " + expires + ";" + path + ";";
  callback();
}

Cloudilly.prototype.clearCookie= function(cname) {
  document.cookie= cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

Cloudilly.prototype.getCookie= function(cname) {
	var name= cname + "="; var ca= document.cookie.split(";");
	for(var i= 0; i< ca.length; i++) {
    var c= ca[i]; while(c.charAt(0)== " ") { c= c.substring(1); }
    if(c.indexOf(name)== 0) { return c.substring(name.length, c.length); }
  }
}

Cloudilly.prototype.loadScript= function(url, callback) {
  var head= document.getElementsByTagName("head")[0];
  var script= document.createElement("script");
  script.type= "text/javascript"; script.src= url;
  script.onload= function() { callback(); };
  head.appendChild(script);
}

Cloudilly.prototype.getCredentials= function(callback) {
  var self= this; if(self.sessionToken) { callback(); return; }

  var params= "saas=" + self.saas;
  params= params + "&version=" + self.version;
  params= params + "&app=" + self.app;
  params= params + "&access=" + self.access;
  if(self.cloudillyToken) { params= params + "&cloudillyToken=" + self.cloudillyToken; }

  var xmlHttp= new XMLHttpRequest();
  xmlHttp.open("POST", self.apiGateway + "getcredentials", true);
  xmlHttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
  xmlHttp.onreadystatechange= function() {
    if(xmlHttp.readyState!= 4) { return; }
    var res= JSON.parse(xmlHttp.responseText);
    if(res.status== "fail") { callback(res); return; }
    self.cloudillyToken= res.cloudillyToken; self.accessKeyId= res.accessKeyId;
    self.secretAccessKey= res.secretAccessKey; self.sessionToken= res.sessionToken;
    var decoded= jwt_decode(self.cloudillyToken); self.device= decoded.device;
    self.setCookie.call(self, "cloudillyToken", res.cloudillyToken, 157700000, function() { // NOTE: 157700000== 5YEARS
      self.setCookie.call(self, "accessKeyId", res.accessKeyId, 3000000, function() { // NOTE: 3000000== 50MIN. BUFFER== 10MIN
        self.setCookie.call(self, "secretAccessKey", res.secretAccessKey, 3000000, function() {
          self.setCookie.call(self, "sessionToken", res.sessionToken, 3000000, function() {
            callback();
          });
        });
      });
    });
  }
  xmlHttp.send(params);
}

Cloudilly.prototype.connectToIOT= function() {
  var self= this; var iotEndpoint= self.createIotEndpoint.call(self);
  var clientId= self.app + "::" + self.device + "::" + self.session;
  var obj= {}; obj.app= self.app; obj.device= self.device; obj.session= self.session;
  self.client= new Paho.MQTT.Client(iotEndpoint, clientId);
  var options= { useSSL: true,
    onSuccess: function() {
      console.log("@@@@@@ PARTIAL CONNECTION: " + self.device + "::" + self.session);
      self.status= "CONNECTED";
      self.client.subscribe(self.app + "/device/" + self.device + "/session/" + self.session);
      self.client.subscribe(self.app + "/device/" + self.device);
    },
    onFailure: function(err) {
      self.status= "DISCONNECTED";
      self.disconnected.call(self, err);
    }
  }
  self.client.connect(options);
  self.client.onMessageArrived= function(msg) {
    var obj= JSON.parse(msg.payloadString);
    switch(obj.type) {
      case "task": self.receivedTask.call(self, obj); return;
      case "device": self.receivedDevice.call(self, obj); return;
			case "post": self.receivedPost.call(self, obj); return;
      case "connected": self.receivedConnected.call(self, obj); return;
      case "disconnected": self.receivedDisconnected.call(self, obj); return;
    }
  }
  self.client.onConnectionLost= function(err) {
    self.status= "DISCONNECTED";
    self.disconnected.call(self, err);
  };
}

Cloudilly.prototype.createIotEndpoint= function() {
  var time= moment.utc(); var dateStamp= time.format("YYYYMMDD");
  var amzdate= dateStamp+ "T" + time.format("HHmmss") + "Z"; var service= "iotdevicegateway";
  var iotRegion= this.iotRegion; var secretKey= this.secretAccessKey;
  var accessKey= this.accessKeyId; var sessionToken= this.sessionToken; var host= this.iotEndpoint;
  var algorithm= "AWS4-HMAC-SHA256"; var method= "GET"; var canonicalUri= "/mqtt";
  var credentialScope= dateStamp + "/" + iotRegion + "/" + service + "/" + "aws4_request";
  var canonicalQuerystring= "X-Amz-Algorithm=AWS4-HMAC-SHA256";
  canonicalQuerystring+= "&X-Amz-Credential=" + encodeURIComponent(accessKey + "/" + credentialScope);
  canonicalQuerystring+= "&X-Amz-Date=" + amzdate; canonicalQuerystring+= "&X-Amz-SignedHeaders=host";
  var canonicalHeaders= "host:" + host + "\n"; var payloadHash= this.sha256.call(self, "");
  var canonicalRequest= method + "\n" + canonicalUri + "\n" + canonicalQuerystring + "\n" + canonicalHeaders + "\nhost\n" + payloadHash;
  var stringToSign= algorithm + "\n" + amzdate + "\n" + credentialScope + "\n" + this.sha256.call(this, canonicalRequest);
  var signingKey= this.getSignatureKey.call(this, secretKey, dateStamp, iotRegion, service);
  var signature= this.sign.call(this, signingKey, stringToSign);
  canonicalQuerystring+= "&X-Amz-Signature=" + signature;
  canonicalQuerystring+= "&X-Amz-Security-Token=" + encodeURIComponent(sessionToken);
  return "wss://" + host + canonicalUri + "?" + canonicalQuerystring;
}

Cloudilly.prototype.sha256= function(msg) {
  var hash= CryptoJS.SHA256(msg);
  return hash.toString(CryptoJS.enc.Hex);
}

Cloudilly.prototype.getSignatureKey= function(key, dateStamp, iotRegion, service) {
  var kDate= CryptoJS.HmacSHA256(dateStamp, "AWS4" + key);
  var kRegion= CryptoJS.HmacSHA256(iotRegion, kDate);
  var kService= CryptoJS.HmacSHA256(service, kRegion);
  var kSigning= CryptoJS.HmacSHA256("aws4_request", kService);
  return kSigning;
}

Cloudilly.prototype.sign= function(key, msg) {
  var hash= CryptoJS.HmacSHA256(msg, key);
  return hash.toString(CryptoJS.enc.Hex);
}

Cloudilly.prototype.writeTask= function(body, callback) {
  var tid= this.generateUUID.call(); var timestamp= new Date().getTime();
  var task= {}; body.tid= tid; body.timestamp= timestamp; task.body= body;
  this.tasks[tid]= task; this.callbacks[tid]= callback;
  if(this.status== "CONNECTED") { this.processTask.call(this, task); }
}

Cloudilly.prototype.processTask= function(task) {
  var msg= JSON.stringify(task); var action= task.body.action;
  var message= new Paho.MQTT.Message(msg); message.destinationName= "command/" + this.app; this.client.send(message);
  if(action== "listen" || action== "join") { this.client.subscribe(this.app + "/group/" + task.body.group); }
  if(action== "unlisten" || action== "unjoin") { this.client.unsubscribe(this.app + "/group/" + task.body.group); }
}

Cloudilly.prototype.generateUUID= function() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r= Math.random()*16|0;
    var v= c=== "x" ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

Cloudilly.prototype.getSession= function() {
  var session= sessionStorage.getItem("session");
  if(session) { return session; }
  session= ""; var possible= "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(var i= 0; i<= 5; i++) {
    session+= possible.charAt(Math.floor(Math.random() * possible.length));
    if(i== 5) { sessionStorage.setItem("session", session); return session; }
  }
}

Cloudilly.prototype.receivedTask= function(obj) {
	if(!this.callbacks[obj.tid]) { return; }
  this.callbacks[obj.tid].call(this, obj.status== "success" ? null : 1, obj);
	delete this.callbacks[obj.tid];
	delete this.tasks[obj.tid];
}

Cloudilly.prototype.receivedConnected= function(obj) {
  var tasks= []; for(var key in self.tasks) { tasks.push([key, self.tasks[key]["body"]["timestamp"]]); };
  tasks.sort(function(a, b) { return a[1]< b[1] ? 1 : a[1]> b[1] ? -1 : 0 }); var length= tasks.length;
  while(length--) { var task= self.tasks[tasks[length][0]]; self.processTask.call(self, task); }
  this.connected.call(this, obj);
}

Cloudilly.prototype.receivedDisconnected= function(obj) {
  console.log(obj);
  this.clearCookie.call(this, "accessKeyId");
  this.clearCookie.call(this, "secretAccessKey");
  this.clearCookie.call(this, "sessionToken");
  this.disconnect.call(this);
}

Cloudilly.prototype.socketConnected= function(callback) {
  this.connected= callback;
}

Cloudilly.prototype.socketDisconnected= function(callback) {
  this.disconnected= callback;
}

Cloudilly.prototype.socketReceivedDevice= function(callback) {
  this.receivedDevice= callback;
}

Cloudilly.prototype.socketReceivedPost= function(callback) {
  this.receivedPost= callback;
}
