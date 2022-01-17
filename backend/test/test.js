const axios = require('axios')
const fs = require('fs')
const { Pool } = require('pg')
const jwt = require('jsonwebtoken')

settings = JSON.parse(fs.readFileSync("../Settings.json"))
privJWTKey = fs.readFileSync("../"+settings.JWT.private, 'utf8')
JWTs = {"3": jwt.sign({"email": "parkingdev@bentonvillek12.org"}, privJWTKey, { algorithm: settings.JWT.algo})};
APIURL = settings.TestAPIUrl;

const pool = new Pool(settings.DBCreds)

// Format: [HTTPMethod, URL, [PossibleParameters], [DefaultValuesForParameters], [InvalidFailures]]
// Invalid failures is for cases in which you have a autoGen test that is failing, but in reality there is nothing wrong. So far I have two examples of this:
// POST createReport 3: This generates a note of null for createReport, but the backend takes the null as a string and because note allows anything it accepts the report. This is slightly questionable because it shouldn't be treating the null as a string, but i think this has to do with how the null is getting converted during HTTP requests.
// POST createReport 8: This leaves out the license_plate parameter, which is a 2nd valid parameter set.
routes = [["GET", "getLot", ["JWT"], ["0"], []], // this should probably be in Settings.json
          ["POST", "takeSpot", ["sid", "JWT"], [4, "0"], []],
          ["POST", "releaseSpot", ["sid", "JWT"], [4, "0"], []],
          ["GET", "getAllUsers", ["JWT"], ["3"], []],
          ["POST", "setLicensePlate", ["JWT", "license_plate"], ["3", "ABC123"], []],
          ["GET", "getUser", ["JWT"], ["3"], []],
          ["GET", "getUserByPlate", ["JWT", "license_plate"], ["3", "TEST000"], []],
          ["GET", "getUsers", ["JWT", "emails"], ["3", "[\"parkingdev@bentonvillek12.org\", \"parkingtestone@bentonvillek12.org\"]"], []],
          ["POST", "assignSpot", ["JWT", "sid", "email"], ["3", 0, "parkingdev@bentonvillek12.org"], []],
          ["POST", "createBlankUser", ["JWT", "email", "access"], ["3", "parkingtestthree@bentonvillek12.org", 3], []],
          ["POST", "createReport", ["JWT", "note", "license_plate", "sid"], ["3", "Unknown License Plate", "ABC123", 1], [3,8]],
        ["POST", "createReport", ["JWT", "note", "sid"], ["3", "Unknown License Plate", 1], [3]],
          ["POST", "deleteReport", ["JWT", "rid"], ["3", "1"], []],
          ["GET", "getReports", ["JWT"], ["3"], []],
          ["POST", "revokeToken", ["JWT"], ["3"], []],
          ["POST", "setAccess", ["JWT", "email", "access"], ["3", "parkingtestzero@bentonvillek12.org", 1], []],
          ["POST", "deleteAccount", ["JWT"], ["1"], []],
          ["POST", "unassignSpot", ["JWT"], ["3"], []],
          ["GET", "getSchedule", ["JWT"], ["3"], []],
          ["POST", "releaseSpotFuture", ["JWT"], ["3"], []],
          ["POST", "removeFutureReleasedSpot", ["JWT"], ["3"], []],
          ["POST", "assignRange", ["JWT"], ["3"], []],
          ["POST", "removeRange", ["JWT"], ["3"], []],
          ["GET", "getRanges", ["JWT"], ["3"], []],
          ["GET", "forceResetSpots", ["JWT"], ["3"], []]
          ];

          //["", "", ["JWT"], ["3"], []],

beforeEach(async () => {
  await get("resetDB", {}, JWTs["3"])
  await post("createSpot", {"number": "1", "section": "AM"}, JWTs["3"])
  await post("createSpot", {"number": "2", "section": "AM"}, JWTs["3"])
  await post("createSpot", {"number": "1", "section": "PM"}, JWTs["3"])
  await post("createSpot", {"number": "2", "section": "PM"}, JWTs["3"])
  test2 = await post("createArbitraryUser", {"email": "parkingtesttwo@bentonvillek12.org", "access": "2", "name": "TEST2 NOTAPERSON", "license_plate": "TEST222", "section": "AM"}, JWTs["3"])
  test1 = await post("createArbitraryUser", {"email": "parkingtestone@bentonvillek12.org", "access": "1", "name": "TEST1 NOTAPERSON", "license_plate": "TEST111", "section": "PM"}, JWTs["3"])
  test0 = await post("createArbitraryUser", {"email": "parkingtestzero@bentonvillek12.org", "access": "0", "name": "TEST0 NOTAPERSON", "license_plate": "TEST000", "section": "PM"}, JWTs["3"])
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
    console.log(res.data)
  spots = res.data.spots
  users = res.data.users
  expectedSpots = [
        {
          id: 1,
          number: '1',
          section: 'AM',
          owner_email: 'parkingdev@bentonvillek12.org',
          inuse: true,
          current_email: 'parkingdev@bentonvillek12.org'
        },
        {
          id: 2,
            number: '2',
            section: 'AM',
          owner_email: 'parkingtesttwo@bentonvillek12.org',
          inuse: true,
          current_email: 'parkingtesttwo@bentonvillek12.org'
        },
        {
          id: 3,
            number: '1',
            section: 'PM',
          owner_email: 'parkingtestone@bentonvillek12.org',
          inuse: true,
          current_email: 'parkingtestone@bentonvillek12.org'
        },
        {
          id: 4,
            number: '2',
            section: 'PM',
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
          license_plate: 'ABC123',
            section: 'AM'
        },
        {
          email: 'parkingtesttwo@bentonvillek12.org',
          name: 'TEST2 NOTAPERSON',
          access: 2,
          license_plate: 'TEST222',
            section: 'AM'
        },
        {
          email: 'parkingtestone@bentonvillek12.org',
          name: 'TEST1 NOTAPERSON',
          access: 1,
          license_plate: 'TEST111',
            section: 'PM'
        },
        {
          email: 'parkingtestzero@bentonvillek12.org',
          name: 'TEST0 NOTAPERSON',
          access: 0,
          license_plate: 'TEST000',
            section: 'PM'
        }
      ];
  users = res.data
    console.log(users)
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
        expect(spots[i].number).toBe("2")
        expect(spots[i].section).toBe("PM")
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
      expect(spots[i].number).toBe("1")
        expect(spots[i].section).toBe("PM")
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
      if (routes[i][4].indexOf(j) < 0) {
          autoTest({"data": datas[j], "route": routes[i], "JWT": JWT, count: j})
      }
  }
}

function autoTest(temp) {
  test("autoGen "+temp.route[0]+" "+temp.route[1]+" "+j, async () => {
    if (temp.route[0] == "GET") {
      err = await get(temp.route[1], temp.data, temp.JWT)
    } else if (temp.route[0] == "POST") {
      err = await post(temp.route[1], temp.data, temp.JWT)
    } else {
      expect(temp.route[0]).toBe("invalid HTTP")
    }
    console.log(temp)
    console.log(err)
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

function delay(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}