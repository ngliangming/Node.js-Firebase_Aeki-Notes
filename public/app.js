document.addEventListener("DOMContentLoaded", event => {

    const app = firebase.app();
    console.log(app)

    const db = firebase.firestore();

    const user = db.collection('users').doc('ngliangming@gmail.com');

    user.get()
        .then(doc => {
            const data = doc.data();
            // document.write(data.name);
        })

});


function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)

        .then(result => {
            const user = result.user;
            const name = user.displayName;
            document.write(`Hello ${user.displayName}`);
            console.log(user)
        })
        .catch(console.log)

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