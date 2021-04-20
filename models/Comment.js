const mongoose = require('mongoose');

//dom purify
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);

const commentSchema = new mongoose.Schema({
    user: {
        required: true,
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    article: {
        required: true,
        type: mongoose.Schema.Types.ObjectId, ref: 'Article'
    },
    comment: {
        required: true,
        type: String,
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }

});

commentSchema.pre('validate', async function (next) {
    if (this.comment) {
        this.comment = dompurify.sanitize(this.comment);
    }
    next();
});

module.exports = mongoose.model('Comment', commentSchema);