//Global vars
var db;
var user_cont;

var toggleSub = function () { };

//On load
document.addEventListener("DOMContentLoaded", event => {

    const app = firebase.app();
    console.log(app)

    window.db = firebase.firestore();

    if (loadUser()) {
        console.log('logged in');
    } else {
        console.log('not logged in');
    }

    for (let i = 0; i < 10; i++) {
        // add_note(i, "a", "", i * 50 + 50, i * 50 + 100);
    }

    // setTimeout(() => {
    //     toggleSub();
    //     console.log('unsub');
    // }, 5000);
});

//Login functions
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)

        .then(result => {
            const user = result.user;
            // document.write(`Hello ${user.displayName}`);
            //console.log(user.email)

            localStorage.setItem('user', user.displayName);
            localStorage.setItem('email', user.email);

            loadUser();
        })
        .catch(console.log)

}

function logout() {
    toggleSub();

    localStorage.removeItem('user');
    localStorage.removeItem('email');
    loadUser();
}

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


function loadUser() {
    user = localStorage.getItem('user');

    if (user) {
        console.log(`Prior data exists as user ${user}`);
        document.getElementById('options').style.display = "block";
        document.getElementById('loginBtn').style.display = "none";

        document.getElementById('welcomeMsg').innerHTML = `Welcome ${localStorage.getItem('user')}!`;

        window.user_cont = window.db.collection('users').doc(localStorage.getItem('email')).collection('notes');

        var oldNote = new Array();

        window.toggleSub = window.user_cont.onSnapshot(col => {
            //Executes everytime doc changes from firebase (constantly runs these code when doc change / basically realtime changes)

            window.user_cont.get().then(snap => {
                size = snap.size // will return the collection size
                var newNote = new Array();

                //Checks if existing notes in browser is deleted from firestore
                var missing = new Array();
                for (let j = 0; j < oldNote.length; j++) {
                    search: {
                        for (let k = 0; k < size; k++) {
                            const doc = snap.docs[k];

                            if (doc.id == oldNote[j]) {
                                break search;
                            }
                        }
                        missing.push(oldNote[j]);
                    }
                }

                //Close notes that are missing from firestore
                for (let j = 0; j < missing.length; j++) {
                    console.log(`${missing[j]} has been deleted`);
                    close_note(document.getElementById(`close_${missing[j]}`));
                }

                //Cycle through all notes from firestore
                for (let i = 0; i < size; i++) {
                    const data = snap.docs[i].data();

                    //Check if note exists in browser
                    if (document.getElementById(`card_${snap.docs[i].id}`) == null) {
                        //Note does not exist in browser, add new note
                        add_note(snap.docs[i].id, data['title'], data['content'], data['x'], data['y']);
                        console.log(`new note id ${snap.docs[i].id} added`);
                    } else {
                        //Note exists in browser, modify notes
                        modify_note(snap.docs[i].id, data['title'], data['content'], data['x'], data['y']);
                        console.log(`note id ${snap.docs[i].id} updated`);
                    }

                    newNote[i] = snap.docs[i].id;
                }

                oldNote = Array.from(newNote);
                console.log("=============== Update complete ===============")
            });


            document.getElementById('welcomeMsg').innerHTML = `Welcome ${localStorage.getItem('user')}!`;
        });

        return true;
    }
    else {
        console.log(`No prior data`);
        document.getElementById('loginBtn').style.display = "block";
        document.getElementById('options').style.display = "none";

        closeAll();

        document.getElementById('welcomeMsg').innerHTML = "Welcome!";
        return false;
    }

}

