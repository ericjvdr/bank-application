"use strict";

const express = require("express");
const xssFilters = require("xss-filters");
const csp = require("helmet-csp");
const bodyParser = require("body-parser");
const session = require("client-sessions");
const mysql = require("mysql2");
const { response } = require("express");
const app = express();
const PORT = 3000;
const secretWord = "Xn6iW%YfkD4M6gzmeaVktLS*tEDLM@";
const sessionName = "session";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  csp({
    directives: {
      defaultSrc: ["'self'"],
    },
  })
);

// session handler middleware
app.use(
  session({
    cookieName: sessionName,
    secret: secretWord,
    duration: 3 * 60 * 1000, // session ends in 3 minutes
    activeDuration: 3 * 60 * 1000, // adds 3 minutes if user is active
    httpOnly: true,
  })
);

// global middleware function to check for session
// deletes customer password associated with session
app.use(function (req, res, next) {
  if (req.session && req.session.customer) {
    req.customer = customer;
    delete req.customer.password;
    req.session.customer = customer;
    res.locals.user = customer;
    next();
  } else {
    next();
  }
});

// requires user to be logged in to access bank
// redirects to login page if not logged in
function requireLogin(req, res, next) {
  if (!req.customer) {
    res.sendFile(__dirname + "/login.html");
  } else {
    next();
  }
}

// creates DB connection
const mysqlConn = mysql.createConnection({
  host: "localhost",
  user: "bankappaccount",
  password: "apppass",
  multipleStatements: true,
});

// connect to DB
mysqlConn.connect(function (err) {
  if (err) throw err;
  console.log("Connected to Database!");
});

function Customer(
  id,
  firstName,
  lastName,
  email,
  password,
  address,
  checking,
  savings
) {
  this.id = id;
  this.firstName = firstName;
  this.lastName = lastName;
  this.email = email;
  this.password = password;
  this.addres = address;
  this.checking = checking;
  this.savings = savings;
}
Object.seal(Customer);
let customer = {};

const dollarRegex = /^\d+(?:\.\d{0,2})$/;

function isWholeNumber(n) {
  return n % 1 === 0;
}

// Helper function that validates the dollar amount input value
// Returns True if valid
// @param string - input from readline

function validateMoney(amount) {
  if (isNaN(amount)) {
    //console.log("Not valid dollar amount. Check your dollar input. It needs to follow he format ##.##");
    return false;
  } else {
    if (dollarRegex.test(amount)) {
      return true;
    } else {
      //console.log("Not valid dollar amount. Check your dollar input");
      return false;
    }
  }
}

function getTotalBalance(type, req) {
  if (type === "checking") {
    // let balance = req.session.customer.checking;
    return customer.checking;
  } else {
    // let balance = req.session.customer.savings;
    return customer.savings;
  }
}

function dashboardPage(name, response) {
  let pageStr = "	<!DOCTYPE html>";
  pageStr += "	<html>";
  pageStr += "	<head>";
  pageStr += "		<title>Dashboard</title>";
  pageStr += "	</head>";
  pageStr += "	<body bgcolor=white>";
  pageStr +=
    "        <div><h3>Welcome to the bank, " +
    name +
    ". This is your dashboard.</h3></div>";
  pageStr += "          <hr>";
  pageStr += "          <br>";
  pageStr += "        <div>";
  pageStr +=
    "            <a href='/viewAccounts' type='button'>View Accounts</a>";
  pageStr += "            <a href='/deposit' type='button' >Deposit</a>";
  pageStr += "            <a href='/withdraw' type='button'>Withdraw</a>";
  pageStr += "            <a href='/transfer' type='button'>Transfer</a>";
  pageStr += "            <a href='/logout' type='button'>Logout</a>";
  pageStr += "        </div>";
  pageStr += "	</body>";
  pageStr += "</html>	";

  response.send(pageStr);
}

function accountsPage(name, chkBal, svgBal, response) {
  name = customer.firstName + " " + customer.lastName;
  chkBal = customer.checking / 100;
  svgBal = customer.savings / 100;

  let pageStr = "	<!DOCTYPE html>";
  pageStr += "	<html>";
  pageStr += "	<head>";
  pageStr += "		<title>View Accounts</title>";
  pageStr += "	</head>";
  pageStr += "	<body bgcolor=white>";
  pageStr += "        <div><h3>";
  pageStr += " " + name + "'s Accounts</h3></div>";
  pageStr += "          <hr>";
  pageStr += "          <br>";
  pageStr += "        <div>";
  pageStr += "<h2>Checking Balance: </h2></div>" + chkBal;
  pageStr += "          <hr>";
  pageStr += "          <br>";
  pageStr += "<div><h2>Savings Balance: </h2></div>" + svgBal;
  pageStr += "          <hr>";
  pageStr += "          <br>";
  pageStr += "            <a href='/dashboard' type='button'>Dashboard</a>";
  pageStr += "            <a href='/logout' type='button'>Logout</a>";
  pageStr += "	</body>";
  pageStr += "</html>	";

  response.send(pageStr);
}

