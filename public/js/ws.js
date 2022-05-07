//const data = require("../../models/data");

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
$(function() {
  myOnresize();
});
$( window ).resize(function () {
  myOnresize();
});
function myOnresize() {
  console.log("myOnresize")
  $("html,body").scrollTop(($( ".shape" ).height()+200 - $( window ).height())/2)
  $("html,body").scrollLeft(($( ".shape" ).width()+200 - $( window ).width())/2)
}
(async function() {

    const ws = await connectToServer();    

    var buyModal = new bootstrap.Modal(document.getElementById('buyModal'), {
      keyboard: false
    });

    ws.onmessage = (webSocketMessage) => {
      console.log("onmessage")
      const messageBody = JSON.parse(webSocketMessage.data);
      console.log(messageBody)
      if (!is_admin) {
        if (messageBody.status !== false && messageBody.status!==true) {
          $("#nft"+messageBody.buy_id).html('<a class="buttonfull" href="#" data-id="'+messageBody.buy_id+'">'+messageBody.buy_id+'</a>');
          $(".buttonfull").click(function(e){
            e.preventDefault()
            $("#nft").html($(this).data("id"))
            $("#email").val("");
            $("#buyModal .alert").addClass("d-none").html("")
            buyModal.show()
          });
        } else {
          $("#nft"+messageBody.buy_id).html('<div class="'+(messageBody.status===true ? "comprato" : "prenotato")+'">'+messageBody.buy_id+'</div>');
          if (messageBody.status === false) {
            var date = new Date();
            console.log("createdAt")
            console.log(date)
        
            setMyIntervan(messageBody.buy_id, delay * 60 * 1000);
    
          }
        }
        buyModal.hide()
      } 
    };        
    
    $(".buttonfull").click(function(e){
      e.preventDefault()
      $("#nft").html($(this).data("id"))
      $("#email").val("");
      $("#buyModal .alert").addClass("d-none").html("")
      buyModal.show()
    });

    $(".adminstatus").click(function(e){
      e.preventDefault()
      var id = $(this).data("id");
      var buy_id = $(this).data("buy_id");
      var status = $(this).is(':checked');
      console.log({ action: "UPDATEDATA", buy_id: buy_id, status: status })
      if (buy_id && id) {
        const messageBody = { action: "UPDATEDATA", buy_id: buy_id, id: id, status: status };
        ws.send(JSON.stringify(messageBody));
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
          //ws.send(JSON.stringify(messageBody));
        })
        .fail(function(error) {
          console.log( "error" );
          $("#buyModal .alert").removeClass("d-none").html(error.responseJSON.message)
          console.log(error)
        });
      }
    }
    if (!is_admin) {
      var intervals = {};
      class interval {
        constructor(buy_id, ms) {
          var i = setInterval(()=>{
            const messageBody = { action: "EXPIREDATA", buy_id: buy_id };
            console.log(messageBody);
            ws.send(JSON.stringify(messageBody));
            clearInterval(i)
          }, ms);
        }
      }
      function setMyIntervan(buy_id, ms) {
        intervals[buy_id] = new interval(buy_id, ms)
      }
      console.log("datadatadatadatadatadata")
      console.log(data)
      for (var a = 0 ; a<data.length; a++) {
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
  
        setMyIntervan(data[a].buy_id, spegni);
        console.log(spegni)
      }
  
    }
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
})();
