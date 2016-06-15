# gulp-rev-manifest [![Build Status](https://travis-ci.org/lukeed/gulp-rev-manifest.svg?branch=master)](https://travis-ci.org/lukeed/gulp-rev-manifest) [![Gitter](https://badges.gitter.im/join_chat.svg)](https://gitter.im/sindresorhus/gulp-rev)

> Generate a `rev-manifest.json` file, mapping original paths to revisioned counterparts.

Make sure to set the files to [never expire](http://developer.yahoo.com/performance/rules.html#expires) for this to have an effect.

## Install

This package expects you to have [`gulp-rev`](https://github.com/sindresorhus/gulp-rev) installed.

```
$ npm install --save-dev gulp-rev-manifest
```

## Usage

```js
var gulp = require('gulp');
var rev = require('gulp-rev');
var revManifest = require('gulp-rev-manifest');

gulp.task('default', function () {
  return gulp.src('src/*.css')
    .pipe(rev())
    .pipe(revManifest())
    .pipe(gulp.dest('dist'));
});
```

## API

### revManifest([path], [options])

#### path

Type: `string`
Default: `"rev-manifest.json"`

Manifest file path.

#### options.base

Type: `string`
Default: `process.cwd()`

Override the `base` of the manifest file.

**Note:** This value is stripped from your destination path.

#### options.cwd

Type: `string`
Default: `process.cwd()`

Override the `cwd` (current working directory) of the manifest file.

#### options.merge

Type: `boolean`
Default: `false`

Merge existing manifest file.

#### options.transformer

Type: `object`
Default: `JSON`

An object with `parse` and `stringify` methods. This can be used to provide a
custom transformer instead of the default `JSON` for the manifest file.


## Examples

```js
var gulp = require('gulp');
var rev = require('gulp-rev');
var revManifest = require('gulp-rev-manifest');

gulp.task('default', function () {
  // by default, gulp would pick `assets/css` as the base,
  // so we need to set it explicitly:
  return gulp.src(['assets/css/*.css', 'assets/js/*.js'], {base: 'assets'})
    .pipe(gulp.dest('build/assets'))  // copy original assets to build dir
    .pipe(rev())
    .pipe(gulp.dest('build/assets'))  // write rev'd assets to build dir
    .pipe(revManifest())
    .pipe(gulp.dest('build/assets')); // write manifest to build dir
});
```

An asset manifest will be written to `build/assets/rev-manifest.json`:

```json
{
  "css/unicorn.css": "css/unicorn-d41d8cd98f.css",
  "js/unicorn.js": "js/unicorn-273c2cin3f.js"
}
```

By default, `rev-manifest.json` will be replaced as a whole. To merge with an existing manifest, pass `merge: true` and the output destination (as `base`) to `rev.manifest()`:

```js
var gulp = require('gulp');
var rev = require('gulp-rev');
var revManifest = require('gulp-rev-manifest');

gulp.task('default', function () {
  // by default, gulp would pick `assets/css` as the base,
  // so we need to set it explicitly:
  return gulp.src(['assets/css/*.css', 'assets/js/*.js'], {base: 'assets'})
    .pipe(rev())
    .pipe(gulp.dest('build/assets'))
    .pipe(revManifest({
      base: 'build/assets', // stripped from the destination path
      merge: true // merge with the existing manifest (if one exists)
    }))
    .pipe(gulp.dest('build/assets'));
});
```

You can optionally call `revManifest('manifest.json')` to give it a different path or filename.


## Integration

For more info on how to integrate **gulp-rev-manifest** into your app, have a look at the [integration guide](integration.md).


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
