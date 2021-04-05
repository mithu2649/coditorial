const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const Article = require('./../models/Article');

const authRoutes = require('./../routes/authRoutes');
const { requireAuth, checkUser } = require('./../middleware/authMiddleware');

router.get('*', checkUser);
router.use(authRoutes)

router.get('/:username', (req, res) => {
    User.findOne({username: req.params.username})
        .select('_id username name email')
        .exec()
        .then(user => {
            if(user == null) res.redirect('/');
            res.status(200).json({ user })
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/:username/articles', async (req, res) => {
    const username = req.params.username;
    const articles = await Article.find({author: username });
    if(articles == null) res.redirect(`/${username}/articles`);
    res.status(200).json(articles);
})

module.exports  = router;