function accountDeposit(name, response) {
  name = customer.firstName;
  let pageStr = "	<!DOCTYPE html>";
  pageStr += "	<html>";
  pageStr += "	<head>";
  pageStr += "		<title>Deposit</title>";
  pageStr += "	</head>";
  pageStr += "	<body bgcolor=white>";
  pageStr += "        <div><h3>" + name + " - Deposit Money</h3></div>";
  pageStr += "          <hr>";
  pageStr += "          <br>";
  pageStr += "          <form action='/deposit' method='post'>";
  pageStr +=
    "          <select name='accounttype' id='accounttype'> Select account type";
  pageStr += "          <option value='checking'>Checking account</option>";
  pageStr += "          <option value='savings'>Saving account</option>";
  pageStr += "          </select><br>";
  pageStr +=
    "          <input type='number' name='amount' min='1' step='0.01' required><br>";
  pageStr += "          <button id='depositSubmit'>Submit</button>";
  pageStr += "          </form>";
  pageStr += "        <div>";
  pageStr += "            <a href='/dashboard' type='button'>Dashboard</a>";
  pageStr += "            <a href='/logout' type='button'>Logout</a>";
  pageStr += "        </div>";
  pageStr += "	</body>";
  pageStr += "</html>	";

  response.send(pageStr);
}

function accountWithdraw(name, response) {
  name = customer.firstName;
  let pageStr = "	<!DOCTYPE html>";
  pageStr += "	<html>";
  pageStr += "	<head>";
  pageStr += "		<title>Withdraw</title>";
  pageStr += "	</head>";
  pageStr += "	<body bgcolor=white>";
  pageStr += "        <div><h3>" + name + " - Withdraw Money</h3></div>";
  pageStr += "          <hr>";
  pageStr += "          <br>";
  pageStr += "          <form action='/withdraw' method='post'>";
  pageStr +=
    "          <select name='accounttype' id='accounttype'> Select account type";
  pageStr += "          <option value='checking'>Checking account</option>";
  pageStr += "          <option value='savings'>Saving account</option>";
  pageStr += "          </select><br>";
  pageStr +=
    "          <input type='number' name='amount' min='1' step='0.01' required><br>";
  pageStr += "          <button id='withdrawSubmit'>Submit</button>";
  pageStr += "          </form>";
  pageStr += "        <div>";
  pageStr += "            <a href='/dashboard' type='button'>Dashboard</a>";
  pageStr += "            <a href='/logout' type='button'>Logout</a>";
  pageStr += "        </div>";
  pageStr += "	</body>";
  pageStr += "</html>	";

  response.send(pageStr);
}

function amountTransfer(name, response) {
  name = customer.firstName;
  let pageStr = "	<!DOCTYPE html>";
  pageStr += "	<html>";
  pageStr += "	<head>";
  pageStr += "		<title>Transfer</title>";
  pageStr += "	</head>";
  pageStr += "	<body bgcolor=white>";
  pageStr += "        <div><h3>" + name + " - Transfer Money</h3></div>";
  pageStr += "          <hr>";
  pageStr += "          <br>";
  pageStr += "          <form action='/transfer' method='post'>";
  pageStr += "          <label> select account to transfer from</label>";
  pageStr +=
    "          <select name='accounttype' id='accounttype'> Select account type";
  pageStr += "          <option value='checking'>Checking account</option>";
  pageStr += "          <option value='savings'>Saving account</option>";
  pageStr += "          </select><br>";
  pageStr += "          <label> select account to transfer to</label>";
  pageStr +=
    "          <select name='accounttypetwo' id='accounttypetwo'> Select account type";
  pageStr += "          <option value='checking'>Checking account</option>";
  pageStr += "          <option value='savings'>Saving account</option>";
  pageStr += "          </select><br>";
  pageStr +=
    "          <input type='number' name='amount' min='1' step='0.01' required><br>";
  pageStr += "          <button id='transferSubmit'>Submit</button>";
  pageStr += "          </form>";
  pageStr += "        <div>";
  pageStr += "            <a href='/dashboard' type='button'>Dashboard</a>";
  pageStr += "            <a href='/logout' type='button'>Logout</a>";
  pageStr += "        </div>";
  pageStr += "	</body>";
  pageStr += "</html>	";

  response.send(pageStr);
}

