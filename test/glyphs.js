/* global describe:true, it:true */
"use strict";

var glyphs = require('../glyphs');

describe('glyphs', function() {
  it('should transliterate correctly', function() {
    var test = "EU)AGGE/LION";
    var match = "εὐαγγέλιον";
    var res = glyphs.parseWord(test);
    if (res !== test) {
      throw new Error(res + " didn't match " + test);
    }
  });
});
