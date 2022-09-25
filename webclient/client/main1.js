// YOUR JAVASCRIPT CODE FOR INDEX.HTML GOES HERE
const player = document.getElementById('player');
const captureButton = document.getElementById('capture-button');
const outputCanvas = document.getElementById('output');
const context = outputCanvas.getContext('2d');



// Enable the Camera access through the video-player DOM element 
navigator.mediaDevices
  .getUserMedia({ video: { facingMode: "environment" } })
  .then((stream) => {
    player.srcObject = stream;
  }).catch(error => {
    console.error('Can not get an access to a camera...', error);
  });



var u_name = "";
captureButton.addEventListener('click', () => {  // Event listner for camera button click
  function postFile(file) {
    let formdata = new FormData(); // Create empty form data

    formdata.append("image", file);  //append the image into formdata

    // Create a request to face recognition endpoint and get the user present in the image
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://irrrsystem.facerecognition.ngrok.io/find_person', true);
    xhr.send(formdata);
    xhr.onload = function () {
      if (this.status === 201) {        // on success
        console.log(this.response);
        var myArr = JSON.parse(this.responseText);
        u_name = myArr.Name;            // Identified user name

        ///Send request to catalyst function to get the employee details 
        let xhr1 = new XMLHttpRequest();
        var messageData = "";
        xhr1.open('POST', 'https://irrr-787344998.development.catalystserverless.com/server/Test1/cliqcall');
        xhr1.setRequestHeader("Content-Type", "application/json");

        xhr1.send(JSON.stringify({ "name": u_name }));  //Compose json response and send it.
        xhr1.onload = function () {
          if (this.status === 201 || this.status === 200) {        // on success
          console.log(this.response);
          messageData = JSON.parse(this.responseText);
          console.log(messageData.message);
          var x = document.getElementById("snackbar");

          var x1 = `
          <div class=" bg-dark d-grid gap-2 d-md-flex  justify-content-md-end">
          <button type="button" class="btn-close" id='closeButton' onclick = "myfunction2()" aria-label="Close" style="background-color:#fff;"></button>
          </div>
          <h5><center>Employee Details recognised using Face recognition <center> </h5>
          <div class="card" >
          <div class="card-body" style="background-color:#797171;">
          <div class="d-flex p-2">
           <div class="row">
             <div class="col-2 p-2 d-flex align-items-center justify-content-center">
             <img class="img2 " src="https://irrr-787344998.development.catalystserverless.com/server/Test1/filestore?name=${messageData.name}" alt="User" width="70" height="70">
             </div>
             <div class="col-10">
             <div class="p-1 textarea">
             <h6>${"Name :"}  ${messageData.name}<br/>${"Reporting to :"}  ${messageData.Reporting}<br/>${"Department :"}  ${messageData.department}</br>${"Location :"}  ${messageData.work_location}</h6>
            </div>
            </div>
            </div>
            </div>
            <button id="Detailsbutton1" type="button" onclick = "myfunction()"  class="btn btn-primary "> More Details</button>
            </div>     
         </div>
         `;
          // x.innerHTML =myArr.Name;
          x.innerHTML = "";
          x.innerHTML += x1;
          x.className = "show";
        }

      }
    }
      else {
        console.error(xhr);
      }
    };

  }

  // Get the real size of the picture
  const imageWidth = player.offsetWidth;
  const imageHeight = player.offsetHeight;

  // Make our hidden canvas the same size
  outputCanvas.width = imageWidth;
  outputCanvas.height = imageHeight;

  // Draw captured image to the hidden canvas
  context.drawImage(player, 0, 0, imageWidth, imageHeight);
  outputCanvas.toBlob(postFile, 'image/jpeg');
});


function myfunction() {   // Executed on more details button is pressed

  var x = document.getElementById("snackbar");    //Snackbar
  x.innerHTML = "";
  x.className = "show";
  setTimeout(function () { x.className = x.className.replace("show", ""); }, 0);
  let xhr1 = new XMLHttpRequest();
  var messageData = "";

  // Create request to the catalyst functions to get the bug and cliq text summary of the user.
  xhr1.open('POST', 'https://irrr-787344998.development.catalystserverless.com/server/Test1/more_user_details');
  xhr1.setRequestHeader("Content-Type", "application/json");
  xhr1.send(JSON.stringify({ "name": u_name }));             // Add user name in the input payload
  xhr1.onload = function () {
    JSON.stringify(messageData)
    console.log(this.response);
    messageData = JSON.parse(this.responseText);

    /// loop and append bug data into a card a
    var bugArray = "";
    messageData.Bugs.forEach(element => {
      bugString = `   <div class="card" >
      <div class="card-body" style="background-color:#797171;">
      <div class="card-title"><h5> ${element.title}</h5>
        <p >Assignee Name :  ${element.assignee_name}</p>
        <p >Reporter Name :  ${element.reported_person}</p>
        <p >Created Date :  ${element.created_time}</p>
        <p >Priority :  ${element.severity.type}</p>
      </div>
      </div>`
      bugArray += bugString;

    });
    // Add the text Cliq message summary and bugs into  list 
    var x = document.getElementById("snackbar1");
    x.innerHTML = "";
    var x2 = JSON.stringify(messageData);
    var x1 = `
    <div class=" bg-dark d-grid gap-2 d-md-flex  justify-content-md-end">
    <button type="button" class="btn-close" id='closeButton' onclick = "myfunction1()" aria-label="Close" style="background-color:#fff;"></button>
    </div>
   <div class="d-flex p-2">
   <div class="row">
     <div class="col-12">
     <h5>Recent Conversation Summary</h5>
      <div class="card" >
      <div class="card-body" style="background-color:#797171;">
      <p class="card-text">Mode :  Zoho Cliq</p>
      <p class="card-text">Last Interaction :   ${messageData.last_modified_time}</p>
      <h6>Conversation Summary</h6>
      <p class="card-text"> ${messageData.message}</p>
    </div>
  </div>
  </div>
  </div>
 </div>
 <div class="p-2">
   <div class="row">
     <div class="col-12">
     <h5>Recent Bug Report</h5>
     ${bugArray}
    </div>
 </div>`

    x.innerHTML += x1;  //Add elements with the Snackbar.
    x.className = "show";
    // setTimeout(function () { x.className = x.className.replace("show", ""); }, 20000); // Timeout to hide the snackbar

  }
}
function myfunction1() { // Function to execute on close button click

  var x = document.getElementById("snackbar1");
  x.innerHTML = "";
  x.className = "show";
 x.className = x.className.replace("show", "");
}

function myfunction2() { // Function to execute on close button click

  var x = document.getElementById("snackbar");
  x.innerHTML = "";
  x.className = "show";
  x.className = x.className.replace("show", ""); 
}
