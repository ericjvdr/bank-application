# BANK-APPLICATION

Authors:

- Aidin Tavassoli, aidin.tavassoli@csu.fullertone.edu
- Eric van der Roest, ericjvdr@csu.fullerton.edu
- Priyanka Kadam, priyankakadam@csu.fullerton.edu

Our bank application allows a user to register for an account at the bank. 
They have to input their first name, last name, email, password, and address.
Once created, the user will be able to login with their email and password.
They will have a checking account and a savings account with balances of 0.
After logging in or registering, the user is presented with the dashboard and has these options: 

- view account balances, deposit money, withdraw money, transfer money between their own accounts, logout

We are using xssFilters for registering and logging in to sanitize user information to protect against XSS.
When a user logs in, they will be authenticated against our database (Mariadb).
If their credentials don't match, then they will not have access to the bank.
Viewing their accounts will display their current checking and savings balances.
Depositing money will allow the user to deposit money into their checking or savings.
The database will then be updated.
This is how we are checking the user's input for depositing, withdrawing, and tansferring money:

- the front end does not allow the input to be negative and that the format is ##.##
- using xssFilters on the user's input
- the back end validates by checking if it's a NaN or a whole number
- withdrawing money checks if the balance is <= 0 or if the balance is <= amount inputed
- transferring money does not allow the transferring of money to the same account (e.g., checking -> checking)
- if the input is invalidated, the user will be directed to a "Try Again" page.

We are using "helmet-csp" for content security policies.
defaultSrc is set to "self", so our application only accepts scripts from the home server.
We are using "client-sessions" to manage the user's session.
The user will be tied to a cookie once they login or register.
If there is a session, the user does not have to log in and is presented with the dashboard.
The session duration is set to 3 minutes, so the user be logged out if there is no activity for 3 minutes.
The session active-duration is set to 3 minutes, so if there is activity, the session will increase by 3 minutes.
The session gets removed when the user logs out.
The session is httpOnly, so javascript does have access to the cookie.
Also, we have a global function that checks for a session.
If there is a session, it deletes the password associated with that cookie becuase our session is tied to a customer object.
The customer object has all of the customer's info in it.
We have a function that checks if the user is logged in and applied to these routes:

- /dashboard, /viewAccounts, /deposit, /withdraw, /transfer

If the user is not logged in, they will be directed to the login page.


## STEPS TO RUN APPLICATION 

Prerequisites:
npm install xss-filters
npm install helmet-csp
npm install mysql2
npm install client-sessions

Create a Mariadb user with the following credentials:

user: "bankappaccount",
password: "apppass",

Use this command to create a user:

CREATE USER 'bankappaccount'@localhost IDENTIFIED BY 'apppass';

Then initialize and grant privileges to the program with the following queries:

CREATE DATABASE BankApp;
GRANT ALL PRIVILEGES ON BankApp.* TO 'bankappaccount'@'localhost' IDENTIFIED BY 'apppass';

- Initialize the empty database by running the command: node db_inti.js
- Then start the bank application with this command: node app.js
- The server is running locally on port 3000
- Navigate to http://localhost:3000 in your browser
- Log in or register to use application 
