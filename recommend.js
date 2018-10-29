const request = require("request-promise");
require("dotenv").config();
const fs = require("fs");
let mentionedRepos = {};
let starredReposList = [];
const tokenAuth = function(token) {
  if (!token) {
    throw "No env variable with the name GITHUB_TOKEN was specified";
  }
  if (/[^a-f0-9]{40}/gi.test(token)) {
    throw "Invalid github token provided";
  }
};

function printResults() {
  const ent = Object.entries(mentionedRepos)
    .sort((a, b) => {
      if (a[1] > b[1]) {
        return -1;
      }
      if (a[1] < b[1]) {
        return 1;
      }
      // a must be equal to b
      return 0;
    })
    .filter((el, idx) => {
      return idx < 5;
    });
  for (let e of ent) {
    console.log(`[${e[1]} stars] / ${e[0]}`);
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
      Authorization: "token " + token
    }
  };
  //Create new get request at the specified url endpoint with the written options
  request(options, function(err, res, body) {
    console.log(35, res.statusCode);
    cb(err, JSON.parse(body), token);
  });
}

function getTally(repoList) {
  let tally = repoList.reduce((tally, el) => {
    tally[el] = (tally[el] || 0) + 1;
    return tally;
  }, mentionedRepos);
}

function getStarredUrls(list, token) {
  let promiseTally = [];
  if (list) {
    for (let el of list) {
      let options = {
        url: "https://api.github.com/users/" + el + "/starred",
        headers: {
          "User-Agent": "request",
          Authorization: "token " + token
        }
      };
      let promise = request(options);
      promiseTally.push(promise);
      // .on("end", );
    }
    return Promise.all(promiseTally).then(results => {
      for (let el of results) {
        let starredRepos = JSON.parse(el);
        for (let repo of starredRepos) {
          starredReposList.push(repo["full_name"]);
        }
      }
    });
    //return true;
  }
}

function starredReposByUser(err, response, token) {
  if (err) throw err;
  let starredUrls = [];
  for (let res of response) {
    starredUrls.push(res["login"]);
  }
  getStarredUrls(starredUrls, token).then(() => {
    getTally(starredReposList);
    printResults();
  });
}

(function() {
  console.log("Welcome to repository recommendations!");
  let args = process.argv.slice(2);
  const token = process.env.GITHUB_TOKEN;
  tokenAuth(token);
  getRepoContributors(
    { repoOwner: args[0], repoName: args[1], token },
    starredReposByUser
  );
})();
