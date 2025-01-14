const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    new Promise((resolve, reject) => {
        resolve(books);
    }).then((successMessage) => {
        return res.status(200).json(successMessage);
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    new Promise((resolve, reject) => {
        const isbn = parseInt(req.params.isbn);
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("This ISBN is not known to us.");
        }
    }).then((successMessage) => {
        return res.status(200).json(successMessage);
    }).catch((error) => {
        return res.status(404).json({ "error": error });
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    new Promise((resolve, reject) => {
        const author = req.params.author;
        let selected_books = []

        for (let [key, value] of Object.entries(books)) {
            let book = books[key];
            if (book.author === author) {
                selected_books.push(book)
            }
        }

        if (selected_books.length > 0) {
            resolve(selected_books);
        } else {
            reject("no matching books for the author " + author + " found.");
        }
    }).then((successMessage) => {
        return res.status(200).json(successMessage);
    }).catch((error) => {
        return res.status(404).json({ "error": error });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    new Promise((resolve, reject) => {
        const title = req.params.title;
        let selected_books = []

        for (let [key, value] of Object.entries(books)) {
            let book = books[key];
            if (book.title === title) {
                selected_books.push(book)
            }
        }
        if (selected_books.length > 0) {
            resolve(selected_books);
        } else {
            reject("no matching books for the title " + title + " found.");
        }
    }).then((successMessage) => {
        return res.status(200).json(successMessage);
    }).catch((error) => {
        return res.status(404).json({ "error": error });
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = parseInt(req.params.isbn);
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ "error": "This ISBN is not known to us." });
    }
});

module.exports.general = public_users;
