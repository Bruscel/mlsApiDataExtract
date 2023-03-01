var {getData}  = require("./getData.js");
var {getHood}  = require("./getData.js");
var childProcess = require('child_process');

async function runScript(scriptPath, callback) {
    await getHood();
    await getData();
   
    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath); 

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}

runScript('./process.js', function (err) {
    //MYSQL Connection           
    const mysql = require('mysql');;
    let mdb = require('./mysql.js');
    const con = mysql.createConnection({host: mdb.config.host, database : mdb.config.database, user: mdb.config.user, password: mdb.config.password});

    con.connect(function(err) {
        if (err) throw err;
       
    console.log("Connected to MySQL!");

    //Clear filter_test_data     
    console.log("Deleting filter_test_data"); 

    con.query("delete from redFinExtractDataDB.filter_test_data", function(err, result, fields) {   
        if (err) throw err;
        console.log(result);
        console.log("Filter table data has been deleted");
        });

     con.end();
    });
    process.exit(0);
});



 

    
   

