var fs = require('fs');
var express = require('express');
var request = require('request');
var dateUtil = require('./dateUtil.js');

var app = express();
var PORT = (process.env.C9_PORT===undefined)?31337:process.env.PORT;
var couchdbHost = "http://www.lekkas.org/";

/**
 * Cooke session object.
 */
var cookieSessionObj = { 
  secret: "MyPreciousSecret", 
  proxy: true, 
  cookie: { 
    path: '/', 
    httpOnly: true, 
    maxAge: null 
  }, 
  key:"lekkas.ses" 
};

/**
 * Create common page options
 */
function createPageOptions(page, req) {
  var obj = {options: {}}; 
  
  obj.options.bodyClass = page+'-page';
  obj.options.auth = (req.session.authStatus=="loggedin")?true:false;
  obj.options.date = dateUtil.getLeDateFormat(new Date());
  
  return obj;
}

app.set('view engine', 'jade');

app.enable('trust proxy');
app.disable('view cache');

app.use(express.logger('dev')); 
app.use(express.bodyParser()); 
app.use(express.static(__dirname + '/public')); 
app.use(express.cookieParser());
app.use(express.cookieSession(cookieSessionObj));
app.use(express.limit('5mb'));

//app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images/blog' }));
//quoteService.setup(app, quotes);
//blogService.setup(app, blogPosts);

/**
 * '/' Route
 */
app.get('/', function(req, res) {
  res.render('about', {options: {bodyClass: "about-page"} }, function(err, html) {
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'max-age=0');
    res.send(200, html);
  });
});

/**
 * 'About' page
 */
app.get('/about', function(req, res) {
  res.render('about', createPageOptions('about', req), function(err, html) {
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'max-age=0');
    res.send(200, html);
  });
});

/**
 * 'Projects' page. 
 */
app.get('/projects', function(req, res) {
  var reqOptions = {
    uri: "https://api.github.com/users/lekkas/repos",
    method: "GET",
    headers: {
        'User-Agent': 'request'
    }
  };
  var projectOptions = createPageOptions('projects', req);
  
  request(reqOptions, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      projectOptions.projectList = JSON.parse(body);
      console.log('got response: '+projectOptions.projectList);
    }
    else {
      console.log("error! "+error);
    }
    
    res.render('projects', projectOptions, function(err, html) {
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'max-age=0');
    res.send(200, html);
    console.log("rendered projects.");
  });
    
  });
});

/**
 * 'Code' page. Currently empty
 */
app.get('/code', function(req, res) {
  res.render('code', createPageOptions('code', req), function(err, html) {
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'max-age=0');
    res.send(200, html);
  });
});

/**
 * 'Books' page. Currently empty, should contain favourite books 
 */
app.get('/books', function(req, res) {
  res.render('books', createPageOptions('books', req), function(err, html) {
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'max-age=0');
    res.send(200, html);
  });
});

/**
 * 'Blog posts' page. Retrieves blog from couchDB and presents them.
 */
app.get('/blog', function(req, res) {
  var blogPosts;
  var viewOptions = createPageOptions('blog', req);

  /*
   * Create couchDB request
   */
  var reqOptions = {
    uri: couchdbHost + "blog/_design/blogPosts/_view/allByDate?descending=true",
    method: "GET"
  };  
  request(reqOptions, function (error, response, body) {
      console.log("error function from request: "+ error + " - " + response + " - " + body);
        if (!error && response.statusCode == 200) {
          console.log("CouchDB response: %j", body);
          blogPosts = JSON.parse(body);
          console.log("parsed JSON: %j", blogPosts);
          viewOptions.options.blogPosts = blogPosts;
          
          res.render('blog', viewOptions, function(err, html) {
            res.set('Content-Type', 'text/html');
            res.set('Cache-Control', 'max-age=0');
            res.send(200, html);
          });
        }
        else {
          console.log("Some error occured");
          res.send(404);
        }
    });
});

/**
 * 'Blog page'. Retrieve and display single blog post
 */
app.get('/blog/:postTitle', function(req, res) {
  var title = req.params.postTitle;
  if(title === undefined || title === null)
    res.redirect(req.get('referer'));
  
  var viewOptions = createPageOptions('blogpost', req);

  /* 
   * Retrieve blog post from couchDB
   */
  var reqOptions = {
    uri: couchdbHost + 'blog/_design/blogPosts/_view/allByFriendlyURL?key="'+title+'"',
    method: "GET"
  };
  request(reqOptions, function (error, response, body) {
      console.log("error function from request: "+ error + " - " + response + " - " + body);
        if (!error && response.statusCode == 200) {
          var queryReply = JSON.parse(body);
          console.log("queryReply parsed JSON: %j", queryReply);
          if(queryReply.rows.length == 1)
            viewOptions.options.blogPost = queryReply.rows[0].value;
          
          res.render('blogpost', viewOptions, function(err, html) {
            res.set('Content-Type', 'text/html');
            res.set('Cache-Control', 'max-age=0');
            res.send(200, html);
          });
        }
    });
});

