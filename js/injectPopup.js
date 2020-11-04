document.addEventListener('DOMContentLoaded', function () {
    _allNodes = [];
    enumList();
    document.getElementById("btnReplace").onclick = clickBtnReplace;
});

function clickBtnReplace() {
    var _btnReplace = document.getElementById("btnReplace");
    var _searchPattern = document.getElementById("searchPattern").value;
    var _replacer = document.getElementById("replacer").value;
    if (!_searchPattern) {
        alert("请输入待替换地址/地址正则表达式");
        return;
    }
    if (!_replacer) {
        alert("请输入需要替换为什么结果");
        return;
    }
    clearPreviewRows();
    if (_allNodes.length == 0)
        return;
    generatePreviewRow("原始地址", "替换后地址");
    var _confirmdReplace = _btnReplace.state != undefined && _btnReplace.state == "1";
    searchBookmarks(!_confirmdReplace,_searchPattern,_replacer);
    if (_confirmdReplace) {
        _btnReplace.value = "替换";
        _btnReplace.state = "0";
        alert("替换完成");
        clearPreviewRows();
    }
    else {
        _btnReplace.value = "确认替换";
        _btnReplace.state = "1"
    }
}

function searchBookmarks(preview, _searchPattern, _replacer) {
    for (var i in _allNodes) {
        if (_allNodes[i].url.indexOf(_searchPattern) > 0) {
            var _replaced = _allNodes[i].url.replace(_searchPattern, _replacer);
            if (!preview) {
                var _replaceObj = { "url":_replaced};
                chrome.bookmarks.update(_allNodes[i].id, _replaceObj, function () { });
            }
            else {
                generatePreviewRow(_allNodes[i].url, _replaced);
            }
        }
        else if (_searchPattern.indexOf("/") == 0) {
            try {
                var _regPattern = eval(_searchPattern);
                if (_regPattern.test(_allNodes[i].url)) {
                    var _replced = _regPattern.replace(_allNodes[i].url, _replacer);
                    if (!preview) {                        
                        var _replaceObj = { "url":_replaced};
                        chrome.bookmarks.update(_allNodes[i].id,  _replaceObj , function () { });
                    }
                    else {
                        generatePreviewRow(_allNodes[i].url, _replced);
                    }
                }
            }
            catch (e) { }
        }
    }
}

function clearPreviewRows() {
    var _table = document.getElementById("tablePreview");
    var _rows = _table.rows.length;
    while (_rows > 0)
    {
        _table.deleteRow(0);
        _rows -= 1;
    }
}

function generatePreviewRow(_orgUrl,_newUrl) {
    var _table = document.getElementById("tablePreview");
    var _newTr = _table.insertRow(_table.rows.length);
    var _orgUrlTd = _newTr.insertCell(0);
    var _newUrlTd = _newTr.insertCell(1);
    _orgUrlTd.innerHTML = _orgUrl;
    _newUrlTd.innerHTML = _newUrl;
    _orgUrlTd.className = "tableTd";
    _newUrlTd.className = "tableTd";
}

_allNodes = [];
function enumList(){
    chrome.bookmarks.getTree(function (_nodes) {
        for (var i in _nodes) {
            enumSubList(_nodes[i]);
        }
    });    
}

function enumSubList(_node) {
    if (_node.url != undefined)
    {
        _allNodes.push(_node);          
    }
    if (!_node.children)
        return;
    for (var i in _node.children) {
        enumSubList(_node.children[i]);
    }
}

function getAllNodes() {
    document.getElementById("test").value = _allNodes.length;
    return _allNodes;
}