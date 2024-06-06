document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settings-form');
    const status = document.getElementById('status');
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const sheetUrl = document.getElementById('sheet-url').value;
      const apiKey = document.getElementById('api-key').value;
  
      chrome.storage.sync.set({ sheetUrl: sheetUrl,  apiKey: apiKey }, () => {
        status.textContent = 'Settings saved.';
        setTimeout(() => { status.textContent = ''; }, 2000);
      });
    });
  
    chrome.storage.sync.get('sheetUrl', (data) => {
      if (data.sheetUrl) {
        document.getElementById('sheet-url').value = data.sheetUrl;
      }
    });

    chrome.storage.sync.get('apiKey', (data) => {
      if (data.apiKey) {
        document.getElementById('api-key').value = data.apiKey;
      }
    });
  });
  