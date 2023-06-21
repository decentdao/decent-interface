const fs = require('fs')

function updateFile(filename, replacement) {
    return new Promise(function(resolve) {
        fs.readFile(filename, 'utf-8', function(err, data) {
            if (err) {
                throw (err);
            } else {
                data = data.replace(replacement.rule, replacement.replacer);
                console.log("Writing to file", filename, data);
            }
            fs.writeFile(filename, data, 'utf-8', function(err) {

                if (err) {
                    throw (err);
                } else {
                    resolve();
                }
            });
        });
    })
}

updateFile(
    "next.config.js", 
    {
        rule: "output: undefined,",
        replacer: "output: 'export',"
    }
);