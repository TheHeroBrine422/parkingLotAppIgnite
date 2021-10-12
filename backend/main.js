const fs = require('fs')
const { Pool } = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const {OAuth2Client} = require('google-auth-library')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");

settings = JSON.parse(fs.readFileSync("Settings.json", 'utf8'))
privJWTKey = fs.readFileSync(settings.JWT.private, 'utf8')
pubJWTKey = fs.readFileSync(settings.JWT.public, 'utf8')

port = 3000;
CLIENT_ID = settings.CLIENT_ID
sessionTokenLength = 64
expirationTime = 30*24*60*60*1000 // 30 days
devMode = true; // disable this in prod. commenting out the dev functions at the bottom is probably a good idea too just in case.

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const client = new OAuth2Client(settings.CLIENT_ID);

const pool = new Pool({
    "user": "postgres",
    "host": "localhost",
    "database": "postgres",
    "password": "test",
    "port": 5432
  })

//const pool = new Pool(settings.DBCreds)

paramRegex = {"sid": /[0-9]*/,
              "stoken": /[a-zA-Z0-9]{64}/,
              "email": /[a-z]*@bentonvillek12.org/,
              "license_plate": /[A-Z0-9]{1,7}/,
              "access": /[0-3]{1}/,
              "note": /[^]*/,
              "rid": /[0-9]*/,
              "credential": /[^]*/,
              "g_csrf_token": /[0-9a-f]{16}/,
              "emails": /[a-z@0-9.\[\]\",]*/,
              "range": /[0-9\[\]\",]*/,
              "day": /[0-9]{1,2}-[0-9]{1,2}-20[0-9]{2}/,
              "schid": /[0-9]*/}

errors = {100: "Invalid Number of parameters.",
          101: "Invalid Parameter.",
          102: "Invalid authorization.",
          104: "Spot in use.",
          106: "Invalid csrf token",
          105: "User already has a spot.",
          107: "DB Error",
          108: "Spot not in use.",
          109: "Invalid google account."}

function error(id, extra) {
  if (extra != null) {
    return JSON.stringify({"err": id, "msg": errors[id], "extra": extra})
  }
  return JSON.stringify({"err": id, "msg": errors[id]})
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function checkParams(res, params, paramList) {
  if (Object.keys(params).length != paramList.length) {
    res.status(400).send(error(100))
    return false;
  }
  for (var i = 0; i < paramList.length; i++) {
    if (params[paramList[i]] == null || params[paramList[i]] == "" || params[paramList[i]].match(paramRegex[paramList[i]])[0] != params[paramList[i]]) {
      res.status(400).send(error(101,paramList[i]))
      return false;
    }
  }
  return true;
}

function verifyToken(res, access, token, callback) {
  if (token != null && token != "") {
    token = token.split(" ")[1] // remove bearer
    if (token != null && token != "") {
      regexTest = token.match(/[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*/)
      if (token == regexTest[0]) {
        try { // deal with error from invalid tokens
          jwtObj = jwt.verify(token, pubJWTKey, { algorithms: settings.JWT.algo})
        } catch {
          res.status(401).send(error(102))
          return
        }
        pool.query('SELECT * FROM users WHERE email=$1', [jwtObj.email], (err, DBres) => {
          if (err) {
            console.log(err)
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            if (DBres.rows == null || DBres.rows[0] == null) {
              res.status(401).send(error(102))
            } else {
              if (DBres.rows[0].access < access) {
                res.status(401).send(error(102))
              } else {
                callback(DBres.rows[0])
              }
            }
          }
        });
      } else {
        res.status(401).send(error(102))
      }
    } else {
      res.status(401).send(error(102))
    }
  } else {
    res.status(401).send(error(102))
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
  if (checkParams(res, req.query, [])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
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
  if (checkParams(res, req.query, [])) {
    verifyToken(res, 3, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM users', (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.get('/api/v1/getSchedule', (req, res) => {
  if (checkParams(res, req.query, [])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM schedule', (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.post('/api/v1/takeSpot', (req, res) => {
  if (checkParams(res, req.body, ["sid"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM spots', (err, DBres) => {
        found = false
        hasSpot = false
        for (var i = 0; i < DBres.rows.length; i++) {
          if (DBres.rows[i].id == req.body.sid) {
            found = true
            if (DBres.rows[i].inuse) {
              res.status(400).send(error(104))
              return;
            }
          }
          if (DBres.rows[i].current_email == user.email || (DBres.rows[i].owner_email == user.email && !DBres.rows[i].inuse && DBres.rows[i].id != req.body.sid)) {
            res.status(400).send(error(105))
            return;
          }
        }
        if (!found) {
          res.status(400).send(error(101, "sid"))
          return;
        }
        pool.query('UPDATE spots SET inuse=true, current_email=$1 WHERE id=$2', [user.email, req.body.sid], (err, DBres) => {
          if (err) {
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            res.send(JSON.stringify({"msg":"success"}))
          }
        });
      });
    });
  }
});

app.post('/api/v1/setLicensePlate', (req, res) => {
  if (checkParams(res, req.body, ["license_plate"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query('UPDATE users SET license_plate=$1 WHERE email=$2', [license_plate, user.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.post('/api/v1/releaseSpotFuture', (req, res) => {
  if (checkParams(res, req.body, ["sid", "day"])) {
    if (isValidDate(new Date(req.body.day))) {
      verifyToken(res, 0, req.headers.authorization, (user) => {
        pool.query('SELECT * FROM spots WHERE sid=$1', [req.body.sid], (err, DBres) => {
          if (DBres.rows != null && DBres.rows[0] != null && DBres.rows[0].owner_email == user.email) {
            pool.query('SELECT * FROM schedule WHERE sid=$1 AND day=$2 AND action=$3', [req.body.sid, req.body.day, "release"], (err, DBres) => {
              if (DBres.rows != null || DBres.rows[0] != null) {
                res.status(400).send(error(101, "sid or day"))
                return;
              }
              pool.query('INSERT INTO schedule (EMAIL, SID, ACTION, DAY) VALUES ($1, $2, $3, $4)', [user.email, req.body.sid, "release", req.body.day], (err, DBres) => {
                if (err) {
                  res.status(400).send(error(107, JSON.stringify(err)))
                } else {
                  res.send(JSON.stringify({"msg":"success"}))
                }
              });
            });
          } else {
            res.status(400).send(error(101, "sid"))
            return;
          }
        });
      });
    } else {
      res.status(400).send(error(101, "day"))
      return;
    }
  }
});

app.post('/api/v1/removeFutureReleasedSpot', (req, res) => {
  if (checkParams(res, req.body, ["schid"])) {
    if (isValidDate(new Date(req.body.day))) {
      verifyToken(res, 0, req.headers.authorization, (user) => {
        pool.query('SELECT * FROM schedule WHERE id=$1', [req.body.schid], (err, DBres) => {
          if (err) {
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            if (DBres.rows != null && DBres.rows[0] != null && DBres.rows[0].email == user.email) {
              pool.query('DELETE FROM schedule WHERE id=$1', [req.body.schid])
              res.send(JSON.stringify({"msg":"success"}))
            }
          }
        });
      });
    } else {
      res.status(400).send(error(101, "day"))
      return;
    }
  }
});

app.post('/api/v1/releaseSpot', (req, res) => {
  if (checkParams(res, req.body, ["sid"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM spots WHERE id=$1', [req.body.sid], (err, DBres) => {
        if (DBres.rows == null || DBres.rows[0] == null) {
          res.status(400).send(error(101, "sid"))
          return;
        }
        if (!DBres.rows[0].inuse) {
          res.status(400).send(error(108))
          return;
        }
        if (DBres.rows[0].current_email != user.email) {
          res.status(400).send(error(102))
          return;
        }
        pool.query('UPDATE spots SET inuse=false, current_email=\'\' WHERE id=$1', [req.body.sid], (err, DBres) => {
          if (err) {
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            res.send(JSON.stringify({"msg":"success"}))
          }
        });
      });
    });
  }
});

app.get('/api/v1/getUser', (req, res) => {
  if (checkParams(res, req.query, ["email"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query("SELECT email, name, license_plate, access FROM users WHERE email=$1", [req.query.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows[0]))
        }
      });
    });
  }
});

app.get('/api/v1/getUserByPlate', (req, res) => {
  if (checkParams(res, req.query, ["license_plate"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query("SELECT email, name, license_plate, access FROM users WHERE license_plate=$1", [req.query.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify({"msg":"success"}))
        }
      });
    });
  }
});

app.get('/api/v1/getUsers', (req, res) => {
  console.log(req.query)
  if (checkParams(res, req.query, ["emails"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      email = JSON.parse(req.query.emails)
      if (email == null) {
        res.status(400).send(error(101, "emails"))
        return;
      }
      for (var i = 0; i < email.length; i++) {
        if (email[i].match(paramRegex["email"])[0] != email[i]) {
          res.status(400).send(error(101, "email"))
          return;
        }
      }
      query = "SELECT email, name, license_plate, access FROM users WHERE email=$1"
      for (var i = 1; i < email.length; i++) {
        query += " OR email=$"+(i+1)
      }
      pool.query(query, email, (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.post('/api/v1/assignSpot', (req, res) => {
  if (checkParams(res, req.body, ["email", "sid"])) {
    verifyToken(res, 1, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM range WHERE email=$1', [user.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
          return;
        }
        if (DBres.rows != null || DBres.rows[0] == null || JSON.parse(DBres.rows[0].range).indexOf(Number(req.body.sid)) < 0) {
          res.status(400).send(error(102))
          return;
        }
        pool.query('UPDATE spots SET OWNER_EMAIL=$1, CURRENT_EMAIL=$1, inuse=true WHERE id=$2', [req.body.email, req.body.sid], (err, DBres) => { // TODO: not sure this query is gonna work cause of double $1.
          if (err) {
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            res.send(JSON.stringify({"msg":"success"}))
          }
        });
      });
    });
  }
});

app.post('/api/v1/unassignSpot', (req, res) => {
  if (checkParams(res, req.body, ["sid"])) {
    verifyToken(res, 1, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM range WHERE email=$1', [user.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
          return;
        }
        if (DBres.rows != null || DBres.rows[0] == null || JSON.parse(DBres.rows[0].range).indexOf(Number(req.body.sid)) < 0) {
          res.status(400).send(error(102))
          return;
        }
        pool.query('UPDATE spots SET OWNER_EMAIL=\'\', CURRENT_EMAIL=\'\', inuse=false WHERE id=$1', [req.body.sid], (err, DBres) => { // TODO: not sure this query is gonna work cause of double $1.
          if (err) {
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            res.send(JSON.stringify({"msg":"success"}))
          }
        });
      });
    });
  }
});

app.post('/api/v1/createBlankUser', (req, res) => {
  console.log(req.url);
  if (checkParams(res, req.body, ["email", "access"])) {
    verifyToken(res, 1, req.headers.authorization, (user) => {
      pool.query('INSERT INTO users (EMAIL, ACCESS) VALUES ($1, $2)', [req.body.email, req.body.access], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify({"msg":"success"}))
        }
      });
    });
  }
});

app.post('/api/v1/createReport', (req, res) => {
  console.log(req.url);
  if (checkParams(res, req.body, ["note", "license_plate", "sid"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query('INSERT INTO reports (AUTHOR_EMAIL, NOTE, SPOT_ID, LICENSE_PLATE, CREATION_DATE) VALUES ($1, $2, $3, $4, $5)', [user.email, req.body.spot_id, req.body.license_plate, (new Date()).getTime()], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify({"msg":"success"}))
        }
      });
    });
  }
});

