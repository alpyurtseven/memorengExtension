const writingTemplate = `<h1>Write the answer!</h1>
<div id="word-container">
  <div id="writingTemplate">
    <h6 class="word">Elma</h6>
    <div id="input-container">
      <form id="word-form">
        <div id="input-boxes"></div>
        <button class="submitWord" type="button">Check</button>
      </form>
    </div>
    <div id="result"></div>
  </div>
</div>`;
const selectingTemplate = `<h1>Select the answer!</h1>
<div id="word-container">
  <div id="selectingTemplate">
    <h6 class="word">Elma</h6>
    <div id="input-container">
      <form id="word-form">
        <div id="input-boxes">
            <div id="top"></div>
            <div id="bottom"></div>
        </div>
      </form>
    </div>
    <div id="result"></div>
  </div>
</div>`;
var data = [];

const startWritingCompetition = () => {
    if(data.length === 0){
        document.getElementById('app').textContent = 'There are not enough words in the vocabulary to do this practice, if there are words in your vocabulary, check the Google Sheets Url and API key in the extension settings.';
        return;
    }

    document.getElementById('app').innerHTML = '';
    document.getElementById('app').insertAdjacentHTML('beforeend', writingTemplate);

    const inputBoxes = document.getElementById('input-boxes');
    const result = document.getElementById('result');
    const wordForm = document.getElementById('word-form');
    const word = document.getElementsByClassName('word')[0];

    const randomPair = data[Math.floor(Math.random() * data.length)];
    const englishWord = randomPair.english;
    const turkishWord = randomPair.turkish;

    word.innerHTML = englishWord;

    inputBoxes.innerHTML = '';
    for (let i = 0; i < turkishWord.length; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = '1';
        input.classList.add('letter-box');
        input.addEventListener('keyup', function (event) {
            if (event.keyCode === 8 || event.keyCode === 46) {
                this.previousSibling.focus();
            } else if (event.keyCode !== 13) {
                this.nextSibling.focus();
            } else if (event.keyCode === 13) {
                document.getElementsByClassName('submitWord')[0].click();
            }
        });
        inputBoxes.appendChild(input);
    }

    document.getElementsByTagName('input').item(0).focus();

    document.getElementsByClassName('submitWord')[0].addEventListener('click', (e) => {
        let userInput = '';
        document.querySelectorAll('.letter-box').forEach(input => {
            userInput += input.value;
        });

        if (userInput.toLowerCase() === turkishWord.toLowerCase()) {
            result.textContent = 'This is the right answer!';
            result.style.color = 'green';

            setTimeout(() => {
                startWritingCompetition();
            }, 500);
        } else {
            result.textContent = 'Wrong!, try again.';
            result.style.color = 'red';
        }
    });
}


const startMultipleChoiceCompetition = () => {
    if(data.length < 4){
        document.getElementById('app').textContent = 'There are not enough words in the vocabulary to do this practice, there must be at least 4 words in the vocabulary, if there are more than 4 words in your vocabulary, check the Google Sheets Url and API key in the extension settings.';
        return;
    }

    document.getElementById('app').innerHTML = '';
    document.getElementById('app').insertAdjacentHTML('beforeend', selectingTemplate);

    const result = document.getElementById('result');
    const word = document.getElementsByClassName('word')[0];
    const randomPair = data[Math.floor(Math.random() * data.length)];
    const englishWord = randomPair.english;
    const correctAnswer = randomPair.turkish;

    word.innerHTML = englishWord;

    const options = [correctAnswer];
    while (options.length < 4) {
        const randomOption = data[Math.floor(Math.random() * data.length)].turkish;
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }

    options.sort(() => Math.random() - 0.5);

    document.getElementById('top').innerHTML = '';
    document.getElementById('bottom').innerHTML = '';

    options.forEach((option, key) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.type = "button";
        button.classList.add('option-button');
        button.addEventListener('click', () => {
            if (option === correctAnswer) {
                result.textContent = 'This is the right answer!';
                result.style.color = 'green';
                debugger
                setTimeout(() => {
                    startMultipleChoiceCompetition();
                }, 500);
            } else {
                result.textContent = 'Wrong!, the right answer is: ' + correctAnswer;
                result.style.color = 'red';

                setTimeout(() => {
                    startMultipleChoiceCompetition();
                }, 2000);
            }
        });

        if (key < 2) {
            document.getElementById('top').appendChild(button);
        } else {
            document.getElementById('bottom').appendChild(button);
        }
    });
}

function getSheetId(url) {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

const getSheet = ()=>{
    chrome.storage.sync.get('apiKey', (storageDataApiKey) => {
        if (storageDataApiKey.apiKey) {
            chrome.storage.sync.get('sheetUrl', (storageData) => {
                if (storageData.sheetUrl) {
                  const sheetId = getSheetId(storageData.sheetUrl);
            
                  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:B?key=${storageDataApiKey.apiKey}`)
                    .then(response => response.json())
                    .then(sheetData => {
                      const rows = sheetData.values;
                      const words = rows.map(row => ({ english: row[0], turkish: row[1] }));
        
                      data = words;
                    });
                }
              });
        }
      });
}

document.addEventListener('DOMContentLoaded', () => {
    getSheet();

    document.getElementById('writingPractice').addEventListener('click', function () {
        startWritingCompetition();
    });

    document.getElementById('multipleChoicePractice').addEventListener('click', function () {
        startMultipleChoiceCompetition();
    });

    document.getElementById('settings').addEventListener('click', function () {
        chrome.runtime.openOptionsPage();
    });
});