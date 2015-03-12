var PORT = process.env.PORT || 3131;

var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    app = express();

var dal = require('./app/data/dal');

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/profiles', function (req, res) {
  res.render('profiles');
});

// API routes
app.get('/api/whisky', function (req, res) {
  dal.getAllWhiskies(function (err, whiskies) {
    if (err)
      return res.end({status: 500, message: err.message});

    res.json({data: whiskies});
  });
});

app.get('/api/whisky/like/:whisky', function (req, res) {
  var whisky = req.params['whisky'];

  dal.getAllWhiskiesLike(whisky, function (err, whiskies) {
    if (err)
      return res.end({status: 500, message: err.message});

    res.json({data: whiskies});
  });
});

app.get('/api/whisky/regions', function (req, res) {
  dal.getWhiskyRegions(function (err, regions) {
    if (err)
      return res.end({status: 500, message: err.message});

    res.json({data: regions});
  });
});

app.get('/api/whisky/in/:region', function (req, res) {
  var region = req.params['region'];

  dal.getAllWhiskiesInRegion(region, function (err, whiskies) {
    if (err)
      return res.end({status: 500, message: err.message});

    res.json({data: whiskies});
  });
});

app.listen(PORT, function () {
  console.log('app started on port', PORT);
});