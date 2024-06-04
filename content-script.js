let url = '';

runIfUrlChanged();

function runIfUrlChanged() {
  const currentUrl = window.location.origin + window.location.pathname;
  if (currentUrl === url) {
    return;
  }

  url = currentUrl;

  runIfUserLoggedIn();
}

function runIfUserLoggedIn() {
  const username = document.querySelector('meta[name="user-login"]')?.content;

  if (username) {
    runIfPullRequestPage({ username });
  }
}

function runIfPullRequestPage(state) {
  const isPullRequestPage = /\/pull\/\d+$/.test(window.location.pathname);

  if (isPullRequestPage) {
    runIfAuthorMatchesLoggedInUser(state);
  }
}

function runIfAuthorMatchesLoggedInUser({ username }) {
  const header = document.querySelector('#partial-discussion-header');
  const author = document.querySelector('.TimelineItem .author').textContent;

  if (author === username) {
    run({ header });
  }
}

function run({ header }) {
  const title = header.querySelector('.js-issue-title').textContent;
  const isOpen = header.getAttribute('data-pull-is-open') === 'true';

  chrome.runtime.sendMessage({
    url,
    title,
    isOpen,
  });
}

window.navigation.addEventListener("navigate", (event) => {
  runIfUrlChanged();
});
