# backend

Backend server for parkingLotAppIgnite

HTTP based api connected to postgres DB server using express and nodejs.

Overall API url: {url}:3000/api/v1/{route}

Post requests are expecting form-data formatting.

Authentication is done through the Authentication header, which expects `Bearer {JWT}`

# Install:

1. Install Postgres
2. Run `npm i`
3. Generate JWT signing keys. (openssl)
4. Configure Settings.json (make a copy of SettingsEx.json and rename it)
5. Run `node main.js`

# Todo list (not prioritized)

1. TEST EVERYTHING AND WRITE DOCUMENTATION. SOMETHINGS HAVE BEEN TESTED BUT I HAVENT KEPT TRACK AND IDK WHAT ACTUALLY WORKS. Also write testing using jest in test/test.js
2. add extra checks for db errors. Add SELECT after modification statement to check that changes worked.
3. check for race conditions
4. Make Settings.DBcreds work. For some reason on my linux machine it is having issues.
5. add checks that tables exist and create them if needed in app.listen(). Could also do this with JWT keys maybe.
6. create New Routes
  * add/remove spot for 2+
  * getRanges
  * fix revokeSessionToken for JWTs
  * createArbitraryUser for 3 dev only for testing

# release Checklist:

1. make sure to regen keys due to token leaks.

### Other Potential Ideas

1. deleteAccount Should it delete reports? unsure if this is a good idea due to reports still being valid, user just no longer existing. maybe allow user to decide if they get deleted.
2. remove console.logs - probably need to replace with some kind of proper logging. Probably need to find a library for that. (winston)
3. allow for editing of reports. Probably need a history for this.
4. mass unassignSpots. Technically not needed but sending 100 http requests at once probably isnt the best idea. Although it probably won't cause a issue either.
5. carpool?
6. remove db errors in err() cause too much info (SQL query). when i setup better logging, put it there so it will only be accessible to the devloper. Might want to add a route for devs to access logs
7. probably should implement csrf protection
8. make checkParams and verifyToken express middleware rather then just functions ran on each route. I really want to do this for learning reasons, but it will require a refactor and isn't really that important.

# Route To-Do List:

? means in progress.

| Route | Implemented | Tested | Documented | Added to AutoTest (test/test.js) |
| ----- | ----- | ----- | ----- | ----- |
| GET getLot | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: |
| GET getAllUsers | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: |
| POST takeSpot | :heavy_check_mark: | :x: | :x: | :x:
| POST setLicensePlate | :heavy_check_mark: | :x: | :x: | :x:
| POST releaseSpot | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: |
| GET getUser | :heavy_check_mark: | :x: | :x: | :x: |
| GET getUserByPlate | :heavy_check_mark: | :x: | :x: | :x:
| GET getUsers | :heavy_check_mark: | | :x: | :x:
| POST assignSpot | :heavy_check_mark: | :x: | :x: | :x:
| POST createBlankUser | :heavy_check_mark: | :x: | :x: | :x:
| POST createReport | :heavy_check_mark: | :x: | :x: | :x:
| POST deleteReport | :heavy_check_mark: | :x: | :x: | :x:
| GET getReports | :heavy_check_mark: | :x: | :x: | :x:
| POST getSessionTokenGoogle | :heavy_check_mark: | :x: | :x: | :x:
| POST createArbitraryUser | :x: | :x: | :x: | :x:
| POST revokeSessionToken | :x: | :x: | :x: | :x:
| POST setAccess | :heavy_check_mark: | :x: | :x: | :x:
| POST deleteAccount | :heavy_check_mark: | :x: | :x: | :x:
| POST unassignSpot | :heavy_check_mark: | :x: | :x: | :x:
| POST createSpot | :x: | :x: | :x: | :x:
| POST deleteSpot | :x: | :x: | :x: | :x:
| GET getSchedule | :heavy_check_mark: | :x: | :x: | :x:
| POST releaseSpotFuture | :heavy_check_mark: | :x: | :x: | :x:
| POST removeFutureReleasedSpot | :heavy_check_mark: | :x: | :x: | :x:
| POST assignRange | :heavy_check_mark: | :x: | :x: | :x:
| POST removeRange | :heavy_check_mark: | :x: | :x: | :x:
| GET getRanges | :x: | :x: | :x: | :x:
| GET forceResetSpots | :heavy_check_mark: | :x: | :x: | :x:




