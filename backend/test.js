const axios = require('axios')

APIURL = "http://localhost:3000/api/v1/";
JWT = 'jeyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvbmVzY2FsQGJlbnRvbnZpbGxlazEyLm9yZyIsImlhdCI6MTYzNDA1OTYyM30.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALz_BYwoUM-KaVwFE20EUMR2543UR44Ur2qMJlffmu_zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFeKJc-HggEayFsyRvnOQ0PMc6gf50SE7iYm0_JdwpA-';

(async () => {
  //res = await get("getSessionTokenInsecureDev", {"email":"jonescal@bentonvillek12.org"})
  //console.log(res.data)
  //token = res.data.token
  res = await get("getLot", {})
  console.log(res.data.spots[0])
  if (res.data.spots[0].inuse) {
    res = await post("releaseSpot", {"sid": "1"})
    //console.log(res.data)
  } else {
    res = await post("takeSpot", {"sid": "1"})
    //console.log(res.data)
  }
  console.log("switching spot.")
  //res = await get("getAllUsers", {})
  //console.log(res.data)
  res = await get("getLot", {})
  console.log(res.data.spots[0])
  //res = await get("getUser", {"email": "jonescal@bentonvillek12.org"})
  //console.log(res.data)
  //res = await get("getUsers", {"emails": JSON.stringify(["jonescal@bentonvillek12.org", "abc@bentonvillek12.org"])})
  //console.log(res.data)
})();

async function get(route, params) {
  return await axios.get(APIURL+route, {params: params, headers: {authorization: "Bearer "+JWT}})
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
  const response = await axios.post(APIURL+route, URLParams, {headers: {authorization: "Bearer "+JWT}})
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  return response;
}
