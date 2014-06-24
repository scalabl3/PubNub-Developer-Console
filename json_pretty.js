/**
* Hat tip to PumBaa80 http://stackoverflow.com/questions/4810841/json-pretty-print-using-javascript 
* for the syntax highlighting function.
**/

jsonDisplay = {

    jsonstring : '' ,
    outputDivID : 'shpretty',
    
    outputPretty: function (jsonstring) {
        jsonstring = (jsonstring === '' ? jsonDisplay.jsonstring : jsonstring);
        e = document.getElementById("json-raw");
        e.innerHTML = jsonstring;
        // prettify spacing
        e = document.getElementById("json-pretty");  
        try {
            var pretty  = JSON.stringify(JSON.parse(jsonstring),null,2);
            shpretty = jsonDisplay.syntaxHighlight(pretty);              
            e.innerHTML = shpretty;
        }
        catch (err) {
            console.log(err);
            e.innerHTML = "<span class=\"string\">" + jsonstring + "</span>";
        }
        
        return;
        // syntaxhighlight the pretty print version
        
        //output to a div
        // This could be a one liner with jQuery 
        // - but not making assumptions about jQuery or other library being available.
        newDiv = document.createElement("pre");      
        newDiv.id = "jsonoutput";
        document.getElementById(jsonDisplay.outputDivID).appendChild(newDiv);
        newDiv = getElementById("jsonoutput");
        newDiv.innerHTML = shpretty;
    },
    
    syntaxHighlight : function (json) {
        
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                  cls = 'key';
                } else {
                  cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
}



/**
 * Example Usage
 * 
 * var myjson = // return from API or ajax call using library of choice
 *
 * // set json text
 * jsonDisplay.jsonstring = myjson;
 * 
 * // set output destination 
 * jsonDisplay.outputDivID = "myoutputdiv" ;
 * 
 * //prettify,highlight and output with set jsonstring
 * jsonDisplay.outputPretty();
 * 
 * // Output opretty highlighted by passing jsonstring into function.
 * jsonDisplay.outputPretty(myjson);
 *
 **/

var myjson = '{ "name": "Jasdeep", "age": 38 }';
myjson = "yo wassup";
    
jsonDisplay.jsonstring = myjson;
jsonDisplay.outputDivID = "myoutputdiv";
jsonDisplay.outputPretty(myjson);
