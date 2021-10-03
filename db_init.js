"use strict";

// The mysql2 library (NOTICE THE DIFFERENCE FROM mysql)
const mysql = require("mysql2");

// Connect to the database
const mysqlConn = mysql.createConnection({
  host: "localhost",
  user: "bankappaccount",
  password: "apppass",
  multipleStatements: true,
});

mysqlConn.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");

  // create users table
  let exist = mysqlConn.query(
    "USE bankapp;\
      CREATE TABLE customers \
      (id INT AUTO_INCREMENT PRIMARY KEY, \
          firstname VARCHAR(255), \
          lastname VARCHAR(255), \
          email VARCHAR(255), \
          password VARCHAR(255), \
          address VARCHAR(255), \
          checking DECIMAL(19,2), \
          savings DECIMAL(19,2));",
    function (err, qresult) {
      if (err) throw err;
      console.log("customers table created");
      //   console.log(qresult[0]);
    }
  );

  // populate customers table
  // be sure to take care of precision becauses insert rounds to the nearest decimal
  mysqlConn.query(
    "USE bankapp;\
    INSERT INTO customers (firstname, lastname, email, password, address, checking, savings) values ('John','Doe','jd@gmail.com', 'password','222 Doe St Irvine, CA 92618', 7000.00, 500.23);\
    INSERT INTO customers (firstname, lastname, email, password, address, checking, savings) values ('James','Bond','jb@gmail.com', '1234','123 Main St Irvine, CA 92618', 40.00, 900.23);\
    INSERT INTO customers (firstname, lastname, email, password, address, checking, savings) values ('Bob','Marley','rrrmusic@gmail.com', '3littlebids','45 Dove St Irvine, CA 92612', 5000000.00, 15000.23);\
    INSERT INTO customers (firstname, lastname, email, password, address, checking, savings) values ('Peter','Griffin','familyguy@gmail.com', 'Mag','1010 Jamboree St Irvine, CA 92618', 100.00, 500.56);\
    ",
    function (err, result) {
      if (err) throw err;
      console.log(result);
    }
  );
  //   console.log(exist);

  // for later with the user retrieve
  // Execute a prepared statement
  // 	mysqlConn.query('USE users; SELECT username,password from appusers where `username` = ? AND `password` = ?',
  // 		// The ?'s will be replaced with the respective elements from this array
  // 		[userName, password],

  // 		// The call back when the query completes
  // 		function(err, qResult){

  // 			if(err) throw err;

  // 			console.log(qResult[1]);

  //   let exist = mysqlConn.query(
  //     "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'bankapp';",
  //     function (err, result) {
  //       if (err) throw err;
  //       console.log(result[0]);
  //     }
  //   );
  //   console.log(exist.query);
  //   if (exist.query === "bankapp") {
  //     console.log("BankApp DB already exists.");
  //   }
  //   else {
  //     // if BankApp.db does not exsit
  //     // create DB
  //     mysqlConn.query("CREATE DATABASE BankApp;", function (err, result) {
  //       if (err) throw err;
  //       console.log("Database created");
  //     });
});

// async function asyncFunction() {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     const rows = await conn.query("SELECT 1 as val");
//     console.log(rows); //[ {val: 1}, meta: ... ]
//     const res = await conn.query("INSERT INTO myTable value (?, ?)", [
//       1,
//       "mariadb",
//     ]);
//     console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
//   } catch (err) {
//     throw err;
//   } finally {
//     if (conn) return conn.end();
//   }
// }
