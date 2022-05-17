//const data = require("../../models/data");
/*
touch
wss://ted.avnode.net
8060


/* $("td").click(function (){
  let buy_id = prompt("Please enter box number", "");
  let text;
  if (buy_id == null || buy_id == "") {
    text = "User cancelled the prompt.";
  } else {
    $(this).html('<a class="buttonfull" href="#" data-id="'+buy_id+'">'+buy_id+'</a>');
    $(this).attr("id", "nft"+buy_id);
  }
}) */

function myOnresize() {
  console.log("myOnresize")
  $(".mycontainer").scrollTop(($( ".shape" ).height()+200 - $( window ).height())/2)
  $(".mycontainer").scrollLeft(($( ".shape" ).width()+200 - $( window ).width())/2)
}
var ws;
var intervals = {};
var buyModal;
class interval {
  constructor(buy_id, ms) {
    var i = setInterval(()=>{
      console.log("azione setInterval")
      console.log($("#nft"+buy_id));
      console.log($("#nft"+buy_id+" .prenotato"));
      console.log($("#nft"+buy_id+" .prenotato").length);
      if ($("#nft"+buy_id+" .prenotato").length) {
        const messageBody = { action: "EXPIREDATA", buy_id: buy_id, status: "expired" };
        console.log(messageBody);
        ws.send(JSON.stringify(messageBody));
      }
      clearInterval(i)
    }, ms);
  }
}
function setMyInterval(buy_id, ms) {
  intervals[buy_id] = new interval(buy_id, ms)
}

