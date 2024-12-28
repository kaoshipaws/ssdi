chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.url.includes('https://steamcommunity.com/id/') && tab.url.includes('/inventory')) {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			files: ['content.js']
		});
	}
});