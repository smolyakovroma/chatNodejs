"use strict";

const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const server = require('http').Server(app);
const io = require('socket.io')(server, {serveClient: true});
const mongoose = require('mongoose');

const passport = require('passport');
const {Strategy, ExtractJwt} = require('passport-jwt');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
}

passport.use(new Strategy(opts, function (jwt_payload, done) {
    if (jwt_payload != void(0)) return done(false, jwt_payload);
    done();
}));

mongoose.connect("mongodb://localhost:27017/chatik", {useMongoClient: true});
mongoose.Promise = require('bluebird');

nunjucks.configure('./client/views', {
    autoescape: true,
    express: app
});


app.use("/assets", express.static('./client/public'));

function checkAuth(req, res, next) {
    passport.authenticate('jwt', {session: false}, function (err, decryptToken, jwtError) {
        if (jwtError != void(0) || err != void(0)
        )
            return res.render('index.html', {error: err || jwtError});
        req.user = decryptToken;
        next();
    })
    (req, res, next);
};

app.get('/', checkAuth, function (req, res) {
    res.render('index.html', {'date': new Date(), 'name': 'Roman'});
});

require('./sockets')(io);
server.listen('7777', '0.0.0.0', function () {
    console.log('server started');
});

