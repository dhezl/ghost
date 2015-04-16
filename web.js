var ack = require('ac-koa').require('hipchat');
var pkg = require('./package.json');
var Client = require('node-rest-client').Client;
var app = ack(pkg);
var qaUser = 'meganb'
var jiraApiUrl = "https://razorfish-central.atlassian.net/rest/api/2/"
var authHeader = {"authorization": "Basic ZGF2aWRoZXpsZXA6T2xpdmVyMDAh", "Content-Type": "application/json"}

var addon = app.addon()
  .hipchat()
  .allowRoom(true)
  .scopes('send_notification');

var http = require('http');

client = new Client();



if (process.env.DEV_KEY) {
  addon.key(process.env.DEV_KEY);
}

addon.webhook('room_message', /^\/timeline$/, function *() {
  yield this.roomClient.sendNotification('<b>Batch 1 (THD US, BBY, WL):</b> <br> CRUX review: 5/1 <br> Code review: 5/4 <br> QA review: 5/5-7 <br> Handoff: 5/8 <br><br> <b>Batch 2 (SEARS, SHELL, Marketing 1):</b> <br> Dev complete: 5/20 <br> Handoff: 5/29');
});

addon.webhook('room_message', /^\/hello$/, function *() {
  yield this.roomClient.sendNotification('Hi, '+this.sender.name+'!');
});

addon.webhook('room_message', /^\/konnichiwa$/, function *() {
  yield this.roomClient.sendNotification('今日は, '+this.sender.name+', 元気ですか?');
});

addon.webhook('room_message', /^\/howdy$/, function *() {
  yield this.roomClient.sendNotification('Tarnation, '+this.sender.name+', there\'s a snake in my boot!');
});


addon.webhook('room_notification', function*() {
  if (this.content.indexOf('deployed') > 0) {

    if (this.content.indexOf('Fusion: White Label (Staging)') > 0) {
      yield this.roomClient.sendNotification('Sending resolved White Label tickets to '+qaUser+'...');
      getTickets('CFVI-1');
    }

    if (this.content.indexOf('Fusion: The Home Depot: US (Staging)') > 0) {
      yield this.roomClient.sendNotification('Sending resolved THD-US tickets to '+qaUser+'...');
      getTickets('CFVI-14')
    }

    if (this.content.indexOf('Fusion: Best Buy (Dev)') > 0) {
      yield this.roomClient.sendNotification('Sending resolved BBY tickets to '+qaUser+'...');
      getTickets('CFVI-15')
    }
  }
});


function getTickets(epicLink) {
  args = {
    headers: authHeader
  };
  returnArray = []
  client.get(jiraApiUrl+'search?jql=assignee%3Ddavidhezlep%20AND%20project%3DCFVI%20AND%20status%3Dresolved%20AND%20%22Epic%20Link%22%20%3D'+epicLink, args, function(data, response) {
    for(var i = 0; i < data.issues.length; i ++) {
      assignTicket(data.issues[i].key);
    }
  });
}

function assignTicket(ticketID) {
  args = {
    data: { fields: { assignee: {name: qaUser} } },
    headers: authHeader
  };
  client.put(jiraApiUrl+'issue/'+ticketID, args, function(data, response){
    console.log(data);
  });
}


 
app.listen();
