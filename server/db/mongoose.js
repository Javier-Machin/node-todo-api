const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// the options prevent deprecation warnings
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });


module.exports = { mongoose };