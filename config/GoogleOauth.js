require("dotenv").config();
const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const User = require("../modals/UserModal");

const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const email = profile._json.email;
        const name = profile._json.name;
        // Check if user with the same email already exists
        console.log(email, name, "coming from the google Oauth");
        let existingUser = await User.findOne({ email });
        if (existingUser) {
          // If user already exists, return that user
          return done(null, existingUser);
        } else {
          // If user doesn't exist, create a new user
          const newUser = new User({
            name,
            email,
            password: uuidv4(),
            emailVerified: true,
          });
          await newUser.save();

          return done(null, newUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);
module.exports = { passport };
