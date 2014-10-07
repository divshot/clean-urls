var path = require('path');
var find = require('lodash.find');
var join = require('join-path');
var qs = require('querystring');
var url = require('fast-url-parser');
var fileExists = require('file-exists');
var deliver = require('deliver');
var mime = require('mime-types');
var booly = require('booly');
var minimatch = require('minimatch');
var asArray = require('as-array');

module.exports = function (rules, options) {
  
  // Default to true
  if (rules === undefined) {
    rules = true;
  }
  
  options = options || {};
  
  var root = options.root || '';
  var indexFile = options.index || 'index.html';
  
  if (options.exists) fileExists = options.exists;
  
  return function (req, res, next) {
    
    var pathname = url.parse(req.url).pathname;
    var reqOptions = {};
    
    if (pathname === '/') {
      return next();
    }
    
    if (path.extname(pathname) === '.html' && pathMatchesRules(pathname, rules)) {
      return redirectAsCleanUrl(req, res);
    }
    
    if (!isCleanUrl(pathname, rules)) {
      return next();
    }
    
    req.url = join(root, pathname + '.html');
    
    if (options.fullPath) {
      var p = options.fullPath(req.url);
      reqOptions.root = p.root;
      req.url = p.pathname;
    }
    
    reqOptions.headers = options.headers;
    reqOptions.contentType = mime.lookup('.html');
    
    deliver(req, res, reqOptions)
      .pipe(res);
  };

  function redirectAsCleanUrl (req, res) {
    
    var pathname = url.parse(req.url).pathname;
    var query = qs.stringify(req.query);
    
    var redirectUrl = (isDirectoryIndexFile(pathname, indexFile))
      ? path.dirname(pathname)
      : join(path.sep, path.dirname(pathname), path.basename(pathname.split('?')[0], '.html'));
    
    redirectUrl += (query) ? '?' + query : '';
    res.writeHead(301, { Location: redirectUrl });
    res.end();
  }

  function isDirectoryIndexFile (pathname, index) {
    
    var paths = pathname.split('/');
    return (paths[paths.length - 1]) === index;
  }

  function isCleanUrl (pathname, rules) {
    
    var p = pathname + '.html';
    
    return pathMatchesRules(p, rules) && fileExists(p, {root: root});
  }
  
  function pathMatchesRules(pathname, rules) {
    
    if (typeof booly(rules) === 'boolean' && booly(rules) === true) {
      rules = '**';
    }
    
    return !!find(asArray(rules, true), function (rule) {
      return minimatch(pathname, rule);
    });
  }
};