# JWT User Object

```json
{
  "email":"abc@bentonvillek12.org",
}
```

Only thing it needs is email. If you want more data use GET getUser

JWT probably isnt needed but im gonna use it anyway.

# Key gen:
openssl ecparam -name prime256v1 -genkey -noout -out ec512-private.pem

openssl ec -in ec512-private.pem -pubout -out ec512-public.pem

Algo: ES512

# Possible Parameters OUT OF DATE
| Parameter | Information | regex |
| --------- | ----------- | ----- |
| stoken | Session Token. 64 char  | [a-zA-Z0-9]{64} |
| sid | spot id | [0-9]* |
| email | only bentonvillek12.org | [a-z]*@bentonvillek12.org |
| emails | array of emails. Also checks each individual email with the email paramter regex. | [a-z@0-9.\[\]\",]* |
| license_plate | | [A-Z0-9]{1,7} |
| access | <details><summary>Levels</summary><p>0: Student</p><p>1: Teacher</p><p>2: Admin</p><p>3: Developer</p></details> | [0-3]{1} |
| note | for reports | WIP Curerntly: [^]* (match all) |
| rid | report id | [0-9]* |
| gtoken | Google Auth Token (only used to get session token) | WIP Curerntly: [^]* (match all) |

# Error Codes

WIP. Check main.js

# GET Routes

### /getLot

Required Access: 0

#### Parameters

stoken

#### Response.

JSON object with users and spots arrays with spot and user data.

Example:

URL: http://localhost:3000/api/v1/getLot?stoken={token}
```
{
  "spots": [
    {
      "id": 1,
      "num": 1,
      "section": "AM",
      "owner_email": "abc@bentonvillek12.org",
      "inuse": true,
      "current_email": "abc@bentonvillek12.org"
    }
  ],
  "users": [
    {
      "email": "abc@bentonvillek12.org",
      "name": "ABC Jones",
      "license_plate": "124ABC"
    }
  ]
}
```

### /getAllUsers

Required Access: 3

#### Parameters

stoken

#### Response.

JSON object with all users.

Example:

URL: http://localhost:3000/api/v1/getAllUsers?stoken={token}
```
```

### /getUser

Required Access: 0

#### Parameters

stoken, email

#### Response.

JSON object with a user.

Example:

URL: http://localhost:3000/api/v1/getUser?stoken={token}&email={email}
```
```

### /getUsers

Required Access: 0

#### Parameters

stoken, emails

#### Response.

JSON object with several users.

Example:

URL: http://localhost:3000/api/v1/getUsers?stoken={token}&emails={emails}
```
```

### /getReports

Required Access: 0

#### Parameters

stoken

#### Response.

JSON object with all reports

Example:

URL: http://localhost:3000/api/v1/getReports?stoken={token}
```
```

### /getSessionTokenGoogle

WIP

### /getSessionTokenInsecureDev

remove this in prod. If real app would have a thing that checks if its running on prod or dev and auto disable in prod.

Required Access: 0

#### Parameters

email

#### Response.

JSON object with stoken.

Example:

URL: http://localhost:3000/api/v1/getSessionTokenInsecureDev?email={email}
```
```

# POST Routes

### /takeSpot

remove this in prod. If real app would have a thing that checks if its running on prod or dev and auto disable in prod.

Required Access: 0

#### Parameters

stoken, sid

#### Response.

"sucess" or err message.
Example:

URL: http://localhost:3000/api/v1/takeSpot
stoken={stoken}
id=1
```
```
