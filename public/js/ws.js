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
$( window ).resize(function() {
  $(".mycontainer").scrollTop(($( ".shape" ).height() - $( window ).height())/2)
  $(".mycontainer").scrollLeft(($( ".shape" ).width() - $( window ).width())/2)
});

(async function() {

    const ws = await connectToServer();    

    var buyModal = new bootstrap.Modal(document.getElementById('buyModal'), {
      keyboard: false
    });

    ws.onmessage = (webSocketMessage) => {
      console.log("onmessage")
      const messageBody = JSON.parse(webSocketMessage.data);
      console.log(messageBody)
      $("#nft"+messageBody.buy_id).html('<div class="'+(messageBody.status===true ? "comprato" : "prenotato")+'">'+messageBody.buy_id+'</div>');
      buyModal.hide()
    };        
    
    if (document.getElementById("book")) {
      document.getElementById("book").onclick = (evt) => {
        if ($("#nft").html() && $("#email").val()) {
          const messageBody = { action: "SETDATA", buy_id: $("#nft").html(), email: $("#email").val() };
          ws.send(JSON.stringify(messageBody));
        } else {
          alert ("error");
        }
      }
    }

    $(".buttonfull").click(function(){
      $("#nft").html($(this).data("id"))
      buyModal.show()
    });

    $(".adminstatus").click(function (){
      var buy_id = $(this).attr("id");
      var status = $(this).is(':checked');
      console.log({ action: "UPDATEDATA", buy_id: buy_id, status: status })
      if (buy_id) {
        const messageBody = { action: "UPDATEDATA", buy_id: buy_id, status: status };
        ws.send(JSON.stringify(messageBody));
      } else {
        alert ("error");
      }
  })

    async function connectToServer() {    
        const ws = new WebSocket('ws://localhost:7071/ws');
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if(ws.readyState === 1) {
                    clearInterval(timer);
                    resolve(ws);
                }
            }, 10);
        });   
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