app.post('/api/v1/deleteReport', (req, res) => {
  if (checkParams(res, req.body, ["rid"])) {
    verifyToken(res, 1, req.headers.authorization, (user) => {
      pool.query('DELETE FROM reports WHERE id=$1', [req.body.rid], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify({"msg":"success"}))
        }
      });
    });
  }
});

app.get('/api/v1/getReports', (req, res) => { // Fields: [token]
  if (checkParams(res, req.query, [])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM reports', (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.post('/api/v1/getSessionTokenGoogle', async (req, res) => { // need clientID to write this: https://developers.google.com/identity/sign-in/web/backend-auth and https://developers.google.com/identity/sign-in/web/sign-in
  if (checkParams(res, req.body, ["credential", "g_csrf_token"])) {
    if (req.body.g_csrf_token == req.cookies.g_csrf_token) {
      const ticket = await client.verifyIdToken({
          idToken: req.body.credential,
          audience: settings.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
          // Or, if multiple clients access the backend:
          //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];

      console.log(payload)
      if (payload['hd'] == "bentonvillek12.org") {
        token = jwt.sign({"email": payload['email']}, privJWTKey, { algorithm: settings.JWT.algo});
        res.send(token)
      } else {
        res.status(400).send(error(109))
      }
    } else {
      res.status(400).send(error(106))
    }
  }
});

app.post('/api/v1/revokeSessionToken', (req, res) => {
  if (checkParams(res, req.body, [])) {
    pool.query('DELETE FROM tokens WHERE SESSION_TOKEN=$1', [req.query.stoken], (err, DBres) => {
      if (err) {
        res.status(400).send(error(107, JSON.stringify(err)))
      } else {
        res.send(JSON.stringify({"msg":"success"}))
      }
    });
  }
});

app.post('/api/v1/setAccess', (req, res) => {
  if (checkParams(res, req.body, ["email", "access"])) {
    verifyToken(res, 2, req.headers.authorization, (user) => {
      pool.query('UPDATE users SET access=$1 WHERE email=$2', [access, user.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.post('/api/v1/assignRange', (req, res) => {
  if (checkParams(res, req.body, ["email", "range"])) {
    verifyToken(res, 2, req.headers.authorization, (user) => {
      pool.query('SELECT * FROM ranges WHERE email=$1', [req.body.email], (err, DBres) => {
        if (DBres.rows == null || DBres.rows[0] == null) {
          try {
            range = JSON.parse(req.body.range)
            if (range != null) {
              pool.query('INSERT INTO ranges (EMAIL, RANGE) VALUES ($1, $2)', [req.body.email, req.body.range, req.query.email.split("@")[0], exp], (err, DBres) => {
                if (err) {
                  res.status(400).send(error(107, JSON.stringify(err)))
                } else {
                  res.send(JSON.stringify({"token": sToken, "exp": exp}))
                }
              });
            } else {
              res.status(400).send(101, range)
            }
          } catch {
            res.status(400).send(101, range)
          }
        } else {
          pool.query('UPDATE range SET range=$2 WHERE email=$1', [req.query.email, req.body.range], (err, DBres) => {
            if (err) {
              res.status(400).send(error(107, JSON.stringify(err)))
            } else {
              res.send(JSON.stringify({"token": sToken, "exp": exp}))
            }
          });
        }
      });
    });
  }
});

app.post('/api/v1/revokeRange', (req, res) => {
  if (checkParams(res, req.body, ["email"])) {
    verifyToken(res, 2, req.headers.authorization, (user) => {
      pool.query('DELETE FROM range WHERE email=$1', [user.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify(DBres.rows))
        }
      });
    });
  }
});

app.post('/api/v1/deleteAccount', (req, res) => {
  if (checkParams(res, req.body, [])) {
    verifyToken(res, 2, req.headers.authorization, (user) => {
      pool.query('UPDATE FROM users WHERE email=$1', [user.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
        } else {
          res.send(JSON.stringify({"msg":"success"}))
        }
        pool.query('SELECT * FROM spots', (err, DBres) => { // TODO: error checking.
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

if (devMode) { // this stuff should probably be completely commented out for security reasons in prod.
  app.get('/api/v1/getArbitraryJWT', (req, res) => {
    if (checkParams(res, req.query, ["email"])) {
      res.send(JSON.stringify({"msg": "WIP/TODO"}))
      /*pool.query('SELECT * FROM users WHERE EMAIL=$1', [req.query.email], (err, DBres) => {
        if (err) {
          res.status(400).send(error(107, JSON.stringify(err)))
          return;
        }
        sToken = genSessionToken()
        exp = Date.now()+expirationTime
        if (DBres.rows == null || DBres.rows[0] == null) {
          pool.query('INSERT INTO users (EMAIL, ACCESS, NAME) VALUES ($2, 0, $3); INSERT INTO tokens (SESSION_TOKEN, EMAIL, EXPIRATION) VALUES ($1, $2, $4)', [sToken, req.query.email, req.query.email.split("@")[0], exp], (err, DBres) => {
            if (err) {
              res.status(400).send(error(107, JSON.stringify(err)))
            } else {
              res.send(JSON.stringify({"token": sToken, "exp": exp}))
            }
          });
        } else {
          pool.query('INSERT INTO tokens (SESSION_TOKEN, EMAIL, EXPIRATION) VALUES ($1, $2, $3)', [sToken, req.query.email, exp], (err, DBres) => {
            if (err) {
              res.status(400).send(error(107, JSON.stringify(err)))
            } else {
              res.send(JSON.stringify({"token": sToken, "exp": exp}))
            }
          });
        }
      });*/
    }
  });

  app.post('/api/v1/createUserAdmin', (req, res) => { // mostly intended for testing.
    console.log(req.url);
    if (checkParams(res, req.body, ["email", "access", "name", "license_plate"])) {
      verifyToken(res, 2, req.headers.authorization, (user) => {
        sToken = genSessionToken()
        pool.query('INSERT INTO users (SESSION_TOKEN, EMAIL, ACCESS, NAME, LICENSE_PLATE) VALUES ($1, $2, $3, $4, $5)', [sToken, req.body.email, req.body.access, req.body.name, req.body.license_plate], (err, DBres) => {
          if (err) {
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            res.send(JSON.stringify({"msg":sToken}))
          }
        });
      });
    }
  });

  app.get('/api/v1/forceResetSpots', (req, res) => {
    if (checkParams(res, req.query, [])) {
      verifyToken(res, 3, req.headers.authorization, (user) => {
        resetSpots()
      });
    }
  });

  app.get('/googleSigninTest', (req, res) => { // i really should just use a real webserver.
    console.log(req.url);
    fs.readFile("/home/caleb/Code/parkingLotAppIgnite/backend/googleSignInTest.html", (err, data) => {
      res.send(data.toString());
    });
  });

  app.get('/test', (req, res) => { // i really should just use a real webserver.
    console.log(req.url);
    fs.readFile("/home/caleb/Code/parkingLotAppIgnite/backend/testPost.html", (err, data) => {
      res.send(data.toString());
    });
  });
}

app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}!`)
  setTimeout(resetSpots, calcTimeResetSpots())
});

function resetSpots() {
  pool.query('UPDATE spots SET CURRENT_EMAIL = OWNER_EMAIL', (err, DBres) => {
    dateObj = new Date()
    day = dateObj.getMonth()+"-"+dateObj.getDate()+"-"+dateObj.getFullYear()
    pool.query('SELECT schedule WHERE day=$1', [day], (err, DBresSCH) => {
      if (!err) {
        pool.query('SELECT * FROM spots', (err, DBresSPT) => {
          if (!err) {
            for (var i = 0; i < DBresSCH.rows.length; i++) {
              for (var j = 0; j < DBresSPOT.rows.length; j++) {
                if (DBresSPT.rows[j].owner_email == DBresSCH.rows[i].email && DBresSPOT.rows[j].id == DBresSCH.rows[i].sid && DBres.rows[i].action == "release") {
                  pool.query('UPDATE spots SET CURRENT_EMAIL = \'\', inuse=false WHERE ID=$1', [DBres.rows[i].sid]) // TODO: better SQL statement. Could prepare and do one rather then tons.
                }
              }
            }
          }
        });
        pool.query('DELETE FROM schedule WHERE day=$1', [day])
      }
    });
  });
  setTimeout(resetSpots, calcTimeResetSpots())
}

function calcTimeResetSpots() {
  currentTime = new Date();
  wait = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 13, 30).getTime() - currentTime.getTime()
  if (wait < 0) {
    wait += 86400000; // if its already passed, do it tmrw.
  }
  return wait
}
