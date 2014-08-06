var path = require('path');
var qs = require('querystring');
var url = require('fast-url-parser');
var fileExists = require('file-exists');
var deliver = require('deliver');
var mime = require('mime-types');

module.exports = function (options) {
  options = options || {};
  
  var root = options.root || '';
  var indexFile = options.index || 'index.html';
  
  if (options.exists) fileExists = options.exists;
  
  return function (req, res, next) {
    var pathname = url.parse(req.url).pathname;
    var reqOptions = {};
    
    if (pathname === '/') return next();
    if (path.extname(pathname) === '.html') return redirectAsCleanUrl(req, res);
    if (!isCleanUrl(pathname)) return next();
    
    req.url = path.join(root, pathname + '.html');
    
    if (options.fullPath) {
      var p = options.fullPath(pathname);
      reqOptions.root = p.root;
      req.url = p.pathname + '.html';
    }
    
    reqOptions.contentType = mime.lookup(pathname);
    
    deliver(req, reqOptions).pipe(res);
  };

  function redirectAsCleanUrl (req, res) {
    var pathname = url.parse(req.url).pathname;
    var query = qs.stringify(req.query);
    
    var redirectUrl = (isDirectoryIndexFile(pathname, indexFile))
      ? path.dirname(pathname)
      : path.join(path.sep, path.dirname(pathname), path.basename(pathname.split('?')[0], '.html'));
    
    redirectUrl += (query) ? '?' + query : '';
    res.writeHead(301, { Location: redirectUrl });
    res.end();
  }

  function isDirectoryIndexFile (pathname, index) {
    var paths = pathname.split('/');
    return (paths[paths.length - 1]) === index;
  }

  function isCleanUrl (pathname) {
    return fileExists(pathname + '.html', {root: root});
  }
};