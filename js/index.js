"use strict"

const title = document.getElementById("search-input")
const example = document.getElementById("example-container")
const sentence = document.getElementById("sentence-display")
const grid = document.getElementById("tiles-grid")

let user;

let current;

let array;

let folder;

let lastWord;

let nextWord = 0

let wordPosition = 0

let sentenceNumber = 0

let targetObject = {}

let targetArray = []

let targetStrings = []

let questionArray = []

let ran = false

let inFolder = false

let outFolder = false

let sentenceArray = []

let utterance = []

loadSettings()

function loadData() {

    let stringify = JSON.stringify(data.words);
    localStorage.setItem("words", stringify);      
}

function loadSettings() {

    let wordStorage = localStorage.getItem("words")
    let userStorage = localStorage.getItem("user")
    if (userStorage && wordStorage) {
        user = JSON.parse(userStorage);
        data = JSON.parse(wordStorage); 
    } else {
        user = {
            home: 0,
            voice: 51,
            columns: 2,
            rows: 2,
            lock: false,
            speakAll: true,
        }
        let userString = JSON.stringify(user)
        localStorage.setItem("user", userString)
        closeDisplay(-1)
        loadData()
        loadSettings()
    }
    loadUser()
    loadGrid(user.home)
    populateVoiceList();
    if (
        typeof speechSynthesis !== "undefined" &&
        speechSynthesis.onvoiceschanged !== undefined
    ) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
}

function save(check) {

    let stringify = JSON.stringify(data);
    let userString = JSON.stringify(user)
    localStorage.setItem("words", stringify);
    localStorage.setItem("user", userString)

    if (check != -1) {
        alert("your settings have been saved")
    }
}

function loadUser() {
    if (user.lock == true) {
        document.getElementById("lock").style.visibility = "visible"
        document.getElementById("lock-button").innerHTML = "unlock grid"
    }
    if (user.speakAll == true) {
        document.getElementById("speakAll").checked = "checked"
    } else {
        document.getElementById("speakNone").checked = "checked"
    }
    lastWord = user.home
    document.getElementById("userName").innerText = user.name
    document.getElementById("homePage").innerText = data[user.home].text
    document.getElementById("rows-select").value = user.rows
    document.getElementById("columns-select").value = user.columns
    grid.style.gridTemplateRows = `repeat(${user.rows}, ${Math.round(1/user.rows*100)}%)`
    grid.style.gridTemplateColumns = `repeat(${user.columns}, ${Math.round(1/user.columns*100) -4}%)`
}

function closeDisplay(check) {

    if (check == -1) {
        document.getElementById("popup").style.display = "flex"
        return
    }
    if (document.getElementById("userInput").value == "") {
        return alert("name cant be empty")
    } else {
        user.name = document.getElementById("userInput").value
        data[549].text = document.getElementById("userInput").value
        save(-1)
    }
    document.getElementById("popup").style.display = "none"
    loadSettings()
}

function loadGrid(id, check) {

    grid.innerHTML = ''

    let random = Math.floor(Math.random() * (user.rows*user.columns));

    if (check == -1) {
        array = id
    } else {
        current = id
        array = data[id].array
        title.value = ""
        if (wordPosition == utterance.length && nextWord == targetArray[wordPosition] && inFolder == true) {
            let gridArray = array.slice(0, (user.rows*user.columns))
            let index = gridArray.indexOf(nextWord)
            if (index == -1) {
                array.splice(random, 0, nextWord)
                ran = true
            } 
        }
    }
    if (inFolder == true || outFolder == true) {
        grid.style.backgroundColor = "#F5EDE0"
    } else {
        title.placeholder = "speak-easy"
        grid.style.backgroundColor = "lightGray"
    }

    for (let i = 0; i < (user.columns*user.rows); i++ ) {

        if (!array[i]) {
            return
        }
        const tile = document.createElement("div")
        const tileImage = document.createElement("img")
        const tileText = document.createElement("p")
        tile.className = "tile"
        tileImage.className = "tile-image"
        tileText.className = "tile-text"
        tile.id = array[i]
        tileText.textContent = data[array[i]].text
        tile.onclick = function tileClick() {
            sentenceAdd(this.id, 0, array, current,)
        }
        if (typeof data[array[i]].image != "undefined") {
            tileImage.src = data[array[i]].image
            tileImage.alt = data[array[i]].text
            tile.appendChild(tileImage)
        }
        if (data[array[i]].sub) {
            tile.style.backgroundColor = "rgb(253, 238, 217)"
            tile.onclick = function tileClick() {
                sentenceAdd(this.id, -1, array, current,)
            }    
        }
        tile.appendChild(tileText)
        grid.appendChild(tile)
    }
    if (ran == true) {
        ran = false
        array.splice(random, 1)
    }
    outFolder = false
}

