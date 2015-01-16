/**
 * Created by per on 15-01-04.
 */
(function () {
    const urlProvider = require("./urlProvider");
    // const windowUtils = require("sdk/window/utils");
    const {Cc, Ci, Cu} = require("chrome");
    Cu.import("resource:///modules/gloda/index_msg.js");
    Cu.import("resource:///modules/gloda/mimemsg.js");
    Cu.import("resource://gre/modules/Services.jsm");
    Cu.import("resource://gre/modules/NetUtil.jsm");
    const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    /**
     *
     */
    const dumpMsgHdr = function () {
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
                        else if (part instanceof MimeContainer) {
                            dump("part instanceof MimeContainer");
                            dump("\n");
                            for (part2 of part.parts) {
                                if (part2 instanceof MimeBody) {
                                    // Plain text message
                                    dump("part2 instanceof MimeBody");
                                    dump("\n");
                                    dump(part2.body);
                                    dump("\n");
                                }
                            }
                        }
                    }
                }, true);
            }
        }
    };

    /**
     *
     * @returns {{init: Function}}
     * @constructor
     */
    const DccUi = function () {
        const init = function () {
            const xulWindows = Services.wm.getXULWindowEnumerator(null);
            while (xulWindows.hasMoreElements()) {
                const xulWindow = xulWindows.getNext();
                const domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
                const document = domWindow.document;
                const unreadMessageCount = document.getElementById("unreadMessageCount");
                if (unreadMessageCount) {
                    const statusbarpanel = document.createElementNS(NS_XUL, "statusbarpanel");
                    statusbarpanel.id = "dccStatusBarPanel";
                    statusbarpanel.tooltipText = "Direct Currency Converter";
                    // TODO show window with message instead
                    statusbarpanel.onclick = dumpMsgHdr;
                    const statusbarimage = document.createElementNS(NS_XUL, "image");
                    statusbarimage.setAttribute("src", urlProvider.getUrl("images/1402781551_currency_exchange_1.png"));
                    statusbarpanel.appendChild(statusbarimage);
                    unreadMessageCount.parentNode.insertBefore(statusbarpanel, unreadMessageCount);
                }
            }
        };
        /**
         * @param aReason
         */
        const onUnload = function (aReason) {
            const xulWindows = Services.wm.getXULWindowEnumerator(null);
            while (xulWindows.hasMoreElements()) {
                const xulWindow = xulWindows.getNext();
                const domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
                const document = domWindow.document;
                // status-bar usually contains statusTextBox and unreadMessageCount
                const statusBar = document.getElementById("status-bar");
                if (statusBar) {
                    while (statusbarpanel = document.getElementById("dccStatusBarPanel")) {
                        if (statusbarpanel) {
                            statusBar.removeChild(statusbarpanel);
                        }
                    }
                }
            }
        };
        const systemUnload = require("sdk/system/unload");
        systemUnload.when(onUnload);
        return {
            init: init
        }
    };

    /**
     *
     * @returns {{init: Function}}
     * @constructor
     */
    const DccController = function () {
        const dccUi = new DccUi();
        const init = function () {
            dccUi.init();
        };
        return {
            init: init
        }
    };

    const dccController = new DccController();
    dccController.init();

})();