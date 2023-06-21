function updateFile(filename, replacements) {
    return new Promise(function(resolve) {
        fs.readFile(filename, 'utf-8', function(err, data) {
            var regex, replaceStr;
            if (err) {
                throw (err);
            } else {
                regex = new RegExp("(\\" + 'let' + "\\s* ]*" + replacements[0].rule + "\\s*=\\s*)([^\\n;}]+)([\\s*;}])");
                    replaceStr = "$1" + replacements[0].replacer + "$3";
                    data = data.replace(regex, replaceStr);

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
    '../../next.config.js', 
    [{
        rule: 'output',
        replacer: 'export'
    }], 
    function (err) {
        sails.log.info((err));
    }
);