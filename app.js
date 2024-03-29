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
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

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

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, (err) => {
            if(err)
            {
                console.log("Incorrect Creds!");
            }
            else
            {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });
        
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {

        User.register({username: req.body.username}, req.body.password, (err, user) => {
            if(err) 
            {
                console.log(err);
                res.redirect("/register");
            } 
            else
            {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });

    });

app.route("/secrets")
    .get((req,res) => {
        if(req.isAuthenticated())
        {
            res.render("secrets");
        }
        else
        {
            res.render("login");
        }
    });

app.route("/logout").get((req,res) => {
    req.logOut();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server Started on port 3000...');
});