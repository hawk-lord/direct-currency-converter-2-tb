 /**
  * Created by per on 15-01-04.
  */
 (function () {
     const urlProvider = require("./urlProvider");
     const systemUnload = require("sdk/system/unload");
     const windowUtils = require("sdk/window/utils");
     const {Cc, Ci, Cu} = require("chrome");
     Cu.import("resource:///modules/gloda/index_msg.js");
     Cu.import("resource:///modules/gloda/mimemsg.js");
     Cu.import("resource://gre/modules/Services.jsm");
     Cu.import("resource://gre/modules/NetUtil.jsm");
     const xulWindows = Services.wm.getXULWindowEnumerator(null);
     const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

     /**
      *
      */
     const dumpMsgHdr = function() {
         const xulWindows = Services.wm.getXULWindowEnumerator(null);
         while (xulWindows.hasMoreElements()) {
             const xulWindow = xulWindows.getNext();
             const domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
             const msgHdr = domWindow.gFolderDisplay.selectedMessage;
             if (msgHdr) {
                 MsgHdrToMimeMessage(msgHdr, null, function (aMsgHdr, aMimeMessage) {
                     dump(aMimeMessage.prettyString());
                     dump("\n");
                     dump(aMimeMessage.allUserAttachments.length);
                     dump("\n");
                     dump(aMimeMessage.size);
                     dump("\n");
                     dump(aMimeMessage.parts);
                     dump("\n");
                     for (part of aMimeMessage.parts) {
                         dump(part);
                         dump("\n");
                         if (part instanceof MimeBody) {
                             // Plain text message
                             dump("part instanceof MimeBody");
                             dump("\n");
                             dump(part.body);
                             dump("\n");
                             // Won't show in TB
                             part.body = part.body.toUpperCase();
                             dump(part.body);
                             dump("\n");
                         }
                     }
                 }, true);
             }
         }
     };

     /**
      *
      */
     const onLoad = function() {
         while (xulWindows.hasMoreElements()) {
             const xulWindow = xulWindows.getNext();
             const domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
             const document = domWindow.document;
             // statusBar contains statusTextBox and unreadMessageCount
             const statusBar = document.getElementById("status-bar");
             const unreadMessageCount = document.getElementById("unreadMessageCount");
             if (unreadMessageCount) {
                 const statusbarpanel = document.createElementNS(NS_XUL, "statusbarpanel");
                 statusbarpanel.id = "dcc";
                 statusbarpanel.onclick = dumpMsgHdr;
                 const statusbarimage = document.createElementNS(NS_XUL, "image");
                 statusbarimage.setAttribute("src", urlProvider.getUrl("images/1402781551_currency_exchange_1.png"));
                 statusbarpanel.appendChild(statusbarimage);
                 unreadMessageCount.parentNode.insertBefore(statusbarpanel, unreadMessageCount);
             }
         }
     };

     /**
      *
      * @param aReason
      */
     const onUnload = function(aReason){
         const xulWindows = Services.wm.getXULWindowEnumerator(null);
         while (xulWindows.hasMoreElements()) {
             const xulWindow = xulWindows.getNext();
             const domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
             const document = domWindow.document;
             const statusBar = document.getElementById("status-bar");
             if (statusBar) {
                 while (statusbarpanel = document.getElementById("dcc")) {
                     if (statusbarpanel) {
                         statusBar.removeChild(statusbarpanel);
                     }
                 }
             }
         }
     };

     systemUnload.when(onUnload);

     onLoad();

 })();