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
        const createPopupElement = function(aDoc) {
            console.error("createPopupElement");
            this.refs = {};
            // load css style
            let css = aDoc.createElement("link");
            css.rel = "stylesheet";
            css.type = "text/css";
            css.href = "chrome://translator/skin/popup.css";
            try {
                aDoc.getElementsByTagName("head")[0].appendChild(css);
            }
            catch(err) {
                console.error(err);
            }
            console.error("created CssElement");

            // create main element
            // let popup = this.refs.popup = aDoc.createElement("div");
            let popup = aDoc.createElement("div");
            popup.id = "translator-popup";
            popup.className = "translator-theme-"; // + this.theme;
            popup.style.top = "-9999px"; // move popup off the screen but keep visible for corrent size calculations
            aDoc.getElementsByTagName("body")[0].appendChild(popup);

            let toolbar = this.refs.toolbar = aDoc.createElement("div");
            toolbar.id = "translator-popup-toolbar";
            popup.appendChild(toolbar);

            let title = aDoc.createElement("div");
            title.id = "translator-popup-title";
            title.innerHTML = "<div id='translator-popup-source-languages-wrapper'>" +
            "<ul id='translator-popup-source-languages'></ul><div id='translator-popup-source-languages-scroller'></div></div>" +
            "<div id='translator-popup-languages-direction'></div>" +
            "<div id='translator-popup-target-languages-wrapper'>" +
            "<ul id='translator-popup-target-languages'></ul><div id='translator-popup-target-languages-scroller'></div></div>";
            toolbar.appendChild(title);

            // add spring after title
            toolbar.innerHTML += "<div class='translator-popup-toolbar-spring'></div>";

            //this.resetLanguages();
            //this.resetSourceLanguage();
            //this.resetTargetLanguage();

            let copyButton = this.refs.copyButton = aDoc.createElement("a");
            copyButton.id = "translator-popup-button-copy";
            copyButton.href = "javascript:void(0);";
            // copyButton.title = $.properties.getString("copyToClipboard");
            copyButton.title = "copyToClipboard";
            toolbar.appendChild(copyButton);

            let message = this.refs.message = aDoc.createElement("div");
            message.id = "translator-popup-message";
            popup.appendChild(message);

            let notice = this.refs.notice = aDoc.createElement("div");
            notice.id = "translator-popup-notice";
            popup.appendChild(notice);

            let textarea = this.refs.textarea = aDoc.createElement("textarea");
            textarea.id = "translator-popup-textarea";
            textarea.style.display = "none";
            popup.appendChild(textarea);

            // hide main element by default (do not use css for this)
            popup.style.display = "none";

            // set copy button event listener
            // toolbar.addEventListener("click", $.bindMethod(this.toolbarClickHandler, this), false);
        };
        const showInputPanel = function () {
            console.error("showInputPanel");
            const xulWindows = Services.wm.getXULWindowEnumerator(null);
            while (xulWindows.hasMoreElements()) {
                // [xpconnect wrapped nsIInterfaceRequestor]
                const xulWindow = xulWindows.getNext();
                console.error("xulWindow " + xulWindow + " " + xulWindow.id);
                // [object ChromeWindow]
                const domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
                console.error("domWindow " + domWindow + " " + domWindow.id);
                // [object XULDocument]
                const xulDocument = domWindow.document;
                console.error("xulDocument " + xulDocument + " " + xulDocument.id);
                // createPopupElement(document);
/*
                // [object ChromeWindow]
                const chromeWindow = xulDocument.defaultView;
                if (chromeWindow == domWindow)
                    console.error("chromeWindow == domWindow ");
                if (chromeWindow === domWindow)
                    console.error("chromeWindow === domWindow ");
*/
                // createPopupElement(xulDocument);
                // [object XULElement]
                const oldPanel = xulDocument.getElementById("dcc-input-panel");
                if (oldPanel) {
                    oldPanel.parentNode.removeChild(oldPanel);
                    console.error("dcc-input-panel was already present");
                    // break;
                }
                const inputPanel = xulDocument.createElementNS(NS_XUL, "panel");
                console.error("inputPanel " + inputPanel);
                inputPanel.id = "dcc-input-panel";
                const popupSet = xulDocument.getElementById("mainPopupSet");
                try {
                    if (popupSet) {
                        popupSet.appendChild(inputPanel);
                    }
                }
                catch (err) {
                    console.error(err);
                }
                const hbox = xulDocument.createElementNS(NS_XUL, "hbox");
                hbox.setAttribute("style", "background-color:rgba(0, 100, 0, 0.5);");
                hbox.setAttribute("width", chromeWindow.outerWidth / 2);
                hbox.setAttribute("height", chromeWindow.outerHeight / 2);
                inputPanel.appendChild(hbox);
                const inputTextbox = xulDocument.createElementNS(NS_XUL, "textbox");
                console.error("inputTextbox " + inputTextbox);
                inputTextbox.id = "dcc-input-textbox";
                inputTextbox.multiline = true;
                inputTextbox.wrap = true;
                inputTextbox.flex = 1;
                inputTextbox.value = "Testing";
                hbox.appendChild(inputTextbox);

/*
                const messagepaneBox = document.getElementById("messagepanebox");
                try {
                    if (messagepaneBox) {
                        messagepaneBox.appendChild(inputPanel);
                    }
                }
                catch (err) {
                    console.error(err);
                }
*/
                const x = (chromeWindow.outerWidth - 300) / 2;
                const y = (chromeWindow.outerHeight - 150) / 2;
                console.error("left " + x);
                console.error("top " + y);
                try {
                    inputPanel.openPopup(null, null, x, y, false, false);
                }
                catch (err) {
                    console.error(err);
                }
                console.error("openPopup done");
                // select all in text box (will just focus if empty)
                // NOTE: small timeout necessary for input panel to open
                /*
                 $.Timer.timeout($.bindMethod(function() {
                 this.E('translator-input-textbox').select();
                 }, this), 200);
                 $.EventManager.trigger('inputPanelOpened');
                 */
            }
            console.error("showInputPanel done");
        };
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
                    // statusbarpanel.onclick = dumpMsgHdr;
                    statusbarpanel.onclick = showInputPanel;
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