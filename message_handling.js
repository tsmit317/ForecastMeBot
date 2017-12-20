/**
 * message_handling.js: Contains functions used to handle incomming user messages (Input Sanitization).
 */

module.exports ={

    /**
     * @param {object} messageObject - Object containing message recieved information.
     * @description Searchs the message for keywords and applies a value to the messageObject
     */
     keywordSearchRO: function(messageObject){
        // Calls list of error messages
        var errorMessages = require('./error_Messages');
        //splits at whitespace
        message_R = messageObject.original_message.split(/[ ,]+/g);
    

        if(module.exports.checkForBadWords(message_R)){
            messageObject.keywordFound = 1;
            
            //There are multiple responses that can be used when a bad word is found. This randomly chooses one.
            var randomNum = Math.floor((Math.random() * 100) + 1);
            if(randomNum % 2 == 0){
                messageObject.errorMsg = errorMessages.curseWordDetected02;
            }
            else{
                messageObject.errorMsg = errorMessages.curseWordDetected;
            }

            console.log("Found badword in keywordSearchRO: " + messageObject.errorMsg);
        }
        else if(message_R.indexOf("help") > -1){
            messageObject.keywordFound = 2;
            messageObject.errorMsg = errorMessages.helpMessage;
            console.log("Found help in keywordSearchRO: " + messageObject.errorMsg);

        }
        // Uses if statement to determine if array contains "pod, bay, (door/doors)"
        else if((message_R.indexOf("pod")> -1) && (message_R.indexOf("bay")> -1) && ((message_R.indexOf("door")> -1) || (message_R.indexOf("doors")> -1))  ){
            messageObject.keywordFound = 6;
            messageObject.errorMsg = "I\'m sorry " + messageObject.senderHandle + ". " +  errorMessages.spaceOdysseyResponse;
            console.log("Space Odyssey Response: " + messageObject.errorMsg);
        }
        else if((message_R.indexOf("conditions") > -1) || (message_R.indexOf("condition") > -1)){
            messageObject.keywordFound = 3;
            var index1 = message_R.indexOf("conditions");
            var index2 = message_R.indexOf("condition");

            if(index1 > -1)
            {
                messageObject.messageAltered = messageObject.messageAltered.replace(message_R[index1], "");
            }
            else
            {
                messageObject.messageAltered = messageObject.messageAltered.replace(message_R[index2], "");
            }
        }

        //Checks if forecast is in string. Accounts for common misspellings. Then removes from string.
        else if((message_R.indexOf("forecasts") > -1) || (message_R.indexOf("forecast") > -1) || (message_R.indexOf("forcast") > -1) || (message_R.indexOf("forcasts") > -1)){
            messageObject.keywordFound = 4;

            var index01 = message_R.indexOf("forecasts");
            var index02 = message_R.indexOf("forecast");
            var index03 = message_R.indexOf("forcast");
            var index04 = message_R.indexOf("forcasts");

            if(index01 > -1)
            {
                messageObject.messageAltered = messageObject.messageAltered.replace(message_R[index01], "");    
            }
            else if(index02 > -1)
            {
                messageObject.messageAltered = messageObject.messageAltered.replace(message_R[index02], "");
            }
            else if(index03 > -1)
            {
                messageObject.messageAltered = messageObject.messageAltered.replace(message_R[index03], "");
            }
            else
            {
                messageObject.messageAltered = messageObject.messageAltered.replace(message_R[index04], "");
            }
            console.log("messasgeAltered after forecast: " + messageObject.messageAltered);
        } 
        else{
            messageObject.keywordFound = 5;
        }
        console.log("Keyword found in keywordSearchRO: " + messageObject.keywordFound);
                
    },



    /**
     * @param {object} messageObject - Object containing message recieved information.
     * @description Checks the messageObjects 'keywordFound' variable to determine if a badword or 'help' was found.
     * If the value is 1 or 2, then an error message is returned and the function is exited. 
     * Otherwise the message is checked for a comma. This is to determine if a zipcode was used or not. 
     * Then calls the functions: splitComma(messageObject), checkCityString(messageObject), checkStateString(messageObject);
     */
    checkMessageObject: function(messageObject){
        // Calls list of error messages
        var errorMessages = require('./error_Messages');
        console.log("\nIn checkMessageObject" + "\nMessageObject.keywordFound: " + messageObject.keywordFound);
        
        // If keywords: 'Conditions, forecast, or none' are found.
        if(messageObject.keywordFound === 3 || messageObject.keywordFound === 4 || messageObject.keywordFound === 5)
        {
            //Check if string doesnt contain a comma. If not, there is a zipcode 
            if(!(messageObject.messageAltered.indexOf(",") > -1))
            {
                console.log("No comma found");
                messageObject.messageAltered =  messageObject.messageAltered.replace(/\s+/, "");
                console.log("messasgeAltered regex: " + messageObject.messageAltered);
                // console.log("messageObject.messageAltered.length: "+ messageObject.messageAltered.length + " messageObject.messageAltered[0].length: " + messageObject.messageAltered[0].length );
                // console.log("messageObject.messageAltered[0]: " + messageObject.messageAltered[0]);
                // console.log("messageObject.messageAltered[1]: " + messageObject.messageAltered[1]);
                
                //Checks to make sure the array length is 1 and the string is 5 characters
                if(messageObject.messageAltered.length === 5)
                {
                    //Sets the message object zipcode
                    messageObject.zipcode = messageObject.messageAltered;
                    console.log("Zip code found: " + messageObject.zipcode);
                }
                else
                {
                    //Sets the error message
                    messageObject.errorMsg = errorMessages.zipErrorMessage;
                    console.log("Zip code not found: " + messageObject.errorMsg);
                }
            }
            else
            {
                console.log("Comma found");
                module.exports.splitComma(messageObject);
                module.exports.checkCityString(messageObject);
                module.exports.checkStateString(messageObject);
            }
        }
    },



    /**
     * @param {object} messageObject - Object containing message recieved information.
     * @description  Checks the messageObject.splitAfterCommaArr (where the state string is located) against an 
     * array of key value pairs (Array of state names and abbreviations). If there is a match, 
     * it sets the varibale messageObject.state to the correct state string. Otherwise, creates an error message.
     * 
     */
    checkStateString: function(messageObject){
        // Calls list of error messages
        var errorMessages = require('./error_Messages');
        // Calls array with state names and abbreviations
        var statesKV = require('./stateKeyValue');
        statesKV = statesKV.usStates;

        console.log("\nIn checkStateString");
        if(messageObject.splitAfterCommaArr.length === 1)
        {
            console.log("Length 1, checking stateAbbv");
            if(module.exports.compareStateAbbv(messageObject.splitAfterCommaArr[0]))
            {
                messageObject.state = messageObject.splitAfterCommaArr[0];
                console.log("Found state abbrv: " + messageObject.state);
            }
            else
            {
                messageObject.errorMsg = errorMessages.stateErrorMessage;
                console.log("Error in checkStateString: " + messageObject.errorMsg);
            }
        }
        else
        {
            console.log("Length 1+, comparing state array");
            var holder = module.exports.compareStateArray(messageObject);

            if(holder.checkTF)
            {
                messageObject.state = module.exports.combineWithUnderscore(statesKV[holder.indexHolder].name.toLowerCase());
                console.log("Found state: " + messageObject.state);
            }
            else
            {
                messageObject.errorMsg = errorMessages.stateErrorMessage;
                console.log("Error in checkStateString: " + messageObject.errorMsg);
            }
        }
    },



    // /**
    //  * @param {string} messageArr - Array containing message.
    //  * @description Combines the elements of an array to form a message. 
    //  * @return combinedMessage - String containing combined message.
    //  */
    //  combineMessage: function(messageArr){
    //    var combinedMessage = "";
    //    for(var t = 2; t < messageArr.length; t++)
    //    {
    //        if(t === (messageArr.length -1))
    //        {
    //             combinedMessage += messageArr[t];
    //        }
    //        else
    //        {
    //             combinedMessage += messageArr[t] + " ";
    //        }
    //    }
    //    return combinedMessage;
    //  },



     /**
      * @param {object} messageObject - Object containing message recieved information.
      * @description Compares the messageObject.splitAfterCommaArr against an array of state names.
      * If found, changes variable cSTa.checkTF to true and adds the index of the state name to cSTa.indexHolder.
      * Otherwise, it checks one more time but looping in the opposite direction. 
      * This is incase the message was incorrectly formatted.
      * @return Object
      */
     compareStateArray: function(messageObject){
        //Imports list of us state key value pairs
        var statesKV = require('./stateKeyValue');
        statesKV = statesKV.usStates;
        
        var cSTa = { checkTF: false, indexHolder: undefined }
        var wordHolder = messageObject.splitAfterCommaArr[0];

        for(var i = 0; i < messageObject.splitAfterCommaArr.length; i++)
        {
            if(i > 0)
            {
                wordHolder += " " + messageObject.splitAfterCommaArr[i];
            }

            console.log("compareStateArray(): Loop " + i + " wordHolder = " + wordHolder);
            var j = 0;
            
            while(!cSTa.checkTF && j < (statesKV.length - 1) )
            {
                if(wordHolder.toUpperCase() === statesKV[j].name)
                {
                    cSTa.checkTF = true;
                    cSTa.indexHolder = j;
                }
                j++;
            }
        }
        /**
         * If the state name was not found above, checks in reverse order.
         * Used incase the Twitter user used an incorrect format. Ex: raleigh, fdfs North Carolina
         * Don't really need this part, I could just return an error, but I thought it might help
         */
        if(!cSTa.checkTF)
        {
            wordHolder = messageObject.splitAfterCommaArr[messageObject.splitAfterCommaArr.length-1];
            
            for(var x = messageObject.splitAfterCommaArr.length; x >= 0; x--)
            {
                if(x < messageObject.splitAfterCommaArr.length)
                {
                    wordHolder = messageObject.splitAfterCommaArr[x-1] + " " + wordHolder;
                }
                console.log("compareStateArray(): Backwards loop " + x + " wordHolder = " + wordHolder);

                var j = 0;
                while(!cSTa.checkTF && j < (statesKV.length - 1))
                {
                    if(wordHolder.toUpperCase() === statesKV[j].name)
                    {
                        console.log(statesKV[j].name);
                        cSTa.checkTF = true;
                        cSTa.indexHolder = j;
                    }
                    j++;
                }
            }
        }
        return cSTa;
    },



    /**
      * @param {string} nameToCheck - string containing state name to check.
      * @description Compares the nameToCheck against an array of state names.
      * @return Boolean
      */

    //************************************************************************************************************************
    // NOTE: I just realized I have several state name checking functions. I will eventually come back and consolidate these.
    //************************************************************************************************************************
    compareStateName: function(nameToCheck){
        //Imports list of us state key value pairs
        var statesKV = require('./stateKeyValue');
        statesKV = statesKV.usStates;

        var checkedtf = 0;
        for(var i = 0; i < statesKV.length; i++)
        {
            if(nameToCheck.toUpperCase() === statesKV[i].name.toString())
            {
                checkedtf = 1;
            }
        }

        if(checkedtf == 0)
        {
            var holder = nameToCheck.split(/[ ,]+/g);
            var firstTwo = holder[0] + " " + holder[1];
            
            for(var i = 0; i < statesKV.length; i++)
            {
                if(firstTwo.toUpperCase() === statesKV[i].name.toString())
                {
                    checkedtf = 2;
                }
            }
                
            if(checkedtf == 0) 
            {
                var firstTwo = holder[0];
                for(var i = 0; i < statesKV.length; i++)
                {
                    if(firstTwo.toUpperCase() === statesKV[i].name.toString())
                    {
                        checkedtf = 3;
                    }
                }
            }
        
        }
        return checkedtf;
    },


    /**
     * @param {string} word - String containing an abbreviation
     * 
     * @description Compares word to array of state abbreviations
     * Checks the length of the string. 
     * If length is 2, then it compares against an array of US State abbreviations.
     * If 1, returns false, indicating an error
     * Else, it calls the compare state name function because it is not a US State abbreviation.
     * 
     * @returns Boolean
     */
    compareStateAbbv: function(word){
        //Imports list of us state key value pairs
        var statesKV = require('./stateKeyValue');
        statesKV = statesKV.usStates;

        var tf = false;
        if(word.length === 2)
        {
            //Checks to make sure that the abbrv is a us state
            for(var i = 0; i < statesKV.length; i++)
            {
                if (word.toUpperCase() === statesKV[i].abbreviation)
                {
                    tf = true;
                }
            }
            return tf;
        }
        else if(word.length === 1)
        {
            return tf;
        }
        else if(word.length > 2)
        {
            return module.exports.compareStateName(word);
        }
    },


    /**
     * @param {object} messageArr - String or array to be combined
     * @description Combines array into string, replacing whitespace with an underscore. Also accepts string
     * Used to replace whitespace with an underscore in order to produce the correct URL
     * (Ex: forecast/q/CA/San_Francisco.json)
     * Checks if param is an array. If so, combines into string.
     * Else just replaces whitespace.
     * @returns string
     */
    combineWithUnderscore: function(messageArr){
        var combinedMessage = "";
        if(Array.isArray(messageArr))
        {
                for(var t = 0; t < messageArr.length; t++)
                {
                    if(t === 0)
                    {
                        combinedMessage = messageArr[t];
                    }
                    else
                    {
                        combinedMessage += " " + messageArr[t];
                    }    
                }
            }
            else
            {
                combinedMessage = messageArr;
            }

            combinedMessage = combinedMessage.replace(/ /g,"_");
            console.log("combineWithUnderscore - after replace: " + combinedMessage);
            return combinedMessage;
    },


    /**
     * @param {string} message_R - String containing the message recieved.
     * @description Checks if the string contains any curse words.
     * Uses for loop to run through an array of bad words, comparing each word
     * @returns true or false
     */
    checkForBadWords: function(message_R){
        //Imports list of bad words to check against
        var badwords = require('./badwords');
        badwords = badwords.cursewords;

        var checktf = false;
        for(var i = 0; i < badwords.length; i++)
        {
            if(message_R.indexOf(badwords[i]) > -1)
            {
                checktf = true;
            }
        }
        return checktf;
    },


    /**
     * @param {object} messageObject - Object containing message recieved information.
     * @description Checks the length of messageObject.splitBeforeCommaArr (array containing the city name) to 
     * see if it is one word or two. If it is two words, combineWithUnderscore() is called. This is because
     * of the formatting the wunderground API requires. 
     */
    checkCityString: function(messageObject){
        console.log("\nIn checkCityString");

        if(messageObject.splitBeforeCommaArr.length === 1){
            messageObject.city = messageObject.splitBeforeCommaArr;
            console.log("oneword found(messageObject.city): " + messageObject.city);
        }
        else if(messageObject.splitBeforeCommaArr.length > 1){
            messageObject.city = module.exports.combineWithUnderscore(messageObject.splitBeforeCommaArr);
            console.log(">1word found(messageObject.city): " + messageObject.city);
        }
        else{
            messageObject.errorMsg = errorMessages.cityErrorMessage;
            console.log("Error in checkCityString: " + messageObject.errorMsg);
        }
    },



    /**
     * @param {object} messageObject - Object containing message recieved information.
     * @description Splits the messageObject.messageAltered string into two variables: splitBefore (should be the city)
     * and splitAfter (should be the state). Also trims any whitespace.
     */
    splitComma: function(messageObject){

        console.log("\nIn splitComma");
        var split = messageObject.messageAltered.split(",");
        console.log("var split: " + split[1]);
        
        //Removes whitespace
        split[0] = split[0].trim();
        split[1] = split[1].trim();
        
        messageObject.splitBeforeCommaArr = split[0].split(/[ ,]+/g);
        messageObject.splitAfterCommaArr = split[1].split(/[ ,]+/g);
        
        console.log("messageObject.splitBeforeCommaArr: " + messageObject.splitBeforeCommaArr);
        console.log("messageObject.splitAfterCommaArr: " + messageObject.splitAfterCommaArr);
        
    }, 


    /**
     * @param {object} messageObject - Object containing message recieved information.
     * @description Prints the messageObject in the console.
     */
     printMessageObject: function(messageObject){
        //Print
        console.log("\n\n End message object: " + messageObject);
        console.log("Message object.original_message: " + messageObject.original_message);
        console.log("Message object.messageAltered: " + messageObject.messageAltered);
        console.log("Message object.tweetReceiver: " + messageObject.tweetReceiver);
        console.log("Message object.errormessage: " + messageObject.errorMsg);
        console.log("Message object.keywordFound: " + messageObject.keywordFound);
        console.log("messageObject.splitBeforeCommaArr: " + messageObject.splitBeforeCommaArr);
        console.log("messageObject.splitAfterCommaArr: " + messageObject.splitAfterCommaArr);
        console.log("messageObject.zipcode: " + messageObject.zipcode);
        console.log("messageObject.state: " + messageObject.state);
        console.log("messageObject.city: " + messageObject.city);
    }

}