//Drag and Drop function
function drag_start(event) {
    var style = window.getComputedStyle(event.target, null);
    var str = (parseInt(style.getPropertyValue("left")) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top")) - event.clientY) + ',' + event.target.id;
    event.dataTransfer.setData("Text", str);
}

function drop(event) {
    var offset = event.dataTransfer.getData("Text").split(',');
    var dm = document.getElementById(offset[2]);


    if (event.clientX + parseInt(offset[1], 10) <= 50) {
        dm.style.left = 0 + 'px';
    } else {
        dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';

    }

    if (event.clientY + parseInt(offset[1], 10) <= 50) {
        dm.style.top = 50 + 'px';
    } else {
        dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
    }

    event.preventDefault();
    return false;
}

function drag_over(event) {
    event.preventDefault();
    return false;
}

//Note/Card function
function add_note(id, title, content, x, y) {
    //get main element, id = "board"
    var board = document.getElementById("board");

    //create div col
    var col = document.createElement("div");
    col.classList.add("col");
    col.id = `card_${id}`;
    col.draggable = true;
    col.addEventListener("dragstart", function () { drag_start(event) });
    col.style = `opacity: 0; left: ${x}px; top: ${y}px;`;

    //create div card > col
    var card = document.createElement("div");
    card.classList.add("card");

    col.appendChild(card);

    //create div top_bar > card
    var top_bar = document.createElement("div")
    top_bar.classList.add("top_bar");

    card.appendChild(top_bar);

    //create input > top_bar
    var input = document.createElement("input")
    input.id = `title_${id}`;
    input.type = "text";
    input.value = title;

    top_bar.appendChild(input);

    //create img > top_bar
    var img = document.createElement("img");
    img.id = `close_${id}`;
    img.classList.add(`close_img_${id}`);
    img.src = "https://icons.iconarchive.com/icons/custom-icon-design/mono-general-1/512/close-icon.png";
    img.addEventListener('click', function () { setTimeout(close_note(this), 3000); });

    top_bar.appendChild(img);

    //create textarea > card
    var textarea = document.createElement("textarea");
    textarea.id = `content_${id}`;
    textarea.classList.add("content");
    textarea.innerHTML = content;

    card.appendChild(textarea);

    //log new card to console
    // console.log(col);

    //append new card to "board"
    board.appendChild(col);

    //show new card
    setTimeout(clear => document.getElementById(`card_${id}`).style.opacity = "1", 100);

    // <div class="col" id="card_1" draggable="true" ondragstart="drag_start(event)" style="left: 862px; top: 630px;">
    //     <div class="card">
    //         <div class="top_bar">
    //             <input id="title_1" type="text">
    //             <img src="https://icons.iconarchive.com/icons/custom-icon-design/mono-general-1/512/close-icon.png" onclick="setTimeout(delete_note(this), 3000);">
    //         </div>
    //         <textarea id="content_1" class="content"></textarea>
    //     </div>
    // </div>

}

function close_note(note) {
    parentNote = note.parentElement.parentElement.parentElement;
    // console.log(parentNote); 
    parentNote.style.opacity = "0";
    setTimeout(clear => {
        // console.log(parentNote);
        parentNote.parentNode.removeChild(parentNote)
    }, 250);

}

function closeAll() {
    var cards = document.getElementsByClassName("col");
    console.log(cards);
    var i = 1;
    var j = 1;
    var parentNote = new Array;

    for (let card of cards) {
        parentNote[i] = cards[cards.length - i];
        // console.log(card);
        // close_note(card);

        parentNote[i] = cards[cards.length - i];
        parentNote[i].style.opacity = "0";
        console.log(parentNote[i]);

        setTimeout(() => {
            parentNote[j].parentNode.removeChild(parentNote[j]);
            j++;
        }, 250);

        i = i + 1;
    }
}

function modify_note(id, title, content, x, y) {
    //Get elements
    var cCol = document.getElementById(`card_${id}`);
    var cTitle = document.getElementById(`title_${id}`);
    var cContent = document.getElementById(`content_${id}`);

    //Modify value
    cCol.style = `opacity: 1; left: ${x}px; top: ${y}px;`;
    cTitle.value = title;
    cContent.value = content;
}