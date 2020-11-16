'use strict';

const crypto = require('crypto');
const passport = require('koa-passport')

const config = require('../config/config');
const {Users} = require('../models')

/**
 * Serialize user
 *
 * @param object        User info
 */
passport.serializeUser((user, done) => {
    done(null, user.id)
})

/**
 * Deserialize user from session
 *
 * @param integer        User id
 * @returns
 */
passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findByPk(id)
        done(null, user)
    } catch (err) {
        done(err)
    }
})

/**
 * Localstrategy of Passport.js
 *
 * @param string        Username
 * @param string        password
 * @returns
 */
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await Users.findOne({
            where: {
                email: username
            }
        });
        if (user) {
            if (user.password === crypto.scryptSync(password, config.hashSecret, 64).toString('hex')) {
                done(null, user);
            } else {
                done(null, false)
            }
        } else {
            done(null, false)
        }
    }
))