// To serve the main page
// @param '/index.html': the form handling script
// function(req, resp) callback:
// @param req: the HTTP request
// @param resp: the response we are sending
// redirects to dashboard if there is a session

app.get("/", function (req, res) {
  if (req.session && req.session.customer) {
    let name = req.session.customer.firstName;
    dashboardPage(name, res);
  } else {
    res.sendFile(__dirname + "/index.html");
  }
});

app.route("/register")
  .get(function (_req, res) {
    res.sendFile(__dirname + "/register.html");
  })
  .post(function (req, res) {
    let firstName = xssFilters.inHTMLData(req.body.fname);
    let lastName = xssFilters.inHTMLData(req.body.lname);
    let email = xssFilters.inHTMLData(req.body.email);
    let password = xssFilters.inHTMLData(req.body.password);
    let address = xssFilters.inHTMLData(req.body.address);
    mysqlConn.query(
      "USE bankapp; INSERT INTO customers (`firstname`, `lastname`, `email`, `password`, `address`, `checking`, `savings`) values (?, ?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, password, address, 0, 0],
      function (err, qResult) {
        if (err) throw err;

        console.log(qResult[1]);
        console.log("id---", qResult[1].insertId);

        customer.id = qResult[1].insertId;
        customer.firstName = firstName;
        customer.lastName = lastName;
        customer.email = email;
        customer.password = password;
        customer.addres = address;
        customer.checking = 0;
        customer.savings = 0;

        req.session.customer = customer;

        dashboardPage(customer.firstName, res);
      }
    );
  });

app.route("/login")
  .get(function (_req, res) {
    res.sendFile(__dirname + "/login.html");
  })
  .post(function (req, res) {
    let credCheck = false;
    let inputEmail = xssFilters.inHTMLData(req.body.email);
    let inputPassword = xssFilters.inHTMLData(req.body.password);

    // ===================================DB=================================
    // retrieve the credentials from database

    mysqlConn.query(
      "USE bankapp; SELECT * FROM customers WHERE email = ? AND password = ?",
      [inputEmail, inputPassword],
      function (err, qResult) {
        if (err) throw err;

        //console.log(qResult[1]);

        // Go through the results of query
        qResult[1].forEach(function (account) {
          if (
            account["email"] == inputEmail &&
            account["password"] == inputPassword
          ) {
            console.log("Match!");

            // We have a match!
            credCheck = true;
            customer = new Customer(
              account["id"],
              account["firstname"],
              account["lastname"],
              account["email"],
              account["password"],
              account["address"],
              parseFloat(account["checking"]) * 100,
              parseFloat(account["savings"]) * 100
            );

            req.session.customer = customer;

            dashboardPage(customer.firstName, res);
          }
        });
        if (credCheck === false) {
          res.sendFile(__dirname + "/PAGE_400.html");
        }
      }
    );
  });

app.get("/dashboard", requireLogin, function (req, res) {
  let name = req.session.customer.firstName;
  dashboardPage(name, res);
});

app.get("/viewAccounts", requireLogin, function (_req, res) {
  accountsPage(
    customer.name,
    customer.checking / 100,
    customer.savings / 100,
    res
  );
});

app.route("/deposit")
  .get(function (req, res) {
    accountDeposit(req, res);
  })
  .post(function (req, res) {
    let accountType = req.body.accounttype;
    let amount = parseFloat(xssFilters.inHTMLData(req.body.amount));
    amount = amount * 100;
    if (validateMoney(amount) || isWholeNumber(amount)) {
      let balance = parseFloat(getTotalBalance(accountType, req));
      let updateBalance = amount + balance;
      switch (accountType) {
        case "checking":
          customer.checking = updateBalance;
          break;
        case "savings":
          customer.savings = updateBalance;
          break;
        default:
          console.log("switch error");
          break;
      }
      // "USE bankapp; SELECT * FROM customers WHERE email = ? AND password = ?",
      console.log("updateBalance", updateBalance);
      if (accountType !== undefined || accountType !== NAN) {
        mysqlConn.query(
          "USE bankapp; UPDATE customers SET " +
            accountType +
            "  = '" +
            updateBalance / 100 +
            "' WHERE `id` = ?",
          [customer.id, accountType, (updateBalance / 100)],
          function (err, qResult) {
            if (err) throw err;

            console.log(qResult[1]);

            res.sendFile(__dirname + "/success.html");
          }
        );
      }
    } else {
      res.sendFile(__dirname + "/tryAgain.html");
    }
  });

