const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "submissions.json");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

function readSubmissions() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return data.trim() ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Could not read submissions:", error.message);
        return [];
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character];
    });
}

function page(title, body) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
body{font-family:Arial,sans-serif;max-width:650px;margin:60px auto;padding:24px;color:#222}
h1{font-size:2rem}p{line-height:1.6;color:#555}
a{color:#333} .button{display:inline-block;background:#555;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none}
.card{border:1px solid #ddd;border-radius:12px;padding:24px}
</style>
</head>
<body><div class="card">${body}</div></body></html>`;
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/submit", (req, res) => {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim();
    const message = (req.body.message || "").trim();

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        message.length < 3) {
        return res.status(400).send(page(
            "Invalid form details",
            `<h1>Please check your details</h1>
             <p>Enter a name of at least 2 characters, a valid email address, and a message of at least 3 characters.</p>
             <a class="button" href="/">Go back</a>`
        ));
    }

    const submissions = readSubmissions();
    submissions.push({
        name: name,
        email: email,
        message: message,
        submittedAt: new Date().toISOString()
    });

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    } catch (error) {
        console.error("Could not save submission:", error.message);
        return res.status(500).send(page(
            "Server error",
            `<h1>500 - Internal Server Error</h1>
             <p>Sorry, your message could not be saved. Please try again later.</p>
             <a class="button" href="/">Return to form</a>`
        ));
    }

    res.send(page(
        "Message sent",
        `<h1>Thank you, ${escapeHtml(name)}!</h1>
         <p>Your message has been received and stored successfully.</p>
         <a class="button" href="/">Send another message</a>`
    ));
});

app.get("/submissions", (req, res) => {
    const submissions = readSubmissions();
    const entries = submissions.map((item, index) => `
        <article style="border-top:1px solid #ddd;padding:14px 0">
        <h3>Message ${index + 1}</h3>
        <p><strong>Name:</strong> ${escapeHtml(item.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(item.email)}</p>
        <p><strong>Message:</strong> ${escapeHtml(item.message)}</p>
        </article>`).join("");

    res.send(page(
        "Stored Messages",
        `<h1>Stored Messages</h1>
         ${entries || "<p>No messages have been submitted yet.</p>"}
         <a class="button" href="/">Back to form</a>`
    ));
});

app.use((req, res) => {
    res.status(404).send(page(
        "Page Not Found",
        `<h1>404 - Page Not Found</h1>
         <p>The page you requested does not exist.</p>
         <a class="button" href="/">Return home</a>`
    ));
});

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).send(page(
        "Server Error",
        `<h1>500 - Internal Server Error</h1>
         <p>Something went wrong. Please try again later.</p>
         <a class="button" href="/">Return home</a>`
    ));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
