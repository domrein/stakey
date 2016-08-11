'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Inert = require('inert');

const server = new Hapi.Server(
  {
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, '../public'),
      },
    },
  },
}
);
server.connection({ port: 3000 });

server.register(Inert, () => {});

server.route({
  method: 'GET',
  path: '/public/{param*}',
  handler: {
    directory: {
      path: '../public/',
      redirectToSlash: true,
      index: true,
    },
  },
});

server.register(require('vision'), (err) => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: require('handlebars'),
    },
    relativeTo: __dirname,
    path: './views',
    // layoutPath: './views/layout',
    // helpersPath: './views/helpers',
    // compileMode: 'async',
  });
});

// VIEWS
// create a new calling
server.route({
  method: 'GET',
  path: '/callings/create',
  handler: function (request, reply) {
    // reply.view('index');
    reply.view('calling', { fortune: 'You will eat a cookie' });
  }
});

// view all callings
server.route({
  method: 'GET',
  path: '/callings',
  handler: function (request, reply) {
    // reply.view('index');
    reply.view('callings', { fortune: 'You will eat a cookie' });
  }
});

// view a specific calling
server.route({
  method: 'GET',
  path: '/callings/{id}',
  handler: function (request, reply) {
    // look up all info for calling and put into read only mode
    // reply.view('index');
    reply.view('calling', { fortune: 'You will eat a cookie' });
  }
});

// admin (add/remove/edit users, update wards/branches)
server.route({
  method: 'GET',
  path: '/admin',
  handler: function (request, reply) {
    // reply.view('index');
    reply.view('admin', { fortune: 'You will eat a cookie' });
  }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
