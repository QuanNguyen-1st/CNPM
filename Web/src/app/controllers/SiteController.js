class SiteController {
    // [GET] /
    home(req, res) {
        res.render('home');
    }
    
    login(req, res) {
        res.redirect('/login');
    }
}

module.exports = new SiteController;