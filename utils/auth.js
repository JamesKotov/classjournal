const passport = require('koa-passport')
const bcrypt = require('bcrypt')
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
            bcrypt.compare(password, user.password, (error, response) => {
                if (response) {
                    done(null, user);
                } else {
                    done(null, false)
                }
            })
        } else {
            done(null, false)
        }
    }
))

