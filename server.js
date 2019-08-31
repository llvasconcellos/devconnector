const express = require("express");
const reload = require("reload");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//DB Config

const db = require("./config/keys").mongoURI;

//Connect to mongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send('Hello Leonardo<script src="/reload/reload.js"></script>');
});

//Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.set("port", process.env.PORT || 3000);

//app.listen(port, () => console.log(`Server running on port ${port}`));

//Reload browser
reload(app)
  .then(function(reloadReturned) {
    // reloadReturned is documented in the returns API in the README

    // Reload started, start web server
    app.listen(app.get("port"), function() {
      console.log(`Web server listening on port ${app.get("port")}`);
    });
  })
  .catch(function(err) {
    console.error(
      "Reload could not start, could not start server/sample app",
      err
    );
  });
