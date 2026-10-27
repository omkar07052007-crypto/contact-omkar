
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

let submissions = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/submit", (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      message.trim().length < 3
    ) {
      return res.status(400).send(
        "<h2>Invalid submission</h2><p>Please enter a valid name, email and message.</p><a href='/'>Go back</a>"
      );
    }

    submissions.push({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      date: new Date().toISOString()
    });

    res.send(`
      <h2>Thank you, ${escapeHtml(name.trim())}!</h2>
      <p>Your message was submitted successfully.</p>
      <a href="/">Back to contact form</a>
    `);
  } catch (error) {
    next(error);
  }
});

app.get("/submissions", (req, res) => {
  res.json(submissions);
});

app.use((req, res) => {
  res.status(404).send(
    "<h2>404 - Page Not Found</h2><a href='/'>Go to home</a>"
  );
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  res.status(500).send(
    "<h2>500 - Internal Server Error</h2><a href='/'>Go to home</a>"
  );
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