function connect() {
  console.log("wsdomain "+wsdomain)
  ws = new WebSocket(''+wsdomain+'/ws');

  ws.onmessage = (webSocketMessage) => {
    console.log("onmessage")
    const messageBody = JSON.parse(webSocketMessage.data);
    console.log(messageBody)
    console.log("is_admin"+is_admin)
    if (!is_admin) {
      console.log("stocazzo")
      if (messageBody.status == "expired") {
        console.log("expired")
        //if ( $("#nft"+messageBody.buy_id+" .prenotato").length) {
          $("#nft"+messageBody.buy_id).html('<a class="buttonfull" href="#" data-id="'+messageBody.buy_id+'">'+messageBody.buy_id+'</a>');
          $(".buttonfull").click(function(e){
            console.log();
            e.preventDefault()
            $("#nft").html($(this).data("id"))
            $("#email").val("");
            $("#buyModal .alert").addClass("d-none").html("")
            buyModal.show()
          });
        //} 
      } else {
        console.log("non expired")
        $("#nft"+messageBody.buy_id).html('<div class="'+messageBody.status+'">'+messageBody.buy_id+'</div>');
        if (messageBody.status == "prenotato") {
          var date = new Date();
          console.log("createdAt")
          console.log(date)
          setMyInterval(messageBody.buy_id, delay * 60 * 1000);   
        }
      }
      //buyModal.hide()
    } 
  };
  ws.onopen = function() {
    console.log('Socket is open.');
  };
  
  ws.onclose = function(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
      connect();
    }, 1000);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
  };
}  
$(function() {
  if($( ".shape" ).length) {
    myOnresize();
    $( window ).resize(function () {
      myOnresize();
    });
  }
  connect();
  buyModal = new bootstrap.Modal(document.getElementById('buyModal'), {
    keyboard: false
  });
  $(".buttonfull").click(function(e){
    e.preventDefault()
    $("#nft").html($(this).data("id"))
    $("#email").val("");
    $("#buyModal .alert").addClass("d-none").html("")
    buyModal.show()
  });

  $(".adminstatus").click(function(e){
    //e.preventDefault()
    var id = $(this).data("id");
    var buy_id = $(this).data("buy_id");
    var status = $(this).is(':checked') ? "comprato" : "prenotato";
    if (status == "prenotato") {
      var date = new Date($(this).data("date"));
      console.log("createdAt")
      console.log(date)
      //
      date = new Date(date.setTime(date.getTime()+ (delay * 60 * 1000)))
      console.log(date)

      var now = new Date().getTime()
      var spegni = date.getTime()-now
      console.log("spegni")
      console.log(spegni)
      if (spegni<0) status == "expired"
    }
    console.log({ action: "UPDATEDATA", buy_id: buy_id, status: status })
    if (buy_id && id) {
      const messageBody = { action: "UPDATEDATA", buy_id: buy_id, id: id, status: status };
      ws.send(JSON.stringify(messageBody));
      location.reload();
    } else {
      alert ("error");
    }
  })

  $(".admindelete").click(function(e){
    e.preventDefault()
    var id = $(this).data("id");
    var buy_id = $(this).data("buy_id");
    if (id) {
      const messageBody = { action: "DELETEDATA", buy_id: buy_id, id: id };
      ws.send(JSON.stringify(messageBody));
      $("#"+id).remove()
    } else {
      alert ("error");
    }
  });

  if (document.getElementById("book")) {
    document.getElementById("book").onclick = (e) => {
      e.preventDefault()
      $("#buyModal .alert").addClass("d-none").html("")
      const messageBody = { action: "SETDATA", buy_id: $("#nft").html(), email: $("#email").val() };
      console.log("messageBody")
      console.log(messageBody)
      $.ajax({
        url: "/",
        method: "POST",
        data: messageBody
      })
      .done(function(data) {
        console.log("data")
        console.log(data)
        buyModal.hide();
        //ws.send(JSON.stringify(messageBody));
      })
      .fail(function(error) {
        console.log( "error" );
        $("#buyModal .alert").removeClass("d-none").html(error.responseJSON.message)
        console.log(error)
      });
    }
  }
});
  if (!is_admin) {
    console.log("datadatadatadatadatadata")
    console.log(data)
    for (var a = 0 ; a<data.length; a++) {
      if (data[a].status == "prenotato") {
        var date = new Date(data[a].createdAt);
        console.log("createdAt")
        console.log(date)
        //
        date = new Date(date.setTime(date.getTime()+ (delay * 60 * 1000)))
        console.log("spegni")
        console.log(date)

        var now = new Date().getTime()
        var spegni = date.getTime()-now
        console.log("spegnispegni")
        console.log(spegni)

        setMyInterval(data[a].buy_id, spegni);
        console.log(spegni)
      }
    }

  }

  /*     if (document.getElementById("buttonget")) {
      document.getElementById("buttonget").onclick = (evt) => {
          const messageBody = { action: "GETDATA" };
          ws.send(JSON.stringify(messageBody));
      };
      
    }
    if (document.getElementById("buttonset")) {
      document.getElementById("buttonset").onclick = (evt) => {
        const messageBody = { action: "SETDATA", buy_id: "456", email: "g.delgobbo@flxer.net" };
        ws.send(JSON.stringify(messageBody));
      }
    }    function getOrCreateCursorFor(messageBody) {
        const sender = messageBody.sender;
        const existing = document.querySelector(`[data-sender='${sender}']`);
        if (existing) {
            return existing;
        }
        
        const template = document.getElementById('cursor');
        const cursor = template.content.firstElementChild.cloneNode(true);
        const svgPath = cursor.getElementsByTagName('path')[0];    
            
        cursor.setAttribute("data-sender", sender);
        svgPath.setAttribute('fill', `hsl(${messageBody.color}, 50%, 50%)`);    
        document.body.appendChild(cursor);

        return cursor;
    }
*/ 
/*     const ws = await connectToServer();    
    async function connectToServer() {    
      if (wsdomain) {
        console.log(''+wsdomain+'/ws')
        const ws = new WebSocket(''+wsdomain+'/ws');
        return new Promise((resolve, reject) => {
          const timer = setInterval(() => {
            if(ws.readyState === 1) {
              clearInterval(timer);
              resolve(ws);
            }
          }, 10);
        });   
      }
    }
 */


