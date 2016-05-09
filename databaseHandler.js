mysql = require('mysql');
__ = require('underscore');

errorThrower = function (err) {
  if (err) {console.log(err);}
};

conditionStringGenerator = function (importedCondition, conditions) {
  var
  conditionKeys = __.keys(conditions),
  conditionString = '',
  conjunction = '=';
  if (importedCondition) {
    conditionString += importedCondition;
    if (conditionKeys.length) {
      conditionString += ' AND';
    }
  }
  for (var i=0; i<conditionKeys.length; i++) {
    if (conditions[conditionKeys[i]].length > 1) {
      conjunction = ' IN ';
    }
    else {
      conjunction = ' = ';
    }
    conditionString += ' `'+ conditionKeys[i] + '`'+ conjunction +'"'+ conditions[conditionKeys[i]].join()+'" ';
    if (conditionKeys[i+1]) {
      conditionString += ' AND ';
    }
  }
  return conditionString || 1;
};

levelSelector = function (table, importedCondition ,conditions, exportFields, exportFunction) {
  connection.query(
    'SELECT '+ exportFields.join() + ' FROM '+ table + ' WHERE '+ conditionStringGenerator(importedCondition, conditions),
    function (err, results) {
      errorThrower(err);
      if (results) {
        exportFunction(results);
      }
    }
  );
};

dbStart = function () {
  connection = mysql.createConnection({user: 'root', password: ''});
  connection.connect();
  connection.query('USE test');
};

dbEnd = function () {
  connection.end();
};

/**
 * the function to check if a user has a particular permission
 * @param  {String} username the session saved in client's browser
 * @param  {String} command  the work to be done. possible commands are
 * select, insert, update, delete, updateBulk, insertBulk, download, show
 * @param  {String} content  name of the table, partial or link to check permission
 */
dbCheckPermission = function (username, command, content, exportFunction) {
  var
  finalPermission = false,
  selectionArray = [
    {
      table: "users",
      conditions: {
        Username: [username]
      },
      exportFields: ["ID"]
    },
    {
      table: "user_permissions",
      conditions: {},
      importedCondition: "UserId",
      exportFields: ["PermissionId"]
    },
    {
      table: "permission_permissionnames",
      importedCondition: "PermissionNameId",
      exportFields: ["PermissionId"]
    },
    {
      table: "permissions",
      importedCondition: "ID",
      conditions: {
        Content: [content],
        Command: [command]
      },
      exportFields: ["ID", "Information"]
    }
  ];
  dbStart();
  selector(selectionArray, function (results) {
    if (results.length){
      finalPermission = true;
    }
    exportFunction(finalPermission);
  });
};

/**
 * the function which performs selections
 * @param  {Array} selectionArray information used to make a selection. structure is: 
 * [
    {
      "table" : "table1",
      "conditions": {
        "col1" : ["val1"],
        "col2" : ["val2"]
      },
      "exportFields" : ["col3"],
    },
    {
      "table" : "table2",
      "importedCondition": "col3",
      "conditions" : {
        "col2" : ["val3"],
        "col3" : ["val4", "val5"]
      },
      "exportFields": ["col5", "col6"]
    }
  ]
 * @param  {function} resultFunction the function performed on results
 */
selector = function (selectionArray, resultFunction) {
  var
  finalResults = [],
  importedConditionString = '',
  i = 0,
  tempFunction = function() {
    levelSelector(selectionArray[i].table, importedConditionString, selectionArray[i].conditions, selectionArray[i].exportFields, function(results){
      if (selectionArray[i+1]) {
        finalResults = [];
        if (results.length) {
          for (var j in results) {
            finalResults.push(results[j][selectionArray[i].exportFields]);
          }
          if (finalResults.length == 1) {
            conjunction = '=';
            cp ='';
          } else {
            conjunction = 'IN (';
            cp = ')';
          }
          importedConditionString = '`'+selectionArray[i+1].importedCondition+'` '+conjunction+finalResults.join()+cp;
          i++;
          tempFunction();
        } else {
          resultFunction([]);
        }
      } else {
        resultFunction(results);
      }
    });
  };
  tempFunction();
};

/**
 * the function to insert 1 row in a table
 * @param  {String} table           the table to be inserted in
 * @param  {Object} insertionObject has the original form of data: {col1: "val1", col2: "val2"}
 */
insertor = function (table ,insertionObject) {
  var
  keys = __.keys(insertionObject),
  values = __.values(insertionObject);
  connection.query(
    'INSERT INTO '+table+ '('+keys.join()+') VALUES ('+values.join()+')',
    function(err){errorThrower(err);}
  );
};
/**
 * the function to update 1 row in a table or update some rows by one set of data
 * @param  {String} table        the table to be updated
 * @param  {String} IDs          IDs separated by ,
 * @param  {Object} dataObj      the object containing the data in normal structure
 */
updator = function (table, IDs, dataObj) {
  var
  conjunction = ' = ',
  keys = __.keys(dataObj),
  values = __.values(dataObj),
  updateString = '';
  if (IDs.length > 1) {
    conjunction = ' IN ';
  } else {
    conjunction = ' = ';
  }
  for (var i=0; i<keys.length; i++) {
    updateString += keys[i] + ' = ' + values[i];
    if (keys[i+1]) {
      updateString += ',';
    }
  }
  connection.query(
    'UPDATE '+table+ 'SET '+updateString+ 'WHERE `ID`'+conjunction+'('+IDs.join()+')',
    function(err) {errorThrower(err);}
  );
};