function lockGrid() {

    if (user.lock == false) {
        document.getElementById("lock").style.visibility = "visible"
        document.getElementById("lock-button").innerHTML = "unlock grid"
        if (typeof sentenceArray[sentenceArray.length-1] != "undefined") {
            user.home = sentenceArray[sentenceArray.length-1]
        }
    } else if (user.lock == true) {
        document.getElementById("lock").style.visibility = "hidden"
        document.getElementById("lock-button").innerHTML = "lock grid"
        user.home = 0
    }
    user.lock = !user.lock
    document.getElementById("homePage").innerText = data[user.home].text
}

function sentenceAdd(id, check, array, current) {

    sentenceArray.push(parseInt(id))

    if (check == -1) {
        folderCheck(id)
    } else {
        const tile = document.createElement("div")
        const tileImage = document.createElement("img")
        const tileText = document.createElement("p")
        tile.className = "sentence-tile"
        tileImage.className = "tile-image"
        tileText.className = "tile-text"
        tile.id = data[id].id
        tileText.textContent = data[id].text
        if (typeof data[id].image != "undefined") {
            tileImage.src = data[id].image
            tileImage.alt = data[id].text
            tile.appendChild(tileImage)
        }
        sentence.appendChild(tile)
        tile.appendChild(tileText)
        sentence.scrollLeft = sentence.scrollWidth;
        utterance.push(data[id].text)
        if (user.speakAll == true) {
            speak(id)
        }
    }
    setTimeout(() => {
        if (user.lock == true && check == -1) {
            return loadGrid(id)
        } else if (user.lock == true) {
            return
        }
        if (nextWord == id) {
            wordPosition++
            wordCheck(id)
        } else {
            orderCheck(array, current, id)
            loadGrid(id)
        }
    }, 5);

}

function toggleVoice() {
    if(event.target.value == "none") {
        user.speakAll = false
    } else {
        user.speakAll = true
    }
}

function speak(id) {

    const voices = window.speechSynthesis.getVoices();
    let message;
    if (id == -1) {
        message = "this is my voice"
    } else  if (id == -2) {
        message = targetStrings.join(" ")
        const lastVoice = voices[33];
        let speech = new SpeechSynthesisUtterance(message);
        speech.voice = lastVoice;
        window.speechSynthesis.speak(speech);
        return
    } else if (event.target.id == "sentence-display") {
        message = utterance.join(" ")
    } else {
        message = data[id].text
    }
    const lastVoice = voices[user.voice];
    let speech = new SpeechSynthesisUtterance(message);
    speech.voice = lastVoice;
    window.speechSynthesis.speak(speech);
}

function back() {

    current = sentenceArray[sentenceArray.length -1]

    if (user.lock == true) {
        if (utterance[utterance.length -1] == data[current].text) {
            utterance.pop()
            sentence.removeChild(sentence.lastChild)
        } 
        sentenceArray.pop()
        return
    }

    if (targetArray[utterance.length] == targetArray[wordPosition]) {
        if (utterance.length == 1) {
            wordPosition = 0
            nextWord = targetArray[wordPosition]
        } else {
            wordPosition--
            nextWord = targetArray[wordPosition]    
        }
    }
    if (typeof current == "undefined") {
        leaveFolder()
        return loadGrid(user.home)
    }
    if (utterance[utterance.length -1] == data[current].text) {
        utterance.pop()
        sentence.removeChild(sentence.lastChild)
    } 
    if (sentenceArray.length == 1) {
        if (sentenceNumber == 0) {
            loadGrid(user.home)
            leaveFolder()
        } else {
            folderCheck(sentenceArray[sentenceArray.length -1])
            loadGrid(lastWord)
        }
    } else {
        folderCheck(sentenceArray[sentenceArray.length -2])
        loadGrid(sentenceArray[sentenceArray.length -2])
    }
    sentenceArray.pop()
}

function clearAll() {

    if (sentenceArray.length == 0 || utterance.length == 0) {
        leaveFolder()
        loadGrid(user.home)
        return
    }
    sentence.innerHTML = ""
    sentenceArray = []
    utterance = []
}

function searchKeyUp() {

    if (document.getElementById('search-input').value == "") {
        if (sentenceArray.length == 0) {
            loadGrid(lastWord)
        } else {
            loadGrid(sentenceArray[sentenceArray.length -1])
        }
        return
    }

    let searchResults = [];
    for (let p = 1; p < data.length; p++) {
        if (data[p].text.toLowerCase().includes(document.getElementById('search-input').value)) {
            searchResults.push(p)
        } 
    }
    loadGrid(searchResults, -1)
}

