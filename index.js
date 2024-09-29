const express = require("express");
const cors = require("cors");
const { connectionToDB } = require("./config/db");
const app = express();
const port = 3000;
const { passport } = require("./config/GoogleOauth");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

app.get("/", async (req, res) => {
  res.send("Home-page for goolge Oauth");
});

// Google Authentication start from here

app.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,

    failureRedirect: "/google/failure",
  }),

  function (req, res) {
    const successMessage = "Google OAuth authentication successful";
    res.redirect(
      `http://localhost:5173/codeEditor?message=${encodeURIComponent(
        successMessage
      )}`
    );
  }
);

app.get("/google/success", (req, res) => {
  res.send("google o auth success");
});
app.get("/google/failure", (req, res) => {
  res.send("google o auth failed");
});
// Google Authentication ends here

app.listen(port, async () => {
  try {
    await connectionToDB
      .then((res) => console.log("Mongo db is connected"))
      .catch((error) => console.log("Mongo db have problem", error));
    console.log(`server is running on port 3000`);
  } catch (error) {
    console.log(error, "error");
  }
});
