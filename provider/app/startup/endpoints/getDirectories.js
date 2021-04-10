const fs = require("fs");

module.exports = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, function (err, results) {
      if (err) reject(err);

      resolve(results);
    });
  });
};
