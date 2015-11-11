'use strict';

/**
 * Recipe:
 * 	Stream Pipe
 *
 * Ingredients:
 * 	stream.pipe()
 *
 * @config 針對本 task 的 configuration。
 * @tasks 傳入的子 tasks 為 configurableTask，是尚未綁定 config 的 task 形式。
 *
 */
function pipe(gulp, config, stream, tasks) {
	var ConfigurableTaskError = require('../core/configurable_task_error.js');

	var i, n;

	if (tasks.length === 0) {
		throw new ConfigurableTaskError('pipe', 'no sub tasks');
	}

	for (i = 0, n = tasks.length; i < n; ++i) {
		stream = tasks[i].run(gulp, config, stream, done);
	}
	return stream;

	function done() {}
}

pipe.expose = [];
pipe.schema = {
	"title": "pipe",
	"description": "",
	"properties": {
	}
};


module.exports = pipe;
