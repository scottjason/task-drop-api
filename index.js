var restify = require('restify');
var server = restify.createServer({ name: 'task-drop-api', version: '1.0.0' });
var config = require('./config');
var database = require('./config/database');
var controller = require('./controllers/');

database.connect();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('/login', controller.login);
server.post('/signup', controller.signup);

server.listen(config.server.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});