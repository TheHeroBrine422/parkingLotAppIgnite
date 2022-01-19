# ideas:

### Frontend

### Backend

* Use classes for routes to reduce duplicated code of checkParmas and verifyToken.


Really bad pseudo code:

```js
class Route {
  constructor(url, access, params, callback) {
 
  }

  createRoute(app) {

  app.use(...)

  }
}

app = Express thing

new Route("getUser", 0, ["email"], function (res, req) {DB stuff and return user.}).createRoute(app)
```

### Both

Add both section for user, for users who are in both afternoon and morning sections (Ex: C Brown). Maybe add a toggle switch for these users in Lot for AM/PM.
