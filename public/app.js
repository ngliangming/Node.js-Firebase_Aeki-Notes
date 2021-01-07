document.addEventListener("DOMContentLoaded", event => {

    const app = firebase.app();
    console.log(app)

    const db = firebase.firestore();
    var user;

    if (loadUser()) {
        console.log('logged in');

        user = db.collection('users').doc(localStorage.getItem('user'));

        user.onSnapshot(doc => {
            //Executes everytime doc changes from firebase

            const data = doc.data();
            console.log(data);
        });


        user = null;

        // subscribe(user);

    } else {
        console.log('not logged in');
    }

    for (let i = 0; i < 10; i++) {
        add_note(i, i * 50 + 50, i * 50 + 100);
    }

    // setTimeout(() => {
    //     unsubscribe(user);
    //     console.log('unsub');
    // }, 5000);
});

function subscribe(user) {
    user.onSnapshot(doc => {
        //Executes everytime doc changes from firebase

        const data = doc.data();
        console.log(data);
    });
}

function unsubscribe(user) {
    user.onSnapshot(doc => {

        const data = doc.data();
        console.log('AAA');
    });
}

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)

        .then(result => {
            const user = result.user;
            const name = user.displayName;
            // document.write(`Hello ${user.displayName}`);
            console.log(user.email)

            localStorage.setItem('user', user.email);
            localStorage.setItem('credential', result.credential);
            // The signed-in user info.

            loadUser(localStorage.getItem('user') + localStorage.getItem('credential'));
        })
        .catch(console.log)

}

function logout() {
    localStorage.removeItem('user');
    loadUser();
}

function loadUser() {
    user = localStorage.getItem('user');

    if (user) {
        console.log(`Prior data exists as user ${user}`);
        document.getElementById('options').style.display = "block";
        document.getElementById('loginBtn').style.display = "none";

        document.getElementById('welcomeMsg').innerHTML = `Welcome ${localStorage.user}!`;
        return true;
    }
    else {
        console.log(`No prior data`);
        document.getElementById('loginBtn').style.display = "block";
        document.getElementById('options').style.display = "none";

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
    dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
    dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
    event.preventDefault();
    return false;
}

function drag_over(event) {
    event.preventDefault();
    return false;
}

//Note/Card function
function add_note(id, x, y) {
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

    top_bar.appendChild(input);

    //create img > top_bar
    var img = document.createElement("img");
    img.id = `close_${id}`;
    img.classList.add("close_img");
    img.src = "https://icons.iconarchive.com/icons/custom-icon-design/mono-general-1/512/close-icon.png";
    img.addEventListener('click', function () { setTimeout(close_note(this), 3000); });

    top_bar.appendChild(img);

    //create textarea > card
    var textarea = document.createElement("textarea");
    textarea.id = `content__${id}`;
    textarea.classList.add("content");

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
        console.log(parentNote);
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