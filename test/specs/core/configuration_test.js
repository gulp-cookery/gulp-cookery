'use strict';

var Sinon = require('sinon');
var Chai = require('chai');
var expect = Chai.expect;

var base = process.cwd();

var Configuration = require(base + '/src/core/configuration');
var ConfigurationError = require(base + '/src/errors/configuration_error');

var test = require(base + '/test/testcase_runner');
var _ = require('lodash');

describe('Core', function () {
	describe('Configuration', function () {
		describe('src()', function () {
			it('should accept path string', function () {
				var actual = Configuration.src('src');
				expect(actual).to.deep.equal({
					globs: ["src"]
				});
			});
			it('should accept globs', function () {
				var actual = Configuration.src('src/**/*.js');
				expect(actual).to.deep.equal({
					globs: ["src/**/*.js"]
				});
			});
			it('should accept globs array', function () {
				var actual = Configuration.src(['src/**/*.js', 'lib/**/*.js']);
				expect(actual).to.deep.equal({
					globs: ['src/**/*.js', 'lib/**/*.js']
				});
			});
			it('should accept globs object with options', function () {
				var actual = Configuration.src({
					globs: '**/*.js',
					options: {
						base: 'src'
					}
				});
				expect(actual).to.deep.equal({
					globs: ["**/*.js"],
					options: {
						base: "src"
					}
				});
			});
			it('should accept globs object with flat options', function () {
				var actual = Configuration.src({
					globs: '**/*.js',
					base: 'src'
				});
				expect(actual).to.deep.equal({
					globs: ["**/*.js"],
					options: {
						base: "src"
					}
				});
			});
		});
		describe('dest()', function () {
			it('should accept path string', function () {
				var actual = Configuration.dest('dist');
				expect(actual).to.deep.equal({
					path: "dist"
				});
			});
			it('should accept path object', function () {
				var actual = Configuration.dest({
					path: 'dist'
				});
				expect(actual).to.deep.equal({
					path: "dist"
				});
			});
			it('should accept path object with options', function () {
				var actual = Configuration.dest({
					path: 'dist',
					options: {
						cwd: '.'
					}
				});
				expect(actual).to.deep.equal({
					path: "dist",
					options: {
						cwd: "."
					}
				});
			});
			it('should accept path object with flat options', function () {
				var actual = Configuration.dest({
					path: 'dist',
					cwd: '.'
				});
				expect(actual).to.deep.equal({
					path: "dist",
					options: {
						cwd: "."
					}
				});
			});
		});
		describe('sort()', function () {
			it('_.defaultsDeep should not merge string characters into array', function() {
				expect(_.defaultsDeep({ src: ['src'] }, { src: 'src' })).to.deep.equal({
					src: ['src']
				});
			});
			it('should accept empty config', function () {
				var actual = Configuration.sort({}, {}, {});
				expect(actual).to.deep.equal({
					taskConfig: {},
					subTaskConfigs: {}
				});
			});
			it('should always accept src and dest property even schema not defined', function () {
				var actual = Configuration.sort({
					src: 'src',
					dest: 'dist'
				}, {}, {});
				expect(actual).to.deep.equal({
					taskConfig: {
						src: {
							globs: ["src"]
						},
						dest: {
							path: "dist"
						}
					},
					subTaskConfigs: {}
				});
			});
			it('should throw if parent config not normalized', function () {
				expect(function () {
					Configuration.sort({}, {
						src: 'src'
					}, {});
				}).to.throw(TypeError);
				expect(function () {
					Configuration.sort({}, {
						dest: 'dist'
					}, {});
				}).to.throw(TypeError);
			});
			it('should inherit parent config', function () {
				var actual = Configuration.sort({}, {
					src: {
						globs: ['src']
					},
					dest: {
						path: 'dist'
					}
				}, {});
				expect(actual).to.deep.equal({
					taskConfig: {
						src: {
							globs: ['src']
						},
						dest: {
							path: 'dist'
						}
					},
					subTaskConfigs: {}
				});
			});
			it('should join parent path config', function () {
				var actual = Configuration.sort({
					src: ['services/**/*.js', 'views/**/*.js'],
					dest: 'lib'
				}, {
					src: {
						globs: ['src']
					},
					dest: {
						path: 'dist'
					}
				}, {});
				expect(actual).to.deep.equal({
					taskConfig: {
						src: {
							globs: ['src/services/**/*.js', 'src/views/**/*.js'],
						},
						dest: {
							path: "dist/lib"
						}
					},
					subTaskConfigs: {}
				});
			});
			it('should put unknown properties to subTaskConfigs', function () {
				var actual = Configuration.sort({
					src: ['services/**/*.js', 'views/**/*.js'],
					dest: 'lib',
					bundles: {
						entries: ['a', 'b', 'c']
					},
					options: {
						extensions: ['.js', '.ts', '.coffee']
					}
				}, {
					src: {
						globs: ['src']
					},
					dest: {
						path: 'dist'
					}
				}, {});
				expect(actual).to.deep.equal({
					taskConfig: {
						src: {
							globs: ['src/services/**/*.js', 'src/views/**/*.js'],
						},
						dest: {
							path: "dist/lib"
						}
					},
					subTaskConfigs: {
						bundles: {
							entries: ['a', 'b', 'c']
						},
						options: {
							extensions: ['.js', '.ts', '.coffee']
						}
					}
				});
			});
			it('should normalize config using the given schema', function () {
				var schema = {
					"definitions": {
						"io": {
							"properties": {
								"src": {
									"description": "",
									"type": "array"
								},
								"dest": {
									"description": "",
									"type": "string"
								}
							}
						},
						"options": {
							"properties": {
								"extensions": {
									"description": "",
									"type": "array",
									"alias": ["extension"]
								},
								"require": {
									"description": "",
									"type": "array",
									"alias": ["requires"]
								},
								"external": {
									"description": "",
									"type": "array",
									"alias": ["externals"]
								},
								"plugin": {
									"description": "",
									"type": "array",
									"alias": ["plugins"]
								},
								"transform": {
									"description": "",
									"type": "array",
									"alias": ["transforms"]
								},
								"exclude": {
									"description": "",
									"type": "array",
									"alias": ["excludes"]
								},
								"ignore": {
									"description": "",
									"type": "array",
									"alias": ["ignores"]
								},
								"shim": {
									"description": "",
									"type": "array",
									"alias": ["shims", "browserify-shim", "browserify-shims"]
								}
							}
						}
					},
					"extends": { "$ref": "#/definitions/io" },
					"properties": {
						"options": {
							"description": "common options for all bundles",
							"extends": { "$ref": "#/definitions/options" },
							"type": "object"
						},
						"bundles": {
							"description": "",
							"alias": ["bundle"],
							"type": "array",
							"extends": [
								{ "$ref": "#/definitions/io" },
								{ "$ref": "#/definitions/options" }
							],
							"properties": {
								"file": {
									"description": "",
									"type": "string"
								},
								"entries": {
									"description": "",
									"alias": ["entry"],
									"type": "array"
								},
								"options": {
									"extends": { "$ref": "#/definitions/options" }
								}
							},
							"required": ["file", "entries"]
						}
					},
					"required": ["bundles"],
					"default": {
						"options": {}
					}
				};
				var options = {
					"extensions": [".js", ".json", ".jsx", ".es6", ".ts"],
					"plugin": ["tsify"],
					"transform": ["brfs"]
				};
				var config = {
					"bundles": [{
					"file": "deps.js",
					"entries": [{
						"file": "traceur/bin/traceur-runtime"
					}, {
						"file": "rtts_assert/rtts_assert"
					}, {
						"file": "reflect-propertydata"
					}, {
						"file": "zone.js"
					}],
					"require": ["angular2/angular2", "angular2/router"]
				}, {
					"file": "services.js",
					"entry": "services/*/index.js",
					"external": ["angular2/angular2", "angular2/router"],
					"options": options
				}, {
					"file": "index.js",
					"entry": "index.js",
					"external": "./services",
					"options": options
				}, {
					"file": "auth.js",
					"entry": "auth/index.js",
					"external": "./services",
					"options": options
				}, {
					"file": "dashboard.js",
					"entry": "dashboard/index.js",
					"external": "./services",
					"options": options
				}]
				};
				var expected = {
					"bundles": [{
						"file": "deps.js",
						"entries": [{
							"file": "traceur/bin/traceur-runtime"
						}, {
							"file": "rtts_assert/rtts_assert"
						}, {
							"file": "reflect-propertydata"
						}, {
							"file": "zone.js"
						}],
						"require": ["angular2/angular2", "angular2/router"]
					}, {
						"file": "services.js",
						"entries": ["services/*/index.js"],
						"external": ["angular2/angular2", "angular2/router"],
						"options": options
					}, {
						"file": "index.js",
						"entries": ["index.js"],
						"external": ["./services"],
						"options": options
					}, {
						"file": "auth.js",
						"entries": ["auth/index.js"],
						"external": ["./services"],
						"options": options
					}, {
						"file": "dashboard.js",
						"entries": ["dashboard/index.js"],
						"external": ["./services"],
						"options": options
					}]
				};
				expect(Configuration.sort(config, {}, schema)).to.deep.equal({
					taskConfig: expected,
					subTaskConfigs: {
					}
				});
			});
		});
		describe('realize()', function () {
			it('should call resolver function', function () {
				var resolved = 'resolver called';
				var values = {
					runtime: Sinon.spy(function() {
						return resolved;
					})
				};
				var expected = {
					runtime: resolved
				}
				expect(Configuration.realize(values)).to.deep.equal(expected);
				expect(values.runtime.calledWith(values)).to.be.true;
			});
			it('should render template using given values', function () {
				var rootResolver = function () {
					return 'value from rootResolver()'
				};
				var nestResolver = function () {
					return 'value from nestedResolver()'
				};
				var template = "Hello {{plainValue}}! {{nested.plainValue}}, {{resolver}} and {{nested.resolver}}.";
				var realized = "Hello World! Inner World, value from rootResolver() and value from nestedResolver().";
				var values = {
					message: template,
					nested: {
						message: template,
						resolver: nestResolver,
						plainValue: "Inner World"
					},
					resolver: rootResolver,
					plainValue: "World"
				};
				var expected = {
					message: realized,
					nested: {
						message: realized,
						resolver: nestResolver(),
						plainValue: "Inner World"
					},
					resolver: rootResolver(),
					plainValue: "World"
				}
				var actual = Configuration.realize(values);
				expect(actual).to.deep.equal(expected);
			});
		});
	});
});
