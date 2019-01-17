/*global document Promise*/
/*prettier-ignore*/
"use strict"

var fs = require("fs-extra")
var join = require("path").join
var JSDOM = require("jsdom").JSDOM
var jsdom = new JSDOM()

global.document = jsdom.window.document

module.exports = function(dot, opts) {
  var state = dot.state

  if (state.render) {
    return
  }

  state.render = opts || {}

  dot.beforeAny("render", render)
}

function render(prop, arg, dot) {
  var promises = []

  for (var path in arg.views) {
    var file = join(arg.outDir, path)
    var output = view(prop, arg.views[path], dot)

    if (arg.outDir) {
      promises.push(writeFile(file, output))
    }
  }

  return Promise.all(promises)
}

function view(prop, arg, dot) {
  while (document.firstChild) {
    document.removeChild(document.firstChild)
  }

  dot[arg.event]({ element: document })

  return jsdom.serialize()
}

function writeFile(file, output) {
  return fs.ensureFile(file).then(function() {
    return fs.writeFile(file, output)
  })
}