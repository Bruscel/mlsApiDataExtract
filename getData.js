const axios = require('axios');
let arrayOfObjects = [];
let homeBelowHoodValue = [];
let neighborhoodByCity =[];
const mysql = require('mysql');;
let mdb = require('./mysql.js');

async function getHood() {
    //get neighborhoods
    const con = mysql.createConnection({host: mdb.config.host, database : mdb.config.database, user: mdb.config.user, password: mdb.config.password});
    con.connect(function (err) {
     if (err) throw err;

     console.log("Connected to MySQL!");

     con.query("SELECT * FROM redFinExtractDataDB.neighborhoods", function (err, result) { 
         if (err) console.log(err)
         console.log(result);
     
         if(result.length > 0){
             result.forEach((element) => {
                 obj = {
                     city: element.city,
                     feet_radius: element.feet_radius,
                     insertion_date_time: element.insertion_date_time,
                     insertion_user: element.insertion_user,
                     latitude: element.latitude,
                     longitude: element.longitude,
                     neighborhood_id: element.neighborhood_id,
                     neighborhood_name: element.neighborhood_name,
                     state: element.state,
                     zip: element.zip};
                 neighborhoodByCity.push(obj);
             })   
         }
     });
     con.end();
 });
}


//This function takes in latitude and longitude of two location and returns the distance between them (in Feet)
function calcCrow(lat1, lon1, lat2, lon2) 
{
  //var R = 6371; // Radius of the earth in km
  var F =  6371 * 3280.84 ; // Radius of the earth in feet
  //var M =  6371 * 0.6213712 ; // Radius of the earth in miles
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = F * c;
  return d;
}

 // Converts numeric degrees to radians
 function toRad(Value) 
 {
     return Value * Math.PI / 180;
 }

