# Groupify – User Manual  
**Version:** 1  
**Team Name:** The Survivors  
**Date:** 10/05/2026  


---


## 1. Introduction
Groupify is a collaborative web application designed to help users organize groups, manage shared tasks, and coordinate schedules in one place. It is built for students, project teams, and small organizations that need a simple, efficient way to stay connected and keep everyone aligned.


---


## 2. System Requirements
- **Hardware:** Minimum 4GB RAM, 2-core processor, 10GB free storage, and a stable internet connection.
- **Software:** Windows 10/11, macOS, or Linux; modern web browser such as Google Chrome, Microsoft Edge, or Firefox; Python 3.10+; Node.js v18+; Git.
- **Other Dependencies:** A local or hosted database, a `.env` file for configuration settings, and any required API keys or environment variables.

---


## 3. Installation Guide
No installation required
Application Link: https://team-12-6vv0.onrender.com/


---


## 4. Getting Started
1. Launch the application using the instructions in the Installation Guide and open the app in your browser.
2. Create an account or log in with your existing credentials.
3. Set up your profile and join or create a group.
4. Invite members to your group and begin creating tasks, assigning responsibilities, and tracking progress.
5. Use the dashboard to view upcoming deadlines, team activity, and shared updates.


---


## 5. Features & Functions
### Feature 1: Sign Up
**What it does:** Lets users create an account and access Groupify.

**How to use it:**
1. Open Groupify.
2. Select Sign Up to create an account.
3. Fill in a unique username, strong password, and an email unaffiliated with an existing account.
4. Clicking Sign Up will direct the user to the Profile Details page, Skills Selection page, and Weekly Availability page. This can be skipped and done later in the profile page.

![Groupify Sign-in Page](images/signuppage.png)

*Figure 1. Sign-up Page*

![Groupify Sign-up page](images/signuperror.png)

*Figure 2. Sign-up Page with error messages*

### Feature 2: Log In and Forgot Password
**What it does:** Lets users log into an existing account and access Groupify.

**How to use it:**
1. Open Groupify.
2. Select Sign In to log into an account.
3. Fill in an existing username or email and a password affiliated with the account.
4. Clicking Sign In will direct the user homepage.
5. On the Sign In page, the user can also click Forgot Password if the user does not remember their password.
6. The Forgot Password page will prompt the user for their email address.
7. After submitting the email, the user is taken to the Reset Password page and is sent a OTP to their email address.
8. With the OTP, the user can create a new password, confirm the new password, and log in.

![Groupify Sign-in Page](images/signinpage.png)

*Figure 1. Log-in Page*

![Groupify Sign-in Page with error messages](images/signinerror.png)

*Figure 2. Log-in Page with error messages*

### Feature 3: Profile Details, Skills Selection, and Weekly Availability
**What it does:** Lets users fill out their profile during sign up.

**How to use it:**
1. Open Groupify.
2. Select Sign Up and create an account.
3. The user gets taken to the Profile Details page. Enter in the details by clicking on the form boxes and typing. The user can skip this for later by clicking Skip For Now.
4. The user gets taken to the Skills Selection page. Type in a skill and click add to "Add" to the list. The user can skip this for later by clicking Skip For Now.
5. The user gets taken to the Weekly Availability page. Click on the available button next to the days one is available on, and enter in the start and end time of one's availability on that day. The user can skip this for later by clicking Skip For Now.

![Groupify Profile Details Page](images/profiledetails.png)

*Figure 1. Profile Details Page*

![Groupify Skills Selection Page](images/skillsselection.png)

*Figure 2. Skills Selection Page*

### Feature 5: Workspaces
**What it does:** Lets users create or join groups within a workspace and access those groups.

**How to use it:**
1. Be signed in to an account.
2. Click on Join Workspace to join a workspace with an existing code given to the user.
3. Enter the code on into the form box and click Join Workspace. If the user is already in the workspace or if the code is invalid, there will be an error message.
4. Click on Create Workspace to create a workspace.
5. Fill out a workspace name and description (optional) and click Create Workspace. The user will receive an error message if the workspace name is shorter than 3 characters.
6. When the workspace is created or joined, it will appear on the homepage and can be clicked to access it.
   
![Groupify Homepage (No Workspaces Yet)](images/homepagenowork.png)

*Figure 1. Homepage (No Workspaces Yet)*

![Groupify Join Workspace Page](images/joinwork.png)

*Figure 2. Join Workspace Page*

### Feature 6: Groups
**What it does:** Lets users create or join groups within a workspace and access those groups.

**How to use it:**
1. Be signed in to an account.
2. Click on a workspace to enter onto the Workspace page.
3. On the Workspace page, click Join Group.
4. On the Join Group page, you can request to join a private group or join a public group.
5. On the Workspace page, click Create Group.
6. On the Create Group page, enter in a group name, the description (optional), and join type (public/private), and then click Create Group.

