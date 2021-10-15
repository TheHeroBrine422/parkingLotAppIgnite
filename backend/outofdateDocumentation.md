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

# GET Routes OUT OF DATE (Probably gonna change how I document this cause too many routes for one file.)

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

### /getTokenGoogle

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
