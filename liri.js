//Brings in dotenv .env
require("dotenv").config();

// Include the request npm package (Don't forget to run "npm install request" in this folder first!)
var request = require("request");

// Include the moment npm package
var moment = require("moment");

//Include the file system npm package
var fs = require('fs');

//Brings in Spotify api, based on API keys from keys.js file
var Spotify = require('node-spotify-api');
const keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);



//concert this function
function concertThisFunction(concertSearchTerm) {
    //set URL for get request based on Search Term
    var queryURL = "https://rest.bandsintown.com/artists/" + concertSearchTerm + "/events?app_id=codingbootcamp";

    request(queryURL, function (error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            var eventArray = JSON.parse(body);

            if (eventArray[0] != null) /*Run the following only when there are upcoming events*/ {
                //iterate through each of the event objects returned
                for (var i = 0; i < eventArray.length; i++) {
                    //new line added between events for readability
                    console.log("");
                    console.log("Venue Name: " + eventArray[i].venue.name);
                    if (eventArray[i].venue.region != "") /*Output location including region if region present*/ {
                        console.log("Venue Location: " + eventArray[i].venue.city + ", " + eventArray[i].venue.region + ", " + eventArray[i].venue.country);
                    } else /*if no region present, ouput location without region */ {
                        console.log("Venue Location: " + eventArray[i].venue.city + ", " + eventArray[i].venue.country);
                    };
                    console.log("Event Date: " + moment(eventArray[i].datetime).format('MM/DD/YYYY'));
                };
            } else /*If there are no upcoming events, notify user*/ {
                console.log("No Upcoming Events For: " + concertSearchTerm);
            };
        }
    });
}

//spotify this function
function spotifyThisFunction(spotifySearchTerm) {

    //perform spotify search using api
    spotify.search({
        type: 'track',
        query: spotifySearchTerm
    }, function (err, data) {
        if (err) {
            return console.log('Spotify API Error: ' + err);
        }

        //variable to keep track of artists for each song, used in following for-loop
        var artists;

        //iterate through each of the items returned as a result of the query
        for (var i = 0; i < data.tracks.items.length; i++) {
            //initialize artists to first artist in the array
            var artists = data.tracks.items[i].artists[0].name;

            //for loop to add subsequent artists
            for (var j = 1; j < data.tracks.items[0].artists.length; j++) {
                artists = artists + ", " + data.tracks.items[i].artists[j].name;
            };

            //insert line break for readability
            console.log("");

            //console log concatenated artists string
            console.log("Artist(s): " + artists);

            //console log Song Name
            console.log("Song Name: " + data.tracks.items[i].name);

            //console log Preview URL
            if (data.tracks.items[i].preview_url !== null) {
                console.log("Preview URL: " + data.tracks.items[i].preview_url);
            } else /* if there is no preview URL, notify user*/ {
                console.log("Preview URL: Not Available");
            };

            //console log Album Name
            console.log("Album Name: " + data.tracks.items[i].album.name);
        };
    });
}

//movie this function
function movieThisFunction(movieSearchTerm) {

    //set URL for OMDB API query based on input search term
    var queryURL = "https://www.omdbapi.com/?t=" + movieSearchTerm + "&y=&plot=short&apikey=trilogy";

    //perform API request to OMDB
    request(queryURL, function (error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {

            var movieData = JSON.parse(body);

            // Parse the body of the site and recover just the imdbRating
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            console.log("Movie Title: " + movieData.Title);
            console.log("Release Year: " + movieData.Year);
            //Ratings[0] is predefined in API as IMDB Rating
            console.log("IMDB Rating: " + movieData.Ratings[0].Value);
            //Ratings[1] is predefined in API as Rotten Tomatoes Rating
            console.log("Rotten Tomatoes Rating: " + movieData.Ratings[1].Value);
            console.log("Country of Production: " + movieData.Country);
            console.log("Language: " + movieData.Language);
            console.log("Plot: " + movieData.Plot);
            console.log("Actors: " + movieData.Actors);
        }
    });

}


//do what it says function
//note this function has recursive elements: 
//This function is called by the switchCommand function when the command do-what-it-says is entered via command line, 
//but also calls the same switchCommand function to process the command provided by random.txt
function doWhatFunction() {

    // This block of code will read from the "random.txt" file.
    // It's important to include the "utf8" parameter or the code will provide stream data (garbage)
    // The code will store the contents of the reading inside the variable "data"
    fs.readFile("random.txt", "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error + " Error reading random.txt");
        }

        //Split the contents of data by commas (to separate command and search term)
        var dataArr = data.split(",");

        //set search command to first part of dataArr
        var doWhatSearchCommand = dataArr[0];

        //set search term to second part of dataArr while removing quotation marks
        var doWhatSearchTerm = dataArr[1].replace(/"/g, "");

        //run switch command only if valid command is pulled from file random.txt
        if (doWhatSearchCommand === 'concert-this' || 'spotify-this-song' || 'movie-this') {
            switchCommand(doWhatSearchCommand, doWhatSearchTerm);
        } else {
            console.log("Invalid Do-What-It-Says Command Within random.txt.");
        }
    });

}

//main switch function to perform different functions based on which command is input
function switchCommand(searchCommandArg, searchTermArg) {
    switch (searchCommandArg) {
        case 'concert-this':
            if (searchTermArg != null) {
                concertThisFunction(searchTermArg);
            } else /* if no band name provided, notify user */ {
                console.log("Error: No Band Name Provided");
            };
            break;
        case 'spotify-this-song':
            if (searchTermArg != null) {
                spotifyThisFunction(searchTermArg);
            } else /*If no song name provided, search for "The Sign" by "Ace of Base*/ {
                spotifyThisFunction("The Sign Ace of Base");
            };
            break;
        case 'movie-this':
            if (searchTermArg != null) {
                movieThisFunction(searchTermArg);
            } else /* if no movie title provided, search for "Mr. Nobody */ {
                movieThisFunction("Mr. Nobody");
            };
            break;
        case 'do-what-it-says':
            doWhatFunction();
            break;
        default:
            console.log('Error: Invalid Or Missing Command.');
    }
};

// Grab search command line argument
var searchCommand = process.argv[2];

//Initialize searchTerm to null in case no arguments passed other than the search command
//If searchTerm is not null, set searchTerm by joining the remaining arguments,
// since a single searchTerm may contain multiple words separated by spaces
var searchTerm = null;
if (process.argv[3] != null) {
    searchTerm = process.argv.slice(3).join(" ");
};

//Calls different functions depending on which search command is input at command line (or from file)
switchCommand(searchCommand, searchTerm);