'use strict';

var messages = {
	version: {
		type: 'list',
		name: 'type',
		message: 'What type of version bump would you like to do?',
		choices: ['patch', 'minor', 'major'],
		"default": 'patch'
	},
	release: {
		type: 'list',
		name: 'release',
		message: 'What type of release would you like to do?',
		choices: ['release', 'prerelease', 'beta', 'alpha'],
		"default": 'release'
	}
};

/**
 * Recipe:
 * bump version
 *
 * Ingredients:
 * gulp-bump
 * gulp-prompt
 *
 * Note:
 * gulp-bump 可以一次修改多個 .json 檔案，針對每個檔案讀取其 version 資訊，然後各自修改其版本號碼。
 * 所以可能造成設定不同步的狀況，並不遵循 single source of truth 原則。
 *
 * Reference:
 * [gulp-bump - Bump npm versions with Gulp (gulpjs.com)](https://www.npmjs.com/package/gulp-bump/)
 */
function bumpTask(gulp, config, stream, done) {
	// lazy loading required modules.
	var semver = require('semver'),
		bump = require('gulp-bump'),
		prompt = require('gulp-prompt').prompt;

	var cwd,
		pkg,
		newVersion;

	cwd = process.cwd();
	pkg = require(cwd + '/package.json');
	stream = stream || gulp.src(config.src.globs);

	if (config.options.interactive) {
		prompt(messages.version, function (res1) {
			prompt(messages.release, function (res2) {
				newVersion = semver.inc(pkg.version, res1.type, res2.release === 'release' ? '' : res2.release);
				bumpTo(newVersion)
					.on('end', done);
			});
		});
	} else {
		newVersion = semver.inc(pkg.version, 'patch');
		return bumpTo(newVersion);
	}

	function bumpTo(newVersion) {
		return stream
			.pipe(bump({ version: newVersion }))
			.pipe(gulp.dest(config.dest.path));
	}
}

bumpTask.schema = {
	"title": "bump",
	"description": "Bump semver versions.",
	"properties": {
		"base": {
			"description": "",
			// 注意：這裡若不指定 base 的話，manifest.json 會輸出到 . 而非 app 目錄。
			"default": "."
		},
		"source": {
			"description": "",
			"default": "package.json"
		},
		"target": {
			"description": "",
			"type": "array",
			"items": {
				"type": "string"
			}
			//, "default": ['bower.json', 'app/manifest.json']
		},
		"options": {
			"description": "",
			"properties": {
				"fields": {
					"description": "",
					"type": "array",
					"items": {
						"type": "string"
					},
					"default": ["version"]
				}
			}
		}
	},
	"required": ["target"]
};

bumpTask.type = 'task';

module.exports = bumpTask;
