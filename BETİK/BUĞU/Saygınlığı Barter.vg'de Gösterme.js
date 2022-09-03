// ==UserScript==
// @author       𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @copyright    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @namespace    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @license      Ödeksiz
// @name         [Buğu] Saygınlığı Barter.vg'de Gösterme
// @homepageURL  https://www.tengrikut1923.com/
// @supportURL   https://www.tengrikut1923.com/
// @version      s1923
// @description  TengriKut1923.com
// @match        https://barter.vg/*
// @grant        GM.xmlHttpRequest
// @runat        document-end
// @nowrap
// @icon         https://cdn.steamtrades.com/img/favicon.ico
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @downloadURL  https://github.com/TengriKut1923/YAZILIM/tree/main/BET%C4%B0K/BU%C4%9EU
// ==/UserScript==

(function() {
    'use strict';
    var REPS_KEY = "stReps";
    var MIN = 60 * 1000;
    var HOUR = 12 * MIN;
    var DAY = 24 * HOUR;
    var WEEK = 7 * DAY;
    var inOffer = location.pathname.indexOf("/o/") >= 0;
    var inProfile = !!location.pathname.match(/\/u\/.*?\/$/);
    var hasProfile = location.pathname.indexOf("/u/") >= 0;
    var inMatches = location.pathname.indexOf("/m/") >= 0;

    var stReps = localStorage[REPS_KEY];
    stReps = stReps ? JSON.parse(stReps) : {};

    var $ = jQuery.noConflict();

    $(function () {
        function getSteamTradesIdAsync(barterId) {
            return new Promise((resolve, reject) => {
                GM.xmlHttpRequest({
                    url: "https://barter.vg/u/" + barterId,
                    onload: function (xhr) {
                        var href = $(xhr.responseText).find("#main aside [href^='https://www.steamtrades.com/user/']").attr("href");
                        resolve(href && href.match(/\d+/)[0]);
                    },
                    onerror: function () {
                        reject();
                    }
                });
            });
        }

        function getRepAsync(id, barterId) {
            return new Promise((resolve, reject) => {
                // leave cache 2 week
                if (stReps[id] && stReps[id].t > new Date().getTime() - 2 * WEEK) {
                    resolve(stReps[id]);
                } else {
                    // console.log("rep xhr", id, barterId);
                    GM.xmlHttpRequest({
                        url: "https://www.steamtrades.com/user/" + id,
                        onload: function (xhr) {
                            var $res = $(xhr.responseText);
                            var plus = parseInt($res.find(".increment_positive_review_count").first().text().replace(",", ""));
                            var minus = parseInt($res.find(".increment_negative_review_count").first().text().replace(",", ""));

                            if (plus == NaN || minus == NaN) {
                                resolve(null) ;
                                return;
                            }

                            stReps[id] = { p: plus, m: minus, t: new Date().getTime(), b: barterId };

                            resolve(stReps[id]);
                        },
                        onerror: function (xhr) {
                            reject();
                        }
                    });
                }
            });
        }

        var queue = [];

        function repsAttachTo ($target, steamId, barterId) {
            var rep = stReps[steamId];
            if (rep) {
                createRep(rep).appendTo($target);
            } else {
                queue.push({ element: $target, steamId: steamId, barterId: barterId });
            }
        }

        function repsAddTo ($target) {
            $target.find("a[href^='https://barter.vg/u/']").each(function () {
                var m = $(this).attr("href").match(/\/u\/(.*?)\/$/);
                if (m) {
                    var bid = m[1];
                    for (var k in stReps) {
                        if (stReps[k].b == bid) {
                            createRep(stReps[k]).appendTo(this);
                            return;
                        }
                    }

                    queue.push({ element: $(this), barterId: bid });
                }
            });
        }

        var template = '<span class="strep" title="SteamTrades.com score">( <span class="plus">+{plus}</span>, <span class="minus {hasMinus}">{minus}</span> )</span>';
        function createRep(rep) {
            if (rep) {
                return $(template.replace("{plus}", rep.p).replace("{minus}", rep.m).replace("{hasMinus}", rep.m != 0 ? "hasMinus" : ""));
            } else {
                return $('<span class="strep notfound">( none )</span>');
            }
        }

        if (hasProfile) {
            $("aside a[href^='https://www.steamtrades.com/user/']").each(function () {
                var bUrl = $("#main h1 a").attr("href");
                if (bUrl) {
                    var bid = bUrl.match(/\d+/)[0];
                    repsAttachTo(this, this.href.match(/\d+/)[0], bid);
                }
            });
        }
        if (inMatches) {
            repsAddTo($(".userinfo"));
        }
        if (inOffer) {
            $("#offerHeader [href^='https://www.steamtrades.com/user/']").each(function () {
                var bUrl = $(this).parents("tr").find("[href*='/u/']").attr("href");
                if (bUrl) {
                    var bid = bUrl.match(/\/u\/(.*?)\//)[1];
                    repsAttachTo(this, $(this).attr("href").match(/\d+/)[0], bid);
                }
            });
            $("#offers a[href^='https://steamcommunity.com/profiles/']").each(function () {
                var bUrl = $(this).prev("a[href*='/u/']").attr("href");
                if (bUrl) {
                    var bid = bUrl.match(/\/u\/(.*?)\//)[1];
                    repsAttachTo(this, $(this).attr("href").match(/\d+/)[0], bid);
                }
            });
        }

        localStorage[REPS_KEY] = JSON.stringify(stReps);

        async function nextQueue() {
            if (queue.length == 0) return;

            var e = queue.shift();
            if (!e.steamId) {
                e.steamId = await getSteamTradesIdAsync(e.barterId);
            }
            var rep = await getRepAsync(e.steamId, e.barterId)
            createRep(rep).appendTo(e.element);

            localStorage[REPS_KEY] = JSON.stringify(stReps);
            setTimeout(nextQueue, 500);
        }

        setTimeout(nextQueue, 500);

        $("<style />").text((function () {/*
    .strep { color: #777; margin-left: 5px; font-size: 90%; }
    .strep .plus { color: #090; }
    .strep .minus { color: #777; }
    .strep .minus.hasMinus { color: #d00; font-weight: bold; }
    #offerHeader { width: 115%; }
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1]).appendTo("head");

    });
})();