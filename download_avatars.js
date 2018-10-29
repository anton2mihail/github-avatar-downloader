const request = require("request");
require("dotenv").config();
const fs = require("fs");

//Make sure that the correct environment variable is set

function tokenAuth(token) {
  if (!token) {
    throw "No env variable with the name GITHUB_TOKEN was specified";
  }
  if (/[^a-f0-9]{40}/gi.test(token)) {
    throw "Invalid github token provided";
  }
}

function getRepoContributors({ repoOwner, repoName, token }, cb) {
  var options = {
    url:
      "https://api.github.com/repos/" +
      repoOwner +
      "/" +
      repoName +
      "/contributors",
    headers: {
      "User-Agent": "request",
      Authorization: token
    }
  };
  //Create new get request at the specified url endpoint with the written options
  request(options, function(err, res, body) {
    cb(err, JSON.parse(body));
  });
}

function downloadImageByURL(url, filePath, token) {
  let options = {
    url: url,
    headers: {
      "User-Agent": "request",
      Authorization: token
    }
  };
  try {
    fs.mkdirSync("./avatars");
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  //Make a get request at specified endpoint, downloads each image specifed in previous response
  request(options, (err, res) => {
    if (err) throw err;
    //Attempt to make directory
  }).pipe(fs.createWriteStream(filePath));
}

//Function to be executed on program start
(function() {
  const token = process.env.GITHUB_TOKEN;
  tokenAuth(token);
  console.log("Welcome to the GitHub Avatar Downloader!");
  //Slice first two identifiers off of command line arguments to remain with just the user specified arguments
  const args = process.argv.slice(2);
  //If there is the correct number of arguments continue with the operation
  if (args.length == 2) {
    getRepoContributors(
      { repoOwner: args[0], repoName: args[1], token },
      (err, result) => {
        if (result.message == "Not Found") {
          throw "Repo Name and Repo Owner combination not found";
        }
        for (let el of result) {
          //Download each image based on the provided url, and place it in an dynamically created directory and file name
          downloadImageByURL(
            el["avatar_url"],
            "avatars/" + el["login"] + ".jpg"
          );
        }
      }
    );
  } else {
    //If arguments are somehow incorrect throw an error explaining what was expected
    throw "Incorrect Number of Arguments!\nThe arguments expected are <owner> <repo>\nOrder is important";
  }
})();
