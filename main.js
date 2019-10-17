var express = require('express')
var app = express()
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
// helmet을 이용한 애플리케이션 안전하게 보호
var helmet = require('helmet')
app.use(helmet());

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

app.use('/', indexRouter);
app.use('/topic', topicRouter);


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
