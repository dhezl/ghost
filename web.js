var ack = require('ac-koa').require('hipchat');
var pkg = require('./package.json');
var app = ack(pkg);

var addon = app.addon()
  .hipchat()
  .allowRoom(true)
  .scopes('send_notification');

var http = require('http');

// curl -u davidhezlep:Oliver00! https://razorfish-central.atlassian.net/rest/api/2/issue/CFVI-7

// curl -u davidhezlep:Oliver00! https://razorfish-central.atlassian.net/rest/api/2/search?jql=assignee%3Ddavidhezlep%20AND%20project%3DCFVI%20AND%20status%3Dresolved
var jiraApiUrl = "https://razorfish-central.atlassian.net/rest/api/2/"

if (process.env.DEV_KEY) {
  addon.key(process.env.DEV_KEY);
}

// addon.webhook('room_message', function *() {
//   if(this.message.indexOf('/hello') > -1) {
//     yield this.roomClient.sendNotification('Hi, '+this.sender.name+'!');
//   }

//   if(this.message.indexOf('/timeline') > -1) {
//     yield this.roomClient.sendNotification('Batch 1 (THD US, BBY, WL): <br> Dev complete: 5/1 <br> Handoff: 5/8 <br><br> Batch 2 (SEARS, SHELL, Marketing 1): <br> Dev complete: 5/20 <br> Handoff: 5/29');
//   }

// });
 
addon.webhook('room_message', /^\/timeline$/, function *() {
  yield this.roomClient.sendNotification('<b>Batch 1 (THD US, BBY, WL):</b> <br> Dev complete: 5/1 <br> Handoff: 5/8 <br><br> <b>Batch 2 (SEARS, SHELL, Marketing 1):</b> <br> Dev complete: 5/20 <br> Handoff: 5/29');
});

addon.webhook('room_message', /^\/hello$/, function *() {
  yield this.roomClient.sendNotification('Hi, '+this.sender.name+'!');
});

addon.webhook('room_message', /^.*deployed.*$/, function *() {
  yield this.roomClient.sendNotification('DEPLOYED!');
})


// addon.webhook('room_message',  function *() {
//   yield this.roomClient.sendNotification("test");
// }); 
 
app.listen();
