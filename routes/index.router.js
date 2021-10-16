const mail = require('./mail.router');
const account = require('./account.router');
const type = require('./type.router');
const nation = require('./nation.router');
function routes(app) {
    app.use('/api', mail);
    app.use('/api', account);
    app.use('/api', type);
    app.use('/api', nation);
}

module.exports = routes;