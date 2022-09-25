# aiRRR
Interaction based Recognition, Rumination &amp; Response using AI (Artificial Intelligence) and AR (Augmented Reality)

   From a brain basis of human-to-human social interaction, human vision (through eyes) would be the primary sense stimuli for a scene understanding. When a person P1 meets/interacts with another person P2, instinctively (from a psychological perspective), P1 automatically gazes at P2's face for the identification/recognition of the P2. Once identified, the human (brain) ruminates and tries to recall the last interaction if memories of the interaction are available. Once P1 gets a summary of the recent interactions with  P2, P1 would like to respond to P2 within the context of the previous interactions.
   In today's world, Smartphones have become one of the primary devices through which we communicate and compute. With the advances in AIoT, AR, & 5G, Augmented Reality based glasses could snap up the interactive computing portions and relegate smartphones to a secondary device. The above scenario can now be simulated in an organizational setup with an AI-equipped AR glass.
   In a software organization, a software project manager (PM) wearing an AR glass organizes a bug resolution hybrid meeting (physical and virtual simultaneously) with the testing team. Utilizing AI-based microservices, the AR glass will do face recognition of members (depending on the direction of gaze by PM) attending the meeting (physically/virtually) and retrieve their details (Name, Dept, Role) and display it on the glass. If the PM intends to interact with a Software Testing Lead (STL) regarding a critical bug, he would get a summary (after extensive rumination through deep learning) of the earlier interactions done with the STL on the company owned email/messaging platform regarding the bug. The PM may want to provide an update on the bug during the meeting, so a response may be drafted by advanced AI-based systems to assist the PM in initiating a dialog/conversation regarding the bug.


List a few benefits of using your app:
1. Productive interactions within the organization
2. Shorter physical/virtual meetings & Quicker resolution of bugs saving time
3. More scenarios could be explored using the above model reaping greater benefits for the organization

How do you plan to achieve this using Catalyst? List features and functionalities of Catalyst that your app will cover:
   A simplified prototype of the above scenario is planned for implementation:
      1. Web app in Zoho catalyst to capture image from camera
      2. Face Analytics and recognition using Zoho Catalyst and third party web services
      3. Streaming Captured camera images from Catalyst webapp to face recognition API to identify the member
      4. Once the user present in the image is identified, we create a webservice in catalyst functions to query the last few messages/message context of the specific user from Zoho Cliq

Catalyst services to be used in the project:
       Develop - Data Store, File Store
       Compute - Functions
       Hosting And Manage - Web Client Hosting
       Zia Services - Face Analytics
