Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

var jsonDisplay = {

    jsonstring : '' ,
    outputDivID : '#msg-viewer-container',

    outputPrettyFromString: function (jsonstring) {
        jsonstring = (jsonstring === '' ? jsonDisplay.jsonstring : jsonstring);
        //e = document.getElementById(outputDivID);
        //e.innerHTML = jsonstring;
        // prettify spacing
        var e = $(jsonDisplay.outputDivID);  
        try {
            var pretty  = JSON.stringify(JSON.parse(jsonstring),null,2);
            var shpretty = jsonDisplay.syntaxHighlight(pretty);              
            e.html("<pre>" + shpretty + "</pre>");
        }
        catch (err) {
            console.log(err);
            e.html("<pre><span class=\"string\">" + jsonstring + "</span></pre>");
        }
        
        return;
    },
    outputPrettyFromObject: function (jsonobject) {
        
        //jsonobject = (jsonobject === null ? jsonDisplay.jsonobject : {});
        
        var e = $(jsonDisplay.outputDivID);
          
        try {
            var pretty  = JSON.stringify(jsonobject,null,2);
            var shpretty = jsonDisplay.syntaxHighlight(pretty);              
            e.html("<pre>" + shpretty + "</pre>");
        }
        catch (err) {
            console.log(err);
            e.html("<pre><span class=\"string\">" + jsonobject + "</span></pre>");
        }
        
        return;
        // syntaxhighlight the pretty print version
        
        //output to a div
        // This could be a one liner with jQuery 
        // - but not making assumptions about jQuery or other library being available.
        // newDiv = document.createElement("pre");      
        // newDiv.id = "jsonoutput";
        // document.getElementById(jsonDisplay.outputDivID).appendChild(newDiv);
        // newDiv = getElementById("jsonoutput");
        // newDiv.innerHTML = shpretty;
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
};

function clear_localStorage() {
  localStorage.clear();
  window.localStorage.clear();
}

function save_channel_info() {
  localStorage.setObject("channels_on", window.channels_on);
  localStorage.setObject("channels_off", window.channels_off);
}

function load_localstorage() {
  
  if (!localStorage.getItem("publishkey")) { localStorage.setItem("publishkey", "demo");}
  if (!localStorage.getItem("subscribekey")) { localStorage.setItem("subscribekey", "demo");}

  if (!localStorage.getItem("channels_on")) { localStorage.setObject("channels_on", {});}
  if (!localStorage.getItem("channels_off")) { localStorage.setObject("channels_off", {});}

  window.pubkey = localStorage.getItem("publishkey");
  window.subkey = localStorage.getItem("subscribekey");
  window.channels_on = localStorage.getObject("channels_on");
  window.channels_off = localStorage.getObject("channels_off");
  window.channel_watching = localStorage.getItem("channel_watching");  
  window.channel_watching_messages = [];
}

function activate_channel_watch(c) {
  $("#channels-on li").each( function(){ $(this).removeClass("watching");} );
  $("#channels-on li[data-channel='" + c + "']").addClass("watching");
  $("#channel-watching").text(c);
  window.channel_watching = c;
  $("#msg-list-container div").remove();
  $("#msg-viewer-container pre").remove();
  $("#msg-rawstream-container div").remove();
  localStorage.setItem("channel_watching", c);
}
function update_channel_nav() {
  
  //$("#channels-on ul li").remove();
  //$("#channels-on ul").prepend("<li><a title=\"Subscribed Channels\"><span class=\"menu-item-parent\" style=\"font-weight: bold;\">SUBSCRIBED CHANNELS</span></a></li>");
  
  $.each(window.channels_on, function(k,v) {
    
    if ($("#channels-on li[data-channel='" + k + "']").length) {
      $("#channels-on li[data-channel='" + k + "'] > a span.badge").text(v.occupants.toString());
    }
    else {
      $("#channels-on ul").append("<li data-channel=\"" + k + "\">\n<a title=\"" + k + "\"><i class=\"fa fa-lg fa-fw fa-list-ul\"></i> <span class=\"menu-item-parent\">" + k + "</span><span class=\"badge bg-color-greenLight pull-right inbox-badge\">" + v.occupants + "</span></a>\n</li>\n");
    
      $("#channels-on ul li").each(function(){
        $(this).click(function(){
          var c = $(this).attr("data-channel");
          activate_channel_watch(c);
          //console.log("clicked " + c + " channel");
        });
      }); 
    }
  });
  
  //$("#channels-off ul li").remove();
  //$("#channels-off ul").prepend("<li><a title=\"Subscribed Channels\"><span class=\"menu-item-parent\" style=\"font-weight: bold;\">OTHER CHANNELS</span></a></li>");
  
  $.each(window.channels_off, function(k,v) {    
    
    if ($("#channels-off li[data-channel='" + k + "']").length) {
      $("#channels-off li[data-channel='" + k + "'] > a span.badge").text(v.occupants.toString());
    }
    else {
      $("#channels-off ul").append("<li data-channel=\"" + k + "\">\n<a title=\"" + k + "\"><i class=\"fa fa-lg fa-fw fa-list-ul\"></i> <span class=\"menu-item-parent\">" + k + "</span><span class=\"badge bg-color-greenLight pull-right inbox-badge\">" + v.occupants + "</span></a>\n</li>\n");
    
      $("#channels-off ul li").each(function(){
        $(this).click(function(){
          var c = $(this).attr("data-channel");              
          //console.log("clicked " + c + " channel");
          subscribe(c, activate_channel_watch(c));          
        });
      });
    }
  });
}


function pull_channel_list() {
  var url_global_here_now = "http://pubsub.pubnub.com/v2/presence/sub-key/" + window.subkey + "?disable_uuids=1";
  console.log("refreshing channel list...");
  
  $.ajax({
    url: url_global_here_now,
    datatype: "json",
    beforeSend: function( xhr ) {
      xhr.overrideMimeType( "application/json" );
    }
  })
  .done(function( data ) {
    if (data.payload.channels) {
      
      $.each(data.payload.channels, function(k,v){
          var c = k;
          var occupants = v.occupancy;
          if (window.channels_on.hasOwnProperty(c)) {
            console.log("updating presence in " + c + ": " + occupants);
            window.channels_on[c].occupants = occupants;
          }
          else if (window.channels_off.hasOwnProperty(c)) {
            //console.log("updating channels_off: " + c + " with " + occupants);
            window.channels_off[c].occupants = occupants;
          }
          else {
            //console.log("adding to channels_off: " + c + " with " + occupants);
            window.channels_off[c] = { occupants: occupants };
          }          
      });
      
      save_channel_info();
      //console.log(window.channels_on);
      //console.log(window.channels_off);
      update_channel_nav();
    }
  });
}



function display_in_viewer(msg) {
  jsonDisplay.outputPrettyFromObject(msg);
}

function message_received(msg, id, channel) {
  if (channel === window.channel_watching) {
    var index = window.channel_watching_messages.push(msg) - 1;
    $("#msg-list-container").prepend("<div class=\"msg-item\" id=\"" + id + "\" data-index=\"" + index + "\"><div class=\"msg-item-content\">" + id + "</div></div>");
    $("#msg-rawstream-container").prepend("<div class=\"msg-raw-item\"><div class=\"msg-raw-item-content\">" + JSON.stringify(msg) + "</div></div>");
    
    $("#msg-list-container div.msg-item[data-index='" + index + "']").click(function(){
      display_in_viewer(window.channel_watching_messages[index]);
      $("div.msg-item").removeClass("viewing");
      $(this).addClass("viewing");      
    });
  }
}
function subscribed(c) {
  console.log("subscribed to channel: " + c);
  var occ = (window.channels_off.hasOwnProperty(c) ? window.channels_off[c].occupants : -1);
  delete window.channels_off[c];
  window.channels_on[c] = { occupants: occ };
  save_channel_info();
  update_channel_nav();
}

function subscribe(c, callback) {
  window.pubnub.subscribe({
    channel : c,
    message : function(m,e,c) { 
        message_received(m, e[1], c); 
        //console.log("Message Received: \n\tm:" + m + "\n\te:" + e[1] + "\n\tc:" + c); 
        //console.log(m);
    },
    connect : function() { subscribed(c); if (callback) { callback(); } }
  });
}

function publish_interval() {
   window.pubnub.publish({
     channel : "dev_console",
     message : { name: "Scalabl3", msg: "What's Up Developer Console", uuid: window.pubnub.uuid(), favorite_colors: [ "red", "green", "blue"], preferences: { tablet: "iPad", phone: "iPhone", papertowels: "Viva", foods: { sub: "Philly Cheesesteak", fruit: "Pineapple", cheese: "Cheddar" } } }
   });
}

function setup_previously_watching() {
  if (window.channel_watching) {
    window.pubnub.subscribe({
       channel : window.channel_watching,
       message : function(m,e,c) { 
            message_received(m, e[1], c); 
            //console.log("Message Received: \n\tm:" + m + "\n\te:" + e[1] + "\n\tc:" + c); 
            //console.log(m);
       },
       connect : function() { subscribed(window.channel_watching); }
   });
   activate_channel_watch(window.channel_watching);
  }
}

function get_realtime() {
  
   load_localstorage();
   update_channel_nav();
   
   window.pubnub = PUBNUB.init({
       publish_key   : window.pubkey,
       subscribe_key : window.subkey
   });
   
   setup_previously_watching();
   
   if (!window.channel_watching) {
     subscribe("dev_console", activate_channel_watch("dev_console"));
   }
      
   setInterval(function() {
      pull_channel_list();
   }, 7000);
   
   setInterval(function() {
      publish_interval();
   }, 1000);
}





