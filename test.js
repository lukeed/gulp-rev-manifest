'use strict';
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var lib = require('./');

it('should build a rev manifest file', function (cb) {
	var stream = lib();

	stream.on('data', function (newFile) {
		assert.equal(newFile.relative, 'rev-manifest.json');
		assert.deepEqual(
			JSON.parse(newFile.contents.toString()),
			{'unicorn.css': 'unicorn-d41d8cd98f.css'}
		);
		cb();
	});

	var file = new gutil.File({
		path: 'unicorn-d41d8cd98f.css',
		contents: Buffer.from('')
	});

	file.revOrigPath = 'unicorn.css';

	stream.write(file);
	stream.end();
});

it('should allow naming the manifest file', function (cb) {
	var path = 'manifest.json';
	var stream = lib({path: path});

	stream.on('data', function (newFile) {
		assert.equal(newFile.relative, path);
		cb();
	});

	var file = new gutil.File({
		path: 'unicorn-d41d8cd98f.css',
		contents: Buffer.from('')
	});

	file.revOrigPath = 'unicorn.css';

	stream.write(file);
	stream.end();
});

it('should append to an existing rev manifest file', function (cb) {
	var stream = lib({
		path: 'test.manifest-fixture.json',
		merge: true
	});

	stream.on('data', function (newFile) {
		assert.equal(newFile.relative, 'test.manifest-fixture.json');
		assert.deepEqual(
			JSON.parse(newFile.contents.toString()),
			{
				'app.js': 'app-a41d8cd1.js',
				'unicorn.css': 'unicorn-d41d8cd98f.css'
			}
		);
		cb();
	});

	var file = new gutil.File({
		path: 'unicorn-d41d8cd98f.css',
		contents: Buffer.from('')
	});

	file.revOrigPath = 'unicorn.css';

	stream.write(file);
	stream.end();
});

it('should not append to an existing rev manifest by default', function (cb) {
	var stream = lib({path: 'test.manifest-fixture.json'});

	stream.on('data', function (newFile) {
		assert.equal(newFile.relative, 'test.manifest-fixture.json');
		assert.deepEqual(
			JSON.parse(newFile.contents.toString()),
			{'unicorn.css': 'unicorn-d41d8cd98f.css'}
		);
		cb();
	});

	var file = new gutil.File({
		path: 'unicorn-d41d8cd98f.css',
		contents: Buffer.from('')
	});

	file.revOrigPath = 'unicorn.css';

	stream.write(file);
	stream.end();
});

it('should sort the rev manifest keys', function (cb) {
	var stream = lib({
		path: 'test.manifest-fixture.json',
		merge: true
	});

	stream.on('data', function (newFile) {
		assert.deepEqual(
			Object.keys(JSON.parse(newFile.contents.toString())),
			['app.js', 'pony.css', 'unicorn.css']
		);
		cb();
	});

	var file = new gutil.File({
		path: 'unicorn-d41d8cd98f.css',
		contents: Buffer.from('')
	});

	file.revOrigPath = 'unicorn.css';

	var fileTwo = new gutil.File({
		path: 'pony-d41d8cd98f.css',
		contents: Buffer.from('')
	});

	fileTwo.revOrigPath = 'pony.css';

	stream.write(file);
	stream.write(fileTwo);
	stream.end();
});

it('should respect directories', function (cb) {
	var stream = lib();

	stream.on('data', function (newFile) {
		var MANIFEST = {};
		MANIFEST[path.join('foo', 'unicorn.css')] = path.join('foo', 'unicorn-d41d8cd98f.css');
		MANIFEST[path.join('bar', 'pony.css')] = path.join('bar', 'pony-d41d8cd98f.css');

		assert.equal(newFile.relative, 'rev-manifest.json');
		assert.deepEqual(JSON.parse(newFile.contents.toString()), MANIFEST);
		cb();
	});

	var file1 = new gutil.File({
		cwd: __dirname,
		base: __dirname,
		path: path.join(__dirname, 'foo', 'unicorn-d41d8cd98f.css'),
		contents: Buffer.from('')
	});

	file1.revOrigBase = __dirname;
	file1.revOrigPath = path.join(__dirname, 'foo', 'unicorn.css');
	file1.origName = 'unicorn.css';
	file1.revName = 'unicorn-d41d8cd98f.css';

	var file2 = new gutil.File({
		cwd: __dirname,
		base: __dirname,
		path: path.join(__dirname, 'bar', 'pony-d41d8cd98f.css'),
		contents: Buffer.from('')
	});

	file2.revOrigBase = __dirname;
	file2.revOrigPath = path.join(__dirname, 'bar', 'pony.css');
	file2.origName = 'pony.css';
	file2.revName = 'pony-d41d8cd98f.css';

	stream.write(file1);
	stream.write(file2);
	stream.end();
});

