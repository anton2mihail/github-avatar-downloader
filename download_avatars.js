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
  request(options, (err, res) => {
    if (err) throw err;
    try {
      fs.mkdir("./avatars");
    } catch (e) {
      if (e.code == "EEXIST") {
      }
    }
  }).pipe(fs.createWriteStream(filePath));
}

//Function to be executed on program start
(function() {
  console.log("Welcome to the GitHub Avatar Downloader!");
  const args = process.argv.slice(2);
  if (args.length == 2) {
    getRepoContributors(args[0], args[1], (err, result) => {
      console.log("Errors:", err);
      for (let el of result) {
        downloadImageByURL(el["avatar_url"], "avatars/" + el["login"] + ".jpg");
      }
    });
  } else {
    throw "Incorrect Number of Arguments!\nThe arguments expected are <owner> <repo>\nOrder is important";
  }
})();
