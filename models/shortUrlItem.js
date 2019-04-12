const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ShortUrlSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
    }
});

module.exports =  ShortUrlItem = mongoose.model('ShortUrlItem', ShortUrlSchema);