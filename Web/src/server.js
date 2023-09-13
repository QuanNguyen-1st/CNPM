const db = require('./config/db');

db.connect();

const express = require('express');
const path = require('path');
const bodyParse = require('body-parser');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars'); 
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = 5000;

const route = require('./routes');

app.use(bodyParse.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParse.urlencoded({
    extended: true
}));

app.use(methodOverride('_method'))

const hbsHelpers = exphbs.create({
    helpers: require("./helpers/handlebars.js").helpers,
    extname: '.hbs'
});

app.engine('hbs', hbsHelpers.engine);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

route(app);

app.listen(port, () => console.log(`Listening on ${port}`));