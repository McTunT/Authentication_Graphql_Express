const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Strategy = require("passport-http-bearer").Strategy;

const User = mongoose.model("user");

// SerializeUser is used to provide some identifying token that can be saved
// in the users session.  We traditionally use the 'ID' for this.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// The counterpart of 'serializeUser'.  Given only a user's ID, we must return
// the user object.  This object is placed on 'req.user'.
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, "Invalid username or password.");
      }
      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(null, user);
        }
        return done(null, false, "Invalid username or password.");
      });
    });
  })
);
/*
passport.use(
  new Strategy(function(token, done) {
    User.findOne({ token: token }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user, { scope: "read" });
    });
  })
);
*/
// Creates a new user account.  We first check to see if a user already exists
// with this email address to avoid making multiple accounts with identical addresses
// If it does not, we save the existing user.  After the user is created, it is
// provided to the 'req.logIn' function.  This is apart of Passport JS.
// Notice the Promise created in the second 'then' statement.  This is done
// because Passport only supports callbacks, while GraphQL only supports promises
// for async code!  Awkward!
function signup({ email, password, req }) {
  const user = new User({ email, password });
  if (!email || !password) {
    throw new Error("You must provide an email and password.");
  }

  return User.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        throw new Error("Email in use");
      }
      return user.save();
    })
    .then(
      user =>
        new Promise((resolve, reject) => {
          req.logIn(user, err => {
            if (err) {
              reject(err);
            }
            resolve(user);
          });
        })
    );
}

// Logs in a user.  This will invoke the 'local-strategy' defined above in this
// file. Notice the strange method signature here: the 'passport.authenticate'
// function returns a function, as its indended to be used as a middleware with
// Express.  We have another compatibility layer here to make it work nicely with
// GraphQL, as GraphQL always expects to see a promise for handling async code.
function login({ email, password, req }) {
  return new Promise((resolve, reject) => {
    passport.authenticate("local", (err, user) => {
      if (!user) {
        reject("Invalid username or password.");
      }

      req.login(user, () => resolve(user));
    })({ body: { email, password } });
  });
}

module.exports = { signup, login };
