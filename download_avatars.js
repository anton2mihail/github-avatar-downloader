const request = require("request");
const authToken = require("./secrets");
const fs = require("fs");

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url:
      "https://api.github.com/repos/" +
      repoOwner +
      "/" +
      repoName +
      "/contributors",
    headers: {
      "User-Agent": "request",
      Authorization: authToken.GITHUB_TOKEN
    }
  };
  //Create new get request at the specified url endpoint with the written options
  request(options, function(err, res, body) {
    cb(err, JSON.parse(body));
  });
}

function downloadImageByURL(url, filePath) {
  let options = {
    url: url,
    headers: {
      "User-Agent": "request",
      Authorization: authToken.GITHUB_TOKEN
    }
  };
  //Make a get request at specified endpoint, downloads each image specifed in previous response
  request(options, (err, res) => {
    if (err) throw err;
    //Attempt to make directory
    fs.mkdir("./avatars", error => {
      fs.createWriteStream(filePath);
    });
  });
}

//Function to be executed on program start
(function() {
  console.log("Welcome to the GitHub Avatar Downloader!");
  //Slice first two identifiers off of command line arguments to remain with just the user specified arguments
  const args = process.argv.slice(2);
  //If there is the correct number of arguments continue with the operation
  if (args.length == 2) {
    getRepoContributors(args[0], args[1], (err, result) => {
      console.log("Errors:", err);
      for (let el of result) {
        //Download each image based on the provided url, and place it in an dynamically created directory and file name
        downloadImageByURL(el["avatar_url"], "avatars/" + el["login"] + ".jpg");
      }
    });
  } else {
    //If arguments are somehow incorrect throw an error explaining what was expected
    throw "Incorrect Number of Arguments!\nThe arguments expected are <owner> <repo>\nOrder is important";
  }
})();
