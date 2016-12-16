var express = require('express'),
    fileUpload = require('express-fileupload'),
    session = require('express-session'),
    path = require('path'),
    chance = require('chance').Chance(),
    fs = require('fs'),
    SHA256 = require('js-sha256'),
    mongodb = require('mongodb');

/*
  To be used later if a solution found for the POST method on /fileOptions
  var bodyParser = require('body-parser');
*/


var app = express();

//MongoDb variables
var MongoClient = mongodb.MongoClient;
var dbUrl = 'mongodb://localhost:27017/filesharer';

app.use(session({
    secret: '1234567890filesharer'
}));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
/*
  To be used later if a solution found for the POST method on /fileOptions
  app.use(bodyParser());
*/


app.set('views', './views');
app.set('view engine', 'pug');

fs.stat(path.join(__dirname, 'uploads/'), function (err, stats) {
    if (err) {
        if (err.code == 'ENOENT') {
            fs.mkdir(path.join(__dirname, 'uploads/'), function (err) {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
});

//using session to send download info to index
var sess;

//get index
app.get('/', function (req, res) {
    sess = req.session;
    if (sess.status) {
        var status = sess.status;
        var message = sess.message;
        sess.status = null;
        sess.message = null;
        res.render('index', {
            status: status,
            message: message
        });
    } else {
        res.render('index');
    }
});

//get file
app.get('/file/:id', function (req, res) {

    var fileId = req.params.id;
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            console.log("Unable to connect to database");
        } else {
            var collection = db.collection('files');

            collection.find({
                file_id: fileId
            }).toArray(function (err, result) {
                if (err) {
                    res.status(404).render('404');
                } else if (result.length) {

                    switch (result[0].file_privacy) {

                        case 'public':
                            var filePath = path.join(__dirname, 'uploads/' + fileId);
                            fs.stat(filePath, function (err, stat) {
                                if (err === null) {
                                    res.download(filePath);
                                } else if (err.code == 'ENOENT') {
                                    res.status(404).render('404');
                                } else {
                                    res.redirect('/');
                                }
                            });
                            break;

                        case 'private':
                            res.render('privateFile', {
                                fileId: fileId
                            });
                            break;
                    }

                } else {
                    res.status(404).render('404');
                }
            });
        }
        db.close();
    });
});


//upload file
app.post('/upload', function (req, res) {

    if (!req.files) {
        res.redirect('/');
    }

    var uploadedFile = req.files.uploadedFile;
    var uploadedFileExt = req.files.uploadedFile.name.split('.').pop();
    var regex = new RegExp("bat|exe|cmd|sh|php|pl|cgi|386|dll|com|torrent|js|" +
        "app|jar|pif|vb|vbscript|wsf|asp|cer|csr|jsp|drv|" +
        "sys|ade|adp|bas|chm|cpl|crt|csh|fxp|hlp|hta|inf|" +
        "ins|isp|jse|htaccess|htpasswd|ksh|lnk|mdb|mde|mdt|" +
        "mdw|msc|msi|msp|mst|ops|pcd|prg|reg|scr|sct|shb|shs|" +
        "url|vbe|vbs|wsc|wsf|wsh");
    if (!regex.test(uploadedFileExt)) {
        var newUploadedFile = chance.guid() + '.' + uploadedFileExt;
        sess = req.session;
        uploadedFile.mv(path.join(__dirname, 'uploads/' + newUploadedFile), function (err) {
            if (err) {
                sess.status = 'failed';
                sess.message = 'Failed to upload the file. Please try again.';
                res.redirect('/');
            } else {
                MongoClient.connect(dbUrl, function (err, db) {
                    if (err) {
                        console.log('Unable to connect to the mongoDB server. Error:', err);
                    } else {

                        console.log('Connection established to', dbUrl);
                        var collection = db.collection('files');
                        var file = {
                            file_id: newUploadedFile,
                            file_privacy: 'public'
                        };

                        collection.insert(file, function (err, result) {
                            if (err) {
                                sess.status = 'failed';
                                sess.message = 'Failed to upload the file. Please try again.';
                                res.redirect('/');
                            } else {
                                sess.status = 'success';
                                sess.message = newUploadedFile;
                                sess.lastFileId = null;
                                sess.lastFileId = newUploadedFile;
                                res.redirect('/');
                            }
                            db.close();
                        });
                    }
                });
            }
        });
    }
});

/*
  For some odd reason i can't get the POST method to work so i'm using the GET
  method as an alternative for now (i think it has something to do with the pug
  templating engine)
*/
app.get('/fileOptions', function (req, res) {

    var lastFileId = sess.lastFileId;
    var filePrivacy = req.query.optionsPrivacy;
    var filePassWord = SHA256(req.query.filePassword);

    if (filePrivacy === "private" && !filePassWord === null) {

        MongoClient.connect(dbUrl, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', dbUrl);
                var collection = db.collection('files');
                collection.update({
                    file_id: lastFileId
                }, {
                    $set: {
                        file_privacy: filePrivacy,
                        file_password: filePassWord
                    }
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('document inserted');
                    }
                    db.close();
                });
            }

        });

        res.redirect('/');
    } else {
        res.redirect('/');
    }
});


//Handle private file download
app.get('/file/private/:id', function (req, res) {

    var fileId = req.params.id;
    var filePassword = SHA256(req.query.filePassword);

    MongoClient.connect(dbUrl, function (err, db) {

        var collection = db.collection('files');

        collection.find({
            $and: [{
                file_id: fileId
            }, {
                file_password: filePassword
            }]
        }).toArray(function (err, result) {
            if (err) {
                res.redirect('back');
            } else if (result.length) {

                var filePath = path.join(__dirname, 'uploads/' + fileId);
                fs.stat(filePath, function (err, stat) {
                    if (err === null) {
                        res.download(filePath);
                    } else if (err.code == 'ENOENT') {
                        res.status(404).render('404');
                    } else {
                        res.redirect('/');
                    }
                });

            } else {
                res.status(403).redirect('back');
            }
        });

        db.close();
    });
});
app.use('*', function (req, res) {
    res.render('404');
});
app.listen(3000);