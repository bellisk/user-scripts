/*jshint esversion: 8 */

// ==UserScript==
// @name         ao3 warn for works with keywords
// @namespace    http://tampermonkey.net/
// @version      2025-02-02
// @description  Adds a warning box on works that contain certain keywords on AO3
// @author       bellisk
// @license      MIT
// @include      https://archiveofourown.org/*
// @icon         http://archiveofourown.org/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// ==/UserScript==

// interface

var dropdown = document.createElement('li');
dropdown.innerHTML = `
    <a class="dropdown-toggle" href="/menu/hide-keywords" data-toggle="dropdown" data-target="#">Hide works with keywords</a>
    <ul class="menu dropdown-menu" role="menu">
        <li id="clearLast" role="menu-item"><a href="#">Remove last-added keyword</a></li>
        <li id="clearAll" role="menu-item"><a href="#">Remove all keywords</a></li>
        <li id="addKeyword" role="menu-item"><a href="#">Add keyword to hide works for</a></li>
    </ul>
`;
dropdown.className = 'dropdown hideKeywordWorks';
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

// filter and hide works

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

function toggleWorkBlurbDisplay(index) {
    const blurbs = document.querySelectorAll('li.blurb');
    const warningButton = document.getElementById(`warningButton${index}`);
    if (blurbs[index].getElementsByClassName('header')[0].style.display === 'none') {
        for (let k=0; k<blurbs[index].children.length; k++) {
            blurbs[index].children[k].style.display = 'block';
        }
        warningButton.textContent = 'Hide the work summary';
    } else {
        for (let k=0; k<blurbs[index].children.length; k++) {
            if (blurbs[index].children[k].className !== 'warningBox') {
                blurbs[index].children[k].style.display = 'none';
            }
        }
        warningButton.textContent = 'Display the work summary';
    }
}

async function filterListOfWorks() {
    const works = document.querySelectorAll('li.blurb');
    if (works.length == 0) {
        return;
    }
    const keywordsToHide = await GM_listValues();
    for (let j=0; j<works.length; j++) {
        const foundKeywords = [];
        for (let k=0; k<keywordsToHide.length; k++) {
            if (keywordsToHide[k] === 'last') {
                continue;
            }
            if (works[j].innerText.toLowerCase().includes(GM_getValue(keywordsToHide[k]))) {
                foundKeywords.push(GM_getValue(keywordsToHide[k]));
            }
        }
        if (foundKeywords.length > 0) {
            const warning = document.createElement('div');
            warning.id = `warningBox${j}`;
            warning.className = "warningBox";
            warning.innerHTML = `
                <h3>Blocked keyword(s) found in this work summary</h3>
                <details>
                    <summary>Click to see the keywords found.</summary>
                    <p>${foundKeywords}</p>
                </details>
                <button id="warningButton${j}">Display the work summary</button>
            `;
            GM_addStyle(warningBoxCss);
            for (let k=0; k<works[j].children.length; k++) {
                works[j].children[k].style.display = 'none';
            }
            works[j].prepend(warning);
            document.getElementById(`warningButton${j}`).onclick = function() {toggleWorkBlurbDisplay(j);};
        }
    }
}

function toggleWorkDisplay() {
    const chapters = document.getElementById('chapters');
    const summary = document.getElementsByClassName('summary')[0];
    const warningButton = document.getElementById('warningButton');
    if (chapters.style.display === 'none') {
        chapters.style.display = 'block';
        summary.style.display = 'block';
        const notes = document.getElementsByClassName('notes');
        for (let k=0; k<notes.length; k++) {
            notes[k].style.display = 'block';
        }
        warningButton.textContent = 'Hide the work';
    } else {
        chapters.style.display = 'none';
        summary.style.display = 'none';
        const notes = document.getElementsByClassName('notes');
        for (let k=0; k<notes.length; k++) {
            notes[k].style.display = 'none';
        }
        warningButton.textContent = 'Display the work';
    }
}

async function addWarningBoxForSingleWorkPage() {
    const chapters = document.getElementById('chapters');
    if (chapters === null) {
        return;
    }
    const summary = document.getElementsByClassName('summary')[0];
    const keywordsToHide = await GM_listValues();
    const foundKeywords = [];
    for (let j=0; j<keywordsToHide.length; j++) {
        if (keywordsToHide[j] == 'last') {
            continue;
        }
        if (chapters.innerText.toLowerCase().includes(GM_getValue(keywordsToHide[j])) ||
           summary.innerText.toLowerCase().includes(GM_getValue(keywordsToHide[j]))) {
            foundKeywords.push(GM_getValue(keywordsToHide[j]));
        }
    }
    if (foundKeywords.length > 0) {
        const warning = document.createElement('div');
        warning.id = "warningBox";
        warning.className = "warningBox";
        warning.innerHTML = `
            <h3>Blocked keyword(s) found in this work</h3>
            <details>
                <summary>Click to see the keywords found.</summary>
                <p>${foundKeywords}</p>
            </details>
            <button id="warningButton">Display the work</button>
        `;
        GM_addStyle(warningBoxCss);
        const summary = document.getElementsByClassName('summary')[0];
        summary.parentNode.insertBefore(warning, summary);

        chapters.style.display = 'none';
        summary.style.display = 'none';
        const notes = document.getElementsByClassName('notes');
        for (let k=0; k<notes.length; k++) {
            notes[k].style.display = 'none';
        }
        document.getElementById('warningButton').onclick = function() {toggleWorkDisplay();};
    }
}

// run

document.getElementById('clearLast').onclick = function() {clearLast();};
document.getElementById('clearAll').onclick = function() {clearAll();};
document.getElementById('addKeyword').onclick = function() {addKeyword();};
filterListOfWorks();
addWarningBoxForSingleWorkPage();
