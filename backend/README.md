# backend

Backend server for parkingLotAppIgnite

HTTP based api connected to postgres DB server using express and nodejs.

Overall API url: localhost:3000/api/v1/{route}

Post requests are expecting form-data formatting.

# Access Levels.

0: Student

1: Teacher

2: Admin

3: Developer

# Possible Parameters
| Parameter | Information | regex |
| --------- | ----------- | ----- |
| stoken | Session Token. 64 char  | [a-zA-Z0-9]{64} |
| sid | spot id | [0-9]* |
| email | only bentonvillek12.org | [a-z]*@bentonvillek12.org |
| license_plate | | [A-Z0-9]{3} |
| access | | [0-3]{1} |
| note | for reports | WIP |
| rid | report id | [0-9]* |
| gtoken | Google Auth Token (only used to get session token) | WIP |

# GET Routes

### /getLot

Required Access: 0

##### Parameters

token: session token

##### Response.

JSON object with users and spots arrays with spot and user data.

Example:

URL: http://localhost:3000/api/v1/getLot?token={token}
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
