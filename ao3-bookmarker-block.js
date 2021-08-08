// ==UserScript==
// @name         ao3 bookmarks block
// @namespace    https://greasyfork.org/en/users/800073-bellisk
// @version      0.1
// @description  permanently hide bookmarks created by specified users
// @author       bellisk
// @include      http://archiveofourown.org/works/*/bookmarks*
// @include      https://archiveofourown.org/works/*/bookmarks*
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.listValues
// @grant        GM.deleteValue
// ==/UserScript==

const bookmarks = document.querySelectorAll('li.short');

// interface

let headerModule, blockLink, blockStyle;
for (let i=0;i<bookmarks.length;i++) {
    headerModule = bookmarks[i].getElementsByClassName('header module')[0];
    blockLink = document.createElement('div');
    blockLink.className = 'bookmarkblock';
    blockLink.innerHTML = '<a class="blockThisBookmarker">block this bookmarker</a>';
    headerModule.parentNode.insertBefore(blockLink, headerModule.nextSibling);
}
blockStyle = document.createElement('style');
blockStyle.innerHTML = 'div.bookmarkblock {text-align: right; font-family:monospace; position:relative; right:5px;}';
document.head.appendChild(blockStyle);

let unblock = document.createElement('li');
unblock.innerHTML = '<a>Bookmark Block</a><ul class="menu"><li id="clearLast"><a>Unblock last</a></li><li id="clearAll"><a>Unblock all</a></li></ul>';
unblock.className = 'dropdown bookmarkblock';
let search = document.getElementsByClassName('primary navigation actions')[0].getElementsByClassName('search')[0];
search.parentNode.insertBefore(unblock, search);

function getBookmarkerName(liTag) {
    const byline = liTag.getElementsByClassName('byline')[0];
    const bookmarker = byline.getElementsByTagName('a')[0];
    return bookmarker.text;
}

// block bookmarks

function blockThisBookmarker(bookmark) {
    const bookmarker = getBookmarkerName(bookmark);
    GM.setValue(bookmarker, bookmarker);
    GM.setValue('last', bookmarker);
}

async function blockSelected(bookmarks) {
    const blocked = await GM.listValues();
    for (let j=0; j<bookmarks.length; j++) {
        const bookmarker = getBookmarkerName(bookmarks[j]);
        if (blocked.find(function(id){return id === bookmarker;})) {
            bookmarks[j].style.display = 'none';
        }
    }
}

// unblock bookmarks

async function clearAll(){
    const keys = await GM.listValues();
    for (let k=0;k<keys.length; k++) {
        await GM.deleteValue(keys[k]);
    }
    location.reload();
}

async function clearLast() {
    const unblockId = await GM.getValue('last');
    await GM.deleteValue('last');
    await GM.deleteValue(unblockId);
    location.reload();
}

// run

blockSelected(bookmarks);

document.getElementById('clearLast').onclick = function() {clearLast();};
document.getElementById('clearAll').onclick = function() {clearAll();};

const blockLinks = document.getElementsByClassName('blockThisBookmarker');
for (let k=0; k<blockLinks.length; k++) {
    let bLink = blockLinks[k];
    bLink.onclick = function() {
        let bookmark = this.parentNode.parentNode;
        blockThisBookmarker(bookmark)
        bookmark.style.display = "none";
    };
}