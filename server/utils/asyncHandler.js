// Lets us write async controllers without try/catch everywhere.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
