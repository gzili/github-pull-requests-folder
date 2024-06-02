chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (!sender.tab) {
      return;
    }

    handlePullRequest(request);
  }
);

async function handlePullRequest(data) {
  const folderId = await getOrCreatePullRequestsFolder();
  const bookmarkNode = await getPullRequestBookmarkNode(folderId, data.url);
  
  if (data.isOpen) {
    createOrUpdateBookmark(folderId, bookmarkNode, data.title, data.url);
  } else {
    removeBookmark(bookmarkNode);
  }
}

async function getOrCreatePullRequestsFolder() {
  const BOOKMARKS_BAR_ID = '1';
  const PULL_REQUESTS_FOLDER_TITLE = 'Pull Requests';

  const bookmarksBarNodes = await chrome.bookmarks.getChildren(BOOKMARKS_BAR_ID);
  for (const node of bookmarksBarNodes) {
    if (node.url !== undefined) {
      continue; // not a folder
    }

    if (node.title === PULL_REQUESTS_FOLDER_TITLE) {
      return node.id;
    }
  }

  const node = await chrome.bookmarks.create({
    parentId: BOOKMARKS_BAR_ID,
    title: PULL_REQUESTS_FOLDER_TITLE,
  });

  return node.id;
}

async function getPullRequestBookmarkNode(folderId, url) {
  const bookmarkedPullRequests = await chrome.bookmarks.getChildren(folderId);

  for (const node of bookmarkedPullRequests) {
    if (node.url === url) {
      return node;
    }
  }
}

async function createOrUpdateBookmark(folderId, bookmarkNode, title, url) {
  if (bookmarkNode === undefined) {
    await chrome.bookmarks.create({
      parentId: folderId,
      title,
      url,
    });
  } else if (title !== bookmarkNode.title) {
    await chrome.bookmarks.update(bookmarkNode.id, { title });
  }
}

async function removeBookmark(bookmarkNode) {
  if (bookmarkNode !== undefined) {
    await chrome.bookmarks.remove(bookmarkNode.id);
  }
}
