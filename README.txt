# Assignment 5 — Contact Form

A simple contact form inspired by the supplied design. It uses HTML and CSS for the frontend and Node.js + Express for server-side processing.

## Features
- Name, email and message form
- Server-side input validation
- Stores submissions in `submissions.json`
- Confirmation page after a successful submission
- `/submissions` route to view stored messages
- Custom 404 page and 500 error handling

## Requirements
Install Node.js (which includes npm).

## Run locally
1. Open this folder in a terminal.
2. Install dependencies:
   `npm install`
3. Start the server:
   `npm start`
4. Open `http://localhost:3000`

## Routes
- `GET /` — displays the contact form
- `POST /submit` — validates and stores the form submission
- `GET /submissions` — displays stored messages
- Any unknown route — custom 404 page

Note: `submissions.json` is created automatically after the first successful submission. This project is for a classroom demonstration; do not use it to collect sensitive personal information.
