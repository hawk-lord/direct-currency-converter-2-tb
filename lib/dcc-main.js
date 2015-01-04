 /**
  * Created by per on 15-01-04.
  */
 (function () {
     console.error("Hello world");

     const {Cc, Ci, Cu} = require("chrome");

     console.error("Cc " + Cc);

     Cu.import("resource:///modules/gloda/index_msg.js");
     Cu.import("resource:///modules/gloda/mimemsg.js");
     Cu.import("resource://gre/modules/Services.jsm");
     Cu.import("resource://gre/modules/NetUtil.jsm");

     const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

     let xulWindows = Services.wm.getXULWindowEnumerator(null);
     console.error("xulWindows " + xulWindows);

     const urlProvider = require("./urlProvider");

     while (xulWindows.hasMoreElements()) {
         let xulWindow = xulWindows.getNext();
         console.error("xulWindow " + xulWindow);
         let domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
         let document = domWindow.document;
         // statusBar contains statusTextBox and unreadMessageCount
         let statusBar = document.getElementById("status-bar");
         let unreadMessageCount = document.getElementById("unreadMessageCount");
         if (unreadMessageCount) {
             const statusbarpanel = document.createElementNS(NS_XUL, "statusbarpanel");
             console.error("statusbarpanel " + statusbarpanel);
             statusbarpanel.id = "dcc";
             const statusbarimage = document.createElementNS(NS_XUL, "image");
             statusbarimage.setAttribute("src", urlProvider.getUrl("images/1402781551_currency_exchange_1.png"));
             statusbarpanel.appendChild(statusbarimage);
             unreadMessageCount.parentNode.insertBefore(statusbarpanel, unreadMessageCount);
         }

     }

 })();