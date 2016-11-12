moment.locale('zh-cn');
var currentKeyword='';

function ajax(searchTerm, callback, errorCallback) {
  var searchUrl = 'http://api.stackexchange.com/2.2/search?order=desc&sort=activity&site=stackoverflow&intitle=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  x.responseType = 'json';
  x.onload = function () {
    var response = x.response;
    if (!response || !response.items) {
      errorCallback('暂无答案');
      return;
    }
    var result = response.items;
    callback(result);
  };
  x.onerror = function () {
    errorCallback('网络异常');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function startSearch() {
  var result = document.getElementById('input');
  keyword = result.value;
  currentKeyword = keyword;
  renderStatus('搜索中......');
  ajax(keyword, function (result) {
    render(result);
    var links = document.getElementsByClassName('href');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', (e) => {
        var link = e.target.href;
        chrome.tabs.create({ url: link });
      })
    }
  }, function (errorMessage) {
    renderStatus(errorMessage);
  });
}

function render(result){
  renderStatus('共' + result.length + '项');
    var resultDOM = document.getElementById('result');
    resultDOM.innerHTML = '';
    var domArr = result.map(item => {
      var article = document.createElement('article')
      var a = document.createElement('a');
      a.className = 'href';
      a.setAttribute('href', item.link);
      a.appendChild(document.createTextNode(item.title));
      article.appendChild(a);
      var count = document.createElement('div');
      count.className = 'count';
      var answerCount = document.createElement('span');
      answerCount.className = 'answer-count';
      answerCount.appendChild(document.createTextNode(item.answer_count + '回答'));
      count.appendChild(answerCount);
      count.appendChild(document.createTextNode(' | '));
      var viewCount = document.createElement('span');
      viewCount.className = 'view-count';
      viewCount.appendChild(document.createTextNode(item.view_count + '浏览'));
      count.appendChild(viewCount);
      count.appendChild(document.createTextNode(item.is_answered ? ' | ' : ''));
      var isAnswered = document.createElement('span');
      isAnswered.className = 'is-answered';
      isAnswered.appendChild(document.createTextNode(item.is_answered ? '已解决' : ''));
      count.appendChild(isAnswered);
      article.appendChild(count);
      var createTime = document.createElement('div');
      createTime.className = 'create-time';
      createTime.appendChild(document.createTextNode(item.owner.display_name + ' '));
      createTime.appendChild(document.createTextNode(moment.unix(item.creation_date).fromNow() + '创建'));
      createTime.appendChild(document.createTextNode(' | ' + moment.unix(item.last_activity_date).fromNow() + '活跃'));
      article.appendChild(createTime);
      return article;
    })
    domArr.forEach(item => {
      resultDOM.appendChild(item);
      resultDOM.appendChild(document.createElement('br'))
    })
    resultDOM.hidden = false;
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('btn').addEventListener('click', startSearch);
  document.onkeydown = (e) => {
    if (13 === e.keyCode) {
      startSearch();
    }
  }
});
