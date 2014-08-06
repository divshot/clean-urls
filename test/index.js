var cleanUrls = require('../');
var connect = require('connect');
var expect = require('chai').expect;
var request = require('supertest');
var query = require('connect-query');
var fs = require('fs');
var mkdirp = require('mkdirp');
var rmdir = require('rmdir');

describe('clean urls middleware', function () {
  afterEach(function (done) {
    if(fs.existsSync('.tmp')) rmdir('.tmp', done);
    else done();
  });
  
  it('redirects to the clean url path when static html file is requested', function (done) {
    var app = connect()
      .use(cleanUrls());
    
    request(app)
      .get('/superstatic.html')
      .expect('Location', '/superstatic')
      .expect(301)
      .end(done);
  });
  
  it('it redirects and keeps the query string', function (done) {
    var app = connect()
      .use(query())
      .use(cleanUrls());
    
    request(app)
      .get('/superstatic.html?key=value')
      .expect('Location', '/superstatic?key=value')
      .expect(301)
      .end(done);
  });
  
  it('serves the .html version of the clean url if clean_urls are on', function (done) {
    mkdirp.sync('.tmp');
    fs.writeFileSync('.tmp/superstatic.html', 'test', 'utf8');
    
    var app = connect()
      .use(cleanUrls({
        root: '.tmp'
      }));
    
    request(app)
      .get('/superstatic')
      .expect(200)
      .expect('test')
      .end(done);
  });
  
  // TODO: fix this test. this
  // does nothing right now
  it('sets the default root if no root in config and no root in settings', function (done) {
    var app = connect()
      .use(cleanUrls());
     
    request(app)
      .get('/asdf')
      .expect(404)
      .end(done);
  });
  
  it('skips the middleware if it is the root path', function (done) {
    var app = connect()
      .use(cleanUrls());
    
    request(app)
      .get('/')
      .expect(404)
      .end(done);
  });
  
  it('skips the middleware if it is not a file and clean_urls are on', function (done) {
    mkdirp.sync('.tmp');
    fs.writeFileSync('.tmp/yep.html', 'yep');
    
    var app = connect()
      .use(cleanUrls({
        root: '.tmp'
      }));
    
    request(app)
      .get('/nope')
      .expect(404)
      .end(done);
  });
  
  describe('overrides', function () {
    it('exists method', function (done) {
      fs.writeFileSync('error.html', 'error');
      
      var existsCalled = false;
      var app = connect()
        .use(cleanUrls({
          root: './',
          exists: function () {
            existsCalled = true;
            return true;
          }
        }));
      
      request(app)
        .get('/error')
        .expect('error')
        .expect(200)
        .expect(function () {
          expect(existsCalled).to.equal(true);
        })
        .end(function (err) {
          fs.unlinkSync('error.html');
          done(err);
        });
    });
    
    it('fullPath method', function (done) {
      fs.writeFileSync('error.html', 'error');
      
      var fullPathCalled = false;
      var app = connect()
        .use(cleanUrls({
          exists: function () {
            return true;
          },
          fullPath: function (pathname) {
            fullPathCalled = true;
            return {
              root: '/',
              pathname: pathname
            }
          }
        }));
      
      request(app)
        .get('/error')
        .expect(function () {
          expect(fullPathCalled).to.equal(true);
        })
        .end(function (err) {
          fs.unlinkSync('error.html');
          done(err);
        });
    });
  });
  
  // it('overrides the fileExists method', function (done) {
  //   done();
  // });
  
  // it('overrides the fullPath method', function (done) {
  //   done();
  // });
});