/**
 * 'Quotes' page. Should load quotes from tumblr.
 */
app.get('/quotes', function(req, res){
  
  var reqOptions = {
    uri: "http://quotearchive.tumblr.com/api/read/json",
    method: "GET",
    headers: {
        'User-Agent': 'request'
    }
  };
  
  var quotesOptions = createPageOptions('quotes', req);
  
  request(reqOptions, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      console.log("body: "+body);
      eval(body);
      console.log("tumblr_api_read: " + tumblr_api_read);
      quotesOptions.blog = tumblr_api_read;
    }
    else {
      console.log("error! "+error);
    }
    
    res.render('quotes', quotesOptions, function(err, html) {
      res.set('Content-Type', 'text/html');
      res.set('Cache-Control', 'max-age=0');
      res.send(200, html);
    });
    
  });
  
  
});

/**
 * Login simply by visiting /login. Lame, but dont need to implement 
 * login functionality right now.
 */
app.get('/login', function(req, res) {
  if(req.session.authStatus == "loggedin")
    //res.redirect(req.get('referer'));
    res.redirect("/about");
  else {
    req.session.authStatus = "loggedin";
    //res.redirect(req.get('referer'));
    res.redirect("/about");
  }
});

/**
 * Logout. 
 */
app.get('/logout', function(req, res) {
  req.session.authStatus = "";
  req.session = null;
  //res.clearCookie('lekkas.ses');
  res.redirect(req.get('referer'));
});

/**
 * 'Newpost' page. Creates new post, if used is logged in.
 */
app.get('/newpost', function(req, res){
  res.render('newpost', createPageOptions('newpost', req), function(err, html) {
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'max-age=0');
    res.send(200, html);
  });
});

/**
 * View all blog images
 */
app.get('/blogimages', function(req, res){
  var imageList = fs.readdirSync('./public/images/blog');
  var imageOptions = createPageOptions('blogimages', req);
  imageOptions.options.imageList = imageList;
  
  res.render('blogimages', imageOptions, function(err, html) {
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'max-age=0');
    res.send(200, html);
  });
});

/**
 * Upload image
 */
app.post("/upload", function(req, res) {            
  if(req.session.authStatus != "loggedin") {
    res.redirect(req.get('referer'));
    console.log("User tried to upload image without being authenticated.");
  }
  
  console.log("%j", req.files);

  var outFile = './public/images/blog/'+req.files.newimage.name;
  var tmpFile = req.files.newimage.path;
  
  if(fs.exists(outFile)) 
    fs.unlinkSync(outFile);    
  
  var buf = fs.readFileSync(tmpFile);
  fs.writeFileSync(outFile, buf);

  res.redirect(req.get('referer'));
});                                                      

/**
 * Create new blog post.
 */
app.post("/createpost", function(req, res) {
  /*
   * Define function that parses CKEDITOR's input
   */
  var parseCKEditor = function(str) {
    str = str.replace("\n", "");
    if(str.substring(0, 3) == '<p>')
      str = str.substring(3, str.length);
    if(str.substring(str.length-4, str.length) == '</p>') 
      str = str.substring(0,str.length-4) ;
    return str;
  };
  
  if(req.session.authStatus != "loggedin") {
    console.log("User tried to upload image without being authenticated.");
    //res.redirect(req.get('referer'));
    res.send({"status":"fail"});
  }
  console.log("authed in and processing POST request");

  console.log("datepretty: "+dateUtil.getLeDateFormat(new Date(Date.now())));
  var blogPostObj = {};
  blogPostObj.publicationDate = Date.now();
  blogPostObj.pubDatePretty = dateUtil.getLeDateFormat(new Date(blogPostObj.publicationDate));
  console.log('blogPostObj.pubDatePretty: '+blogPostObj.pubDatePretty);
  blogPostObj.lastEditDate = null;
  blogPostObj.URLFriendlyTitle = parseCKEditor(req.body.postInfo.urlfriendlytitle);
  blogPostObj.title = parseCKEditor(req.body.postInfo.title);
  blogPostObj.summary = parseCKEditor(req.body.postInfo.summary);
  blogPostObj.content = parseCKEditor(req.body.postInfo.content);
  blogPostObj.tags = req.body.postInfo.tags;
  
  var reqOptions = {
    uri: couchdbHost + "blog/",
    method: "POST",
    json: blogPostObj
  };
  
  request(reqOptions, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(200, {"status": "postSubmitted"});
        }
    });
 });

/*
app.post('/auth', function(req, res) {
  console.log(req.body);
  // Yes, I know, this is not going live.
  if(req.body.username == "test" && req.body.password == "test") {
    req.session.authStatus = "loggedin";
    res.redirect('/about');
  }
  else
    res.send(401, 'Sorry, wrong credentials');
});
*/

app.listen(PORT);
console.log('Listening on port '+PORT);
