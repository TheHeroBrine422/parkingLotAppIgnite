const axios = require('axios')
const fs = require('fs')
const { Pool } = require('pg')
const jwt = require('jsonwebtoken')

settings = JSON.parse(fs.readFileSync("../Settings.json"))
privJWTKey = fs.readFileSync("../"+settings.JWT.private, 'utf8')
JWTs = {"3": jwt.sign({"email": "parkingdev@bentonvillek12.org"}, privJWTKey, { algorithm: settings.JWT.algo})};
APIURL = settings.TestAPIUrl;

const pool = new Pool(settings.DBCreds)

// Format: [HTTPMethod, URL, [PossibleParameters], [DefaultValuesForParameters]]
routes = [["GET", "getLot", ["JWT"], ["0"]], // this should probably be in Settings.json
          ["POST", "takeSpot", ["sid", "JWT"], [4, "0"]],
          ["POST", "releaseSpot", ["sid", "JWT"], [4, "0"]],
          ["GET", "getAllUsers", ["JWT"], ["3"]]];

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


test('getAllUsers - success - access lvl 2', async () => {
  res = await get("getAllUsers", {}, JWTs["2"])
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
    expect(users.findIndex(a => objEqual(a, expectedUsers[i]))).toBeGreaterThanOrEqual(0) // dont love this due to how output works, but easier to write so idk.
  }
});

test('getAllUsers - fail - access lvl 1', async () => {
    err = await get("getAllUsers", {}, JWTs["1"])
    expect(err.response).not.toBeUndefined()
    expect(err.response.data).not.toBeUndefined()
    expect(err.response.data.err).toBe(102)
    expect(err.response.data.msg).toBe("Invalid authorization.")
});

test('releaseSpot - success - student', async () => {
  res = await post("releaseSpot", {"sid":4}, JWTs["0"])
  expect(res.data).not.toBeUndefined()
  expect(res.data.msg).toBe("success")
  res = await get("getLot", {}, JWTs["0"])
  spots = res.data.spots
  found = false;
  for (var i = 0; i < spots.length; i++) {
    if (spots[i].owner_email == "parkingtestzero@bentonvillek12.org") {
      found = true;
      expect(spots[i].name).toBe("2 PM")
      expect(spots[i].inuse).toBe(false)
      expect(spots[i].current_email).toBe("")
      break;
    }
  }
  expect(found).toBe(true)
})

test('takeSpot - success - student', async () => {
  releaseOne = await post("releaseSpot", {"sid":3}, JWTs["1"])
  expect(releaseOne.data).not.toBeUndefined()
  expect(releaseOne.data.msg).toBe("success")
  deleteZero = await post("deleteSpot", {"sid":4}, JWTs["3"])
  expect(deleteZero.data).not.toBeUndefined()
  expect(deleteZero.data.msg).toBe("success")
  take = await post("takeSpot", {"sid":3}, JWTs["0"])
  expect(take.data).not.toBeUndefined()
  expect(take.data.msg).toBe("success")
  res = await get("getLot", {}, JWTs["0"])
  spots = res.data.spots
  found = false;
  for (var i = 0; i < spots.length; i++) {
    if (spots[i].id == 3) {
      found = true;
      expect(spots[i].name).toBe("1 PM")
      expect(spots[i].inuse).toBe(true)
      expect(spots[i].current_email).toBe("parkingtestzero@bentonvillek12.org")
      expect(spots[i].owner_email).toBe("parkingtestone@bentonvillek12.org")
      break;
    }
  }
  expect(found).toBe(true)
})

// TODO: this only modifys one paramter at a time. it should probably modify them all at the same time and generate all possible combinations of the original paramters and the invalid paramters other then the actual real paramter combination
for (var i = 0; i < routes.length; i++) { // autoGen failure routes. This has complex and weird array manipulation so im gonna write lots of comments over it for future reading.
  datas = []
  for (var j = 0; j < routes[i][2].length; j++) { // loop over possible paramters to select which one to be modified
    [null, "", "remove"].forEach((item) => { // loop over what the removed parameter will be set to.
      temp = {}
      for (var k = 0; k < routes[i][2].length; k++) { // loop over the overall paramters and create the object with the modified paramter.
        if (routes[i][2][k] != routes[i][2][j]) { // if not selected paramter, just set it to default
          temp[routes[i][2][k]] = routes[i][3][k]
        } else {
          if (item != "remove") { // if selected parameter, set to modified value or completely remove.
            temp[routes[i][2][k]] = item
          }
        }
      }
      datas.push(temp)
    });
  }
  for (var j = 0; j < datas.length; j++) {
    if (Object.keys(JWTs).indexOf(datas[j].JWT) > -1) { // find out if the JWT is a ID or the actual JWT to be used and then set it.
      JWT = JWTs[datas[j].JWT]
    } else {
      JWT = datas[j].JWT
    }
    delete datas[j].JWT
    autoTest({"data": datas[j], "route": routes[i], "JWT": JWT})
  }
}

function autoTest(temp) {
  test(temp.route[0]+" "+temp.route[1]+" autoGen", async () => {
    if (temp.route[0] == "GET") {
      err = await get(temp.route[1], temp.data, temp.JWT)
    } else if (temp.route[0] == "POST") {
      err = await post(temp.route[1], temp.data, temp.JWT)
    } else {
      expect(temp.route[0]).toBe("invalid HTTP")
    }
    expect(err.response).not.toBeUndefined()
    expect(err.response.data).not.toBeUndefined()
    expect(err.response.data.err).not.toBeUndefined()
  });
}

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
