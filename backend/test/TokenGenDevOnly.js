const jwt = require('jsonwebtoken')
const fs = require('fs')

settings = JSON.parse(fs.readFileSync("../Settings.json", 'utf8'))
privJWTKey = fs.readFileSync("../"+settings.JWT.private, 'utf8')
pubJWTKey = fs.readFileSync("../"+settings.JWT.public, 'utf8')

token = jwt.sign({"email": "parkingdev@bentonvillek12.org"}, privJWTKey, { algorithm: settings.JWT.algo});

console.log(token)
