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
6. somehow create a user account for yourself with access 3 (most likely edit the database to create the user.) The onboarding progress is currently bad, but I currently haven't implemented a better solution

# release Checklist:

1. make sure to regen keys due to token leaks.

# Todo list (not prioritized)

1. TEST AND DOCUMENT. For testing, I am no longer doing it manually, and just writing testing using jest cause I need to do it anyway and most things need a lot of testing. Will do documentation after everything works.
  * remember to remove debug console.logs when finished writing testing code
2. add extra checks for db errors. Add SELECT after modification statement to check that changes worked.
3. check for race conditions
4. Make Settings.DBcreds work. For some reason on my linux machine it is having issues.
  * This issue only appears in main.js but not in test.js with jest. I have no clue why that would happen
5. add checks for types in app.listen db reset?
6. make getTokenGoogle actually create accounts
7. make createArbitraryUser check if the user it is trying to create already exists and maybe just abstract the code into a function so I can use it in getTokenGoogle
6. create New Routes
  * fix revokeToken for JWTs
10. add expiration to JWT
11. i dont think scheduling works properly for teachers.

### Other Potential Ideas

1. deleteAccount Should it delete reports? unsure if this is a good idea due to reports still being valid, user just no longer existing. maybe allow user to decide if they get deleted.
2. remove console.logs - probably need to replace with some kind of proper logging. Probably need to find a library for that. (winston)
3. allow for editing of reports. Probably need a history for this.
4. mass unassignSpots. Technically not needed but sending 100 http requests at once probably isnt the best idea. Although it probably won't cause a issue either.
5. carpool?
6. remove db errors in err() cause too much info (SQL query). when i setup better logging, put it there so it will only be accessible to the devloper. Might want to add a route for devs to access logs
7. probably should implement csrf protection
8. make checkParams and verifyToken express middleware rather then just functions ran on each route. I really want to do this for learning reasons, but it will require a refactor and isn't really that important.
9. make first user to create acc get access lvl 3

# Route To-Do List:

? means in progress.

| Route | Implemented | Tested | Documented | Added to AutoTest (test/test.js) |
| ----- | ----- | ----- | ----- | ----- |
| GET getLot | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: |
| GET getAllUsers | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: |
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
| POST getTokenGoogle | :heavy_check_mark: | :x: | :x: | NA
| POST createArbitraryUser | :heavy_check_mark: | :x: | :x: | :x:
| POST revokeToken | :x: | :x: | :x: | :x:
| POST setAccess | :heavy_check_mark: | :x: | :x: | :x:
| POST deleteAccount | :heavy_check_mark: | :x: | :x: | :x:
| POST unassignSpot | :heavy_check_mark: | :x: | :x: | :x:
| POST createSpot | :heavy_check_mark: | :x: | :x: | :x:
| POST deleteSpot | :heavy_check_mark: | :x: | :x: | :x:
| GET getSchedule | :heavy_check_mark: | :x: | :x: | :x:
| POST releaseSpotFuture | :heavy_check_mark: | :x: | :x: | :x:
| POST removeFutureReleasedSpot | :heavy_check_mark: | :x: | :x: | :x:
| POST assignRange | :heavy_check_mark: | :x: | :x: | :x:
| POST removeRange | :heavy_check_mark: | :x: | :x: | :x:
| GET getRanges | :heavy_check_mark: | :x: | :x: | :x:
| GET forceResetSpots | :heavy_check_mark: | :x: | :x: | :x:
| GET resetDB | :heavy_check_mark: | :x: | :x: | :x:

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