function orderCheck(array, current, id) {

    let index = array.indexOf(parseInt(id))

    if (index == -1) {
        data[current].array.unshift(parseInt(id)) 
    } else {
        data[current].array.splice(index, 1)
        data[current].array.unshift(parseInt(id))  
    }
}

function folderCheck(id) {

    if (!data[id].sub) {
        return
    }
    folder = id
    title.placeholder = data[id].text
    if (!data[id].sub.questions) {
        outFolder = true
    } else if (!data[id].sub.answers[0]) {
        targetSentence(id, -1)
        inFolder = true
    } else {
        targetSentence(id, -2)
        inFolder = true
    }
}

function wordCheck(id) {

    nextWord = targetArray[wordPosition]

    if (typeof nextWord == "undefined") {
        wordPosition = 0
        utterance = []
        sentenceArray = []
        sentence.innerHTML = ""
        sentenceNumber++
        targetArray = targetObject[sentenceNumber]
        if (typeof targetArray == "undefined") {
            leaveFolder()
            if (folder == 809 && user.rows == 2) {
                user.rows++
                user.columns++
                alert("nice! how about a larger grid?")
                data[user.home].array.shift()
                data[user.home].array.unshift(190)
                save(-1)
                loadUser()
            }
            loadGrid(user.home)
            return 
        } else {
            targetArray = targetObject[sentenceNumber]
            nextWord = targetArray[wordPosition]
            targetSentence(folder)
        }
    }
    loadGrid(id)
}

function targetSentence(id, check) {

    example.innerHTML = ""

    if (check == -1) {
        targetObject = data[id].sub.questions
        targetArray = targetObject[sentenceNumber]
        nextWord = targetArray[wordPosition]
    } else if (check == -2) {
        targetObject = data[id].sub.answers
        targetArray = targetObject[sentenceNumber]
        nextWord = targetArray[wordPosition]
    }
    
    for (let f = 0; f < data[folder].sub.questions[sentenceNumber].length; f++ ) {

        const tile = document.createElement("div")
        const tileImage = document.createElement("img")
        const tileText = document.createElement("p")
        tile.className = "example-tile"
        tileImage.className = "tile-image"
        tileText.className = "tile-text"
        tile.id = data[data[id].sub.questions[sentenceNumber][f]].id
        tileText.textContent = data[data[id].sub.questions[sentenceNumber][f]].text
        if (typeof data[data[id].sub.questions[sentenceNumber][f]].image != "undefined") {
            tileImage.src = data[data[id].sub.questions[sentenceNumber][f]].image
            tileImage.alt = data[data[id].sub.questions[sentenceNumber][f]].text
            tile.appendChild(tileImage)
        }
        tile.onclick = function click() {
            sayArray(data[folder].sub.questions[sentenceNumber])
        }
        example.appendChild(tile)
        tile.appendChild(tileText)
    }
    document.getElementById("move-down").style.visibility = "visible"
    document.getElementById("move-up").style.visibility = "visible"
    setTimeout(() => {
        sayArray(data[folder].sub.questions[sentenceNumber])
    }, 300)
}

function move() {

    sentence.innerHTML = ""
    sentenceArray = []
    utterance = []

    wordPosition = 0
    if (event.target.id == "move-down") {
        sentenceNumber--
    } else {
        sentenceNumber++
    }
    if (sentenceNumber == -1) {
        leaveFolder()
        return back()
    }
    if (typeof targetObject[sentenceNumber] == "undefined") {
        leaveFolder()
        return back()
        } else if (sentenceNumber == 0) {
        targetArray = targetObject[0]
        lastWord = folder
        nextWord = targetArray[0]
    } else {
        targetArray = targetObject[sentenceNumber -1]
        lastWord = targetArray[targetArray.length -1]
        targetArray = targetObject[sentenceNumber]  
        nextWord = targetArray[wordPosition]  
    }
    loadGrid(lastWord)
    targetSentence(folder)
}

function leaveFolder() {

    wordPosition = 0
    sentenceNumber = 0
    nextWord = 0
    targetArray = []
    targetObject = {}
    document.getElementById("move-down").style.visibility = "hidden"
    document.getElementById("move-up").style.visibility = "hidden"
    example.innerHTML = ""
    grid.style.backgroundColor = "lightGray"
    title.placeholder = "speak-easy"
    inFolder = false
}

function sayArray(array) {

    targetStrings = []
    for (let i = 0; i < array.length; i++ ) {
        targetStrings.push(data[array[i]].text)
    }
    speak(-2)
}
