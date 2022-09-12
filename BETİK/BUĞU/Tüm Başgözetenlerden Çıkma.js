// ==UserScript==
// @author       𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @copyright    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @namespace    𐱅𐰭𐰼𐰃:𐰸𐰆𐱃:𝟏𝟗𝟐𝟑
// @license      Ödeksiz
// @name         [Buğu] Tüm Başgözetenlerden Çıkma
// @homepageURL  https://www.tengrikut1923.com/
// @supportURL   https://www.tengrikut1923.com/
// @version      s1923
// @description  TengriKut1923.com
// @grant        GM_addStyle
// @icon         https://store.steampowered.com/favicon.ico
// @include      https://store.steampowered.com/curators/mycurators/*
// @downloadURL  https://github.com/TengriKut1923/YAZILIM/tree/main/BET%C4%B0K/BU%C4%9EU
// ==/UserScript==

(function() {
	'use strict';
	try {
		let btn = document.createElement('input');
		btn.id = "btnUnSub"
		btn.type='button';
		btn.value='Tümünden Çık';
		btn.onclick = unSub;
		document.body.append(btn);
		btn.setAttribute('style','top:110px;');

		function unSub() {
			let yesNo = confirm('Tüm başgözetenlerden çıkmak istiyor musunuz?');
			if (yesNo) {
				var allCurators = getCount(); var count = 0;
				for (let cd in gFollowedCuratorIDs) {
					++count;
				}
				count = Math.floor(count / 10);

				for (var i = 0; i < count; i++) {
					setTimeout(function() {
						document.all.footer.scrollIntoView(true);
					}, 1200 * (i));
				}

				allCurators = getCount();
				setTimeout(function() { for (let i = 0; i < allCurators.length; i++) {
					allCurators[i].click();
					process(i);
				}}, (count) * 1500);

				function process(i) {
					setTimeout(function() {
						ShowBlockingWaitDialog('Çıkılıyor...',`Tümünden Çık ${i+1}/${allCurators.length}`);
						if (i+1 == allCurators.length) {
							ShowDialog('Bitti!',`${allCurators.length} başgözetenden başarıyla çıktınız.`);
							location.reload();
							return;
						}
					}, 90 * i);
				}

				function getCount(allCurators) {
					allCurators = document.getElementsByClassName('following_button btn_green_steamui btn_medium');
					return allCurators;
				}
			}
		}

		GM_addStyle ( `
		 #btnUnSub {
			position: absolute;
			right: 10px;
			font-size: 18px;
			background-color: white;
			color:#273d52;
			border: 1px solid green;
			padding:5px;
			cursor: pointer;
			width: 130px;
		 }
		 #btnUnSub:hover {
			background-color: #4CAF50;
			color: white;
		 }
	   ` );
	}
	catch(e) {
		console.error(e)
	}
})();