# [ForecastMe-Bot](https://twitter.com/ForecastMe) (Beta)
ForecastMe Bot is a Twitter bot designed to provide users with current forecast information. 
Twitter users simply tweet @ForecastMe the zip code, or city and state, and the bot will respond with the appropriate forecast. 
The user also has the option of choosing what type of information they wish to receive by including the keywords ‘conditions’ or ‘forecast’.
Otherwise, if no keywords are included, the bot will respond with a combination of the two. 
Additionally, including the keyword ‘help’ in the tweet will prompt the bot to respond with directions.


![Screenshot](https://user-images.githubusercontent.com/13583303/30406548-6e8222e6-98c0-11e7-99e3-48c8004a8e4a.png)

### About
The project was initially intended to be a simple weather bot that tweeted the current conditions for a single location on a set interval.
However, after completing this task, I realized it would be more interesting to allow individuals to request forecast information for any location, thus making it more versatile. 

Currently the bot only works for U.S. cities. 
This is due to the nature of the Wunderground API’s error handling.
While the Wunderground API will return an error for ‘city not found’, it will not return an error for a unidentified state. 
Instead, the API returns an array of best guesses for the location, which turned out to be an issue when a user misspells a state name or abbreviation. 
For this reason, I decided to limit the bot to only cities in the USA, at least until I can find another solution. 
In order to limit the search to US cities, the program compares the tweet string to an array of US State key value pairs (State name and state abbreviation). If there is not a match, the bot will send an error message to the Twitter user.

The portion of this project that has turned out to be the most difficult and time consuming is input sanitation. 
The program functions by taking the user tweet and placing it into a message object. 
Then the tweet is split into an array and is searched for the keyword ‘help’, as well as, curse words. 
If any are found, the program will respond with the appropriate error message.
Otherwise, the bot sends a request to wunderground and returns a string to be tweeted.


### What does the bot do
* Provides the current conditions, forecast, or both to Twitter users when it is prompted
* Currently only works for US states
* Replies when followed
* Replies when a curse word is detected
* Replies to several phrases. For example, if the program detects the words “pod bay doors”, it will respond with, “I’m afraid I can’t do that”

### Software Used
* **Programming Language:** Javascript
* **Frameworks:** Angular.js, Node.js
* **IDE:** Visual Studio Code
* **API:** Weather Underground, Twitter
* **Cloud Platform:** Heroku
* **package:** wunderground
* **package:** twit

### Challenges
* Learning how to use the Twitter API
* Learning how to use the ‘twit’ and ‘wunderground’ packages
* Sanitizing inputs.
* Scope Creep 

### Current Issues

* ~~Due to Twitter's character limit the bot often returns 'undefined' when prompted for the 'forecast' of a location.~~ (Fixed - Twitter increased the character limit to 280)
* Will not respond to users whose account is set to private. 

### Screenshots
* An example of a query sent to ForecastMe
![Screenshot](https://user-images.githubusercontent.com/13583303/30406823-4db90d3e-98c2-11e7-9464-40770aa6fa99.png)

* An example of a reply from @ForecastMe 
![Screenshot](https://user-images.githubusercontent.com/13583303/30406545-6b2df5ac-98c0-11e7-9039-52d0ab09bfc2.png)

* An example of ForecastMe help message. When tweeted 'Help', the bot responds with instructions on how to use.
![Screenshot](https://user-images.githubusercontent.com/13583303/30406582-ae36d616-98c0-11e7-8a37-5640eeff00a7.png)

* An example of an incorrect query where there is either a typo or the the city does not exist.
![Screenshot](https://user-images.githubusercontent.com/13583303/30406583-af87bf76-98c0-11e7-9b9d-641b9dbed1df.png)

* Returns error message if the state is misspelled or if the location is not within the US.
![Screenshot](https://user-images.githubusercontent.com/13583303/30406584-b0ff7f60-98c0-11e7-9ee0-061ebc948997.png)

* An example of a query for the forecast.
![Screenshot](https://user-images.githubusercontent.com/13583303/30406586-b2837486-98c0-11e7-9bb0-82594b63528f.png)

* When a curse word is detected, ForecastMe responds with a message.
![Screenshot](https://user-images.githubusercontent.com/13583303/30406789-03444552-98c2-11e7-8c84-9785a2c496a1.png)
