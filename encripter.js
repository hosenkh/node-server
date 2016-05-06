var crypto = require('crypto'),
algorithm = 'aes-256-ctr',
password = 'd6F&UFvR&yGFDer46%YHTYuikP3Efeq',

encrypt = function(text){
  var cipher = crypto.createCipher(algorithm,password);
  var crypted = cipher.update(text+'FJFgdcgd%$^terdft54etr34534','utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
},

decrypt = function(text){
  var decipher = crypto.createDecipher(algorithm,password);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  dec = dec.slice(0,-27);
  return dec;
};


exports['encrypt'] = encrypt;
exports['decrypt'] = decrypt;
