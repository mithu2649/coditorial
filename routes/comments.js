const express = require('express');
const router = express.Router();
const Article = require('./../models/Article');
const Comment = require('./../models/Comment');
const User = require('./../models/User');

const authRoutes = require('./../routes/authRoutes');
const { requireAuth, checkUser } = require('./../middleware/authMiddleware');

router.get('*', checkUser);
router.use(authRoutes)

router.post('/', requireAuth, async (req, res, next) => {
    req.comment = new Comment();
    next();
}, saveCommentAndRedirect());

router.delete('/:id', requireAuth, async (req, res, next) => {
    let comment = await Comment.findById(req.params.id)
    let article = await Article.findById(comment.article)
    
    await Comment.findByIdAndDelete(req.params.id);
    res.redirect(`/articles/${article.slug}`);
});


function saveCommentAndRedirect() {
    return async (req, res) => {
        let comment = req.comment;

        comment.user    = req.body.user;
        comment.article = req.body.article;
        comment.comment = req.body.comment;

        try {
            comment = await comment.save();
            let article = await Article.findById(comment.article);
            res.redirect(`/articles/${article.slug}`);
        } catch (e) {
           console.log(e)
        }
    }
}
module.exports = router;
