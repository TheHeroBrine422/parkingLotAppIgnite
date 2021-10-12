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

1. TEST EVERYTHING AND WRITE DOCUMENTATION. SOMETHINGS HAVE BEEN TESTED BUT I HAVENT KEPT TRACK AND IDK WHAT ACTUALLY WORKS.
2. create library to access routes for testing software and frontend.
3. make testing software using library
4. add extra checks for db errors. Add SELECT after modification statement to check that changes worked.
5. update POST revokeSessionToken since it will now need a blacklist of hashed tokens, and add checks of revoked tokens in verifyToken
6. check for race conditions
7. Add/remove spot route for level 2+
8. regen keys for prod to revoke tokens accidently put in public repo. Not a big deal till being ran publically.
9. Make Settings.DBcreds work. For some reason on my linux machine it is having issues.

### Other Potential Ideas

1. deleteAccount Should it delete reports? unsure if this is a good idea due to reports still being valid, user just no longer existing. maybe allow user to decide if they get deleted.
2. remove console.logs - probably need to replace with some kind of proper logging. Probably need to find a library for that. (winston)
3. allow for editing of reports. Probably need a history for this.
4. mass unassignSpots. Technically not needed but sending 100 http requests at once probably isnt the best idea. Although it probably won't cause a issue either.
5. carpool?
6. remove db errors in err() cause too much info (SQL query). when i setup better logging, put it there so it will only be accessible to the devloper. Might want to add a route for devs to access logs
7. probably should implement csrf protection
8. make checkParams and verifyToken express middleware rather then just functions ran on each route. I really want to do this for learning reasons, but it will require a refactor and isn't really that important.

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

# Test List:

* [x] GET getLot
* [x] GET getAllUsers
* [x] POST takeSpot
* [ ] POST setLicensePlate
* [x] POST releaseSpot
* [x] GET getUser
* [ ] GET getUserByPlate
* [x] GET getUsers
* [ ] POST assignSpot
* [ ] POST createBlankUser
* [ ] POST createUserAdmin (DEV)
* [ ] POST createReport
* [ ] POST deleteReport
* [ ] GET getReports
* [ ] GET getSessionTokenGoogle
* [ ] GET getSessionTokenInsecureDev (DEV)
* [ ] POST revokeSessionToken
* [ ] POST setAccess
* [ ] POST deleteAccount
* [ ] POST unassignSpot

# Documentation List:

* [x] GET getLot
* [ ] GET getAllUsers
* [ ] POST takeSpot
* [ ] POST setLicensePlate
* [ ] POST releaseSpot
* [ ] GET getUser
* [ ] GET getUserByPlate
* [ ] GET getUsers
* [ ] POST assignSpot
* [ ] POST createBlankUser
* [ ] POST createUserAdmin (DEV)
* [ ] POST createReport
* [ ] POST deleteReport
* [ ] GET getReports
* [ ] GET getSessionTokenGoogle
* [ ] GET getSessionTokenInsecureDev (DEV)
* [ ] POST revokeSessionToken
* [ ] POST setAccess
* [ ] POST deleteAccount
* [ ] POST unassignSpot

# Possible Parameters
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
