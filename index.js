const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const express = require("express");
const passport = require("passport");
const passportSetUp = require("./passport");
const passportStrategy = require("./passportConfig");
const { DB_URL, DB_PASSWORD } = process.env;

passportStrategy(passport);
passportSetUp(passport);

const app = express();

app.use(express.json());

const db_string = DB_URL.replace("<password>", DB_PASSWORD);

mongoose
  .connect(db_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the DB"))
  .catch((err) => console.log(err));

// Variables
const port = process.env.PORT || 8000;

// Redirect the user to the Google signin page
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Retrieve user data using the access token received
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    jwt.sign(
      { user: req.user },
      "secretKey",
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          return res.json({
            token: null,
          });
        }
        res.json({
          token,
        });
      }
    );
  }
);

app.get("/profile", (req, res) => {
  passport.authenticate("jwt", { session: false });
  console.log(req);
  res.send("Welcome");
});

app.listen(port, () => {
  console.log("already listening");
});
