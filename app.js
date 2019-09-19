//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const md5 = require('md5');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStratergy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/")
    .get((req, res) => {
        res.render("home");
    });

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {

        const queryUser = {
            email: req.body.username,
        };

        User.findOne(queryUser, (err, foundUser) => {
            if (!err) {
                if (foundUser) {
                    console.log("User found successfully!");
                    bcrypt.compare(md5(req.body.password), foundUser.password, (err, result) => {

                        if (result === true) {
                            console.log("Logged in successfully");
                            res.render("secrets");
                        }
                        else {
                            console.log("Wrong password!!!");
                        }
                    });

                }
                else {
                    console.log("Wrong Username!!!");
                }
            }
            else {
                console.log("Error finding in user: " + err);
            }
        });
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {

        bcrypt.hash(md5(req.body.password), saltRounds, (err, hash) => {
            if (!err) {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });

                newUser.save((err) => {
                    if (!err) {
                        console.log("User registerd successfully!");
                        res.render("secrets");
                    }
                    else {
                        console.log("Error registering user: " + err);
                    }
                });
            }
            else {
                console.log("err in hashing: ", err);
            }

        });
    });

app.listen(3000, () => {
    console.log('Server Started on port 3000...');
});