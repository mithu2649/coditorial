const mongoose = require('mongoose');
const marked = require('marked');
const { isAlphanumeric } = require('validator');
const slugify = require('slugify');

//dom purify
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);


const articleSchema = new mongoose.Schema({
    author: {
        required: true,
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    title: {
        required: true,
        type: String,
        maxlength: 160
    },
    description: {
        type: String
    },
    markdown: {
        required: true,
        type: String
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    slug: {
        required: true,
        type: String,
        unique: true
    },
    sanitizedHtml: {
        required: true,
        type: String
    }
});


articleSchema.pre('validate', async function (next) {
    if (this.title) {
        this.slug = await slugify(this.title, {
            lower: true,
            strict: true
        });

        if (this.slug) { 
            this.slug += `-${Date.now().toString().slice(-4)}` 
        }
    }

    if (this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown));
    }
    next();
});

module.exports = mongoose.model('Article', articleSchema);