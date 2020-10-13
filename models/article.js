const mongoose = require('mongoose');
const marked = require('marked');
const slugify = require('slugify');

//dom purify
const createDomPurify = require('dompurify');
const {JSDOM}  = require('jsdom');
const dompurify = createDomPurify(new JSDOM().window);


const articleSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
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

articleSchema.pre('validate', function(next){
    if(this.title){
        this.slug  = slugify(this.title, {
            lower: true, 
            strict: true
        });
    }

    if(this.markdown){
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown));
    }
    next();
});

module.exports  = mongoose.model('Article', articleSchema);