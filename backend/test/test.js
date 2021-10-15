const axios = require('axios')
const fs = require('fs')
const { Pool } = require('pg')


APIURL = "http://localhost:3000/api/v1/";
settings = JSON.parse(fs.readFileSync("../Settings.json"))
JWTs = {"3": settings.DevTestJWT};

const pool = new Pool(settings.DBCreds)

beforeEach(async () => {
  await get("resetDB", {}, JWTs["3"])
  await post("createSpot", {"name": "1 AM"}, JWTs["3"])
  await post("createSpot", {"name": "2 AM"}, JWTs["3"])
  await post("createSpot", {"name": "1 PM"}, JWTs["3"])
  await post("createSpot", {"name": "2 PM"}, JWTs["3"])
  test2 = await post("createArbitraryUser", {"email": "parkingtesttwo@bentonvillek12.org", "access": "2", "name": "TEST2 NOTAPERSON", "license_plate": "TEST222"}, JWTs["3"])
  test1 = await post("createArbitraryUser", {"email": "parkingtestone@bentonvillek12.org", "access": "1", "name": "TEST1 NOTAPERSON", "license_plate": "TEST111"}, JWTs["3"])
  test0 = await post("createArbitraryUser", {"email": "parkingtestzero@bentonvillek12.org", "access": "0", "name": "TEST0 NOTAPERSON", "license_plate": "TEST000"}, JWTs["3"])
  JWTs["2"] = test2.data
  JWTs["1"] = test1.data
  JWTs["0"] = test0.data
  await post("assignRange", {"email": "parkingdev@bentonvillek12.org", "range": JSON.stringify([1,4])})
  //await post("assignSpot", {"email": "parkingdev@bentonvillek12.org", "sid": "0"}, JWTs["3"])
  //await post("assignSpot", {"email": "parkingtesttwo@bentonvillek12.org", "sid": "1"}, JWTs["3"])
  //await post("assignSpot", {"email": "parkingtestone@bentonvillek12.org", "sid": "2"}, JWTs["3"])
  //await post("assignSpot", {"email": "parkingtestzero@bentonvillek12.org", "sid": "3"}, JWTs["3"])


  /*
  assignSpots
  */
});

test('getLot', async () => {
  res = await get("getLot", {}, JWTs["3"])
  console.log(res.data)

  expect(res.data.spots[0].owner_email).toBe('');
});

/*
(async () => {
  //res = await get("getSessionTokenInsecureDev", {"email":"jonescal@bentonvillek12.org"})
  //console.log(res.data)
  //token = res.data.token
  res = await get("getLot", {}, JWTs["3"])
  console.log(res.data.spots[0])
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
  console.log(res.data.spots[0])
  //res = await get("getUser", {"email": "jonescal@bentonvillek12.org"})
  //console.log(res.data)
  //res = await get("getUsers", {"emails": JSON.stringify(["jonescal@bentonvillek12.org", "abc@bentonvillek12.org"])})
  //console.log(res.data)
})();
*/

async function get(route, params, JWT) {
  return await axios.get(APIURL+route, {params: params, headers: {authorization: "Bearer "+JWT}})
  .catch(function (error) {
    // handle error
    console.log(error);
  })
}

async function post(route, params, JWT) {
  const URLParams = new URLSearchParams();
  for (var i = 0; i < Object.keys(params).length; i++) {
    key = Object.keys(params)[i]
    URLParams.append(key, params[key])
  }
  const response = await axios.post(APIURL+route, URLParams, {headers: {authorization: "Bearer "+JWT}})
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  return response;
}
