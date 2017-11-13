
var Twit = require('twit');

// Twitter keys
var appkeys = require('./appkeys');
var T = new Twit(appkeys);

// Message handling functions
var msgHandling = require('./message_handling');

// Wunderground functions
var wunderFunctions = require('./wundergroundFunctions');

// Responses to being followed by Twitter user
var f_Responses = require('./followed_Responses');



// Creating a user stream
var stream = T.stream('user');
// Creates a stream to detect when users follow you
stream.on('follow', accountFollowed);

/**
 * 
 * @param {JSON} followedData - JSON data for the followed event.
 * 
 * @description detects if a Twitter user follows your account, then replys with a message.
 * At the moment, randomly generates a number 0-100 to determine which message to reply with.
 */
function accountFollowed (followedData) {
    var follower_name = followedData.source.name;
    var follower_userName = followedData.source.screen_name;
    console.log('Followed by ' + follower_name);
    followedMessage(follower_userName);
}






//Creates stream for tweet recieved
stream.on('tweet', receivedTweet);

/**
 * @param {JSON} receivedData - JSON data for the followed event.
 * @description Determines how to reply when a Twitter user tweets the bot a message. 
 * Creates a message object to hold the JSON object data (Tweet information).
 * Sets to lowercase and removes '@ForecastMe' from the message.
 * Uses three functions: keywordSearchRO(), checkMessageObject(), getWeather_sentTweet() - to determine what wunderground search to be made.
 * 
 */
function receivedTweet(receivedData){

    console.log("in received tweet");
    var replyto = receivedData.in_reply_to_screen_name;
    var messageReceived = receivedData.text;
    console.log("message received: " + messageReceived);
    //Checks to see if the in_reply_to_screen_name matches the bots name
    if(replyto === 'ForecastMe'){
        console.log("in received tweet if: "+messageReceived);
        
        var messageObject = { };
        messageObject.tweetReceiver = replyto;
        messageObject.original_message = messageReceived;
        messageObject.messageAltered  = messageObject.original_message.replace(("@" + replyto+ " "), "").toString();
        messageObject.original_message = messageReceived.toLowerCase();
        console.log("Message object.messageAltered: " + messageObject.messageAltered);
        messageObject.senderUsername = receivedData.user.screen_name;
        messageObject.senderHandle = "@" + receivedData.user.screen_name;
        console.log("User who sent message: " + messageObject.senderHandle);

        // Checks message for keywords
        msgHandling.keywordSearchRO(messageObject);
        //
        msgHandling.checkMessageObject(messageObject);
        var stringToTweet
        wunderFunctions.retreiveWeather(messageObject, function waitForInfo(wfi){
                stringToTweet = messageObject.senderHandle + " " + wfi;
                sendTweet(stringToTweet);
                
                
        });

        // Console.log the message object
        msgHandling.printMessageObject(messageObject);
    }
}




var counter = 0;

/**
 * 
 * @param {string} messageToTest - String used to test the program
 * @description Used to test the application without having to rely on Twitter (In otherwords, test offline) 
 */
function test(messageToTest){
        var messageReceived = messageToTest;
        var replyto = 'ForecastMe';
        var messageObject = { };
        messageObject.tweetReceiver = replyto;
        messageObject.senderHandle = "@Test1234565";
        messageObject.original_message = messageReceived.toLowerCase();
        messageObject.messageAltered  = messageReceived.replace(("@" + replyto+ " "), "").toString();
        console.log("Message object.messageAltered: " + messageObject.messageAltered);
        
        msgHandling.keywordSearchRO(messageObject);
        msgHandling.checkMessageObject(messageObject);
        var stringToTwt;
       
        wunderFunctions.retreiveWeather(messageObject, function waitForInfo(wfi){
                stringToTwt = wfi;
                msgHandling.printMessageObject(messageObject);
                console.log("TWEET TO SEND: " + stringToTwt);
                counter++;
        });
}


function followedMessage(follower_name){
        var follower_userName = follower_name;
        var randomNum = Math.floor((Math.random() * 100) + 1);
        if(randomNum % 2 == 0)
        {
                if(randomNum % 5 == 0)
                {
                        sendTweet('@' + follower_userName + ' ' + f_Responses.followedMessage01);
                }
                else
                {
                        sendTweet('@' + follower_userName + ' ' + f_Responses.followedMessage04);
                } 
        }
        else if (randomNum % 2 != 0)
        {
                if(randomNum % 3 == 0)
                {
                        sendTweet('@' + follower_userName + ' ' + f_Responses.followedMessage02);
                }
                else if(randomNum % 39 == 0)
                {
                        sendTweet('@' + follower_userName + ' ' + f_Responses.followedMessage03);
                }
                else
                {
                        sendTweet('@' + follower_userName + ' ' + f_Responses.followedMessage05);
                }
                
        }

}


/**
 * @param {string} content - String to be tweeted
 * @description Sends a tweet 
 */
function sendTweet(content){
    var message = 
    {
        status: content
    }

    T.post('statuses/update', message, tweet); 
    function tweet (err, data, response) 
    {
        if(err)
        {
            console.log("Error: " + err);
        }
        else
        {
            console.log("Tweet was successfully sent");
        }
    };
};


// var params = { q: 'wolfpack', count: 2 };

// T.get('search/tweets', params, getData); 

// function getData(err, data, response) {
//     var search_results = data.statuses;
//     for(var i = 0; i < search_results.length; i++){
//         console.log(search_results[i].text);
//     }
  
// };
