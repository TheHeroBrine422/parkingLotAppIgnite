const axios = require('axios')

APIURL = "http://localhost:3000/api/v1/";

(async () => {
  token = await get("getSessionTokenInsecureDev", {"email":"jonescal@bentonvillek12.org"})
  console.log(token)
})();

async function get(route, params) {
  return await axios.get(APIURL+route, {params: params})
  .then(function (response) {
    // handle success
    return response;
  })
}
