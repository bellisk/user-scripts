// ==UserScript==
// @name         Youtrack Bigger Comment Box
// @namespace    http://tampermonkey.net/
// @version      2024-10-24
// @description  Increase comment box size on Youtrack tickets
// @author       You
// @match        {YOUR_YOUTRACK_URL}/issue/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        GM_addStyle
// ==/UserScript==

// NB: Update the @match line above with your Youtrack url.

(function() {
    'use strict';

    const css = `
      .commentEditorFocused__def .commentEditorArea__edd.commentEditorArea__edd > .ProseMirror {
          min-height: 600px !important;
	  }

	  .commentEditor__ca0.commentEditor__ca0 {
        min-height: 0;
        max-height: 1800px !important;
      }`

    GM_addStyle(css)
})();
