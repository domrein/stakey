'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Inert = require('inert');
const Joi = require('joi');
const MySql = require ('mysql');

const connection = MySql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stakey',
});

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, '../public'),
      },
    },
  },
});
server.connection({port: 3000});

server.register(Inert, () => {});

// SERVER STATIC ASSETS
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
  },
});

// view all callings
server.route({
  method: 'GET',
  path: '/callings',
  handler: function (request, reply) {
    // pull all the stuff from the database
    // display in table
    // reply.view('index');
    reply.view('callings', { fortune: 'You will eat a cookie' });
  },
});

// view a specific calling
server.route({
  method: 'GET',
  path: '/callings/{id}',
  handler: function (request, reply) {
    // look up all info for calling and put into read only mode
    // reply.view('index');
    reply.view('calling', {
      firstName: 'Ash',
      middleName: 'Dash',
      lastName: 'Ketchum',
      position: 'Stake Technology Specialist',
      deletable: true,
    });
  },
});

// admin (add/remove/edit users, update wards/branches)
server.route({
  method: 'GET',
  path: '/admin',
  handler: function (request, reply) {
    // reply.view('index');
    reply.view('admin', { fortune: 'You will eat a cookie' });
  },
});

// API CALLS
// create a new calling
server.route({
  method: 'POST',
  path: '/callings',
  handler: function (request, reply) {
    console.log("payload: ");
    console.log(request.payload);
    // shove all that garbage into the database
    connection.connect();

    connection.query(`
      INSERT INTO stakey.callingForms (
        firstName,
        middleName,
        lastName,
        position,
        currentPositionHolder,
        recommendedBy,
        recommendedDate,
        submittedBy,
        submittedDate,
        reason,
        templeWorthy,
        wardId,
        currentCalling,
        currentCallingStartDate,
        phone,
        altPhone,
        spouse,
        spouseCurrentCalling,
        bishopConsulted,
        bishopConsultedDate,
        highCouncilRepConsulted,
        highCouncilRepConsultedDate,
        stakePresidencyApproval,
        stakePresidencyApprovalDate,
        highCouncilApproval,
        highCouncilApprovalDate,
        interviewed,
        interviewer,
        interviewDate,
        interviewResults,
        interviewNotes,
        incumbentReleased,
        incumbentReleaser,
        incumbentReleaseDate,
        sustained,
        sustainer,
        sustainedDate,
        setApart,
        setApartBy,
        setApartDate
      ) VALUES (
        'ash',
        'mercury',
        'ketchum',
        'Pokemaster',
        'Ash Ketchum',
        'Brock Harrison',
        CURDATE(),
        'Brock Harrison',
        CURDATE(),
        'You know its his destiny.',
        1,
        1,
        'Hymnbook straightener',
        CURDATE(),
        '555-5555',
        '555-5555',
        'Misty Joto',
        'Young Womens President',
        1,
        CURDATE(),
        1,
        CURDATE(),
        1,
        CURDATE(),
        1,
        CURDATE(),
        1,
        'Jesse',
        CURDATE(),
        'Unable to steal Pokemon.',
        'Must plan another heist.',
        1,
        'James',
        CURDATE(),
        1,
        'Brock',
        CURDATE(),
        1,
        'Misty',
        CURDATE()
      )
    `, function(err, rows, fields) {
      if (err) throw err;
      connection.end();
    });

  },
  config: {
    validate: {
      payload: {
        firstName: Joi.string().max(255),
        middleName: Joi.string().max(255),
        lastName: Joi.string().max(255),
        // position: Joi.string().max(255),
        // currentPositionHolder: Joi.string().max(255),
        // recommendedBy: Joi.string().max(255),
        // recommendedDate: Joi.number().integer().positive(),
        // submittedBy: Joi.string().max(255),
        // submittedDate: Joi.number().integer().positive(),
        // reason: Joi.string().max(255),
        // templeWorthy: Joi.number().integer().positive().max(1),
        // wardId: Joi.number().integer().positive().max(255),
        // currentCalling: Joi.string().max(255),
        // currentCallingStartDate: Joi.number().integer().positive(),
        // phone: Joi.string().max(255),
        // altPhone: Joi.string().max(255),
        // spouse: Joi.string().max(255),
        // spouseCurrentCalling: Joi.string().max(255),
        // bishopConsulted: Joi.number().integer().positive().max(1),
        // bishopConsultedDate: Joi.number().integer().positive(),
        // highCouncilRepConsulted: Joi.number().integer().positive().max(1),
        // highCouncilRepConsultedDate: Joi.number().integer().positive(),
        // stakePresidencyApproval: Joi.number().integer().positive().max(1),
        // stakePresidencyApprovalDate: Joi.number().integer().positive(),
        // highCouncilApproval: Joi.number().integer().positive().max(1),
        // highCouncilApprovalDate: Joi.number().integer().positive(),
        // interviewed: Joi.number().integer().positive().max(1),
        // interviewer: Joi.string().max(255),
        // interviewDate: Joi.number().integer().positive(),
        // interviewResults: Joi.string().max(1024),
        // interviewNotes: Joi.string().max(1024),
        // incumbentReleased: Joi.number().integer().positive().max(1),
        // incumbentReleaser: Joi.string().max(255),
        // incumbentReleaseDate: Joi.number().integer().positive(),
        // sustained: Joi.number().integer().positive().max(1),
        // sustainer: Joi.string().max(255),
        // sustainedDate: Joi.number().integer().positive(),
        // setApart: Joi.number().integer().positive().max(1),
        // setApartBy: Joi.string().max(255),
        // setApartDate: Joi.number().integer().positive(),
      },
    },
  },
})

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
