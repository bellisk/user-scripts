// ==UserScript==
// @name         ao3 warn for fics with keywords
// @namespace    http://tampermonkey.net/
// @version      2025-02-01
// @description  Adds a warning box on fics that contain certain keywords on AO3
// @author       bellisk
// @include      https://archiveofourown.org/works/*
// @icon         http://archiveofourown.org/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_log
// @grant        GM_addStyle
// ==/UserScript==


// interface

var dropdown = document.createElement('li');
dropdown.innerHTML = `
    <a class="dropdown-toggle" href="/menu/hide-keywords" data-toggle="dropdown" data-target="#">Hide fics with keywords</a>
    <ul class="menu dropdown-menu" role="menu">
        <li id="clearLast" role="menu-item"><a href="#">Remove last-added keyword</a></li>
        <li id="clearAll" role="menu-item"><a href="#">Remove all keywords</a></li>
        <li id="addKeyword" role="menu-item"><a href="#">Add keyword to hide fics for</a></li>
    </ul>
`;
dropdown.className = 'dropdown hideKeywordFics';
var primaryNav = document.getElementsByClassName('primary navigation actions')[0];
primaryNav.appendChild(dropdown);

// manage keywords to hide

function addKeyword() {
    const keyword = prompt("Enter a keyword to hide works that contain it");
    GM_setValue(keyword, keyword);
    GM_setValue('last', keyword);
    location.reload();
}

async function clearAll(){
    const keys = await GM.listValues();
    for (let k=0;k<keys.length; k++) {
        await GM.deleteValue(keys[k]);
    }
    location.reload();
}

async function clearLast() {
    const keyword = await GM.getValue('last');
    await GM.deleteValue('last');
    await GM.deleteValue(keyword);
    const keywordsToHide = await GM.listValues();
    if (keywordsToHide.length > 0) {
        GM.setValue('last', keywordsToHide[keywordsToHide.length -1]);
    }
    location.reload();
}

// filter and hide fics

async function logKeywords() {
    const keywordsToHide = await GM_listValues();
    GM_log(keywordsToHide);
    GM_log(GM_getValue('last'));
    for (let j=0; j<keywordsToHide.length; j++) {
        GM_log(keywordsToHide[j]);
        GM_log(GM_getValue(keywordsToHide[j]));
    }
}

async function filterListOfFics() {
    const keywordsToHide = await GM_listValues();
    const fics = document.querySelectorAll('li.work');
    for (let j=0; j<fics.length; j++) {
        const atag = fics[j].getElementsByClassName('heading')[0].getElementsByTagName('a')[0];
        GM_xmlhttpRequest({
            method: "GET",
            url: atag.href,
            responseType: "document",
            onload: function (response) {
                // Attempt to create responseXML, if absent, in supported browsers
                var responseXML = response.responseXML;
                if (!responseXML) {
                    try {
                        responseXML = new DOMParser().parseFromString(response.responseText, "text/html");
                    }
                    catch (err) {}
                }
                for (let k=0; k<keywordsToHide.length; k++) {
                    if (keywordsToHide.find(function(keyword) {return response.responseText.toLowerCase().includes(keyword.toLowerCase());})) {
                        fics[j].style.display = 'none';
                        GM_log(`Not displaying fic #${atag.href} because it contains keyword: ${keywordsToHide[k]}`);
                    }
                };
            }
        });
    }
}

const warningBoxCss = `
.warningBox {
  box-shadow: 1px;
  box-shadow: 1px 1px 5px #aaa;
  border: 1px solid #ccc;
  clear: right;
  padding: 1.286em 0.75em;
  position: relative;
  overflow: hidden;
  text-align: center;
}`

async function addWarningBox() {
    const keywordsToHide = await GM_listValues();
    const chapters = document.getElementById('chapters');
    for (let j=0; j<keywordsToHide.length; j++) {
        if (chapters.innerText.toLowerCase().includes(GM_getValue(keywordsToHide[j]))) {
            const warning = document.createElement('div');
            warning.className = "warningBox";
            warning.innerHTML = `
                <h3>WARNING</h3>
                <p>${GM_getValue(keywordsToHide[j])}</p>
            `;
            GM_addStyle(warningBoxCss);
            const summary = document.getElementsByClassName('summary')[0];
            summary.parentNode.insertBefore(warning, summary);
        }
        break;
    }
}

// run

document.getElementById('clearLast').onclick = function() {clearLast();};
document.getElementById('clearAll').onclick = function() {clearAll();};
document.getElementById('addKeyword').onclick = function() {addKeyword();};
logKeywords();
// filterListOfFics();
addWarningBox();