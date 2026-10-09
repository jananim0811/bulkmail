const cors = require("cors");
const nodemailer = require("nodemailer");
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/passkey")
    .then(function() {
        console.log("connected to db");
    })
    .catch(function(error) {
        console.log("failed to connect", error);
    });

app.post("/sendemail", async function(req, res) {
    const msg = req.body.msg;
    const emaillist = req.body.emaillist;

    console.log("Received message:", msg);
    console.log("Received email list:", emaillist);

    // Check if emaillist is provided and is an array
    if (!emaillist || !Array.isArray(emaillist) || emaillist.length === 0) {
        return res.status(400).send({ status: false, message: "Email list is empty or invalid" });
    }

    try {
        // Fetch credentials from MongoDB using await
        const credential = mongoose.model("credential", {}, "bulkmail");
        const data = await credential.find();

        if (!data || data.length === 0) {
            return res.status(500).send({ status: false, message: "No email credentials found in database" });
        }

        const dbUser = data[0].toJSON().user;
        const dbPass = data[0].toJSON().pass;

        // Create the transporter with fetched credentials
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: dbUser,
                pass: dbPass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Map through the email list and send emails
        const emailPromises = emaillist.map((email) => {
            return new Promise((resolve, reject) => {
                transporter.sendMail({
                    from: dbUser,
                    to: email,
                    subject: "message from bulkmail app",
                    text: msg
                }, function(error, info) {
                    if (error) {
                        console.log(`Failed to send to ${email}:`, error);
                        reject(error);
                    } else {
                        console.log(`Email sent to ${email}:`, info.response);
                        resolve(info);
                    }
                });
            });
        });

        await Promise.all(emailPromises);
        res.send({ status: true, message: "All emails sent successfully!" });
        
    } catch (error) {
        console.log("Error sending bulk emails:", error);
        res.status(500).send({ status: false, message: "Failed to send some emails" });
    }
});

app.listen(5000, function() {
    console.log("server started on port 5000...");
});