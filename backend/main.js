const { Pool } = require('pg')
const express = require('express')
const bodyParser = require('body-parser');
const {OAuth2Client} = require('google-auth-library');

port = 3000;
CLIENT_ID = "nonexistance"
sessionTokenLength = 64

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  user: 'jonescal',
  host: 'localhost',
  database: 'jonescal',
  password: 'secretpassword',
  port: 5432,
})

paramRegex = {"sid": /[0-9]*/,
              "stoken": /[a-zA-Z0-9]{64}/,
              "email": /[a-z]*@bentonvillek12.org/,
              "license_plate": /[A-Z0-9]{1,7}/,
              "access": /[0-3]{1}/,
              "note": /[^]*/,
              "rid": /[0-9]*/,
              "gtoken": /[^]*/,
              "emails": /[a-z@\[\]\",]*/}

errors = {100: "Invalid Number of parameters.",
          101: "Invalid Parameter.",
          102: "Invalid permissions.",
          104: "Spot in use.",
          105: "User already has a spot.",
          107: "DB Error",
          108: "Spot not in use.",
          }

function error(id, extra) {
  if (extra != null) {
    return JSON.stringify({"err": id, "msg": errors[id]+" "+extra})
  }
  return JSON.stringify({"err": id, "msg": errors[id]})
}

function checkParams(res, params, paramList) {
  if (Object.keys(params).length != paramList.length) {
    res.status(500).send(error(100))
    return false;
  }
  for (var i = 0; i < paramList.length; i++) {
    if (params[paramList[i]] == null || params[paramList[i]] == "" || params[paramList[i]].match(paramRegex[paramList[i]])[0] != params[paramList[i]]) {
      res.status(500).send(error(101,paramList[i]))
      return false;
    }
  }
  return true;
}

function verifyToken(res, access, token, callback) {
  if (token.length == sessionTokenLength) {
    pool.query('SELECT * FROM users WHERE session_token=$1', [token], (err, DBres) => {
      if (DBres.rows != null && DBres.rows[0] != null) {
        if (DBres.rows[0].access < access) {
          res.status(500).send(error(102))
          return;
        }
        callback(DBres.rows[0])
      } else {
        res.status(500).send(error(101, "stoken"))
        return;
      }
    });
  } else {
    res.status(500).send(error(101, "stoken"))
    return;
  }
}

function genSessionToken() {
  charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  token = ""
  for (var i = 0; i < sessionTokenLength; i++) {
    token += charSet.charAt(Math.floor(Math.random()*charSet.length))
  }
  return token;
}

app.get('/api/v1/getLot', (req, res) => { // Fields: [token] // TODO: send user data too.
  if (checkParams(res, req.query, ["stoken"])) {
    verifyToken(res, 0, req.query.stoken, (user) => {
      pool.query('SELECT * FROM spots', (err, DBres) => {
        endObj = {"spots":DBres.rows, "users":[]}
        query = "SELECT email, name, license_plate FROM users WHERE email=$1"
        for (var i = 0; i < DBres.rows.length; i++) {
          if (endObj.users.indexOf(DBres.rows[i].owner_email) < 0) {
            endObj.users.push(DBres.rows[i].owner_email)
          }
          if (endObj.users.indexOf(DBres.rows[i].current_email) < 0) {
            endObj.users.push(DBres.rows[i].current_email)
          }
        }
        for (var i = 1; i < endObj.users.length; i++) {
          query += " OR email=$"+(i+1)
        }
        pool.query(query, endObj.users, (err, DBres) => {
          endObj.users = DBres.rows;
          res.send(JSON.stringify(endObj))
        });
      });
    });
  }
});

// DEV ONLY.
app.get('/api/v1/getAllUsers', (req, res) => {
  if (checkParams(res, req.query, ["stoken"])) {
    verifyToken(res, 3, req.query.stoken, (user) => {
      pool.query('SELECT * FROM users', (err, DBres) => {
        console.log(err, DBres)
        res.send(JSON.stringify(DBres.rows[i]))
      });
    });
  }
});

app.post('/api/v1/takeSpot', (req, res) => {
  if (checkParams(res, req.body, ["stoken", "sid"])) {
    verifyToken(res, 0, req.body.stoken, (user) => {
      pool.query('SELECT * FROM spots', (err, DBres) => {
        console.log(err, DBres)
        found = false
        hasSpot = false
        for (var i = 0; i < DBres.rows.length; i++) {
          if (DBres.rows[i].sid == req.body.sid) {
            found = true
            if (DBres.rows[i].inuse) {
              res.status(500).send(error(104))
              return;
            }
          }
          if (DBres.rows[i].current_email == user.email || (DBres.rows[i].owner_email == user.email && !DBres.rows[i].inuse)) {
            res.status(500).send(error(105))
            return;
          }
        }
        if (!found) {
          res.status(500).send(error(101, "sid"))
          return;
        }
        pool.query('UPDATE spots SET inuse=true, current_email=$1 WHERE id=$2', [user.email, req.body.sid], (err, DBres) => {
          if (err) {
            res.status(500).send(error(107, JSON.stringify(err)))
          } else {
            res.send("success")
          }
        });
      });
    });
  }
});

app.post('/api/v1/setLicensePlate', (req, res) => {
  if (checkParams(res, req.body, ["stoken", "license_plate"])) {
    verifyToken(res, 0, req.body.stoken, (user) => {
      pool.query('UPDATE users SET license_plate=$1 WHERE email=$2', [license_plate, user.email], (err, DBres) => {
        if (err) {
          res.status(500).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.post('/api/v1/releaseSpot', (req, res) => {
  if (checkParams(res, req.body, ["stoken", "sid"])) {
    verifyToken(res, 0, req.body.stoken, (user) => {
      pool.query('SELECT * FROM spots WHERE id=$1', [req.body.sid], (err, DBres) => {
        console.log(err, DBres)
        if (DBres.rows == null || DBres.rows[0] == null) {
          res.status(500).send(error(101, "sid"))
          return;
        }
        if (!DBres.rows[0].inuse) {
          res.status(500).send(error(108))
          return;
        }
        if (DBres.rows[0].current_email != user.email) {
          res.status(500).send(error(102))
          return;
        }
        pool.query('UPDATE spots SET inuse=false, current_email=\'\' WHERE id=$1', [req.body.sid], (err, DBres) => {
          if (err) {
            res.status(500).send(error(107, JSON.stringify(err)))
          } else {
            res.send(JSON.stringify("success"))
          }
        });
      });
    });
  }
});

app.get('/api/v1/getUser', (req, res) => {
  if (checkParams(res, req.query, ["stoken", "email"])) {
    verifyToken(res, 0, req.query.stoken, (user) => {
      pool.query("SELECT email, name, license_plate, access FROM users WHERE email=$1", [req.query.email], (err, DBres) => {
        if (err) {
          res.status(500).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.get('/api/v1/getUsers', (req, res) => {
  if (checkParams(res, req.query, ["stoken", "emails"])) {
    verifyToken(res, 0, req.query.stoken, (user) => {
      email = JSON.parse(req.query.email)
      if (email == null) {
        res.status(500).send("Invalid emails")
        return;
      }
      for (var i = 0; i < email.length; i++) {
        if (email[i].match(paramRegex["email"])[0] != email[i]) {
          res.status(500).send("Invalid email")
          return;
        }
      }
      query = "SELECT email, name, license_plate, access FROM users WHERE email=$1"
      for (var i = 1; i < email.length; i++) {
        query += " OR email=$"+(i+1)
      }
      pool.query(query, email, (err, DBres) => {
        console.log(err, DBres)
        res.send(JSON.stringify(DBres.rows))
      });
    });
  }
});

app.post('/api/v1/assignSpot', (req, res) => {
  if (checkParams(res, req.body, ["stoken", "email", "sid"])) {
    verifyToken(res, 1, req.body.stoken, (user) => {
      pool.query('UPDATE spots SET OWNER_EMAIL=$1, CURRENT_EMAIL=$1, inuse=true WHERE id=$2', [req.body.email, req.body.sid], (err, DBres) => { // TODO: not sure this query is gonna work cause of double $1.
        console.log(err, DBres)
        res.send("success")
      });
    });
  }
});

app.post('/api/v1/createBlankUser', (req, res) => {
  console.log(req.url);
  if (checkParams(res, req.body, ["stoken", "email", "access"])) {
    verifyToken(res, 1, req.query.stoken, (user) => {
      if (req.body.access == req.body.access.match(/[0-3]{1}/g)) {
        pool.query('INSERT INTO users (EMAIL, ACCESS) VALUES ($1, $2)', [req.body.email, req.body.access], (err, DBres) => {
          console.log(err, DBres)
          res.send(JSON.stringify(DBres.rows))
        });
      } else {
        res.status(500).send("invalid access")
      }
    });
  }
});

app.post('/api/v1/createReport', (req, res) => {
  console.log(req.url);
  if (checkParams(res, req.body, ["stoken", "note", "license_plate", "sid"])) {
    verifyToken(res, 0, req.query.stoken, (user) => {
      pool.query('INSERT INTO reports (AUTHOR_EMAIL, NOTE, SPOT_ID, LICENSE_PLATE, CREATION_DATE) VALUES ($1, $2, $3, $4, $5)', [user.email, req.body.spot_id, req.body.license_plate, (new Date()).getTime()], (err, DBres) => {
        console.log(err, DBres)
        res.send(JSON.stringify(DBres.rows))
      });
    });
  }
});

app.post('/api/v1/deleteReport', (req, res) => {
  if (checkParams(res, req.body, ["stoken", "rid"])) {
    verifyToken(res, 1, req.query.stoken, (user) => {
      pool.query('DELETE FROM reports WHERE id=$1', [req.body.rid], (err, DBres) => {
        console.log(err, DBres)
        res.send(JSON.stringify(DBres.rows))
      });
    });
  }
});

app.get('/api/v1/getReports', (req, res) => { // Fields: [token]
  if (checkParams(res, req.query, ["stoken"])) {
    verifyToken(res, 0, req.query.stoken, (user) => {
      pool.query('SELECT * FROM reports', (err, DBres) => {
        res.send(JSON.stringify(DBres.rows))
      });
    });
  }
});

app.get('/api/v1/getSessionTokenGoogle', async (req, res) => { // need clientID to write this: https://developers.google.com/identity/sign-in/web/backend-auth and https://developers.google.com/identity/sign-in/web/sign-in
  if (checkParams(res, req.body, ["gtoken"])) {
    const ticket = await client.verifyIdToken({
        idToken: req.query.gtoken,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    res.send("WIP")
  }
});

// pass a email and it gens a token and give it to you. DEV ONLY
app.get('/api/v1/getSessionTokenInsecureDev', (req, res) => {
  if (checkParams(res, req.query, ["email"])) {
    pool.query('SELECT * FROM users WHERE EMAIL=$1', [req.query.email], (err, DBres) => {
      console.log(err, DBres)
      sToken = genSessionToken()
      if (DBres.rows == null || DBres.rows[0] == null) {
        pool.query('INSERT INTO users (SESSION_TOKEN, EMAIL, ACCESS, NAME) VALUES ($1, $2, 0, $3)', [sToken, req.query.email, req.query.email.split("@")[0]], (err, DBres) => {
          console.log(err, DBres)
          res.send(JSON.stringify({token: sToken}))
        });
      } else {
        if (DBres.rows[0].session_token.length == sessionTokenLength) {
          res.send(JSON.stringify({token: DBres.rows[0].session_token}))
        } else {
          pool.query('UPDATE users SET SESSION_TOKEN=$1 WHERE email=$2', [sToken, req.query.email], (err, DBres) => {
            console.log(err, DBres)
            res.send(JSON.stringify({token: sToken}))
          });
        }
      }
    });
  }
});

app.post('/api/v1/revokeSessionToken', (req, res) => {
  if (checkParams(res, req.body, ["stoken"])) {
    pool.query('UPDATE users SET SESSION_TOKEN=\'\', WHERE SESSION_TOKEN=$1', [req.query.stoken], (err, DBres) => {
      console.log(err, DBres)
      res.send("success")
    });
  }
});

app.post('/api/v1/setAccess', (req, res) => {
  if (checkParams(res, req.body, ["stoken", "email", "access"])) {
    verifyToken(res, 2, req.body.stoken, (user) => {
      pool.query('UPDATE users SET access=$1 WHERE email=$2', [access, user.email], (err, DBres) => {
        console.log(err, DBres)
        res.send(JSON.stringify(DBres.rows))
      });
    });
  }
});

app.post('/api/v1/deleteAccount', (req, res) => {
  if (checkParams(res, req.body, ["stoken"])) {
    verifyToken(res, 2, req.body.stoken, (user) => {
      pool.query('UPDATE FROM users WHERE email=$1', [user.email], (err, DBres) => {
        console.log(err, DBres)
        pool.query('SELECT * FROM spots', (err, DBres) => {
          for (var i = 0; i < DBres.length; i++) {
            if (DBres.row[i].current_email == user.email && DBres.row[i].owner_email == user.email) {
              pool.query('UPDATE spots SET current_email=\'\', inuse=false, owner_email=\'\' FROM spots', (err, DBres) => {});
            } else if (DBres.row[i].current_email == user.email) {
              pool.query('UPDATE spots SET inuse=false, owner_email=\'\' FROM spots', (err, DBres) => {});
            } else if (DBres.row[i].owner_email == user.email) {
              pool.query('UPDATE spots SET owner_email=\'\' FROM spots', (err, DBres) => {});
            }
          }
        });
      });
    });
  }
});

app.listen(port, () => console.log(`Started server at http://localhost:${port}!`));