/**
 * the function to delete records in a table
 * @param  {String} table name of the table
 * @param  {String} IDs   IDs separated by ,
 */
deletor = function (table, IDs) {
  var
  conjunction = ' = ';
  if (IDs.length > 1) {
    conjunction = ' IN ';
  } else {
    conjunction = ' = ';
  }
  connection.query(
    'DELETE FROM '+table+'WHERE `ID`'+conjunction+IDs.join(),
    function(err) {errorThrower(err);}
  );
};

/**
 * the function to insert many rows into a table
 * @param  {String} table   the table to be inserted in
 * @param  {Object} dataObj has to prototypes columns (an array) and data (an array of arrays)
 */
insertBulk = function (table, dataObj) {
  var dataString = '';
  for (var i in dataObj.data) {
    dataString += '('+ dataObj.data[i].join()+'),';
  }
  dataString = dataString.slice(0,-1);
  connection.query(
    'INSERT INTO ' + table + ' ('+dataObj.columns.join() + ') VALUES ' + dataString,
    function(err) {errorThrower(err);}
  );
};

/**
 * the function to perform bulk update in a table
 * @param  {String} table   name of the table to be updated
 * @param  {Object} dataObj has two prototypes IDs (an array) and data (an array of objects with normal structur)
 */
updateBulk = function (table, dataObj) {
  for (var i in dataObj.IDs) {
    var dataString = '`',
    keys = __.keys(dataObj.data[i]);
    for (var j=0; j<keys.length; j++) {
      dataString += keys[j]+'` ='+dataObj.data[i][keys[j]];
      if (keys[j+1]) {
        dataString += ', ';
      }
    }
    connection.query(
      'UPDATE '+table+ 'SET '+dataString+ 'WHERE `ID`='+dataObj.IDs[i],
      function(err) {errorThrower(err);}
    );
  }
};

permissionParser = function (username, selectionArray, command) {
  var
  permissionArray = [];
  if (command == 'select' || command == 'delete' || command == 'update') {
    for (var i in selectionArray) {
      permissionArray.push({username: username, command: "select", content: selectionArray[i].table});
      for (var j in selectionArray[i].exportFields) {
        var fieldArray = selectionArray[i].exportFields[j].split('.');
        if (fieldArray.length == 2 && fieldArray[0] != selectionArray[i].table) {
          permissionArray.push({username: username, command: "select", content: fieldArray[0]});
        }
      }
    }
    if (command != "select") {
      permissionArray.push({username: username, command: command, content: selectionArray[selectionArray.length-1].table});
    }
  } else {
    permissionArray.push({username: username, command: command, content: selectionArray});
  }
    
  return permissionArray;
};

showLinkPermission = function (username, content, resultFunction) {
  var
  selectionArray = [
    {
      table: "users",
      conditions: {
        Username: [username]
      },
      exportFields: ["ID"]
    },
    {
      table: "user_permissions",
      conditions: {},
      importedCondition: "UserId",
      exportFields: ["PermissionId"]
    },
    {
      table: "permission_permissionnames",
      importedCondition: "PermissionNameId",
      exportFields: ["PermissionId"]
    },
    {
      table: "permissions",
      importedCondition: "ID",
      conditions: {
        Content: ['show'],
        Command: [command]
      },
      exportFields: ["Information"]
    }
  ];
  selector(selectionArray, resultFunction);
};

/**
 * the incoming function from request handler to perform an action an db
 * @param  {String} username        the requesting user
 * @param  {Array} selectionArray for inserting, bulk inserting and bulk updating, only contains the table name, for other commands contains the selection informaion
 * @param  {String} command         the action to perfor
 * @param  {Object} data            the data for inserting of updateStri
 * @param  {Function} resultFunction  the function to be done on results of selection (only in select queries)
 */
dbRequest = function (username, selectionArray, command, data, resultFunction) {
  var
  totalPermission = true,
  permissionArray = permissionParser(username, selectionArray, command);
  dbStart();
  for (var i in permissionArray) {
    dbCheckPermission(permissionArray[i].username, permissionArray[i].command, permissionArray[i].content, function(finalPermission){
      totalPermission = totalPermission && finalPermission;
    });
  }
  if (totalPermission) {
    if (typeof(selectionArray) == 'object') {
      selector(selectionArray, function(results){
        var IDArray = [];
        for (var i in results) {
          IDArray.push(results['ID']);
        }
        switch (command) {
          case "select":
            resultFunction(results);
          break;
          case "update":
            updator(selectionArray[selectionArray.length-1].table, IDArray, data);
          break;
          case "delete":
            deletor(selectionArray[selectionArray.length-1].table, IDArray);
          break;
        }
      });
    } else {
      switch (command) {
        case "insert":
          insertor(selectionArray, data);
          resultFunction(true);
        break;
        case "insertBulk":
          insertBulk(selectionArray, data);
          resultFunction(true);
        break;
        case "updateBulk":
          updateBulk(selectionArray, data);
        break;
      }
    }
  }
};

exports.dbCheckPermission = dbCheckPermission;
exports.dbRequest = dbRequest;
exports.showLink = showLinkPermission;