"use strict";

var _ = require('underscore');

var glyphs = {};
var beforeStates = {
  '*': 'capital'
  , '(': 'rough'
  , ')': 'smooth'
  , '=': 'circumflex'
};
var afterStates = {
  '/': 'acute'
  , '\\': 'grave'
  , '+': 'umlaut'
  , '|': 'iota'
};
var states = _.extend(beforeStates, afterStates);
var diacriticOrder = ['rough', 'smooth', 'acute', 'grave', 'circumflex',
    'umlaut', 'iota'];
var stateOrder = ['upper', 'lower', 'final', 'none'].concat(diacriticOrder);

var noDiacritics = ['B', 'G', 'D', 'F', 'K', 'L', 'M', 'N', 'P', 'C', 'S', 'T',
    'Y', 'Q', 'X', 'Z'];

//var vowels = ['A', 'E', 'H', 'I', 'O', 'U', 'W'];
//var takesBreathing = vowels + ['R'];

var debug = function(msg) {
  //console.log(msg);
};

glyphs.parseWord = function(translit) {
  var glyphSet = [];
  var curGlyph = glyphs.getNextGlyph(translit.split(""));
  while(curGlyph[0] !== null) {
    debug("curGlyph is " + JSON.stringify(curGlyph));
    if (curGlyph[0] === null) {
      debug("it's null!");
    } else {
      debug(typeof curGlyph);
      debug("It's not null, it's " + JSON.stringify(curGlyph[0]));
    }
    glyphSet.push(curGlyph[0]);
    debug("Getting next glyph from " + curGlyph[1]);
    curGlyph = glyphs.getNextGlyph(curGlyph[1]);
  }
  return glyphSet.join("");
};

glyphs.getNextGlyph = function(chars) {
  var state = [];
  if (chars.length) {
    var haveGlyph = false;
    var glyph = null;
    var res, validGlyph, unknown, returnLast, isLast, char;
    while (!haveGlyph) {
      debug("Chars is now: " + JSON.stringify(chars));
      char = chars.shift();
      isLast = chars.length === 0;
      state.push(char);
      debug("Looking for glyph with " + JSON.stringify(state));
      res = glyphs.getGlyphFromState(state, isLast);
      debug("Res is " + JSON.stringify(res));
      validGlyph = res[0];
      unknown = res[1];
      returnLast = res[2];
      glyph = res[3];
      if (returnLast) {
        chars.unshift(returnLast);
      }
      if (validGlyph) {
        haveGlyph = true;
      }
    }
    return [glyph, chars];
  } else {
    debug("Char list is empty");
    return [null];
  }
};

glyphs.numBaseCharsInState = function(state) {
  var num = 0;
  _.each(state, function(char) {
    if (!_.has(states, char)) {
      num++;
    }
  });
  return num;
};

// upper, lower, rough, acute, grave, umlaut, circumflex, iota, smooth, none

glyphs.getGlyphFromState = function(state, isLast) {
  var validGlyph = false;
  var unknown = false;
  var returnLast = null;
  var glyph = null;
  if (state.length === 1) {
    if (_.contains(noDiacritics, state[0])) {
      validGlyph = true;
    } else if (!_.has(states, state[0])) {
      unknown = true;
    }
  } else {
    var last = state[state.length - 1];
    var secondToLast = state[state.length - 2];
    if (states[secondToLast] !== 'capital' && _.contains(noDiacritics, last) ||
        (_.has(afterStates, secondToLast) && !_.has(states, last)) ||
        (glyphs.numBaseCharsInState(state) > 1)) {
      debug("we've crossed glyph boundary");
      returnLast = state.pop();
      validGlyph = true;
    }
  }
  if (isLast) {
    validGlyph = true;
  }
  if (validGlyph) {
    debug("at start of validGlyph: " + JSON.stringify(state));
    if (isLast && state[0] === "S") {
      state.unshift("final");
    }
    if (states[state[0]] === 'capital') {
      state.shift();
      state.unshift('upper');
    } else {
      state.unshift('lower');
    }
    if (state.length === 2) {
      state.unshift('none');
    }
    debug(state);
    state = glyphs.mapStates(state);
    state = glyphs.sortByDiacriticOrder(state);
    debug(state);
    var glyphString = "glyphs";
    glyph = glyphs.glyphs;
    _.each(state, function(stateEl) {
      try {
        glyphString += "[" + stateEl + "]";
        glyph = glyph[stateEl];
      } catch (e) {
        console.log("Could not find a glyph for state: " + glyphString);
        throw e;
      }
    });
    debug(glyphString);
  }
  return [validGlyph, unknown, returnLast, glyph];
};

glyphs.mapStates = function(state) {
  var newState = [];
  _.each(state, function(stateElement) {
    if (_.has(states, stateElement)) {
      newState.push(states[stateElement]);
    } else {
      newState.push(stateElement);
    }
  });
  return newState;
};

glyphs.sortByDiacriticOrder = function(state) {
  state = _.sortBy(state, function(stateEl) {
    if (_.contains(stateOrder, stateEl)) {
      return stateOrder.indexOf(stateEl);
    } else {
      return 100;
    }
  });
  return state;
};

