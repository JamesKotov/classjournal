'use strict';

// Functions which will be used here and there

/**
 * Authentication middleware for authenticated router.
 * Use it like:
 * router.get('/authenticated-route', authenticated(), async (ctx, next) {
 */
exports.authenticated = () => {
    return (ctx, next) => {
        if (ctx.isAuthenticated()) {
            return next()
        } else {
            ctx.redirect('/login')
        }
    }
}
