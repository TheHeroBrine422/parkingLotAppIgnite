const axios = require('axios')

APIURL = "http://localhost:3000/api/v1/";

(async () => {
  res = await get("getSessionTokenInsecureDev", {"email":"jonescal@bentonvillek12.org"})
  //console.log(res.data)
  token = res.data.token
  res = await get("getLot", {"stoken":token})
  console.log(res.data.spots[0])
  if (res.data.spots[0].inuse) {
    res = await post("releaseSpot", {"stoken":token, "sid": "1"})
    //console.log(res.data)
  } else {
    res = await post("takeSpot", {"stoken":token, "sid": "1"})
    //console.log(res.data)
  }
  console.log("switching spot.")
  //res = await get("getAllUsers", {"stoken":token})
  //console.log(res.data)
  res = await get("getLot", {"stoken":token})
  console.log(res.data.spots[0])
  //res = await get("getUser", {"stoken":token, "email": "jonescal@bentonvillek12.org"})
  //console.log(res.data)
  //res = await get("getUsers", {"emails": JSON.stringify(["jonescal@bentonvillek12.org", "abc@bentonvillek12.org"])})
  //console.log(res.data)
})();

async function get(route, params) {
  return await axios.get(APIURL+route, {params: params})
  .catch(function (error) {
    // handle error
    console.log(error);
  })
}

async function post(route, params) {
  const URLParams = new URLSearchParams();
  for (var i = 0; i < Object.keys(params).length; i++) {
    key = Object.keys(params)[i]
    URLParams.append(key, params[key])
  }
  const response = await axios.post(APIURL+route, URLParams)
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  return response;
}