glyphs.glyphs = {
  'upper': {
    'acute': {
      'A': '\u1FBB'
      , 'E': 'u1FC9'
      , 'H': '\u1FCB'
      , 'I': '\u1FDB'
      , 'O': '\u1FF9'
      , 'U': '\u1FEB'
      , 'W': '\u1FFB'
    },
    'grave': {
      'A': '\u1FBA'
      , 'E': '\u1FC8'
      , 'H': '\u1FCA'
      , 'I': '\u1FDA'
      , 'O': '\u1FF8'
      , 'U': '\u1FEA'
      , 'W': '\u1FFA'
    },
    'iota': {
      'A': '\u1FBC'
      , 'H': '\u1FCC'
      , 'W': '\u1FFC'
    },
    'rough': {
      'A': '\u1F09'
      , 'E': '\u1F19'
      , 'H': '\u1F29'
      , 'I': '\u1F39'
      , 'O': '\u1F49'
      , 'U': '\u1F59'
      , 'W': '\u1F69'
      , 'R': '\u1FEC'
      , 'acute': {
          'A': '\u1F0D'
          , 'E': '\u1F1D'
          , 'H': '\u1F2D'
          , 'I': '\u1F3D'
          , 'O': '\u1F4D'
          , 'U': '\u1F5D'
          , 'W': '\u1F6D'
        }
      , 'grave': {
          'A': '\u1F0B'
          , 'E': '\u1F1B'
          , 'H': '\u1F2B'
          , 'I': '\u1F3B'
          , 'O': '\u1F4B'
          , 'U': '\u1F5B'
          , 'W': '\u1F6B'
          , 'iota': {
              'A': '\u1F8B'
              , 'H': '\u1F9B'
              , 'W': '\u1FAB'
            }
        }
      , 'circumflex': {
          'A': '\u1F0E'
          , 'H': '\u1F2E'
          , 'I': '\u1F3E'
          , 'U': '\u1F5E'
          , 'W': '\u1F6E'
          , 'iota': {
              'A': '\u1F8F'
              , 'H': '\u1F9F'
              , 'W': '\u1FAF'
            }
        }
      , 'iota': {
          'A': '\u1F89'
          , 'H': '\u1F99'
          , 'W': '\u1FA9'
        }
    },
    'smooth': {
      'A': '\u1F08'
      , 'E': '\u1F18'
      , 'H': '\u1F28'
      , 'I': '\u1F38'
      , 'O': '\u1F48'
      , 'W': '\u1F68'
      , 'acute': {
          'A': '\u1F0C'
          , 'E': '\u1F1C'
          , 'H': '\u1F2C'
          , 'I': '\u1F3C'
          , 'O': '\u1F4C'
          , 'W': '\u1F6C'
        }
      , 'grave': {
          'A': '\u1F0A'
          , 'E': '\u1F1A'
          , 'H': '\u1F2A'
          , 'I': '\u1F3A'
          , 'O': '\u1F4A'
          , 'W': '\u1F6A'
          , 'iota': {
              'A': '\u1F8C'
              , 'H': '\u1F9C'
              , 'W': '\u1FAC'
            }
        }
      , 'circumflex': {
          'A': '\u1F0F'
          , 'H': '\u1F2F'
          , 'I': '\u1F3F'
          , 'W': '\u1F6F'
          , 'iota': {
              'A': '\u1F8E'
              , 'H': '\u1F9E'
              , 'W': '\u1FAE'
            }
        }
      , 'smooth_iota': {
          'A': '\u1F88'
          , 'H': '\u1F98'
          , 'W': '\u1FA8'
        }
    },
    'none': {
      'A': '\u0391'
      , 'B': '\u0392'
      , 'G': '\u0393'
      , 'D': '\u0394'
      , 'E': '\u0395'
      , 'Z': '\u0396'
      , 'H': '\u0397'
      , 'Q': '\u0398'
      , 'I': '\u0399'
      , 'K': '\u039A'
      , 'L': '\u039B'
      , 'M': '\u039C'
      , 'N': '\u039D'
      , 'C': '\u039E'
      , 'O': '\u039F'
      , 'P': '\u03A0'
      , 'R': '\u03A1'
      , 'S': '\u03A3'
      , 'T': '\u03A4'
      , 'U': '\u03A5'
      , 'F': '\u03A6'
      , 'X': '\u03A7'
      , 'Y': '\u03A8'
      , 'W': '\u03A9'
      , "'": '\u0374'
    }
  },
  'lower': {
    'umlaut': {
      'I': '\u03CA'
      , 'U': '\u03CB'
    },
    'acute': {
      'A': '\u1F71'
      , 'E': '\u1F73'
      , 'H': '\u1F75'
      , 'I': '\u1F77'
      , 'O': '\u1F79'
      , 'U': '\u1F7B'
      , 'W': '\u1F7D'
      , 'iota': {
          'A': '\u1FB4'
          , 'H': '\u1FC4'
          , 'W': '\u1FF4'
        }
      , 'umlaut': {
          'I': '\u1FD3'
          , 'E': '\u1FE3'
        }
    },
    'grave': {
      'A': '\u1F70'
      , 'E': '\u1F72'
      , 'H': '\u1F74'
      , 'I': '\u1F76'
      , 'O': '\u1F78'
      , 'U': '\u1F7A'
      , 'W': '\u1F7C'
      , 'iota': {
          'A': '\u1FB2'
          , 'H': '\u1FC2'
          , 'W': '\u1FF2'
        }
      , 'umlaut': {
          'I': '\u1FD2'
          , 'E': '\u1FE2'
        }
    },
    'circumflex': {
      'A': '\u1FB6'
      , 'H': '\u1FC6'
      , 'I': '\u1FD6'
      , 'U': '\u1FE6'
      , 'W': '\u1FF6'
      , 'circumflex_iota': {
          'A': '\u1FB7'
          , 'H': '\u1FC7'
          , 'I': '\u1FD7'
          , 'U': '\u1FE7'
          , 'W': '\u1FF7'
        }
    },
    'rough': {
      'A': '\u1F01'
      , 'E': '\u1F11'
      , 'H': '\u1F21'
      , 'I': '\u1F31'
      , 'O': '\u1F41'
      , 'U': '\u1F51'
      , 'W': '\u1F61'
      , 'R': '\u1FE4'
      , 'iota': {
          'A': '\u1F81'
          , 'H': '\u1F91'
          , 'W': '\u1FA1'
        }
      , 'acute': {
          'A': '\u1F05'
          , 'E': '\u1F15'
          , 'H': '\u1F25'
          , 'I': '\u1F35'
          , 'O': '\u1F45'
          , 'U': '\u1F55'
          , 'W': '\u1F65'
          , 'iota': {
              'A': '\u1F85'
              , 'H': '\u1F95'
              , 'W': '\u1FA5'
            }
        }
      , 'grave': {
          'A': '\u1F03'
          , 'E': '\u1F13'
          , 'H': '\u1F23'
          , 'I': '\u1F33'
          , 'O': '\u1F43'
          , 'U': '\u1F53'
          , 'W': '\u1F63'
          , 'iota': {
              'A': '\u1F823'
              , 'H': '\u1F93'
              , 'W': '\u1FA3'
            }
        }
      , 'circumflex': {
          'A': '\u1F07'
          , 'H': '\u1F27'
          , 'I': '\u1F37'
          , 'U': '\u1F57'
          , 'W': '\u1F67'
          , 'iota': {
              'A': '\u1F87'
              , 'H': '\u1F97'
              , 'W': '\u1FA7'
            }
        }
    },
    'smooth': {
      'A': '\u1F00'
      , 'E': '\u1F10'
      , 'H': '\u1F20'
      , 'I': '\u1F30'
      , 'O': '\u1F40'
      , 'U': '\u1F50'
      , 'W': '\u1F60'
      , 'R': '\u1FE5'
      , 'iota': {
          'A': '\u1F80'
          , 'H': '\u1F90'
          , 'W': '\u1FA0'
        }
      , 'acute': {
          'A': '\u1F04'
          , 'E': '\u1F14'
          , 'H': '\u1F24'
          , 'I': '\u1F34'
          , 'O': '\u1F44'
          , 'U': '\u1F54'
          , 'W': '\u1F64'
          , 'iota': {
              'A': '\u1F84'
              , 'H': '\u1F94'
              , 'W': '\u1FA4'
            }
        }
      , 'grave': {
          'A': '\u1F02'
          , 'E': '\u1F12'
          , 'H': '\u1F22'
          , 'I': '\u1F32'
          , 'O': '\u1F42'
          , 'U': '\u1F52'
          , 'W': '\u1F62'
          , 'iota': {
              'A': '\u1F82'
              , 'H': '\u1F92'
              , 'W': '\u1FA2'
            }
        }
      , 'circumflex': {
          'A': '\u1F06'
          , 'H': '\u1F26'
          , 'I': '\u1F36'
          , 'U': '\u1F56'
          , 'W': '\u1F66'
          , 'iota': {
              'A': '\u1F86'
              , 'H': '\u1F96'
              , 'W': '\u1FA6'
            }
        }
    },
    'final': {
      'S': '\u03DB'
    },
    'none': {
      'A': '\u03B1'
      , 'B': '\u03B2'
      , 'G': '\u03B3'
      , 'D': '\u03B4'
      , 'E': '\u03B5'
      , 'Z': '\u03B6'
      , 'H': '\u03B7'
      , 'Q': '\u03B8'
      , 'I': '\u03B9'
      , 'K': '\u03BA'
      , 'L': '\u03BB'
      , 'M': '\u03BC'
      , 'N': '\u03BD'
      , 'C': '\u03BE'
      , 'O': '\u03BF'
      , 'P': '\u03C0'
      , 'R': '\u03C1'
      , 'S': '\u03C3'
      , 'T': '\u03C4'
      , 'U': '\u03C5'
      , 'F': '\u03C6'
      , 'X': '\u03C7'
      , 'Y': '\u03C8'
      , 'W': '\u03C9'
      , "'": '\u0374'
    }
  }
};

module.exports = glyphs;
