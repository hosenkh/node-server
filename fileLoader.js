fs = require('fs');
path = require('path');
load = function (response, setCookies, address, cookies) {
  var
  ext = path.extname(address),
  localPath = './file',
  validExtensions = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".txt": "text/plain",
    ".json": "text/json",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".png": "image/png",
    ".ico": "image/icon",
    ".map": "application/x-navimap",
    ".woff": "application/font-woff",
    ".woff2": "application/font-woff2",
    ".ttf": "application/octet-stream"
  },
  validExt = validExtensions[ext];
  if (validExt) {
    
    localPath += address;
    fs.exists(localPath, function(exists) {
      if(exists) {
        // console.log("Serving file: " + localPath);
        var tempFile = fs.readFileSync(localPath);
        if (setCookies) {
          response.writeHead(200, {'Content-Type': validExt, 'set-cookie': setCookies});
        } else {
          response.writeHead(200, {'Content-Type': validExt});
        }
        response.end(tempFile);
      } else {
        console.log("File not found: " + localPath);
        response.writeHead(404);
      }
    });

  } else {
    console.log("Invalid file extension detected: " + ext);
  }
};
exports.load = load;