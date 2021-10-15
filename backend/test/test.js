const axios = require('axios')
const fs = require('fs')
const { Pool } = require('pg')

settings = JSON.parse(fs.readFileSync("../Settings.json"))
JWTs = {"3": settings.DevTestJWT};
APIURL = settings.TestAPIUrl;

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
  await post("assignRange", {"email": "parkingdev@bentonvillek12.org", "range": JSON.stringify([1,4])}, JWTs["3"])
  await post("assignSpot", {"email": "parkingdev@bentonvillek12.org", "sid": "1"}, JWTs["3"])
  await post("assignSpot", {"email": "parkingtesttwo@bentonvillek12.org", "sid": "2"}, JWTs["3"])
  await post("assignSpot", {"email": "parkingtestone@bentonvillek12.org", "sid": "3"}, JWTs["3"])
  await post("assignSpot", {"email": "parkingtestzero@bentonvillek12.org", "sid": "4"}, JWTs["3"])
});

/*
test('', async () => {

});
*/

test('getLot', async () => {
  res = await get("getLot", {}, JWTs["3"])
  spots = res.data.spots
  users = res.data.users
  expectedSpots = [
        {
          id: 1,
          name: '1 AM',
          owner_email: 'parkingdev@bentonvillek12.org',
          inuse: true,
          current_email: 'parkingdev@bentonvillek12.org'
        },
        {
          id: 2,
          name: '2 AM',
          owner_email: 'parkingtesttwo@bentonvillek12.org',
          inuse: true,
          current_email: 'parkingtesttwo@bentonvillek12.org'
        },
        {
          id: 3,
          name: '1 PM',
          owner_email: 'parkingtestone@bentonvillek12.org',
          inuse: true,
          current_email: 'parkingtestone@bentonvillek12.org'
        },
        {
          id: 4,
          name: '2 PM',
          owner_email: 'parkingtestzero@bentonvillek12.org',
          inuse: true,
          current_email: 'parkingtestzero@bentonvillek12.org'
        }
      ];
  expectedUsers = [
        {
          email: 'parkingdev@bentonvillek12.org',
          name: 'DEVELOPER NOTAPERSON',
          license_plate: 'ABC123'
        },
        {
          email: 'parkingtesttwo@bentonvillek12.org',
          name: 'TEST2 NOTAPERSON',
          license_plate: 'TEST222'
        },
        {
          email: 'parkingtestone@bentonvillek12.org',
          name: 'TEST1 NOTAPERSON',
          license_plate: 'TEST111'
        },
        {
          email: 'parkingtestzero@bentonvillek12.org',
          name: 'TEST0 NOTAPERSON',
          license_plate: 'TEST000'
        }
      ];
  expect(spots.length).toBe(expectedSpots.length)
  expect(users.length).toBe(expectedUsers.length)
  for (var i = 0; i < expectedUsers.length; i++) {
    expect(users.findIndex(a => objEqual(a, expectedUsers[i]))).toBeGreaterThanOrEqual(0) // dont love this due to how output works, but easier to write so idk.
  }
  for (var i = 0; i < expectedSpots.length; i++) {
    expect(spots.findIndex(a => objEqual(a, expectedSpots[i]))).toBeGreaterThanOrEqual(0)
  }
});


test('getAllUsers - access Lvl 3', async () => {
  res = await get("getAllUsers", {}, JWTs["3"])
  console.log(res.data)
  expectedUsers = [
        {
          email: 'parkingdev@bentonvillek12.org',
          name: 'DEVELOPER NOTAPERSON',
          access: 3,
          license_plate: 'ABC123'
        },
        {
          email: 'parkingtesttwo@bentonvillek12.org',
          name: 'TEST2 NOTAPERSON',
          access: 2,
          license_plate: 'TEST222'
        },
        {
          email: 'parkingtestone@bentonvillek12.org',
          name: 'TEST1 NOTAPERSON',
          access: 1,
          license_plate: 'TEST111'
        },
        {
          email: 'parkingtestzero@bentonvillek12.org',
          name: 'TEST0 NOTAPERSON',
          access: 0,
          license_plate: 'TEST000'
        }
      ];
  users = res.data
  expect(res.data.length).toBe(expectedUsers.length)
  for (var i = 0; i < expectedUsers.length; i++) {
    console.log(expectedUsers[i])
    expect(users.findIndex(a => objEqual(a, expectedUsers[i]))).toBeGreaterThanOrEqual(0) // dont love this due to how output works, but easier to write so idk.
  }
});

test('getAllUsers - access Lvl 2', async () => {
    err = await get("getAllUsers", {}, JWTs["2"])
    expect(err.response).not.toBeUndefined()
    expect(err.response.data).not.toBeUndefined()
    expect(err.response.data.err).toBe(102)
    expect(err.response.data.msg).toBe("Invalid authorization.")
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
    // handle error
    return error
  })
}

function objEqual(a,b) { // maybe i should just use lodash for this.
  aKeys = Object.keys(a)
  bKeys = Object.keys(b)
  if (aKeys.length != bKeys.length) {
    return false;
  }
  for (var i = 0; i < aKeys.length; i++) {
    found = false
    for (var j = 0; j < bKeys.length; j++) {
      if (aKeys[i] == bKeys[j]) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  for (var i = 0; i < aKeys.length; i++) {
    if (a[aKeys[i]] !== b[aKeys[i]]) {
      return false;
    }
  }
  return true;
}
