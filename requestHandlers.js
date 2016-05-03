fs = require('fs');
path = require('path');
querystring = require('querystring');

addressPurifier = function (address) {
  address = address.toString();
  var
  pathnameArray = address.toString().split('/');
  pathnameArray.shift();
  pathnameArray.shift();
  var purePath = '';
  for (var i in pathnameArray) {
    purePath += '/'+pathnameArray[i];
  }
  return purePath;
};


main = function (response, address) {
  var tempPath = address;
  if (tempPath === '/') {
    tempPath += 'index.html';
  }
  // console.log('./file'+tempPath);
  fileLoader(response, tempPath);
};

db = function (response, address, queryOptions, method) {
  var purePath = addressPurifier(address),
  queryObj = querystring.parse(queryOptions);
  if (method == 'get') {
    
  }
};

save = function (response, address, queryOptions, method) {
  if (method == 'post') {
    console.log(queryOptions);
  }
};

fileLoader = function (response, address) {
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
        response.writeHead(200, {'Content-Type': validExt});
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
exports['main'] = main;
exports['db'] = db;
exports['save'] = save;