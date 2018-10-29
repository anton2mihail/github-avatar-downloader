const request = require("request");
const authToken = require("./secrets");
console.log("Welcome to the GitHub Avatar Downloader!");

function getRepoContributors(repoOwner, repoName, cb) {
  // ...
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

getRepoContributors("jquery", "jquery", (err, result) => {
  console.log("Errors:", err);
  for (let el of result) {
    downloadImageByURL(el["avatar_url"], "avatars/" + el["login"] + ".jpg");
  }
});
const fs = require("fs");
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
  }).pipe(fs.createWriteStream(filePath));
}
