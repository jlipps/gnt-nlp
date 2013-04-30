"use strict";

var words = require('./words');

words.sortedWordFreqsForBook('RO', function(err, freqs) {
  console.log(freqs);
});
