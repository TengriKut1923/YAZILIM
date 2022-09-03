// ==UserScript==
// @author       𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @copyright    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @namespace    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @license      Ödeksiz
// @name         [Buğu] Ürünü Barter.vg'ye Eşöylükleme
// @homepageURL  https://www.tengrikut1923.com/
// @supportURL   https://www.tengrikut1923.com/
// @version      s1923
// @description  TengriKut1923.com
// @include      https://barter.vg/u/*/l*
// @include      https://barter.vg/u/*/b*
// @include      https://barter.vg/u/*/w*
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @icon         https://bartervg.com/imgs/ico/barter/favicon-32x32.png
// @downloadURL  https://github.com/TengriKut1923/YAZILIM/tree/main/BET%C4%B0K/BU%C4%9EU
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);
const go = function () {

    function getApps(callback)
    {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://store.steampowered.com/dynamicstore/userdata/?t=" + (new Date().getTime()),
            timeout: 5000,
            onload: function(response) {

                callback(JSON.parse(response.responseText));
            },
        });
    }

    let form = $('ul.actions');
    let syncer = $('<div>');

    // Owned
    if (window.location.pathname.indexOf('/l/') > -1)
    {
        let btnAppID = $('<button>', {'text': 'Betikliği Eşöylükle'});
        let btnAll = $('<button>', {'text': 'Betiklik ile Dürekleri Eşöylükle'});

        syncer.append(btnAppID);
        syncer.append(btnAll);

        btnAppID.click(function () {
            console.log("btnAppID clicked");

            btnAppID.attr('disabled', true);
            stop();

            getApps(function (jsonFile) {

                let appidsOwned = jsonFile.rgOwnedApps.join(",");

                let form = $('<form>', {
                    'action': 'https://barter.vg/u/my/l/e/#modified',
                    'method': 'POST',
                });

                form.append($('<input>', {'type': 'hidden', 'name': 'action', 'value': 'Edit'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'change_attempted', 'value': '1'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'add_from', 'value': 'AppIDs'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'bulk_IDs', 'value': appidsOwned}));
                form.append($('<input>', {'type': 'hidden', 'name': 'userdata', 'value': 'on'}));

                $('body').append(form);

                form.submit();

            });

        });

        btnAll.click(function () {
            console.log("btnAll clicked");

            btnAll.attr('disabled', true);
            stop();

            getApps(function (jsonFile) {

                let allOwned = "app/" + jsonFile.rgOwnedApps.join(",app/") + ",sub/" + jsonFile.rgOwnedPackages.join(",sub/");

                let form = $('<form>', {
                    'action': 'https://barter.vg/u/my/l/e/#modified',
                    'method': 'POST',
                });

                form.append($('<input>', {'type': 'hidden', 'name': 'action', 'value': 'Edit'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'change_attempted', 'value': '1'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'add_from', 'value': 'IDs'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'bulk_IDs', 'value': allOwned}));
                form.append($('<input>', {'type': 'hidden', 'name': 'userdata', 'value': 'on'}));

                $('body').append(form);

                form.submit();

            });

        });
    }

    // Blacklist
    if (window.location.pathname.indexOf('/b/') > -1)
    {
        let btnAddIgnored = $('<button>', {'text': 'Yok Sayılanları Eşöylükle'});

        syncer.append(btnAddIgnored);

        btnAddIgnored.click(function () {

            btnAddIgnored.attr('disabled', true);
            stop();

            getApps(function (jsonFile) {

                let appidsOwned = Object.keys(jsonFile.rgIgnoredApps).map(a => parseInt(a, 10));

                let form = $('<form>', {
                    'action': 'https://barter.vg/u/my/b/e/#modified',
                    'method': 'POST',
                });

                form.append($('<input>', {'type': 'hidden', 'name': 'action', 'value': 'Edit'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'change_attempted', 'value': '1'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'add_from', 'value': 'AppIDs'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'bulk_IDs', 'value': appidsOwned}));
                form.append($('<input>', {'type': 'hidden', 'name': 'userdata', 'value': 'on'}));

                $('body').append(form);

                form.submit();

            });

        });
    }

    // Wishlist
    if (window.location.pathname.indexOf('/w/') > -1)
    {
        let btnAddWishlisted = $('<button>', {'text': 'Dilek Dizmesini Eşöylükle'});

        syncer.append(btnAddWishlisted);

        btnAddWishlisted.click(function () {

            btnAddWishlisted.attr('disabled', true);
            stop();

            getApps(function (jsonFile) {

                let appidsOwned = jsonFile.rgWishlist.join(",");

                let form = $('<form>', {
                    'action': 'https://barter.vg/u/my/w/e/#modified',
                    'method': 'POST',
                });

                form.append($('<input>', {'type': 'hidden', 'name': 'action', 'value': 'Edit'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'change_attempted', 'value': '1'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'add_from', 'value': 'AppIDs'}));
                form.append($('<input>', {'type': 'hidden', 'name': 'bulk_IDs', 'value': appidsOwned}));
                form.append($('<input>', {'type': 'hidden', 'name': 'userdata', 'value': 'on'}));

                $('body').append(form);

                form.submit();

            });

        });
    }

    form.after(syncer);

};

let varCounter = 0;
let intervalId = setInterval(function() {
    if(varCounter <= 10) {
        varCounter++;
        if ($('ul.actions').length > 0) {
            //console.log("waited times 50ms: " + varCounter);
            clearInterval(intervalId);
            go();
        }
    } else {
        clearInterval(intervalId);
    }
}, 50);