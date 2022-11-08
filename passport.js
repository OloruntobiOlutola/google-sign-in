const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("./model/user-model");
const { CLIENT_ID, CLIENT_SECRET } = process.env;

const passportSetUp = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "http://localhost:8000/auth/google/callback",
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          let existingUser = await User.findOne({ "google.id": profile.id });
          // if user exists return the user
          if (existingUser) {
            return done(null, existingUser);
          }
          // if user does not exist create a new user
          console.log("Creating new user...");
          const newUser = new User({
            method: "google",
            name: profile.displayName,
            email: profile.emails[0].value,
          });
          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};

module.exports = passportSetUp;
