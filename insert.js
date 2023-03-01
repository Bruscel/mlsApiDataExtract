//MYSQL Connection           
const mysql = require('mysql');;
let mdb = require('./mysql.js');
const con = mysql.createConnection({host: mdb.config.host, database : mdb.config.database, user: mdb.config.user, password: mdb.config.password});
var { nanoid } = require("nanoid");

var insertion_id = nanoid();// random Id

console.log("Connected to MySQL!");
con.connect(function(err) {
    if (err) throw err;
    con.query("INSERT INTO node_test_data (insertion_id, mls_id, address, neighborhood, city, zip, state, beds, baths, built_on, price, status, sqrt_feet, lot_size, source, latitude, longitude) SELECT distinct '"+insertion_id+"',f.mls_id, f.address, f.neighborhood, f.city, f.zip, f.state, f.beds, f.baths, f.built_on, f.price, f.status, f.sqrt_feet, f.lot_size, f.source, f.latitude, f.longitude  FROM filter_test_data f  WHERE f.mls_id NOT IN (Select ntd.mls_id FROM node_test_data ntd)  AND f.address NOT IN (Select ntd.address FROM node_test_data ntd)", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      console.log("Inserted into node_test_data");
    });
    con.end();
});

