"use strict"

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
var request = require('request');
const app = express();
app.use(express.json());

app.get("/filestore", (req, res) => {  //Endpoint to fetch image from catalyst filestore
  let Name = req.query.name;
  var app = catalyst.initialize(req);
  let filestore = app.filestore();
  let folderPromise = filestore.getFolderDetails(7867000000027003); //Fetch the file details of Userimage
  folderPromise.then((folder) => {
    folder = folder.toJSON(); // Convert into json
    console.log(folder.file_details);
    console.log(folder.Folder);


    folder.file_details.forEach(element => { // loops for each file in the json match the user image
      if (element.file_name == Name +".jpg") { 
        let folder1 = filestore.folder(7867000000027003);
        let downloadPromise = folder1.downloadFile(element.id);
        downloadPromise.then((fileObject) => {
          res.set('Content-Disposition', `attachment; filename="result.jpg"`); // Set file name for the image and send it as attachment
          res.status(200).send(fileObject);
        });
      }

    })
  });
});


app.post("/cliqcall", (req, res) => {

  const requestBody = req.body;
  var globaltoken = '';
  let text = "";

  // Fetch Access token from Refresh token.
  var options = {
    'method': 'POST',
    'url': 'https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.b3984fce473d32529bea2d30069c5489.317dcb9495f25dcf04c2f5f5564a6c93&grant_type=refresh_token&scope=ZohoCliq.Channels.CREATE,ZohoCliq.Channels.READ,ZohoCliq.Channels.UPDATE,ZohoCliq.Channels.DELETE,ZohoPeople.forms.READ,ZohoPeople.employee.READ,ZohoPeople.attendance.READ,ZohoCliq.Chats.READ,ZohoPeople.forms.READ,ZohoPeople.employee.READ,ZohoPeople.attendance.READ,ZohoCliq.Users.READ,ZohoCliq.Messages.READ,ZohoBugTracker.portals.READ,ZohoProjects.tasks.READ,ZohoProjects.projects.ALL,ZohoProjects.portals.ALL,ZohoProjects.projects.ALL,ZohoProjects.activities.ALL,ZohoProjects.feeds.ALL,ZohoProjects.status.ALL,ZohoProjects.milestones.ALL,ZohoProjects.tasklists.ALL,ZohoProjects.tasks.ALL,ZohoProjects.timesheets.ALL,ZohoProjects.bugs.ALL,ZohoProjects.events.ALL,ZohoProjects.forums.ALL,ZohoProjects.clients.ALL,ZohoProjects.users.ALL,ZohoProjects.documents.READ,ZohoProjects.search.READ,ZohoProjects.tags.ALL,ZohoProjects.calendar.ALL,ZohoProjects.integrations.ALL,ZohoProjects.projectgroups.ALL,ZohoProjects.entity_properties.ALL,ZohoPC.files.ALL,WorkDrive.workspace.ALL,WorkDrive.files.ALL,WorkDrive.team.ALL&client_id=1000.9VQ3VHFOKKJRS6A6VNV4B25KCUFGJD&client_secret=3b569957b62357e2477fdce11bd919d8163374665b&redirect_uri=https://accounts.zohoportal.com/accounts/extoauth/clientcallback/',
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var jsonObject = JSON.parse(response.body);
    globaltoken = jsonObject.access_token;        // Access token

    //  Get user information from Cliq API
    var options1 = {
      'method': 'GET',
      'url': 'https://cliq.zoho.com/api/v2/users?fields=all',
      'headers': {
        'Authorization': 'Zoho-oauthtoken ' + globaltoken,
        'Content-Type': 'application/json'
      }
    };
    request(options1, function (error, response) {
      if (error) throw new Error(error);
      var jsonObject1 = JSON.parse(response.body);
      console.log(jsonObject1);
      jsonObject1.data.forEach(element => {             // loop for all the users in cliq and match the user you want and get addiotional details.
        if (element.name.includes(requestBody.name)) {

          console.log("found name" + element.first_name);
          res.header("Access-Control-Allow-Headers", "*")

          // Send response 
          res.status(200).send(JSON.stringify({
            "name": element.first_name,                 // first name
            "Reporting": element.reportingto.name,      // Reporting
            "department": element.department.name,      // Department
            "work_location": element.work_location      //Location
          }));


        }
      });
    });

  });
});


