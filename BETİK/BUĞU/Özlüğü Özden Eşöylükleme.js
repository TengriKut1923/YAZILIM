// ==UserScript==
// @author       𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @copyright    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @namespace    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @license      Ödeksiz
// @name         [Buğu] Özlüğü Özden Eşöylükleme
// @homepageURL  https://www.tengrikut1923.com/
// @supportURL   https://www.tengrikut1923.com/
// @version      s1923
// @description  TengriKut1923.com
// @include      *steamgifts.com*
// @grant        GM_xmlhttpRequest
// @connect      store.steampowered.com
// @connect      royalgamer06.ga
// @icon         https://cdn.steamgifts.com/img/favicon.ico
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.js
// @downloadURL  https://github.com/TengriKut1923/YAZILIM/tree/main/BET%C4%B0K/BU%C4%9EU
// ==/UserScript==

// ==Configuration==
const syncDelay = 86400000; // Eşöylükle 86400000 = 24 * 60 * 60 * 1000 = 24 Öyün / 43200000 = 12 Öyün / 3600000 = 1 Öyün / 600000 = 10 Birin
const syncOnReceived = true; // Kazanılan ürün alındı olarak imlendikten sonra eşöylüklensin mi? (Evet = true / Yo = false)
// ==/Configuration==

// ==Code==
this.$ = this.jQuery = jQuery.noConflict(true);

$(document).ready(function() {
    const lastSyncDate = parseInt(localStorage.getItem("lastSyncDate")) || 1;
    if (Date.now() - lastSyncDate > syncDelay) {
        setTimeout(doSync, 0);
    } else if (location.href.indexOf("/giveaways/won") > -1 && syncOnReceived) {
        $(".table__gift-feedback-awaiting-reply").click(doSync);
    }
});

function doSync() {
    var xsrfToken = $(".js__logout").data("form").split("xsrf_token=")[1];
    if (xsrfToken.length > 0) {
        var data =  "xsrf_token=" + xsrfToken  + "&do=sync";
        var prevHidden = localStorage.getItem("prevHidden");
        var v = parseInt(localStorage.getItem("v")) || 2;
        if (!prevHidden) {
            prevHidden = [];
            localStorage.setItem("prevHidden", prevHidden.join(","));
        } else {
            prevHidden = prevHidden.split(",");
        }
        $.ajax({
            url: "/ajax.php",
            type: "POST",
            dataType: "json",
            data: data,
            success: function() {
                console.log("Yerel eşöylükleme bitti.");
            }
        });
        console.log("Gizli armağanlara iyesi olunan ürünler ile indirilebilir içerikleri ekleniyor...");
        console.log("Gizlenmiş:", prevHidden);
        console.log("İyesi olunan ürünlerin kimlik bilgileri toplanıyor...");
        v++;
        localStorage.setItem("v", v);
        GM_xmlhttpRequest({
            method: "GET",
            ignoreCache: true,
            url: "http://store.steampowered.com/dynamicstore/userdata/?v=" + v,
            onload: function(response) {
                const ownedApps = JSON.parse(response.responseText).rgOwnedApps;
                console.log("İyesi olunan ürünlerin kimlik bilgileri başarıyla toplandı:", ownedApps);
                console.log("Gizlenmemiş iyesi olunan ürünler ile indirilebilir içerikleri gizleniyor...");
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://royalgamer06.ga/sgdb.json",
                    ignoreCache: true,
                    onload: function(response) {
                        const sgdb = JSON.parse(response.responseText);
                        const appsToHide = ownedApps.filter(appid => sgdb.appids.hasOwnProperty(appid) && !prevHidden.includes(appid.toString()));
                        if (appsToHide.length > 0) {
                            var ajaxDone = 0;
                            appsToHide.forEach(function(a) {
                                let appid = a;
                                console.log("" + appid + "ürünün kimlik bilgileri gizleniyor...");
                                $.post("/ajax.php", { xsrf_token: xsrfToken , game_id: sgdb.appids[appid], do: "hide_giveaways_by_game_id" }, function() {
                                    ajaxDone++;
                                    prevHidden.push(appid);
                                    localStorage.setItem("prevHidden", prevHidden.join(","));
                                    console.log("" + appid + "ürünün gizli armağanlara başarıyla eklendi.");
                                    if (ajaxDone === appsToHide.length) {
                                        localStorage.setItem("lastSyncDate", Date.now());
                                        console.log("Gizli armağanlara " + ajaxDone + " ürün başarıyla eklendi!");
                                    }
                                });
                            });
                        } else {
                            console.log("Ürünlerin gizlenmesine gerek yok!");
                        }
                    }
                });
            }
        });
    } else {
        console.log("Eksik bilgi yüzünden eşöylüklenemiyor.");
    }
}
// ==/Code==