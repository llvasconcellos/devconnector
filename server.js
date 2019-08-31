const express = require("express");
const reload = require("reload");

const app = express();

app.get("/", (req, res) => {
  res.send('Hello Leonardo<script src="/reload/reload.js"></script>');
});

app.set("port", process.env.PORT || 3000);

//app.listen(port, () => console.log(`Server running on port ${port}`));

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
