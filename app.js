var express = require('express')
var fileUpload = require('express-fileupload')
var path = require('path')
var chance = require('chance').Chance()
var fs = require('fs')

var app = express()

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', './views');
app.set('view engine', 'pug');

//get index
app.get('/' , function(req, res){

  if(req.flash('success')){
    res.render('index', {status: 'Success', message: req.flash('success')})
  }else if(req.flash('error')){
    res.render('index', {status: 'Failed', message: req.flash('failed')})
  }
});

//get file
app.get('/file/:id', function(req, res){
  var filePath = path.join(__dirname, 'temp/'+ req.params.id);
  fs.stat(filePath, function(err, stat) {
    if(err == null) {
        res.sendFile(filePath);
    } else if(err.code == 'ENOENT') {
        // file does not exist
        res.status(404).send('Fichier inexistant');
    } else {
        res.redirect('back');
    }
  });

});

//upload file
app.post('/upload', function(req, res){

    if(!req.files){
      res.redirect('back');
      return;
    }

    var uploadedFile = req.files.uploadedFile;
    var newUploadedFile = chance.hash({length: 15}) + '.' + uploadedFile.name.split('.').pop();

    uploadedFile.mv(path.join(__dirname, 'temp/'+ newUploadedFile), function(err){
        if(err){
          req.flash('failed', 'Failed uploading please check the file selected')
          res.redirect('/')
        }else{
          req.flash('success', 'File available at: localhost:3000'+newUploadedFile)
          res.redirect('/');
        }
      });

});


app.listen(3000);
