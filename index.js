'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var assign = require('object-assign');
var file = require('vinyl-file');
var sortKeys = require('sort-keys');

function relPath(base, filePath) {
	if (filePath.indexOf(base) !== 0) {
		return filePath.replace(/\\/g, '/');
	}

	var newPath = filePath.substr(base.length).replace(/\\/g, '/');

	if (newPath[0] === '/') {
		return newPath.substr(1);
	}

	return newPath;
}

function getManifestFile(opts, cb) {
	file.read(opts.path, opts, function (err, manifest) {
		if (err) {
			// not found
			if (err.code === 'ENOENT') {
				cb(null, new gutil.File(opts));
			} else {
				cb(err);
			}

			return;
		}

		cb(null, manifest);
	});
}

module.exports = function (pth, opts) {
	if (typeof pth === 'string') {
		pth = {path: pth};
	}

	opts = assign({
		path: 'rev-manifest.json',
		merge: false,
		// Apply the default JSON transformer.
		// The user can pass in his on transformer if he wants. The only requirement is that it should
		// support 'parse' and 'stringify' methods.
		transformer: JSON
	}, opts, pth);

	var manifest = {};

	return through.obj(function (file, enc, cb) {
		// ignore all non-rev'd files
		var revisionsEnabled = file.path && file.revOrigPath;
		var revisionedFile = relPath(file.base, file.path);
		var originalFile = revisionsEnabled ? path.join(path.dirname(revisionedFile), path.basename(file.revOrigPath)).replace(/\\/g, '/') : revisionedFile;;

		manifest[originalFile] = revisionedFile;

		cb();
	}, function (cb) {
		// no need to write a manifest file if there's nothing to manifest
		if (Object.keys(manifest).length === 0) {
			cb();
			return;
		}

		getManifestFile(opts, function (err, manifestFile) {
			if (err) {
				cb(err);
				return;
			}

			if (opts.merge && !manifestFile.isNull()) {
				var oldManifest = {};

				try {
					oldManifest = opts.transformer.parse(manifestFile.contents.toString());
				} catch (err) {}

				manifest = assign(oldManifest, manifest);
			}

			manifestFile.contents = Buffer.from(opts.transformer.stringify(sortKeys(manifest), null, '  '));
			this.push(manifestFile);
			cb();
		}.bind(this));
	});
};