// Endpoint to query the Cliq message,  Text summary and Bug details
app.post("/more_user_details", (req, res) => {
  const requestBody = req.body;
  console.log(req.body.name)
  var globaltoken = '';
  let text = "";

  /// Get Access token using request
  var options = {
    'method': 'POST',
    'url': 'https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.b3984fce473d32529bea2d30069c5489.317dcb9495f25dcf04c2f5f5564a6c93&grant_type=refresh_token&scope=ZohoCliq.Channels.CREATE,ZohoCliq.Channels.READ,ZohoCliq.Channels.UPDATE,ZohoCliq.Channels.DELETE,ZohoPeople.forms.READ,ZohoPeople.employee.READ,ZohoPeople.attendance.READ,ZohoCliq.Chats.READ,ZohoPeople.forms.READ,ZohoPeople.employee.READ,ZohoPeople.attendance.READ,ZohoCliq.Users.READ,ZohoCliq.Messages.READ,ZohoBugTracker.portals.READ,ZohoProjects.tasks.READ,ZohoProjects.projects.ALL,ZohoProjects.portals.ALL,ZohoProjects.projects.ALL,ZohoProjects.activities.ALL,ZohoProjects.feeds.ALL,ZohoProjects.status.ALL,ZohoProjects.milestones.ALL,ZohoProjects.tasklists.ALL,ZohoProjects.tasks.ALL,ZohoProjects.timesheets.ALL,ZohoProjects.bugs.ALL,ZohoProjects.events.ALL,ZohoProjects.forums.ALL,ZohoProjects.clients.ALL,ZohoProjects.users.ALL,ZohoProjects.documents.READ,ZohoProjects.search.READ,ZohoProjects.tags.ALL,ZohoProjects.calendar.ALL,ZohoProjects.integrations.ALL,ZohoProjects.projectgroups.ALL,ZohoProjects.entity_properties.ALL,ZohoPC.files.ALL,WorkDrive.workspace.ALL,WorkDrive.files.ALL,WorkDrive.team.ALL&client_id=1000.9VQ3VHFOKKJRS6A6VNV4B25KCUFGJD&client_secret=3b569957b62357e2477fdce11bd919d8163374665b&redirect_uri=https://accounts.zohoportal.com/accounts/extoauth/clientcallback/',
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var jsonObject = JSON.parse(response.body);
    globaltoken = jsonObject.access_token;        // Access token
    //Get Cliq chat information to identify chat id
    var options = {
      'method': 'GET',
      'url': 'https://cliq.zoho.com/api/v2/chats',
      'headers': {
        'Authorization': 'Zoho-oauthtoken ' + globaltoken,
        'Content-Type': 'application/json'
      }
    };

  
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
      jsonObject = JSON.parse(response.body);
      //console.log(globaltoken);
      var last_modified_time = "";
      var chat_id = "";
      jsonObject.chats.forEach(element => {  // loop for all the conversations to identify the recipients in the conversation 
        if ((element.recipients_summary[0].name.includes(requestBody.name)) || (element.recipients_summary[1].name.includes(requestBody.name))) {
          chat_id = element.chat_id;  // Chat id
          last_modified_time = element.last_modified_time  // Last modified date of the conversation
        }
      });
      //Get last 20 conversations of the chat using chat id.
      var options = {
        'method': 'GET',
        'url': 'https://cliq.zoho.com/api/v2/chats/' + chat_id + '/messages?limit=20',
        'headers': {
          'Authorization': 'Zoho-oauthtoken ' + globaltoken,
          'Content-Type': 'application/json'
        }
      };

      request(options, function (error, response) {
        if (error) throw new Error(error);
        //console.log(globaltoken);
        var jsonObject1 = JSON.parse(response.body);


        jsonObject1.data.forEach(element => {     // Add all the text messages 
          text += element.content.text + "  ";
        });
        console.log(text);

        //////////////////////Test Summarisation call///////////
        //Pass the complete cliq conversation into text summarisation
        var options = {
          'method': 'GET',
          'url': 'https://irrrsystem.facerecognition.ngrok.io/summarisetext',
          'headers': {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "text": text
          })
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          var jsonObject = JSON.parse(response.body);
          text = jsonObject.msg;

          // Get all the bugs from the Zoho Bug tracker API
          var options1 = {
            'method': 'GET',
            'url': 'https://projectsapi.zoho.com/restapi/portal/675729928/projects/1339873000000427005/bugs/',
            'headers': {
              'Authorization': 'Zoho-oauthtoken ' + globaltoken,
              'Content-Type': 'application/json'
            }
          };
          request(options1, function (error, response) {
            if (error) throw new Error(error);
            var jsonObject1 = JSON.parse(response.body);
            //console.log(jsonObject1);

            var result = [];
            jsonObject1.bugs.forEach(element => { // Loop and select only the bugs from specific user
              if (element.assignee_name == requestBody.name) {
                result.push(element);
              }
            });

            res.header("Access-Control-Allow-Headers", "*") //Header to avoid CORS issue in the sender side

            res.status(200).send(JSON.stringify({ // Send response 
              "message": text,
              'Bugs': result,
              "last_modified_time": last_modified_time.slice(0, 10)
            }));
          });
        });
      });

    });
  });
});
module.exports = app;