it('should respect files coming from directories with different bases', function (cb) {
	var stream = lib();

	stream.on('data', function (newFile) {
		var MANIFEST = {};
		MANIFEST[path.join('foo', 'scriptfoo.js')] = path.join('foo', 'scriptfoo-d41d8cd98f.js');
		MANIFEST[path.join('bar', 'scriptbar.js')] = path.join('bar', 'scriptbar-d41d8cd98f.js');

		assert.equal(newFile.relative, 'rev-manifest.json');
		assert.deepEqual(JSON.parse(newFile.contents.toString()), MANIFEST);
		cb();
	});

	var file1 = new gutil.File({
		cwd: __dirname,
		base: path.join(__dirname, 'output'),
		path: path.join(__dirname, 'output', 'foo', 'scriptfoo-d41d8cd98f.js'),
		contents: Buffer.from('')
	});

	file1.revOrigBase = path.join(__dirname, 'vendor1');
	file1.revOrigPath = path.join(__dirname, 'vendor1', 'foo', 'scriptfoo.js');
	file1.origName = 'scriptfoo.js';
	file1.revName = 'scriptfoo-d41d8cd98f.js';

	var file2 = new gutil.File({
		cwd: __dirname,
		base: path.join(__dirname, 'output'),
		path: path.join(__dirname, 'output', 'bar', 'scriptbar-d41d8cd98f.js'),
		contents: Buffer.from('')
	});

	file2.revOrigBase = path.join(__dirname, 'vendor2');
	file2.revOrigPath = path.join(__dirname, 'vendor2', 'bar', 'scriptbar.js');
	file2.origName = 'scriptfoo.js';
	file2.revName = 'scriptfoo-d41d8cd98f.js';

	stream.write(file1);
	stream.write(file2);
	stream.end();
});

it('should use correct base path for each file', function (cb) {
	var stream = lib();

	stream.on('data', function (newFile) {
		var MANIFEST = {};
		MANIFEST[path.join('foo', 'scriptfoo.js')] = path.join('foo', 'scriptfoo-d41d8cd98f.js');
		MANIFEST[path.join('bar', 'scriptbar.js')] = path.join('bar', 'scriptbar-d41d8cd98f.js');

		assert.deepEqual(JSON.parse(newFile.contents.toString()), MANIFEST);
		cb();
	});

	var fileFoo = new gutil.File({
		cwd: 'app/',
		base: 'app/',
		path: path.join('app', 'foo', 'scriptfoo-d41d8cd98f.js'),
		contents: Buffer.from('')
	});
	fileFoo.revOrigPath = 'scriptfoo.js';

	var fileBar = new gutil.File({
		cwd: 'assets/',
		base: 'assets/',
		path: path.join('assets', 'bar', 'scriptbar-d41d8cd98f.js'),
		contents: Buffer.from('')
	});
	fileBar.revOrigPath = 'scriptbar.js';

	stream.write(fileFoo);
	stream.write(fileBar);
	stream.end();
});

it('should correctly work even if revisions are not enabled', function (cb) {
	var stream = lib();

	stream.on('data', function (newFile) {
		assert.equal(newFile.relative, 'rev-manifest.json');
		assert.deepEqual(
			JSON.parse(newFile.contents.toString()),
			{'unicorn.css': 'unicorn.css'}
		);
		cb();
	});

	var file = new gutil.File({
		path: 'unicorn.css',
		contents: Buffer.from('')
	});

	stream.write(file);
	stream.end();
});
