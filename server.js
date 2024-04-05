const express = require("express");
const app = express();
const mysql = require('mysql2');
const cookieParser = require("cookie-parser");
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'wpr',
    password: 'fit2023',
    database: 'wpr2023',
    port: 3306,
}).promise();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());

// Sign-in
app.get('/signin', (req, res) => {
    const cookie = req.cookies.signin;
    if (!cookie) {
        res.render('signin');
    } else {
        res.redirect('/inbox');
    }

});

app.post('/signin', async (req, res) => {

    const { email, password } = req.body;

    const [conect] = await connection.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
    );
    if (conect.length > 0) {
        res.cookie('signin', conect[0].id, { maxAge: 3600000 });
        res.redirect('/inbox');
    } else {
        res.render('signin', { error: 'Invalid email or password!' });
    }

});





// Sign-up
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password, reEnterPassword } = req.body;

        if (!fullName || !email || !password || !reEnterPassword) {
            return res.render('signup', { error: 'Please fill in all the fields' });
        }

        if (email === undefined || email === "") {
            return res.render('signup', { error: 'Please enter email!' });
        }
        const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", email);
        if (rows.length > 0) {
            return res.render('signup', { error: 'Email already exists!' });
        }

        if (password === undefined || password.length < 6) {
            return res.render('signup', { error: 'Password is too short!' });
        }
        if (reEnterPassword !== password) {
            return res.render('signup', { error: 'Confirm Password does not match!' });
        }

        const insertNewUser = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
        connection.query(insertNewUser, [fullName, email, password]);
        res.render('signup', { success: 'Registration successful! Sign in now?' });

    } catch (error) {
        console.error('Error occurred:', error);
        res.sendStatus(401);
    }
});




//Inbox
app.get('/inbox', async (req, res) => {
    const inbox = req.cookies.signin;
    if (!inbox) {
        return res.render('denied');
    }
    const [emails] = await connection.query("SELECT * FROM emails WHERE receiver_id = ? AND receiverDeleted = 0", inbox);
    const [uname] = await connection.query("SELECT * FROM users WHERE id = ?", inbox);

    const page = parseInt(req.query.page) || 1;
    const EmailPerPage = 5;
    const startIndex = (page - 1) * EmailPerPage;
    const endIndex = startIndex + EmailPerPage;
    const paginatedEmails = emails.slice(startIndex, endIndex);
    const totalPages = Math.ceil(emails.length / EmailPerPage);
    const hasMore = endIndex < emails.length;

    res.render('inbox', { username: uname[0].full_name, emails: paginatedEmails, page, hasMore, totalPages });
});

app.post('/inbox/delete/:emailId', async (req, res) => {
    const del = req.cookies.signin;
    const link = req.params.emailId;

    try {
        const [a] = await connection.query(`UPDATE emails SET receiverDeleted = true WHERE id = ?`, [link, del]);
        if (a.affectedRows > 0) {
            res.status(200).json({ message: "Deleted Successfully" });
        } else {
            res.status(400).json({ message: "Fail" });
        }
    } catch (error) {
        console.log(error);
    }

});


//LogOut
app.get('/signout', (req, res) => {
    res.clearCookie('signin');
    res.redirect('/signin');
})




//Compose
app.get('/compose', async (req, res) => {
    const compose = req.cookies.signin;
    if (!compose) {
        return res.redirect('/');
    }
    const [others] = await connection.query("SELECT * FROM users WHERE id != ?", compose);
    const [uname] = await connection.query("SELECT * FROM users WHERE id = ?", compose);

    res.render('compose', { username: uname[0].full_name, others });
});

app.post('/compose', async (req, res) => {
    const compose = req.cookies.signin;
    if (!compose) {
        return res.redirect('/');
    }
    const [others] = await connection.query("SELECT * FROM users WHERE id != ?", compose);
    const { receiver, subject, body } = req.body;
    const [uname] = await connection.query("SELECT * FROM users WHERE id = ?", compose);
    const [recepent] = await connection.query("SELECT * FROM users WHERE id = ?", receiver);

    const [newEmail] = await connection.query(`INSERT IGNORE INTO emails (receiver_id, receiver, sender_id, sender, subject, body) VALUES (?, ?, ?, ?, ?, ?)`,
        [receiver, recepent[0].full_name, compose, uname[0].full_name, subject, body]
    );
    res.render('compose', { username: uname[0].full_name, others, successMess: "Email sent successfully!" })
});



//Outbox
app.get('/outbox', async (req, res) => {
    const outbox = req.cookies.signin;
    if (!outbox) {
        return res.redirect('/');
    }
    const [emails] = await connection.query("SELECT * FROM emails WHERE sender_id = ? AND senderDeleted = 0", outbox);
    const [uname] = await connection.query("SELECT * FROM users WHERE id = ?", outbox);

    const page = parseInt(req.query.page) || 1;
    const EmailPerPage = 5;
    const startIndex = (page - 1) * EmailPerPage;
    const endIndex = startIndex + EmailPerPage;
    const paginatedEmails = emails.slice(startIndex, endIndex);
    const totalPages = Math.ceil(emails.length / EmailPerPage);
    const hasMore = endIndex < emails.length;

    res.render('outbox', { username: uname[0].full_name, emails: paginatedEmails, page, hasMore, totalPages });

});

//delete
app.post('/outbox/delete/:emailId', async (req, res) => {
    const dele = req.cookies.signin;
    const links = req.params.emailId;

    const [a] = await connection.query(`UPDATE emails SET senderDeleted = true WHERE id = ?`, [links, dele]);

    if (a.affectedRows > 0) {
        res.status(200).json({ message: "Deleted Successfully" });
    } else {
        res.status(400).json({ message: "Fail" });
    }
});




//Email
app.get('/email/:emailId', async (req, res) => {
    const demail = req.cookies.signin;
    if (!demail) {
        return res.redirect('/');
    }
    const [uname] = await connection.query("SELECT * FROM users WHERE id = ?", demail);

    const ID = req.params.emailId;
    const [detail] = await connection.query("SELECT * FROM emails WHERE id = ?", ID);

    const [send] = await connection.query("SELECT * FROM users WHERE id = ?", detail[0].sender_id);
    const [recieve] = await connection.query("SELECT * FROM users WHERE id = ?", detail[0].receiver_id);

    res.render('email', { username: uname[0].full_name, Email: send[0].email, toEmail: recieve[0].email, Subject: detail[0].subject, Sender: detail[0].sender, Receiver: detail[0].receiver, Body: detail[0].body, Attach: detail[0].attachment });

});


app.listen(8000);
require('dotenv').config();
