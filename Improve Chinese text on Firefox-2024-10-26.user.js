// ==UserScript==
// @name         Improve Chinese text on Firefox
// @namespace    http://tampermonkey.net/
// @version      2024-10-26
// @description  Change lang="zh" attribute to lang="zh-cn" so Firefox can style it correctly
// @author       bellisk
// @match        http://*/*
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.3/waitForKeyElements.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    waitForKeyElements("*:lang(zh)", (element) => {
        console.log(element);
        element.lang = "zh-cn";
    })
})();
