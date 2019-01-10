// express setup
const express = require('express');
const app = express();

const path = require('path');
const publicPath = path.join(__dirname, '/public');
// to serve static files
app.use(express.static(publicPath));



// bodyparser setup 
const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// ejs setup 
app.set('view engine', 'ejs');

// username and password imported
var configFile = require('./configFile.js');
userName = configFile.userName;
password = configFile.password;
blogString = configFile.blogString;

// mongodb setup
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

// mongodb connection to mlab
MongoClient.connect('mongodb://' + userName + ':' + password + blogString, { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log(err)
    db = client.db('node-blog') // database name

    app.listen(3000, () => {
        console.log('listening on 3000')
    })
})

// home page
app.get('/', (req, res) => {
    db.collection('blogPosts').find().toArray((err, result) => {
        if (err) return console.log(err)
        // renders index.ejs with the blogposts array
        res.render('index.ejs', {blogPosts: result})
    })
})

// post blog posts
app.post('/blogPosts', (req, res) => {
    db.collection('blogPosts').insertOne(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/')
    })
})

app.get('/createPost', (req, res) => {   
    res.render('createPost.ejs')
})

app.get('/about', (req, res) => {    
    res.render('about.ejs')
})

// get individual post using posts id
app.get('/post/:id', (req, res) => {    
    db.collection('blogPosts').find({"_id": ObjectId(req.params.id)}).toArray((err, result) => {
        if (err) return console.log(err)

        res.render('post.ejs', {blogPosts: result})
    })
})

