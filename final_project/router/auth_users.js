const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = parseInt(req.params.isbn);
    const comment = req.body.comment;
    if(books[isbn]){
        const book = books[isbn];
        const user = req.session.authorization.username;
        let edited = false;
        for (let [key, value] of Object.entries(book.reviews)) {
            if(key == user){
                books[isbn].reviews[user] = comment;
                edited = true;
            }
        }
        if(!edited){
            books[isbn].reviews[user] = comment;
            return res.status(200).json({"msg":"Your review was created."});
        }else{
            return res.status(200).json({"msg":"Your review was edited."});
        }
    }else{
        return res.status(404).json({"error": "This ISBN is not known to us."});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = parseInt(req.params.isbn);
    if(books[isbn]){
        const book = books[isbn];
        const user = req.session.authorization.username;
        let deleted = false;
        for (let [key, value] of Object.entries(book.reviews)) {
            if(key == user){
                delete books[isbn].reviews[user];
                deleted = true;
            }
        }
        if(deleted){
            return res.status(200).json({"msg":"Your review was deleted."});
        }else{
            return res.status(200).json({"msg":"You have no review on this book"});
        }
    }else{
        return res.status(404).json({"error": "This ISBN is not known to us."});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
