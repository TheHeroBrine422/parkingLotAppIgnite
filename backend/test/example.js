const axios = require('axios')
const fs = require('fs')
const { Pool } = require('pg')
const jwt = require('jsonwebtoken')

settings = JSON.parse(fs.readFileSync("../Settings.json"))
privJWTKey = fs.readFileSync("../"+settings.JWT.private, 'utf8')
JWTs = {"3": jwt.sign({"email": "parkingdev@bentonvillek12.org"}, privJWTKey, { algorithm: settings.JWT.algo})};
APIURL = settings.TestAPIUrl;

(async () => {
  /*res = await post("createSpot", {"name": "1 AM"}, JWTs["3"])
  console.log(res.data)
  res = await post("createSpot", {"name": "2 AM"}, JWTs["3"])
  console.log(res.data)
  res = await post("createSpot", {"name": "1 PM"}, JWTs["3"])
  console.log(res.data)
  res = await post("createSpot", {"name": "2 PM"}, JWTs["3"])
  console.log(res.data)*/
  res = await  post("createSpot", {"number": "1", "section": "AM"}, JWTs["3"])
  console.log(res)
  /*res = await post("assignSpot", {"email": "parkingdev@bentonvillek12.org", "sid": "1"}, JWTs["3"])
  console.log(res.data)
  res = await post("assignSpot", {"email": "jonescal@bentonvillek12.org", "sid": "2"}, JWTs["3"])
  console.log(res.data)*/
  /*//res = await get("getSessionTokenInsecureDev", {"email":"jonescal@bentonvillek12.org"})
  //console.log(res.data)
  //token = res.data.token
  res = await get("getLot", {}, JWTs["3"])
  console.log(res.data)
  if (res.data.spots[0].inuse) {
    res = await post("releaseSpot", {"sid": "1"}, JWTs["3"])
    //console.log(res.data)
  } else {
    res = await post("takeSpot", {"sid": "1"}, JWTs["3"])
    //console.log(res.data)
  }
  console.log("switching spot.")
  //res = await get("getAllUsers", {})
  //console.log(res.data)
  res = await get("getLot", {}, JWTs["3"])
  console.log(res.data)
  res = await get("getAllUsers", {}, JWTs["3"])
  console.log("\n\n\n\nUsers:\n"+res.data)
  //res = await get("getUser", {"email": "jonescal@bentonvillek12.org"})
  //console.log(res.data)
  //res = await get("getUsers", {"emails": JSON.stringify(["jonescal@bentonvillek12.org", "abc@bentonvillek12.org"])})
  //console.log(res.data)*/
})();

async function get(route, params, JWT) {
  return await axios.get(APIURL+route, {params: params, headers: {authorization: "Bearer "+JWT}})
  .catch(function (error) {
    return error
  })
}

async function post(route, params, JWT) {
  const URLParams = new URLSearchParams();
  for (var i = 0; i < Object.keys(params).length; i++) {
    key = Object.keys(params)[i]
    URLParams.append(key, params[key])
  }
  return await axios.post(APIURL+route, URLParams, {headers: {authorization: "Bearer "+JWT}})
  .catch(function (error) {
    return error
  })
}
