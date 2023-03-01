//MYSQL Connection           
const mysql = require('mysql');;
let mdb = require('./mysql.js');
const con = mysql.createConnection({host: mdb.config.host, database : mdb.config.database, user: mdb.config.user, password: mdb.config.password});

    //setting current time
    var date_time = new Date();
    let day = ("0" + date_time.getDate()).slice(-2);
    // get current month
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    // get current year
    let year = date_time.getFullYear();
    // get current hours
    let hours = date_time.getHours();
    // get current minutes
    //let minutes = date_time.getMinutes();
    let minutes = date_time.getMinutes() - 1;
    // get current seconds
    let seconds = date_time.getSeconds();
  
    //con.connect();
    console.log("Connected to MySQL!");
    
    // Checking node_test_data to see if there is data
    console.log("Checking node_test_data for data to send email"); 

    con.query("select * from redFinExtractDataDB.node_test_data n where n.date_time >= '"+year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"' ", function (err, recordset) { 
        if (err) console.log(err)
        
    //----------------SMS----------------------/
        let Text = [];
        if(recordset.length > 0){

            
            for(i = 0; i < recordset.length; i++){
                obj = "mls_id:\t"+recordset[i].mls_id+"\t"+"address:\t"+recordset[i].address
                Text.push(obj);    
            }
        

            'use strict';
            const nodemailer = require('nodemailer');
            const config = require('./config');
        
            async function sms(){
                    
            const transporter = nodemailer.createTransport(config);
                let mailOptions = {
                    from: 'bend86984@gmail.com', // sender address
                    to: config.to,
                    cc: config.cc,
                    subject: 'New Property Alert', // Subject line
                    text: Text.join('\n')  // plain text body
                    //html:'<b>homeBelowHoodValue:<br>'+homeBelowHoodValue[1]+'</b>' // html body
                    //html:'<b>Testing</b>' // html body
                };
                let info = await transporter.sendMail(mailOptions);
                console.log('Message sent: %s', info.messageId);
                }
                sms().catch(console.error);  
        }
        //----------------SMS----------------------/
        con.end();
    });
  



   



