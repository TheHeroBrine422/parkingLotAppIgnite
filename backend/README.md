# backend

Backend server for parkingLotAppIgnite

HTTP based api connected to postgres DB server using express and nodejs.

Overall API url: localhost:3000/api/v1/{route}

Post requests are expecting form-data formatting.

# Todo list (roughly prioritized)

1. TEST EVERYTHING. SOMETHINGS HAVE BEEN TESTED BUT I HAVENT KEPT TRACK AND IDK WHAT ACTUALLY WORKS.
2. google stuff (likely need Mr. Russel so we have access)
3. convert all responses to json
4. session expiration
5. multiple session tokens
7. make testing software
8. add extra checks for db errors.
9. maybe remove console.logs - probably need some kind of logging.
10. deleteAccount - delete reports.
11. fullcontrol account creation with access 2+ route. for dev testing purposes.
12. auto reclaim at night for owner spots.

# Possible Parameters
| Parameter | Information | regex |
| --------- | ----------- | ----- |
| stoken | Session Token. 64 char  | [a-zA-Z0-9]{64} |
| sid | spot id | [0-9]* |
| email | only bentonvillek12.org | [a-z]*@bentonvillek12.org |
| emails | array of emails | [a-z@\[\]\",]* |
| license_plate | | [A-Z0-9]{3} |
| access | <details><summary>Levels</summary><p>0: Student</p><p>1: Teacher</p><p>2: Admin</p><p>3: Developer</p></details> | [0-3]{1} |
| note | for reports | WIP Curerntly: [^]* (match all) |
| rid | report id | [0-9]* |
| gtoken | Google Auth Token (only used to get session token) | WIP Curerntly: [^]* (match all) |

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
