crypto = require('./encripter');
fileLoader = require('./fileLoader');
querystring = require('querystring');
databaseHandler = require('./databaseHandler');

addressPurifier = function (address) {
  address = address.toString();
  var
  pathnameArray = address.toString().split('/').shift().shift();
  var purePath = '';
  for (var i in pathnameArray) {
    purePath += '/'+pathnameArray[i];
  }
  return purePath;
};

queryParser = function (query) {
  var
  splittedQuery = [],
  parsedQuery = {};
  if (query) {
    splittedQuery = query.split('&');
    parsedQuery = {};
    for (var i in splittedQuery) {
      var command = splittedQuery[i].split('=');
      parsedQuery[command[0]] = command[1];
    }
  }
  return parsedQuery;
};

userDecryptor = function (cookies) {
  var user;
  if (cookies.user) {
    return (crypto.decrypt(cookies.user));
  } else {
    return 'public';
  }
};

main = function (response, address, cookies) {
  var tempPath = address;
  if (tempPath === '/') {
    tempPath += 'index.html';
  }
  fileLoader.load(response, '',tempPath, cookies);
};

db = function (response, address, queryOptions, method, cookies, postData) {
  username = userDecryptor(cookies);
  queryObj = querystring.parse(queryOptions);
  requestData = JSON.parse(postData);
  if (method == 'get') {
    databaseHandler.showLink(username, queryObj.menu, function(results) {
      response.write(results);
      response.end();
    });
  }
  if (method == 'post') {
    databaseHandler.dbRequest(username, requestData.selectionArray, requestData.command, requestData.data, function(results) {
      if (userDecryptor(cookies) != 'public') {
        response.writeHead(200, {
          'set-cookie': 'user='+cookies.user+';httpOnly=true;expires='+new Date(new Date().getTime()+600000).toUTCString()
        });
      }
      response.write('a'+JSON.stringify(results));
      response.end();
    });
  }
};

restricted = function (response, address, queryOptions, method, cookies, postData) {
  username = userDecryptor(cookies);
  queryObj = querystring.parse(queryOptions);
  fileName = address.split('/');
  fileName = fileName[fileName.length - 1];
  databaseHandler.dbCheckPermission(username, 'download', fileName, function (permission) {
    if (permission) {
      fileLoader.load(response, '', address, cookies);
    } else {
      response.writeHead(200);
      response.write("You don't have the permission to access this page with this account or you may have been logged out.\nYou can try to <a id= 'restrictedlink' href='#/login'>login</a>.");
      response.end();
    }
  });
};


save = function (response, address, queryOptions, method) {
  if (method == 'post') {
    console.log(queryOptions);
  }
};
login = function (response, address, queryOptions, method, cookies, postData) {
  postObject = JSON.parse(postData);
  if (method == 'post' && address == '/login') {
    if (postObject.username == 'admin') {
      if (postObject.password == 'c914a90605a59084d12575ff9016bb2a') {
        response.writeHead(200, {
          'set-cookie': 'user='+crypto.encrypt(postObject.username)+';httpOnly=true;expires='+new Date(new Date().getTime()+600000).toUTCString()
        });
        response.write('login successful');
        response.end();
      } else {
        response.writeHead(200, {
          'set-cookie': 'user='+crypto.encrypt('public')+';httpOnly=true'
        });
        response.write('password incorrect');
        response.end();
      }
    } else {
      var
      usernameSelectionArray = [
        {
          table: "users",
          conditions: {
            username: [postObject.username]
          },
          exportFields: ["ID"]
        }
      ],
      passwordSelectionArray = [
        {
          table: 'users',
          conditions: {
            username: [postObject.username],
            password: [crypto.encrypt(postObject.password)]
          },
          exportFields: ['ID']
        }
      ];
      databaseHandler.dbRequest('public', usernameSelectionArray, 'select', '', function(results){
        if (results.length == 1) {
          databaseHandler.dbRequest('public', passwordSelectionArray, 'select', '', function(results){
            if (results.length == 1) {
              response.writeHead(200, {
                'set-cookie': 'user='+crypto.encrypt(postObject.username)+';httpOnly=true;expires='+new Date(new Date().getTime()+15000).toUTCString()
              });
              response.write('login successful');
              response.end();
            } else {
              response.writeHead(200, {
                'set-cookie': 'user='+crypto.encrypt('public')+';httpOnly=true'
              });
              response.write('password incorrect');
              response.end();
            }
          });
        } else {
          response.write('no such user');
          response.end();
        }
      });
    }
  }
};

logout = function (response, address, queryOptions, method, cookies, postData) {
  response.writeHead(200, {
    'set-cookie': 'user='+crypto.encrypt('public')+';httpOnly=true'
  });
  response.write('<script>window.location = "/";</script>');
  response.end();
};

postpone = function (response, address, queryOptions, method, cookies, postData) {
  if (userDecryptor(cookies) != 'public') {
    response.writeHead(200, {
      'set-cookie': 'user='+cookies.user+';httpOnly=true;expires='+new Date(new Date().getTime()+15000).toUTCString()
    });
  } else {
    response.writeHead(200, {
      'set-cookie': 'user='+crypto.encrypt('public')+';httpOnly=true'
    });
  }
  response.end();
};

exports['main'] = main;
exports['db'] = db;
exports['postpone'] = postpone;
exports['restricted'] = restricted;
exports['save'] = save;
exports['login'] = login;
exports['logout'] = logout;