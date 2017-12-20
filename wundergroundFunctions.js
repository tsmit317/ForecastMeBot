module.exports = {

    /***********************************************************************************************************
     * @param {object} messageObject - Object containing message recieved information.
     * @description Determines which Wunderground API GET call to make based on the keywordFound parameter. Then sends Tweet.
     * Uses switch statment to identify the keyword type
     * Then will send an error message if there is one
     * Otherwise, initializes the query object (Zipcode, or 'City, State')
     * Then calls the correct Wunderground function and sends the forecast tweet
     * @return string
     **********************************************************************************************************/

    retreiveWeather: function(messageObject, waitForInfo){
        console.log("\n\nIn retreiveWeather");
       
        //If the error message is empty, checks to see if 'conditons', 'forecast', or no keyword was found
        if (typeof messageObject.errorMsg === 'undefined' && (messageObject.keywordFound === 3 || messageObject.keywordFound === 4 || messageObject.keywordFound === 5))
        {
            switch(messageObject.keywordFound){
                //Keyword 'conditions' was found
                case 3:
                        console.log("Case 3 - Conditions");
                        if(typeof messageObject.zipcode === 'undefined')
                        {
                            console.log("Zipcode not found");

                            var query = {
                                            city: messageObject.city,
                                            state: messageObject.state
                                        }

                            module.exports.getConditions(query, function sendWeatherInfo(forecastReturned){
                                console.log("\nForecastReturned string: " + forecastReturned);
                                waitForInfo(forecastReturned);
                            });
                        }
                        else
                        {
                            console.log("Zipcode found (messageObject.zipcode != undef)");

                            var query = {
                                            zip: messageObject.zipcode
                                        }

                            module.exports.getConditions(query, function sendWeatherInfo(forecastReturned){
                                console.log("\nForecastReturned string: " + forecastReturned);
                                waitForInfo(forecastReturned);
                            });
                        }
                        break;

                //Keyword 'Forecast' was found        
                case 4:
                        console.log("Case 4 - Forecast");
                        if(typeof messageObject.zipcode === 'undefined')
                        {
                            console.log("Zipcode not found");
                            var query = {
                                            city: messageObject.city,
                                            state: messageObject.state
                                        }

                            module.exports.getForecast(query, messageObject.senderHandle, function sendWeatherInfo(forecastReturned){
                                console.log("\nForecastReturned string: " + forecastReturned);
                                waitForInfo(forecastReturned);
                            });
                        }
                        else
                        {
                            console.log("Zipcode found (messageObject.zipcode != undef)");

                            var query = {
                                            zip: messageObject.zipcode
                                        }

                            console.log("Query zip: " + query.zip);

                            module.exports.getForecast(query, messageObject.senderHandle, function sendWeatherInfo(forecastReturned){
                                console.log("\nForecastReturned string: " + forecastReturned);  
                                waitForInfo(forecastReturned);
                            });
                        }
                        break;

                //No keyword was found        
                case 5:
                        console.log("Case 5 - No keyword");
                        if(typeof messageObject.zipcode === 'undefined')
                        {
                            console.log("Zipcode not found");
                            var query = {
                                            city: messageObject.city,
                                            state: messageObject.state
                                        }

                            module.exports.getWeather(query, function sendWeatherInfo(forecastReturned){
                                console.log("\nForecastReturned string: " + forecastReturned);
                                waitForInfo(forecastReturned);
                            });
                        }
                        else
                        {
                            console.log("Zipcode found (messageObject.zipcode != undef)");

                            var query = {
                                            zip: messageObject.zipcode
                                        }

                            module.exports.getWeather(query, function sendWeatherInfo(forecastReturned){
                                console.log("\nForecastReturned string: " + forecastReturned);
                                waitForInfo(forecastReturned);
                            });
                        }
                        break;
            }
        }
        else 
        {
            console.log("Error message found: " + messageObject.errorMsg);
            waitForInfo(messageObject.errorMsg);
        }

    },


    /**********************************************************************************************************
     * 
     * @param {object} query - object contaniing the state and city or the zipcode
     * @param {function} sendWeatherInfo - callback method. Makes sure that the weather info is returned before sending a tweet.
     * @description calls the wunderground.conditions function (makes an API GET call to Wunderground for weather conditions).
     * Contains the wunderground conditions get call. The query param is passed to return the current conditions.
     * Checks to see if there is an error, then creates a string to be tweeted.
     * If there is an error, determines the type and creates a string to be tweeted.
     * @returns string to be tweeted containing current weather conditions 
     * 
     **********************************************************************************************************/

    getConditions: function (query, sendWeatherInfo)
    {
        //Initialize Wunderground 
        var wk = require('./wundergroundkey');
        var wunderground = require('wunderground')(wk.wunderground_key);
        wunderground.conditions(query, function(err, conditions)
        {
            //Checks for request errors
            if(!err && !(conditions.current_observation == null))
            {
                console.log("\n\nIn getConditions - No Errors");
                var conditionsReturned = conditions.current_observation;
                var currentTemperature = Math.round(conditionsReturned.temp_f);

                // Retrieve weather observation and humidity
                var weatherObs = conditionsReturned.weather;
                var relative_humidity = conditionsReturned.relative_humidity;

                // Retrieve Wind string, direction, speed, windchill. 
                var windString = conditionsReturned.wind_string;
                var windDirection = conditionsReturned.wind_dir;
                var windDirAbrrv;
                
                var windSpeed = Math.round(conditionsReturned.wind_mph);
                var windchill_f = conditionsReturned.windchill_f;
                
                // Retrieve Pressure and Dewpoint
                var pressure_in = conditionsReturned.pressure_in;
                var dewpoint_f = conditionsReturned.dewpoint_f;
                
                // Retrieve feelslike, visibility, and icon
                var feelslike_f = Math.round(conditionsReturned.feelslike_f);
                var visibility_mi = Math.round(conditionsReturned.visibility_mi);
                var icon = conditionsReturned.icon;
                

                // Sets windchill or humidity. If no windchill, string is set for humidity. 
                var windchillORhumidity;
                if(windchill_f === "NA")
                {
                    windchillORhumidity = " Humidity " + relative_humidity + ".";
                }
                else{
                    windchillORhumidity = " Windchill " +  windchill_f + String.fromCharCode(176) + "F.";
                }

                // If windDirection is more than 3 characters, creates an abbreviation by taking the first letter in each word
                if(windDirection.length > 3)
                {
                    var holder = windDirection.split(' ');
                    for(var i = 0; i < holder.length; i++)
                    {
                        windDirAbrrv += holder[i].substring(0,1);
                    }
                }
                else
                {
                    windDirAbrrv = windDirection;
                }

                // Create wind information string (Speed & Direction Abbreviation)
                var windInfo =  " Wind " + windSpeed + "mph " + windDirAbrrv + ".";
                if(windSpeed === 0)
                {
                    windInfo = " No wind.";
                }

                /**
                 * Message to be sent to Twitter contains:
                 *      current temperature, 
                 *      weather observation, 
                 *      wind info (direction, speed), 
                 *      feelslike, 
                 *      windchill or humidity (if there's windchill), 
                 *      and visibility.
                 */
                var weatherMessage = "It\'s " + currentTemperature + String.fromCharCode(176) + "F & " 
                                     + weatherObs.toLowerCase() + "." +  windInfo
                                     + " Feels like " + feelslike_f + String.fromCharCode(176)+ "F." + windchillORhumidity 
                                     + " Visibility " + visibility_mi + " miles.";
                
                sendWeatherInfo(weatherMessage);                    
            
            }
            else if (err) 
            {
                var errorObject = err.error;
                var errorType = errorObject.type.toString();
                var errorMessage = errorObject.description.toString();

                console.log("There was an error in getweather"); 
                console.log("Error: " + err); 
                console.log("Error: " + errorType); 
                console.log("Error dis: " + errorMessage);

                if(errorType === "querynotfound")
                {
                    var weatherMessage = "No cities match your search query :(";
                }
                else 
                {
                    var weatherMessage = "Oops! There was an error with your request";
                }
                
                sendWeatherInfo(weatherMessage);
            }
            else
            {
                var weatherMessage = "Doh! There was an error with your request. Please make sure everything is spelled correctly";
                sendWeatherInfo(weatherMessage);
            }
            
        });
    },


    /***********************************************************************************************************
     * 
     * @param {object} query - object contains either the zipcode or city and state
     * @param {string} senderHandle - string that contains the twitter handle for the sender. Used to determine length of weather tweet.
     * @param {function} sendWeatherInfo - callback method. Makes sure that the weather info is returned before sending a tweet.
     * @description calls the wunderground.forecast function (makes an API GET call to Wunderground for weather forecast). 
     * Checks if there are errors or if the JSON object is empty.
     * Then creates a string to be returned to the sender. 
     * The string is checked to make sure that it meets the character limit.
     * If it does the second period of the forecast is added to the string then checked again. 
     * @returns returns the forecast for the specified area.
     *
     **********************************************************************************************************/

    getForecast: function (query,senderHandle, sendWeatherInfo)
    {
        //Initialize Wunderground
        var wk = require('./wundergroundkey');
        var wunderground = require('wunderground')(wk.wunderground_key);
        wunderground.forecast( query, function(err, result)
        {
            console.log("\n\nIn getForecast");

            if(!err && !(result.forecast.txt_forecast.forecastday == null))
            {
                var forecastReturned = result.forecast.txt_forecast.forecastday;
                //console.log("In if - forecastReturned: " + forecastReturned);
                //console.log("In if - forecastReturned[0].title: " + forecastReturned[0].title);

                // Retrieve first period (Ex: Saturday) information
                var period1 = forecastReturned[0].title;
                var p1weather = forecastReturned[0].fcttext;
                var percentChance1 = forecastReturned[0].pop;

                console.log("In if - period1: " + period1);
                console.log("In if - p1weather: " + p1weather);
                console.log("In if - percentChance1: " + percentChance1);

                // Retrieve second period(Ex: Saturday Night) information 
                var period2 = forecastReturned[1].title;
                var p2weather = forecastReturned[1].fcttext;
                var percentChance2 = forecastReturned[1].pop;

                var weatherMessage = period1 + "-" + p1weather + " " + period2 + "-" + p2weather ;
               
                sendWeatherInfo(weatherMessage);
            }
            else if (err) 
            {
                // Intialize variables to hold error strings
                var errorObject = err.error;
                var errorType = errorObject.type.toString();
                var errorMessage = errorObject.description.toString();

                console.log("There was an error in getweather"); 
                console.log("Error: " + err); 
                console.log("Error: " + errorType); 
                console.log("Error dis: " + errorMessage);

                if(errorType === "querynotfound")
                {
                    var weatherMessage = "No cities match your search query :(";
                }
                else 
                {
                    var weatherMessage = "Oops! There was an error with your request";
                }
                
                sendWeatherInfo(weatherMessage);
            }
            else
            {
                var weatherMessage = "Doh! There was an error with your request. Please make sure everything is spelled correctly";
                sendWeatherInfo(weatherMessage);
            }
        });
    },



    /***********************************************************************************************************
     * 
     * @param {object} query - object contains either the zipcode or city and state
     * @param {string} senderHandle - string that contains the twitter handle for the sender. Used to determine length of weather tweet.
     * @description calls the wunderground.execute function to get weather info. NOTE: This is used when neither 'forecast' or 'conditions' are specified. It can GET all types. 
     * Creates sort of a hybrid forecast. 
     * Checks if there is an error and if the JSON object is empty.
     * Creates a string to be returned. 
     * Adds current temp, percent precip, hi/low, and conditions.
     * If condtions contains chance it formats the string a certain way.
     * @returns string to be tweeted containing weather conditions and forecast
     **********************************************************************************************************/

    getWeather: function (query, sendWeatherInfo)
    { 
        //Initialize Wunderground
        var wk = require('./wundergroundkey');
        var wunderground = require('wunderground')(wk.wunderground_key);
        var actions = ['forecast', 'forecast10day', 'conditions'];
        wunderground.execute(actions, query, function(err, result) 
        {
            /* 
            Checks for errors
            If result.current_observation == null, then the query returned more than one result for the location.
            In this case it is likely a problem with the state or country, as it would be an error if it were the city.
            */
            if(!err && !(result.current_observation == null))
            {
                /*
                Note: Wunderground splits their data up. So current conditions are not held within forecast. 
                      That is why there are two results below
                */

                //Current weather
                var cWeather = result.current_observation;
                console.log("cweather Result: " + cWeather);
                var currentTemp = Math.round(cWeather.temp_f);

                //ADD OTHER PARAMS
                console.log("Current Temp " + currentTemp);
                //Forecast
                var result = result.forecast.simpleforecast.forecastday;
                var f_holder = result[0];
                var highTemp = f_holder.high.fahrenheit.toString();
                var lowTemp = f_holder.low.fahrenheit.toString();
                var conditions = f_holder.conditions.toLowerCase().toString();
                var pctchc = f_holder.pop;
                var percentChance = f_holder.pop.toString();

                
                // Formats the string differently if the conditions JSON object contains 'chance'
                // If true, that means there will be a chance of rain, snow, storms, etc.
                if(conditions.includes("chance"))
                {
                    var useANorA;

                    if(pctchc >= 80 && pctchc <=89){
                        useANorA = " an ";
                    }
                    else{
                        useANorA = " a ";
                    }
                    var weatherMessage = "It\'s currently " + currentTemp + String.fromCharCode(176) + "F. " 
                                         + "High/Low: " + highTemp
                                         + "/" + lowTemp+ String.fromCharCode(176) 
                                         + "F. There\'s" + useANorA + percentChance + "% " + conditions;

                    console.log("In getWea " + weatherMessage); 
                    sendWeatherInfo(weatherMessage);
                } 
                else
                {
                    var weatherMessage = "It\'s currently " + currentTemp + String.fromCharCode(176) + "F " 
                                         + "& " + conditions + ". High/Low: " + highTemp
                                         + "/" + lowTemp+ String.fromCharCode(176) 
                                         + "F. Chance of precip: " + percentChance
                                         + "%" ;

                    console.log("In getWea " + weatherMessage); 
                    sendWeatherInfo(weatherMessage);
                }           
                
            }
            else if (err)
             {
                // Intialize variables to hold error strings            
                var errorObject = err.error;
                var errorType = errorObject.type.toString();
                var errorMessage = errorObject.description.toString();

                console.log("There was an error in getweather"); 
                console.log("Error: " + err); 
                console.log("Error: " + errorType); 
                console.log("Error dis: " + errorMessage);

                if(errorType === "querynotfound")
                {
                    var weatherMessage = "No cities match your search query :(";
                }
                else 
                {
                    var weatherMessage = "Oops! There was an error with your request";
                }
                
                sendWeatherInfo(weatherMessage);
            }
            else
            {
                var weatherMessage = "Whoops! There was an error in your request. Please make sure everything is spelled/formatted correctly";
                sendWeatherInfo(weatherMessage);
            }
            
        });

    }
}