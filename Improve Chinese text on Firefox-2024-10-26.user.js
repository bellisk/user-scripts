// ==UserScript==
// @name         Improve Chinese text on Firefox
// @namespace    http://tampermonkey.net/
// @version      2024-10-26
// @description  Change lang="zh" attribute to lang="zh-cn" so Firefox can style it correctly
// @author       bellisk
// @match        http://*/*
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var spans = document.getElementsByTagName("span");
    for (var i = spans.length; --i >= 0;) {
        var span = spans[i];
        var lang = span.getAttribute("lang");
        if (lang == "zh") {
            span.lang = "zh-cn";
        }
    }
})();