![Groupify Create Group Page/UI NOT FINISHED](images/creategroup.png)

*Figure 1. Create Group Page*

![Groupify Join Group Page/UI NOT FINISHED](images/joingroup.png)

*Figure 2. Join Group Page*

### Feature 7: Groupchat
**What it does:** Lets users chat within a workspace or group.

**How to use it:**

**Workspace Groupchat:**
1. Be signed in to an account.
2. Click on a workspace to enter onto the Workspace page.
3. On the Workspace page, click Groupchat to access the workspace groupchat.
4. The user can type in a message and send a message to the groupchat by clicking the send button.

**Group Groupchat:**
1. Be signed in to an account.
2. Click on a workspace to enter onto the Workspace page.
3. Click on a group within a workspace to enter onto the group page.
4. On the Group page, click Groupchat to access the group page's groupchat.
5. The user can type in a message and send a message to the groupchat by clicking the send button, or click on an individual user on the left panel to chat individually.

![Groupify Workspace Groupchat/UI NOT FINISHED](images/workgroupchat.png)

*Figure 1. Groupchat Page in a Workspace*

![Groupify Group Groupchat/UI NOT FINISHED](images/groupgroupchat.png)

*Figure 2. Groupchat Page in a Workspace*

### Feature 8: Planning
**What it does:** Lets users plan projects within a group.

**How to use it:**
1. Be signed in to an account.
2. Click on a workspace to enter onto the Workspace page.
3. Click on a group within a workspace to enter onto the group page.
4. On the Group page, click Planning to access the Planning page.
5. The user can type in a message and send a message to the groupchat by clicking the send button, or click on an individual user on the left panel to chat individually.

![Groupify Planning Page/UI NOT FINISHED](images/planningpage.png)

*Figure 1. Planning Page*

![Groupify Planning Page with content filled out/UI NOT FINISHED](images/planningpagecontent.png)

*Figure 2. Planning Page with content filled out*

### Feature 8: AI Optimal Group Suggestions
**What it does:** Lets users view personalized group recommendations in a workspace.

**How to use it:**
1. Be signed in to an account.
2. Click on a workspace to enter onto the Workspace page.
3. Click on a the AI Optimal Group Suggestions button (the small button with the stars).
4. Scroll on the AI Suggestions page to see the personalized suggestions for group formations.

![Groupify AI Suggestions Page/UI NOT FINISHED](images/aisuggestionspage.png)

*Figure 1. AI Suggestions Page*

![Groupify AI Suggestions Page Continued/UI NOT FINISHED](images/aisuggestionspage2.png)

*Figure 2. AI Suggestions Page Continued*

### Feature 9: Profile Customization
**What it does:** Lets users edit their profile on the profile page.

**How to use it:**
1. Be signed in to an account.
2. Click on a the profile icon on the right part of the header.
3. Click on Edit Profile on the profile page to edit one's profile.
4. Click Change Photo to change one's profile photo.
5. Enter in details in the form boxes and click save to update profile information.
6. Enter in skills and click "Add" to add them in to the skills box. Hit save to save changes.
7. Click Edit Availability to get taken to the Weekly Availability page to edit one's availability. Click on the available button next to the days one is available on, and enter in the start and end time of one's availability on that day.
8. Click Exit if the user does not want to save changes

![Groupify Profile Page/UI NOT FINISHED](images/profilepage.png)

*Figure 1. Profile Page*

![Groupify Edit Profile Page/UI NOT FINISHED](images/editprofile.png)

*Figure 2. Edit Profile Page*

---


## 6. Troubleshooting examples
| Problem | Cause | Solution|
|---|---|---|
| App will not launch | Missing dependencies | Run `npm install` before launching. |
| Login fails | Incorrect credentials | Verify email spelling or click "Reset Password". |
| Reset OTP email did not arrive | Email delay, incorrect email inputted | Verify email is correct and click resend code and wait. |
| Workspace could not be joined | Join code is incorrect or user is already in workspace | Verify the join code is correct and check if one is already in the workspace |
| AI Suggestions are inaccurate | Not enough users in workspace or profile page is not filled out for enough users | Fill out one's profile page, and share the join code with more users |
---

## 7. Contact Information
- **Support Email:** groupifya@gmail.com
- **Project Repository:** https://github.com/tobifotis/team-12 


## 8. FAQ
**Q:** Do I need to install software to use Groupify?  
**A:** No. Groupify is a web-based application, so you can use it directly in a browser.

**Q:** Can I create or join groups?  
**A:** Yes. You can create a new group or join an existing one if you have an invitation or access link.

**Q:** Do I have to pay for to use this application?  
**A:** No. This application is completely free to use.
