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

        result.reverse();
        // renders index.ejs with the blogposts array
        res.render('index.ejs', {blogPosts: result})
    })
})

// Main post view
// get individual post using posts id
app.get('/post/:id', (req, res) => {    
    db.collection('blogPosts').find({"_id": ObjectId(req.params.id)}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('post.ejs', {blogPosts: result})
    })
})

// CREATE blog posts
app.post('/blogPosts', (req, res) => {
    db.collection('blogPosts').insertOne(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/')
    })
})

// UPDATE blog posts
app.post('/update-post/:id', (req, res) => {    
    
    db.collection('blogPosts').updateOne({_id: ObjectId(req.params.id)}, { $set: {title : req.body.title, post : req.body.post} },{upsert: true}, (err) => {
        if(err){
            console.log(err)
            return;
        } else {
            res.redirect('/')
        }
    })
})

// DELETE blog post
app.get('/delete/:id', (req, res) => {   
    db.collection('blogPosts').deleteOne({"_id": ObjectId(req.params.id)}, (err, result) => {
        if (err) return console.log(err)

        console.log('deleted from database')        
        res.redirect('/')
    })
});        


app.get('/about', (req, res) => {    
    res.render('about.ejs')
})

app.get('/create-post', (req, res) => {   
    res.render('create-post.ejs')
})

app.get('/update-post/:id', (req, res) => {
    db.collection('blogPosts').find({"_id": ObjectId(req.params.id)}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('update-post.ejs', {blogPosts: result})
    })  
})   

app.get('/about', (req, res) => {    
    res.render('about.ejs')
})

// content management center
app.get('/cms', (req, res) => {    
    res.render('cms.ejs')
})

app.get('/cms-posts', (req, res) => {
    db.collection('blogPosts').find().toArray((err, result) => {
        if (err) return console.log(err)

        result.reverse();
        // renders index.ejs with the blogposts array
        res.render('cms-posts.ejs', {blogPosts: result})
    })
})



