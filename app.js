var css = require('css');
var fs = require('fs');
var fileName = 'source.css';
var outputFilename = 'my.json';

var stringContains = function(inputString, searchForCharacter) {
    if(inputString.indexOf(searchForCharacter) !== -1) {
        return true;
    } else {
        return false;
    }
};

var validate = function(inputValue) {
    console.log('inputValue: ', inputValue);
    stringContains(inputValue, '#');
};


var selectorsArray = [];

fs.exists(fileName, function(exists) {
    if (exists) {
        fs.stat(fileName, function(error, stats) {
            fs.open(fileName, "r", function(error, fd) {
                var buffer = new Buffer(stats.size);

                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                    var data = buffer.toString("utf8", 0, buffer.length);

                    //console.log(data);
                    var parsedCSS = css.parse(data, { source: fileName });
                    //console.log('parsedCSS: ', parsedCSS.stylesheet);

                    var rules = parsedCSS.stylesheet.rules;

                    var i, rule, feedback = 0;

                    for (i = rules.length; i--;) {
                        if(rules[i].type === 'rule') {
                            var rule = rules[i];
                            var ruleObj = {};
                            ruleObj.feedback = {};

                            if(stringContains(rule.selectors.toString(), '#')) {
                                ruleObj.feedback.hash = true;
                            }
                            if(stringContains(rule.selectors.toString(), '>')) {
                                ruleObj.feedback.higherThan = true;
                            }

                            if (typeof ruleObj.feedback === 'undefined' || Object.keys(ruleObj.feedback).length === 0) {
                                delete ruleObj.feedback;
                            } else {
                                console.log('Feedback before: ', feedback);
                                ruleObj.selector = rule.selectors.toString();
                                ruleObj.line = rule.position.start.line;
                                ruleObj.source = rule.position.source;
                                selectorsArray.push(ruleObj);
                            }
                        }
                    }

                    fs.writeFile(outputFilename, JSON.stringify(selectorsArray.reverse()), function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("JSON saved to " + outputFilename);
                        }
                    });
                    fs.writeFile('css.json', JSON.stringify(parsedCSS), function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("JSON saved to " + 'css.json');
                        }
                    });
                    console.log("JSON saved to " + selectorsArray.length);

                    fs.close(fd);
                });
            });
        });
    }
});

//result.code; // string with CSS
//result.map // source map object