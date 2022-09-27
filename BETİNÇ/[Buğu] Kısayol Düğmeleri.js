// ==UserScript==
// @author       𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @copyright    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @namespace    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @license      Ödeksiz
// @name         [Buğu] Kısayol Düğmeleri
// @homepageURL  https://www.tengrikut1923.com/
// @supportURL   https://www.tengrikut1923.com/
// @version      s1923
// @description  TengriKut1923.com
// @match        *://store.steampowered.com/*
// @match        *://steamcommunity.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @icon         https://store.steampowered.com/favicon.ico
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @downloadURL  https://github.com/TengriKut1923/YAZILIM/tree/main/BET%C4%B0K/BU%C4%9EU
// ==/UserScript==

/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}

(function($, undefined) {
    'use strict';

    // ASCII number or "a" letter
    var Hotkeys = new Map([
        ["ADD_TO_WISHLIST", "d"],
        ["NOT_INTERESTED", "x"],
        ["NEXT_QUEUE", ["f", ""]],
        ["CLICK_REVIEWS", "v"],
        ["INVENTORY", "z"],
        ["PROFILE", "r"],
        ["ACTIVITY", "a"],
        ["CHAT", "s"],
        ["HOME", "e"],
        ["EXPLORE", "c"],
    ]);

    var Settings = {
        "ONE_CLICK_ADVANCE": true,
        "HOTKEYS_ENABLED": true,
        "TO_TOP_ON_ACTION": true,
        "DISCOVERY_QUEUE": [],
        "VIEW_COUNT": 0,
        "NOT_INTERESTEDS": [],
        "WISHLISTED": [],
    };

    // Flag so the request to remove the game from the queue is only sent once
    var APPID_CLEARED = false;
    var Appid;
    try {
        Appid = parseInt(window.location.pathname.split('/')[2]);
    }catch(err){}

    function loadSettings() {
        if (GM_getValue("Settings") === undefined)
            return;
        const savedsettings = JSON.parse(GM_getValue("Settings"));
        for (const k of Object.keys(Settings)) {
            if (k in savedsettings)
                Settings[k] = savedsettings[k];
        }
    }

    function saveSettings() {
        GM_setValue("Settings", JSON.stringify(Settings));
    }

    // Returns true if currently browsing a queue
    function pageInQueue() {
        return Boolean(document.querySelector("div.next_in_queue_content"));
    }

    function clickNextQueue() {
        document.querySelectorAll("div.btn_next_in_queue, #refresh_queue_btn, .queue_actions_ctn a[href='http://store.steampowered.com/explore/']")[0].click();
    }

    function clearAppId(appId, callback) {
        if (APPID_CLEARED)
            return;
        APPID_CLEARED = true;
        $.post(window.location.protocol + '//store.steampowered.com/app/60', {
            appid_to_clear_from_queue: appId,
            sessionid: g_sessionID
        }).done(callback).fail(function(){
            APPID_CLEARED = false;
        });
    }

    function finishAppPage(appId) {
        clearAppId(appId, function(){});
    }

    function isInQueue(appId) {
        return Settings.DISCOVERY_QUEUE.indexOf(appId) !== -1;
    }

    function keyAddToWishlist() {
        if (Settings.TO_TOP_ON_ACTION)
            window.scrollTo(0, 0);
        let rm = document.querySelector("#add_to_wishlist_area_success:not([style*='none'])");
        let add = document.querySelector("#add_to_wishlist_area:not([style*='none']) a");
        (rm || add).click();
        if (Settings.ONE_CLICK_ADVANCE && pageInQueue()) {
            if (isInQueue(Appid)) {
                finishAppPage(Appid);
            } else {
                // Wait for the http request to finish processing adding/removing it
                let keyElement;
                if (rm !== null)
                    keyElement = "#add_to_wishlist_area:not([style*='none']) a";
                else if (add !== null)
                    keyElement = "#add_to_wishlist_area_success:not([style*='none'])";
                waitForKeyElements(keyElement, clickNextQueue, true);
            }
        }
    }

    function keyNotInterested() {
        if (Settings.TO_TOP_ON_ACTION)
            window.scrollTo(0, 0);
        document.querySelector("div.queue_btn_ignore div:not([style*='none'])").click();
        if (Settings.ONE_CLICK_ADVANCE && pageInQueue()) {
            if (isInQueue(Appid))
                finishAppPage(Appid);
            else
                waitForKeyElements("div.queue_btn_active:not([style*='none'])", clickNextQueue, true);
        }
    }

    function doc_keyUp(e) {
        if (!Settings.HOTKEYS_ENABLED)
            return;
        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)
            return;
        if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')
            return;
        if (Hotkeys.get("ADD_TO_WISHLIST").indexOf(e.keyCode) !== -1) {
            keyAddToWishlist();
        } else if (Hotkeys.get("NOT_INTERESTED").indexOf(e.keyCode) !== -1) {
            keyNotInterested();
        } else if (Hotkeys.get("NEXT_QUEUE").indexOf(e.keyCode) !== -1) {
            if (pageInQueue() || document.querySelector("#refresh_queue_btn") !== null)
                clickNextQueue();
            else
                location.href = window.location.protocol + "//store.steampowered.com/explore/";
        } else if (Hotkeys.get("CLICK_REVIEWS").indexOf(e.keyCode) !== -1) {
            if (checkVisible(document.getElementById("app_reviews_hash"), 20, "below"))
                location.href = "#app_reviews_hash";
            else
                window.scrollTo(0, 0);
        } else if (Hotkeys.get("INVENTORY").indexOf(e.keyCode) !== -1) {
            location.href = window.location.protocol + "//steamcommunity.com/my/inventory/";
        } else if (Hotkeys.get("PROFILE").indexOf(e.keyCode) !== -1) {
            location.href = window.location.protocol + "//steamcommunity.com/my/profile/";
        } else if (Hotkeys.get("ACTIVITY").indexOf(e.keyCode) !== -1) {
            location.href = window.location.protocol + "//steamcommunity.com/my/home/";
        } else if (Hotkeys.get("CHAT").indexOf(e.keyCode) !== -1) {
            location.href = window.location.protocol + "//steamcommunity.com/chat/";
        } else if (Hotkeys.get("HOME").indexOf(e.keyCode) !== -1) {
            location.href = window.location.protocol + "//store.steampowered.com/";
        } else if (Hotkeys.get("EXPLORE").indexOf(e.keyCode) !== -1) {
            location.href = window.location.protocol + "//store.steampowered.com/explore/";
            //location.href = "https://store.steampowered.com/explore/next"; // Go right to the first item
        }
    }

    // Adds settings to the Customize your queue dialog box
    function addHotkeySettings() {
        const enableChecked = Settings.HOTKEYS_ENABLED ? `checked="checked"` : ``;
        const autoAdvance = Settings.ONE_CLICK_ADVANCE ? `checked="checked"` : ``;
        const topOnAction = Settings.TO_TOP_ON_ACTION ? `checked="checked"` : ``;
        var HotKeysSettings = `<div style="float:right; width:50%"><div class="dq_settings_section_title">Seçenekler:</div>
<div class="dq_settings_checkrow"><input type="checkbox" id="sdqhotkeys_enabled" ${enableChecked}><label for="sdqhotkeys_enabled">Kısayol düğmelerini etkinleştirme.</label></div>
<div class="dq_settings_checkrow"><input type="checkbox" id="sdqhotkeys_autoadvance" ${autoAdvance}><label for="sdqhotkeys_autoadvance" title="Dilek dizmesine ekledikten azu ilgilenmiyorum olarak imledikten sonra özden olarak bir ileride bulunan oyuna git.">Özden ilerleme.</label></div>
<div class="dq_settings_checkrow"><input type="checkbox" id="sdqhotkeys_toponaction" ${topOnAction}><label for="sdqhotkeys_autoadvance" title="Dilek dizmesine ekledikten azu ilgilenmiyorum olarak imledikten sonra betin en üstüne git.">Başa çık.</label></div>
</div>`;
        $(HotKeysSettings).prependTo($("div.dq_settings_content div.dq_settings_section:first"));
        $("#sdqhotkeys_enabled").change(function(){ Settings.HOTKEYS_ENABLED = Boolean(this.checked); saveSettings(); });
        $("#sdqhotkeys_autoadvance").change(function(){ Settings.ONE_CLICK_ADVANCE = Boolean(this.checked); saveSettings(); });
        $("#sdqhotkeys_toponaction").change(function(){ Settings.TO_TOP_ON_ACTION = Boolean(this.checked); saveSettings(); });
    }

    function checkVisible(elm, threshold, mode) {
        threshold = threshold || 0;
        mode = mode || 'visible';

        var rect = elm.getBoundingClientRect();
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        var above = rect.bottom - threshold < 0;
        var below = rect.top - viewHeight + threshold >= 0;

        return mode === 'above' ? above : (mode === 'below' ? below : !above && !below);
    }

    function handleQueue(queue) {
        Settings.DISCOVERY_QUEUE = queue;
        saveSettings();
        queue.forEach(function(appId) {
            GM_openInTab(window.location.protocol + "//store.steampowered.com/app/" + appId);
        });
        $(`#sh_message`).text("Done");
        setTimeout(function(){
            $(`#sh_tabscontainer .btnv6_lightblue_blue`).fadeIn("slow");
        }, 3000);
    }

    function discoverEmbedded() {
        try {
            const queue = JSON.parse($("script").text().match(/CDiscoveryQueue\(\s+\S+\s+(\S+),/)[1]);
            if (queue.length > 0) {
                handleQueue(queue);
                return false;
            }
        } catch(err) {}
        return true;
    }

    function loadQueueFromPage() {
        $(`#sh_message`).text("Bet yükleniyor...");
        $.get(window.location.protocol + "//store.steampowered.com/explore/")
        .done(function(resp){
            const q = JSON.parse($(resp).find("script").text().match(/CDiscoveryQueue\(\s+\S+\s+(\S+),/)[1]);
            handleQueue(q);
        })
        .fail(function(){
            $(`#sh_message`).text("Dilek başarısız: " + errorThrown);
            $(`#sh_tabscontainer .btnv6_lightblue_blue`).fadeIn("slow");
        });
    }

    function fastDiscover() {
        $(`#sh_tabscontainer .btnv6_lightblue_blue`).hide();
        if (!discoverEmbedded())
            return;
        $.ajaxSetup({
            timeout: 5000
        });
        $(`#sh_message`).text("JSON yükleniyor...");
        $.post(window.location.protocol + '//store.steampowered.com/explore/generatenewdiscoveryqueue', {
            sessionid: g_sessionID,
            queuetype: 0
        }).done(function(data) {
            handleQueue(data.queue);
        }).fail(loadQueueFromPage);
    }

    function main() {
        // Convert string hotkeys to char codes
        for (let [key, value] of Hotkeys) {
            if (!Array.isArray(value))
                value = [value];
            for (let i = 0; i < value.length; i++) {
                if (typeof value[i] === 'string')
                    value[i] = value[i].toUpperCase().charCodeAt(0);
            }
            Hotkeys.set(key, value);
        }

        loadSettings();
        waitForKeyElements("div.dq_settings_content", addHotkeySettings, false);

        window.addEventListener('keydown', doc_keyUp, false);

        if (window.location.href.match(/store\.steampowered\.com\/explore\/?/)) {
            var newB = $(`<div id="sh_tabscontainer" style="text-align: center"><div id="sh_message"></div>`+
                `<div class="btnv6_lightblue_blue btn_medium"><span>Sekemlerde dizimli aç.</span></div></div>`);
            newB.find(".btnv6_lightblue_blue:first").click(fastDiscover);
            newB.appendTo(".discovery_queue_apps");
        }

        if (Appid !== undefined && isInQueue(Appid)) {
            $("#add_to_wishlist_area,#add_to_wishlist_area_success,.queue_btn_follow,.queue_btn_ignore").click(function(){
                finishAppPage(Appid);
            });
        }
    }

    main();
})(jQuery);
