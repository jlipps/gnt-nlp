"use strict";

var path = require('path')
  , _ = require('underscore')
  , fs = require('fs')
  , books = require('./books').bookAbbrevList
  , tspDir = path.resolve(__dirname, "..", "data", "text")
  , jsonDir = path.resolve(__dirname, "..", "data", "text_json");

exports.convertTspToJson = function(cb) {
  _.each(books, function(book) {
    var tspPath = path.resolve(tspDir, book + '.TSP');
    var jsonPath = path.resolve(jsonDir, book + '.js');
    fs.readFile(tspPath, function(err, tspData) {
      var words = tspData.split("\n");
      var jsonWords = [];
      _.each(words, function(word) {
      });
    });
  });
};

//
//  {chapters: [
//    {verses: [
//      {
//        newParagraph: false,
//        words: [
//          {
//            translit1: *PAU=LOS,
//            translit2: *PAU=LOS,
//            pos: N-NSM,
//            strongs: 3972

if (require.main === module) {
  exports.convertTspToJson(function(err) {
    if (err) throw err;
    console.log("Done!");
  });
}
