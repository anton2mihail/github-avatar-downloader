const request = require("request");
require("dotenv").config();
const fs = require("fs");
const tokenAuth = function(token) {
  if (!token) {
    throw "No env variable with the name GITHUB_TOKEN was specified";
  }
  if (/[^a-f0-9]{40}/gi.test(token)) {
    throw "Invalid github token provided";
  }
};

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
    console.log(res.statusCode);
    cb(err, JSON.parse(body), token);
  });
}

function getStarredUrls(list, token) {
  let starredReposList = [];
  if (list) {
    for (let el of list) {
      let options = {
        url: "https://api.github.com/users/" + el + "/starred",
        headers: {
          "User-Agent": "request",
          Authorization: token
        }
      };
      request(options, (err, res, body) => {
        if (err) throw err;
        console.log(res.statusCode);
        let starredRepos = JSON.parse(body);
        for (let repo of starredRepos) {
          starredReposList.push(repo["full_name"]);
        }
      }).on("end", () => {
        console.log(starredReposList);
      });
    }
  }
}

function starredReposByUser(err, response) {
  if (err) throw err;
  let starredUrls = [];
  for (let res of response) {
    starredUrls.push(res["login"]);
  }
  getStarredUrls(starredUrls);
}

(function() {
  console.log("Welcome to repository recommendations!");
  let args = process.argv.slice(2);
  tokenAuth(process.env.GITHUB_TOKEN);
  getRepoContributors(
    { repoOwner: args[0], repoName: args[1], token: process.env.GITHUB_TOKEN },
    starredReposByUser
  );
})();
