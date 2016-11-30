var express = require('express')
var fileUpload = require('express-fileupload')
var session = require('express-session')
var path = require('path')
var chance = require('chance').Chance()
var fs = require('fs')

var app = express()

app.use(session({secret: '1234567890QWERTY'}));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', './views');
app.set('view engine', 'pug');

var sess;


//get index
app.get('/' , function(req, res){
  sess = req.session;
  if(sess.status){
    var status = sess.status;
    var message = sess.message;
    sess.status = null;
    sess.message = null;
    res.render('index', {status: status, message: message});
  }else{
    res.render('index');
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
    sess = req.session;
    uploadedFile.mv(path.join(__dirname, 'temp/'+ newUploadedFile), function(err){
        if(err){
          sess.status = 'failed';
          sess.message = 'Failed to upload the file. Please try again.'  ;
          res.redirect('/');
        }else{
          sess.status = 'success';
          sess.message = 'File uploaded at: localhost:3000/file/'+newUploadedFile;
          res.redirect('/');
        }
      });

});


app.listen(3000);
