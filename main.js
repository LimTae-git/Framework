var express = require('express')
var app = express()
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var bodyParser = require('body-parser');
var sanitizeHtml = require('sanitize-html');
var compression = require('compression');
var template = require('./lib/template.js');

// 남이 만든 미들웨어 사용하기
app.use(express.static('public'));  // 정적인 파일 서비스하기
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
// 미들웨어 생성하기
app.get('*', function(request, response,next){
  fs.readdir(`./data`, function(error, filelist){
    request.list = filelist;
    next();
  });
});

// route, routing
// app.get('/', (req,res) => res.send('Hello World!'))
app.get('/', function(request, response) {
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.list(request.list);
  var html = template.HTML(title, list,
    `
    <h2>${title}</h2>${description}
    <img src = "images/hello.jpg" style = "width: 300px; display:block; margin-top: 10px;">
    `,
    `<a href="/topic/create">create</a>`
  );
  response.send(html);
});

app.get('/topic/create', function(request, response) {
  var title = 'WEB - create';
  var list = template.list(request.list);
  var html = template.HTML(title, list, `
    <form action="/topic/create_process" method="post">
    <p><input type="text" name="title" placeholder="title"></p>
    <p>
    <textarea name="description" placeholder="description"></textarea>
    </p>
    <p>
    <input type="submit">
    </p>
    </form>
    `, '');
    response.send(html);
  });

  app.post('/topic/create_process', function(request, response){
    var post = request.body;
    var title = post.title;
    var description = post. description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/topic/${title}`)
    })
  });

  app.get('/topic/update/:pageId', function(request, response){
    var filterdId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filterdId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var list = template.list(request.list);
      var html = template.HTML(title, list,
        `
        <form action="/topic/update_process" method="post">
        <input type = "hidden" name = "id" value = "${title}">
        <p><input type="text" name="title" placeholder="title" value = "${title}"></p>
        <p>
        <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
        <input type="submit">
        </p>
        </form>
        `,
        `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
      );
      response.send(html);
    });
  });

  app.post('/topic/update_process', function(request, response){
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post. description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect(`/topic/${title}`);
      })
    })
  });

  app.post('/topic/delete_process', function(request, response){
    var post = request.body;
    var id = post.id;
    var filterdId = path.parse(id).base;
    fs.unlink(`data/${filterdId}`, function(error){
      response.redirect(`/`);
    })
  });

  app.get('/topic/:pageId', function(request, response, next) {
    var filterdId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filterdId}`, 'utf8', function(err, description){
      if(err){
        next(err);
      } else {
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags:['h1']
        });
        var list = template.list(request.list);
        var html = template.HTML(title, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/topic/create">create</a>
          <a href="/topic/update/${sanitizedTitle}">update</a>
          <form action = "/topic/delete_process" method = "post">
          <input type = "hidden" name = "id" value = "${sanitizedTitle}">
          <input type = "submit" value = "delete">
          </form>`
        );
        response.send(html);
      }
    });
  });



  // 에러처리
  // 미들웨어는 순차적으로 실행되기 때문에 뒤쪽에 위치
  app.use(function(req, res, next){
    res.status(404).send('Sorry cant find that!');
  });

  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!');
  })

  app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
  });

  /*
  var http = require('http');
  var fs = require('fs');
  var url = require('url');
  var qs = require('querystring');
  var template = require('./lib/template.js');
  var path = require('path');
  var sanitizeHtml = require('sanitize-html');


  var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if(pathname === '/'){
  if(queryData.id === undefined){
} else {
}
} else if(pathname === '/create'){
});
} else if(pathname === '/create_process'){


} else if(pathname === '/update'){

} else if(pathname === "/update_process"){

} else if(pathname === "/delete_process"){

} else {
response.writeHead(404);
response.end('Not found');
}



});
app.listen(3000);
*/
