# clean-urls

Express/Connect middleware to serve static files from cleaner, extensionless urls.

Clean urls are only used for `.html` files. Useful for sites like blogs that are generated from static site generators such as Jekyll.

## Install

```
npm install clean-urls --save
```

## Usage

```js
var express = require('express');
var cleanUrls = require('clean-urls');

var app = express();

app.use(cleanUrls(['/app/**']));

app.listen(3000, function () {
  
});
```

### cleanUrls([rules, options])

* `rules` - OPTIONAL - this is where you define which paths get treated for clean urls. Values can be blank, `true`, `false`, a glob-like string (`/app/**/*.html`), or an array of globs.
* `options`
  * `root` - root directory of your static files. This is used to determine if the url maps a static file and to serve those static files.
  * `index` - name if the directory index file. Defaults to `index.html`. This is used to redirect you to the directory url instead of the index url and to serve the index file if it is a directory url.

## Run Tests

```
npm install
npm test
```
