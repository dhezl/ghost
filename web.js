var ack = require('ac-koa').require('hipchat');
var pkg = require('./package.json');
var Client = require('node-rest-client').Client;
var app = ack(pkg);
var qaUser = 'meganb'
var jiraApiUrl = "https://razorfish-central.atlassian.net/rest/api/2/"
var authHeader = {"authorization": "Basic ZGF2aWRoZXpsZXA6T2xpdmVyMDAh", "Content-Type": "application/json"}

var jira = require('./config.json')

// var jira = {
//   developers: ['davidhezlep', 'KevinMorgan', 'britneyjo'],
//   shell: {
//     epic: 'CFVI-17',
//     component: 'Shell',
//     strings: ['Shell', 'shell', 'SHELL']
//   },
//   bestbuy: {
//     epic: 'CFVI-15',
//     component: 'Best Buy',
//     strings: ['BBY', 'BB', 'BestBuy', 'BEST BUY']
//   },
//   thd_us: {
//     epic: 'CFVI-14',
//     component: 'THD US',
//     strings: ['Home Depot', 'THD']
//   },
//   sears: {
//     epic: 'CFVI-16',
//     component: 'Sears',
//     strings: ['SEARS', 'Sears', 'sears', 'SRS']
//   }
// }

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

addon.webhook('room_message', /^\/v$/, function *() {
  yield this.roomClient.sendNotification('Current <b>affects version</b> is 6.2.00<br>Current <b>fix version</b> is 6.2.01');
})

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
      // yield this.roomClient.sendNotification('Sending resolved White Label tickets to '+qaUser+'...');
      // getTickets('CFVI-1');
      // console.log('moving whitelabel tickets');
    }

    if (this.content.indexOf('Fusion: The Home Depot: US (Staging)') > 0) {
      yield this.roomClient.sendNotification('Sending resolved THD-US tickets to '+qaUser+'...');
      getTickets(jira.thd_us);
    }

    if (this.content.indexOf('Fusion: Best Buy (Staging)') > 0) {
      yield this.roomClient.sendNotification('Sending resolved BB tickets to '+qaUser+'...');
      getTickets(jira.bestbuy);
    }

    if (this.content.indexOf('Fusion: Shell (Staging)') > 0) {
      yield this.roomClient.sendNotification('Sending resolved SHL tickets to '+qaUser+'...');
      getTickets(jira.shell);
    }

    if (this.content.indexOf('Fusion: Sears (Staging)') > 0) {
      yield this.roomClient.sendNotification('Sending resolved SRS tickets to '+qaUser+'...');
      getTickets(jira.sears);
    }
  }
});


function getTickets(partner) {
  args = {
    headers: authHeader
  };
  returnArray = []
  q = buildQueryString(partner);
  client.get(jiraApiUrl + q, args, function(data, response) {
    if(data.issues) {
      for(var i = 0; i < data.issues.length; i ++) {
        assignTicket(data.issues[i].key);
      }
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

function buildQueryString(partner) {
  returnString = 'search?jql=(';
  for (var i = 0; i < jira.developers.length; i ++) {
    returnString += 'assignee%3D' + jira.developers[i];
    if (i < jira.developers.length - 1) {
      returnString += '%20OR%20'
    }
  }
  returnString += ')%20AND%20project%3DCFVI%20AND%20status%3Dresolved%20AND%20('
  returnString += '%22Epic%20Link%22%20%3D'+partner.epic
  returnString += '%20OR%20'
  returnString += 'component%3D'+partner.component
  returnString += ')'
  return returnString;
}


 
app.listen();
