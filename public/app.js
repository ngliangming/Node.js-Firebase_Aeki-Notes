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
});

//Login functions
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)

        .then(result => {
            const user = result.user;

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
                    if (document.getElementById(`${snap.docs[i].id}`) == null) {
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

            toggleUi(true);
        });

        return true;
    }
    else {
        toggleUi(false);

        return false;
    }

}

function toggleUi(loggedIn) {
    options = document.getElementById('options');
    loginBtn = document.getElementById('loginBtn');
    welcomeMsg = document.getElementById('welcomeMsg');
    createBtn = document.getElementById('createNote');

    if (loggedIn) {
        console.log(`Prior data exists as user ${user}`);
        options.style.display = "block";
        loginBtn.style.display = "none";
        welcomeMsg.style.opacity = 0;
        
        createBtn.style.display = "block";
        
    } else {
        // console.log(`No prior data`);
        loginBtn.style.display = "block";
        options.style.display = "none";
        welcomeMsg.style.opacity = 1;

        createBtn.style.display = "none";

        closeAll();
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
    var x;
    var y;

    if (event.clientX + parseInt(offset[0], 10) <= 0) {
        dm.style.left = 0 + 'px';
        x = 0
    } else {
        dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
        x = event.clientX + parseInt(offset[0], 10);
    }

    if (event.clientY + parseInt(offset[1], 10) <= 50) {
        dm.style.top = 50 + 'px';
        y = 50
    } else {
        dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
        y = event.clientY + parseInt(offset[1], 10);
    }

    update_note(dm.id);

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
    col.id = `${id}`;
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
    input.addEventListener("change", function () { update_note(id); });

    top_bar.appendChild(input);

    //create img > top_bar
    var img = document.createElement("img");
    img.id = `close_${id}`;
    img.classList.add(`close_img_${id}`);
    img.draggable = false;
    img.src = "https://icons.iconarchive.com/icons/custom-icon-design/mono-general-1/512/close-icon.png";
    // img.addEventListener('click', function () { setTimeout(close_note(this), 3000); });
    img.addEventListener('click', function () { delete_note(id); });

    top_bar.appendChild(img);

    //create HR
    var hr = document.createElement("hr");

    card.appendChild(hr);

    //create textarea > card
    var textarea = document.createElement("textarea");
    textarea.id = `content_${id}`;
    textarea.classList.add("content");
    textarea.innerHTML = content;
    textarea.addEventListener("change", function () { update_note(id); });

    card.appendChild(textarea);

    //log new card to console
    // console.log(col);

    //append new card to "board"
    board.appendChild(col);

    //show new card
    setTimeout(clear => document.getElementById(`${id}`).style.opacity = "1", 100);
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
    var cCol = document.getElementById(`${id}`);
    var cTitle = document.getElementById(`title_${id}`);
    var cContent = document.getElementById(`content_${id}`);

    //Check and modify differing values
    if (cCol.style.left != x + "px" || cCol.style.top != y + "px") {
        cCol.style = `opacity: 1; left: ${x}px; top: ${y}px;`;
        // console.log(`${id} Change to x/y`)
    }
    if (cTitle.value != title) {
        cTitle.value = title;
        // console.log(`${id} Change to title`)
    }
    if (cContent.value != content) {
        cContent.value = content;
        // console.log(`${id} Change to content`)
    }
}

function create_note() {
    // window.user_cont = window.db.collection('users').doc(localStorage.getItem('email')).collection('notes')
    window.db.collection('users').doc(localStorage.getItem('email')).collection('notes')
        .add({
            title: "",
            content: "",
            x: 100,
            y: 150
        })
        .then(function () {
            alert_box("Note created");
            console.log("Note successfully created!");
        })
        .catch(function (error) {
            console.error("Error creating note: ", error);
        });
}

function delete_note(id) {
    // window.db.collection('users').doc(localStorage.getItem('email')).collection('notes')
    window.db.collection('users').doc(localStorage.getItem('email')).collection('notes').doc(id).delete()
        .then(function () {
            alert_box("Note deleted");
            console.log("Note successfully deleted!");
        })
        .catch(function (error) {
            console.error("Error deleting note: ", error);
        });
}

function update_note(id) {
    var cCol = document.getElementById(`${id}`);
    var cTitle = document.getElementById(`title_${id}`);
    var cContent = document.getElementById(`content_${id}`);

    window.db.collection('users').doc(localStorage.getItem('email')).collection('notes').doc(id).set({
        title: cTitle.value,
        content: cContent.value,
        x: cCol.style.left.replace("px", ""),
        y: cCol.style.top.replace("px", "")
    })
        .then(function () {
            alert_box("Note updated");
            console.log("Note successfully updated!");
        })
        .catch(function (error) {
            console.error("Error updated note: ", error);
        });
}

function alert_box(msg) {
    document.getElementById("alert").innerHTML = msg;
    document.getElementById("alert").style.opacity = 1;
    setTimeout(() => {
        document.getElementById("alert").style.opacity = 0;
    }, 1000);
}