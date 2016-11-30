var express = require('express')
var fileUpload = require('express-fileupload')
var path = require('path')
var Chance = require('chance')

var app = express()
var chance = new Chance()

app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', './views')
app.set('view engine', 'pug')

app.get('/' , function(req, res){

    console.log("Got a request")
    res.render('index', { title: 'test title'})

})

app.post('/upload', function(req, res){

    if(!req.files){
      res.redirect('back')
      return
    }

    var uploadedFile = req.files.uploadedFile
    var newUploadedFile = chance.hash({length: 15}) + '.' + uploadedFile.name.split('.').pop()

    uploadedFile.mv(path.join(__dirname, 'temp/'+ newUploadedFile), function(err){
        if(err){
          res.status(500).send(err);
        }else{
          res.redirect('back')
        }
      })

})

app.listen(3000)
