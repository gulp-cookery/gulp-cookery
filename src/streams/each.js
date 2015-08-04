/*jshint node: true */
/*global process*/

/**
 * @config 針對本 task 的 configuration。
 * @tasks 傳入的子 tasks 為 configurableTask，是尚未綁定 config 的 task 形式。
 *  
 */
function each(config, tasks) {
    var gulp = this;
    
    // lazy loading required modules.
    var mergeStream = require('merge-stream');
    var merge = require('./merge');
    
    var streams;
    
    // TODO: return a empty stream that already end.
    if (config.values.length === 0) {
        return null;
    }
    
    if (config.values.length === 1) {
        return processValue(config.values[0]);
    }
    
    streams = config.values.map(processValue);
    return mergeStream(streams);
    
    function processValue(value) {
        return merge.call(gulp, value, tasks);
    }
}

each.description = '';
each.consumes = ['values'];

module.exports = each;