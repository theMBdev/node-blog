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


    db.collection('blogPosts').find().sort( { _id: -1 } ).toArray((err, result) => {
        if (err) return console.log(err)

        // renders index.ejs with the blogposts array
        res.render('index', {blogPosts: result})
    })
})

// Main post view
// get individual post using posts id
app.get('/post/:id', (req, res) => {    
    db.collection('blogPosts').find({"_id": ObjectId(req.params.id)}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('post', {blogPosts: result})
    })
})

// CREATE blog posts
app.post('/blogPosts', (req, res) => {      
    db.collection('blogPosts').insertOne(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/cms')
    })
})

app.post('/submit-email', (req, res) => {    
    req.body['authenticated'] = false;
    db.collection('emailList').insertOne(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved email to database')        
        //res.status(200).send({ success: true })
        res.status(204).send();
    })
})

// UPDATE blog posts
app.post('/update-post/:id', (req, res) => {    

    db.collection('blogPosts').updateOne({_id: ObjectId(req.params.id)}, { $set: {title : req.body.title, post : req.body.post, image: req.body.image} },{upsert: true}, (err) => {
        if(err){
            console.log(err)
            return;
        } else {
            res.redirect('/cms')
        }
    })
})

// DELETE blog post
app.post('/delete-post/:id', (req, res) => {   
    db.collection('blogPosts').deleteOne({"_id": ObjectId(req.params.id)}, (err, result) => {
        if (err) return console.log(err)

        console.log('deleted from database')        
        res.redirect('/cms')
    })
});      

// DELETE email post
app.post('/delete-email/:id', (req, res) => {   
    db.collection('emailList').deleteOne({"_id": ObjectId(req.params.id)}, (err, result) => {
        if (err) return console.log(err)

        console.log('deleted email from database')        
        res.redirect('/cms')
    })
});    

// Authenticate email
app.post('/authenticate-email/:id', (req, res) => {    

    db.collection('emailList').updateOne({_id: ObjectId(req.params.id)}, { $set: {authenticated : true} },{upsert: true}, (err) => {
        if(err){
            console.log(err)
            return;
        } else {
            res.redirect('/cms')
        }
    })
})


app.get('/about', (req, res) => {    
    res.render('about')
})

app.get('/create-post', (req, res) => {   
    res.render('create-post')
})

app.get('/update-post/:id', (req, res) => {
    db.collection('blogPosts').find({"_id": ObjectId(req.params.id)}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('update-post', {blogPosts: result})
    })  
})   

app.get('/delete-post/:id', (req, res) => {
    db.collection('blogPosts').find({"_id": ObjectId(req.params.id)}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('delete-post', {blogPosts: result})
    })  
})   

app.get('/about', (req, res) => {    
    res.render('about')
})

// content management center
app.get('/cms', (req, res) => {    
    res.render('cms')
})

app.get('/cms-posts', (req, res) => {
    db.collection('blogPosts').find().sort( { _id: -1 } ).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('cms-posts', {blogPosts: result})
    })
})

app.get('/cms-emails', (req, res) => {
    db.collection('emailList').find().sort( { _id: -1 } ).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('cms-emails', {emailList: result})
    })
})