async function getData() {

        //setting current time
        var date_time = new Date();
        date_time.setDate(date_time.getDate() - 90);// subtract 90 days
        let day = ("0" + date_time.getDate()).slice(-2);
        // get current month
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        // get current year
        let year = date_time.getFullYear();
        // get current hours
        let hours = date_time.getHours();
        // get current minutes
        let minutes = date_time.getMinutes() - 5;
        // get current seconds
        let seconds = date_time.getSeconds();

        
        minutes = minutes < 0 ? minutes = 00 : minutes;

        var date  = year + "-" + month + "-" + day
        //var time = hours + ":" + minutes + ":" + seconds;
        var time = "00" + ":" + "00" + ":" + "00";

        console.log(date_time);
        console.log(date);
        console.log(time);

        let Properties = [];

        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/DataSystem?access_token=+credentials.api.key+")
        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties?access_token=+credentials.api.key+&$filter=ListingId eq 'F10356998'")
        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties/replication?access_token=+credentials.api.key+&$filter=ListingId eq 'R10840687'")//for Rents
        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties?access_token=+credentials.api.key+&$filter=ModificationTimestamp eq now()")
        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties?access_token=+credentials.api.key+&$filter=date(ModificationTimestamp) eq 2022-08-25&$top=200")
        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties?access_token=+credentials.api.key+&$filter=time(ModificationTimestamp) ge "+time+" and date(ModificationTimestamp) eq "+date+"&$top=200&$skip=200&$orderby=ListPrice desc")
        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties/replication?access_token=+credentials.api.key+&$filter=time(ModificationTimestamp) ge "+time+" and date(ModificationTimestamp) eq "+date+" and PropertyType eq 'Residential' and StandardStatus eq 'Active' and StateOrProvince eq 'FL' and contains(CountyOrParish, 'Broward')")
        //axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties/replication?access_token=+credentials.api.key+&$filter=time(ModificationTimestamp) ge "+time+" and date(ModificationTimestamp) eq "+date+" and PropertyType eq 'Residential' and StandardStatus eq 'Active' or StandardStatus eq 'Closed' and StateOrProvince eq 'FL' and tolower(CountyOrParish) eq 'broward county' and tolower(PropertySubType) eq 'single family residence'")
        let credentials = require('./apiCred.js');
        await axios.get("https://api.bridgedataoutput.com/api/v2/OData/miamire/Properties/replication?access_token="+credentials.api.key+"&$filter=time(ModificationTimestamp) ge "+time+" and date(ModificationTimestamp) ge "+date+" and PropertyType eq 'Residential' and (StandardStatus eq 'Closed' or StandardStatus eq 'Active') and StateOrProvince eq 'FL' and tolower(CountyOrParish) eq 'broward county' and tolower(PropertySubType) eq 'single family residence'")
            .then(res => {
            console.log(res.data)
            const data  = res.data.value;
            data.forEach((element) => {
                    object = {
                        mls_id: element.ListingId, 
                        status: element.StandardStatus,
                        major_change_type: element.MajorChangeType,
                        mls_status: element.MlsStatus, 
                        address: element.StreetNumber +' '+ element.StreetName, 
                        county: element.CountyOrParish, 
                        city: element.City, 
                        zoning: element.Zoning, 
                        change_type: element.MajorChangeType , 
                        price: element.ListPrice, 
                        zip: element.PostalCode, 
                        state: element.StateOrProvince, 
                        beds: element.BedroomsTotal, 
                        baths: element.BathroomsFull, 
                        year_built_on: element.YearBuilt, 
                        home_sqrt_feet: element.LivingArea, 
                        price_per_sqrt_foot: element.MIAMIRE_RATIO_CurrentPrice_By_SQFT, 
                        lot_size_sqrt_feet: element.LotSizeSquareFeet, 
                        source: element.ListAOR, 
                        latitude: element.Latitude, 
                        longitude: element.Longitude, 
                        days_on_market: element.DaysOnMarket,
                        off_market_date: element.OffMarketDate,  
                        senior_community: element.SeniorCommunityYN,
                        close_date: element.CloseDate };
                    Properties.push(object);
                    })
            })
            .catch(err => {
                console.log(err);
            });

        //to find neighborhood
        var count = 0;
        var plusOne = 0;
        
        /*let neighborhoodByCity = [{hood_id: 1, city: 'Oakland Park',neighborhood: 'North Andrews Garden',latitude:'26.1932090', longitude:'-80.1430934',radius: 4100},
                                {hood_id: 2, city: 'Oakland Park',neighborhood: 'Twin Lakes South',latitude:'26.1785234', longitude:'-80.1609909',radius: 1100},
                                {hood_id: 3, city: 'Oakland Park',neighborhood: 'Twinlakes',latitude:'26.1849636', longitude:'-80.1588000',radius: 1325},
                                {hood_id: 4, city: 'Pompano Beach',neighborhood: 'Cresthaven',latitude:'26.2667449', longitude:'-80.1070377',radius: 3000},
                                {hood_id: 5, city: 'Pompano Beach',neighborhood: 'Highlands South',latitude:'26.2836715', longitude:'-80.1034393',radius: 3000},
                                {hood_id: 6, city: 'Pompano Beach',neighborhood: 'Highlands North',latitude:'26.2987794,', longitude:'-80.1001291',radius: 2300}];*/
      
         
        for(i = 0; i < Properties.length; i++){
            var lat1 = parseFloat(Properties[i].latitude);
            var lon1 = parseFloat(Properties[i].longitude);

            //Checking neighborhoods with pre-set distance 
            for(k = 0; k < neighborhoodByCity.length; k++){
                
                var lat3 = parseFloat(neighborhoodByCity[k].latitude);
                var lon3 = parseFloat(neighborhoodByCity[k].longitude);
                var ftDistanceToHood = calcCrow(lat1,lon1,lat3,lon3).toFixed(1);//Loking at the distance of the preset neighborhood
                if(ftDistanceToHood <= neighborhoodByCity[k].radius){
                        objs = {hood_id: neighborhoodByCity[k].hood_id, 
                                mls_id: Properties[i].mls_id,
                                major_change_type: Properties[i].major_change_type,
                                mls_status: Properties[i].mls_status, 
                                status: Properties[i].status, 
                                neighborhood: neighborhoodByCity[k].neighborhood, 
                                address: Properties[i].address, 
                                city: Properties[i].city, 
                                close_date: Properties[i].close_date, 
                                price: Properties[i].price, 
                                zip: Properties[i].zip, 
                                state: Properties[i].state,
                                beds: Properties[i].beds, 
                                baths: Properties[i].baths, 
                                built_on: Properties[i].year_built_on,  
                                sqrt_feet: Properties[i].home_sqrt_feet, 
                                price_per_sqrt_foot: Properties[i].price_per_sqrt_foot, 
                                lot_size: Properties[i].lot_size_sqrt_feet, 
                                source: Properties[i].source, 
                                latitude: Properties[i].latitude, 
                                longitude: Properties[i].longitude, 
                                days_on_market: Properties[i].days_on_market,
                                off_market_date: Properties[i].off_market_date,
                                senior_community: Properties[i].senior_community};  
                        arrayOfObjects.push(objs);    
                    }
                }

                //Checking if distance of home [i] and [i+1] in Properties array that are below 200 feet    
                for(j = plusOne; j < Properties.length; j++){
                        var lat2 = parseFloat(Properties[j].latitude);
                        var lon2 = parseFloat(Properties[j].longitude);
                        var ftDistanceToHome = calcCrow(lat1,lon1,lat2,lon2).toFixed(1);//Looking at the distance between two homes 
                        if(ftDistanceToHome <= 200 ){
                            objs = {hood_id: 6 + i,
                                    mls_id: Properties[i].mls_id,
                                    major_change_type: Properties[i].major_change_type,
                                    mls_status: Properties[i].mls_status, 
                                    status: Properties[i].status, 
                                    address: Properties[i].address, 
                                    city: Properties[i].city, 
                                    close_date: Properties[i].close_date, 
                                    price: Properties[i].price, 
                                    zip: Properties[i].zip, 
                                    state: Properties[i].state,
                                    beds: Properties[i].beds, 
                                    baths: Properties[i].baths, 
                                    built_on: Properties[i].year_built_on,  
                                    sqrt_feet: Properties[i].home_sqrt_feet, 
                                    price_per_sqrt_foot: Properties[i].price_per_sqrt_foot, 
                                    lot_size: Properties[i].lot_size_sqrt_feet, 
                                    source: Properties[i].source, 
                                    latitude: Properties[i].latitude, 
                                    longitude: Properties[i].longitude, 
                                    days_on_market: Properties[i].days_on_market,
                                    off_market_date: Properties[i].off_market_date,
                                    senior_community: Properties[i].senior_community};    
                            arrayOfObjects.push(objs);  
                        }  
                }   
                plusOne += 1;
                count +=  1;
        }
    

        //Begining for finding average cost of neighborhood
        var count2 = 0;
        let avgSoldNeighborhoodPrice = [];
        let calcAvgNeighborhoodPrice = [];

        
        //Looping through all the sold homes in the MLS Api dataset to find their average neighborhood sold price
        for(i = 0; i < arrayOfObjects.length; i++){
            var sumPricePerSqrtFoot  = 0;
            var countOfPrices = 0;
            var dup_flag = 0;
            
            //Deleting array
            if(calcAvgNeighborhoodPrice.length > 0){
            for(p = 0; p = calcAvgNeighborhoodPrice.length; p++){  
                //Popping the last element from the array
                calcAvgNeighborhoodPrice.pop();
            }      
            }
            
            //Checking for duplicate neighborhood Id
            for(w = 0; w < avgSoldNeighborhoodPrice.length; w++){
                if(arrayOfObjects[i].hood_id == avgSoldNeighborhoodPrice[w].hood_id){
                    //console.log("dup found");
                    dup_flag = 1;
                }
            }

            //Comparing neighborhood d to store in calcAvgNeighborhoodPrice array to then calculate the average neighborhood price
            for(j = count2; j < arrayOfObjects.length; j++){
                if(arrayOfObjects[i].hood_id == arrayOfObjects[j].hood_id && arrayOfObjects[i].status == 'Closed' && dup_flag != 1 ){
                    objs2 = {hood_id: arrayOfObjects[j].hood_id, price: arrayOfObjects[j].price, price_per_sqrt_foot: arrayOfObjects[j].price_per_sqrt_foot};
                    calcAvgNeighborhoodPrice.push(objs2);
                    count2 = count2 + 1;  
                }
            }
            
            //Making average neighborhood price calculation  
            for(k = 0; k < calcAvgNeighborhoodPrice.length; k++){
                //meanPrice  += parseInt(calcAvgNeighborhoodPrice[k].price);
                sumPricePerSqrtFoot  += parseInt(calcAvgNeighborhoodPrice[k].price_per_sqrt_foot);
                countOfPrices += 1;
            }
            if(countOfPrices > 0){
                var mean = sumPricePerSqrtFoot  / countOfPrices; 
                objs3 = {hood_id: calcAvgNeighborhoodPrice[0].hood_id, meanPricePerSqrtFeet: mean };
                avgSoldNeighborhoodPrice.push(objs3); 
            }      
        }//End for finding average cost of neighborhood

        //MLS Listing
        //console.log(avgSoldNeighborhoodPrice);

        //Checking active market homes to see if they are under value
        for(i = 0; i < avgSoldNeighborhoodPrice.length; i++){
            //arrayOfObjects is original data array
            for(j = 0; j < arrayOfObjects.length; j++){
                //checking to see if  homeBelowHoodValue array is empty
                if(homeBelowHoodValue.length > 0){
                    if(avgSoldNeighborhoodPrice[i].hood_id == arrayOfObjects[j].hood_id && arrayOfObjects[j].price_per_sqrt_foot < avgSoldNeighborhoodPrice[i].meanPricePerSqrtFeet){
                        objs4 = {hood_id: arrayOfObjects[j].hood_id, 
                                neighborhood: arrayOfObjects[j].neighborhood, 
                                mls_id: arrayOfObjects[j].mls_id , 
                                address: arrayOfObjects[j].address, 
                                city: arrayOfObjects[j].city, 
                                price: arrayOfObjects[j].price, 
                                zip: arrayOfObjects[j].zip, 
                                state: arrayOfObjects[j].state, 
                                beds: arrayOfObjects[j].beds, 
                                baths: arrayOfObjects[j].baths, 
                                built_on: arrayOfObjects[j].built_on, 
                                status: arrayOfObjects[j].status, 
                                sqrt_feet: arrayOfObjects[j].sqrt_feet, 
                                lot_size: arrayOfObjects[j].lot_size, 
                                source: arrayOfObjects[j].source, 
                                latitude: arrayOfObjects[j].latitude, 
                                longitude: arrayOfObjects[j].longitude, 
                                days_on_market: arrayOfObjects[j].days_on_market, 
                                off_market_date: arrayOfObjects[j].off_market_date};
                        homeBelowHoodValue.push(objs4);           
                    }
                    
                }else{
                    if(avgSoldNeighborhoodPrice[i].hood_id == arrayOfObjects[j].hood_id && arrayOfObjects[j].price_per_sqrt_foot < avgSoldNeighborhoodPrice[i].meanPricePerSqrtFeet){
                        objs4 = {hood_id: arrayOfObjects[j].hood_id, 
                                neighborhood: arrayOfObjects[j].neighborhood, 
                                mls_id: arrayOfObjects[j].mls_id , 
                                address: arrayOfObjects[j].address, 
                                city: arrayOfObjects[j].city, 
                                price: arrayOfObjects[j].price, 
                                zip: arrayOfObjects[j].zip, 
                                state: arrayOfObjects[j].state, 
                                beds: arrayOfObjects[j].beds, 
                                baths: arrayOfObjects[j].baths, 
                                built_on: arrayOfObjects[j].built_on, 
                                status: arrayOfObjects[j].status, 
                                sqrt_feet: arrayOfObjects[j].sqrt_feet, 
                                lot_size: arrayOfObjects[j].lot_size, 
                                source: arrayOfObjects[j].source, 
                                latitude: arrayOfObjects[j].latitude, 
                                longitude: arrayOfObjects[j].longitude, 
                                days_on_market: arrayOfObjects[j].days_on_market,
                                off_market_date: arrayOfObjects[j].off_market_date};
                        homeBelowHoodValue.push(objs4);           
                    }
                }
            }
            
        }

        //MSSQL inserting to filter_test_data
        //----------------------------------------/
        /*
        var azuremssql = require('./azuremssql.js');
        var sql = require("mssql");

        sql.connect(azuremssql.config, function (err) {
            if (err) console.log(err);
            // create Request object
            var request = new sql.Request();
            console.log("Connected to MSSQL!");
            for(b = 0; b < homeBelowHoodValue.length; b++){    
                request.query("INSERT INTO dbo.filter_test_data (neighborhood, mls_id, address, city, price, zip, state, beds, baths, built_on, status, sqrt_feet, lot_size, source, latitude, longitude) VALUES ('"+homeBelowHoodValue[b].neighborhood+"','"+homeBelowHoodValue[b].mls_id+"','"+homeBelowHoodValue[b].address+"','"+homeBelowHoodValue[b].city+"','"+homeBelowHoodValue[b].price+"','"+homeBelowHoodValue[b].zip+"','"+homeBelowHoodValue[b].state+"','"+homeBelowHoodValue[b].beds+"','"+homeBelowHoodValue[b].baths+"','"+homeBelowHoodValue[b].built_on+"','"+homeBelowHoodValue[b].status+"','"+homeBelowHoodValue[b].sqrt_feet+"','"+homeBelowHoodValue[b].lot_size+"','"+homeBelowHoodValue[b].source+"','"+homeBelowHoodValue[b].latitude+"','"+homeBelowHoodValue[b].longitude+"')", function (err, recordset) { 
                    if (err) console.log(err)  
                });                 
            }    
        });
        */
        //------------------------------------ 
        

        //MYSQL inserting to filter_test_data
        
        const con2 = mysql.createConnection({host: mdb.config.host, database : mdb.config.database, user: mdb.config.user, password: mdb.config.password});  
        console.log("Connected to MySQL!");
        con2.connect(function(err) {
            if (err) throw err;
            
         for(b = 0; b < homeBelowHoodValue.length; b++){    
            con2.query("INSERT INTO redFinExtractDataDB.filter_test_data (mls_id, address, neighborhood, city, price, zip, state, beds, baths, built_on, status, sqrt_feet, lot_size, source, latitude, longitude, days_on_market, off_market_day) VALUES ('"+homeBelowHoodValue[b].mls_id+"','"+homeBelowHoodValue[b].address+"','"+homeBelowHoodValue[b].neighborhood+"','"+homeBelowHoodValue[b].city+"','"+homeBelowHoodValue[b].price+"','"+homeBelowHoodValue[b].zip+"','"+homeBelowHoodValue[b].state+"','"+homeBelowHoodValue[b].beds+"','"+homeBelowHoodValue[b].baths+"','"+homeBelowHoodValue[b].built_on+"','"+homeBelowHoodValue[b].status+"','"+homeBelowHoodValue[b].sqrt_feet+"','"+homeBelowHoodValue[b].lot_size+"','"+homeBelowHoodValue[b].source+"','"+homeBelowHoodValue[b].latitude+"','"+homeBelowHoodValue[b].longitude+"','"+homeBelowHoodValue[b].days_on_market+"','"+homeBelowHoodValue[b].off_market_date+"')", function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            });
         }
         console.log("Inserted to filter_test_data");
         con2.end();
        });

        console.log(homeBelowHoodValue);

    /*    
    return new Promise(function(resolve, reject) {
        var success = 1;
        resolve(success)
    })*/
}


module.exports={getData, getHood};
//getData();


    