app.route("/withdraw")
  .get(requireLogin, function (req, res) {
    accountWithdraw(req, res);
  })
  .post(requireLogin, function (req, res) {
    let accountType = req.body.accounttype;
    let amount = parseFloat(xssFilters.inHTMLData(req.body.amount));
    amount = amount * 100;
    if (validateMoney(amount) || isWholeNumber(amount)) {
      let balance = parseFloat(getTotalBalance(accountType, req));
      if (balance <= 0 || balance <= amount) {
        res.sendFile(__dirname + "/tryAgain.html");
      } else {
        let updateBalance = balance - amount;
        switch (accountType) {
          case "checking":
            customer.checking = updateBalance;
            break;
          case "savings":
            customer.savings = updateBalance;
            break;
          default:
            console.log("switch error");
            break;
        }
        console.log(
          "previous account balance",
          accountType,
          amount,
          balance,
          updateBalance
        );
        if (accountType !== undefined || accountType !== NAN) {
          mysqlConn.query(
            "USE bankapp; UPDATE customers SET " +
              accountType +
              "  = '" +
              updateBalance / 100 +
              "' WHERE `id` = ?",
            [customer.id],
            function (err, qResult) {
              if (err) throw err;

              console.log(qResult[1]);

              res.sendFile(__dirname + "/success.html");
            }
          );
        }
      }
    } else {
      res.sendFile(__dirname + "/tryAgain.html");
    }
  });

app.route("/transfer")
  .get(function (req, res) {
    amountTransfer(req, res);
  })
  .post(requireLogin, function (req, res) {
    let accountType = req.body.accounttype;
    let accountTypeTwo = req.body.accounttypetwo;
    let amount = parseFloat(xssFilters.inHTMLData(req.body.amount)) * 100;
    if (validateMoney(amount) || isWholeNumber(amount)) {
      let balance = parseFloat(getTotalBalance(accountType, req));
      if (balance <= 0 || balance <= amount) {
        res.sendFile(__dirname + "/tryAgain.html");
      } else {
        let withdrawBalance = balance - amount;
        balance = parseFloat(getTotalBalance(accountTypeTwo, req));
        let depositBalance = balance + amount;
        switch (accountType) {
          case "checking":
            customer.checking = withdrawBalance;
            break;
          case "savings":
            customer.savings = withdrawBalance;
            break;
          default:
            console.log("switch2 error");
            break;
        }
        if (accountType !== accountTypeTwo) {
          if (accountType !== undefined || accountType !== NAN) {
            mysqlConn.query(
              "USE bankapp; UPDATE customers SET " +
                accountType +
                "  = '" +
                withdrawBalance / 100 +
                "' WHERE `id` = ?",
              [customer.id],
              function (err, qResult) {
                if (err) throw err;
                console.log(qResult[1]);
              }
            );
            switch (accountTypeTwo) {
              case "checking":
                customer.checking = depositBalance;
                break;
              case "savings":
                customer.savings = depositBalance;
                break;
              default:
                console.log("switch3 error");
                break;
            }
            mysqlConn.query(
              "USE bankapp; UPDATE customers SET " +
                accountTypeTwo +
                "  = '" +
                depositBalance / 100 +
                "' WHERE `id` = ?",
              [customer.id],
              function (err, qResult) {
                if (err) throw err;
                console.log(qResult[1]);
              }
            );
            res.sendFile(__dirname + "/success.html");
          } else {
            res.sendFile(__dirname + "/tryAgain.html");
          }
        } else {
          res.sendFile(__dirname + "/tryAgain.html");
        }
      }
    } else {
      res.sendFile(__dirname + "/tryAgain.html");
    }
  });

// logout user and resets the session
app.get("/logout", requireLogin, function (req, res) {
  req.session.reset();
  res.redirect("/");
});

// anything not expected goes to error page
app.get("*", (_req, res) => {
  // error page
  res.sendFile(__dirname + "/PAGE_404.html");
});

app.listen(PORT, () => console.log("Server listening on PORT", PORT));
