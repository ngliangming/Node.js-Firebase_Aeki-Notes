//! Use document.write() to write the header into other html BEFORE displaying it to user, if used after it displays, will reload page
//! Cap each line of the string with "\" when using normal quotes, or simply use "`" instead of the usual string quote for better uses
//! Using "`" allows use of variables inside via ${VAR_NAME}

//! http://localhost:5000/?a=data1&b=data2 for data parse test
//! ${params.has('a')||params.has('b')? `${parsedData1} ||| ${parsedData2}` : ""} basically means if params has a/b, print a & b, else do nothing
const params = new URLSearchParams(window.location.search);

// for (const param of params) {
//     console.log(param)
// }

//!     This is how to use conditional return
//?     CONDITION_TRUE_FALSE ? TRUE_RETURN : FALSE_RETURN
var hasParse = params.has('a') || params.has('b') ? true : false

if (hasParse) {
    var parsedData1 = params.get('a')
    var parsedData2 = params.get('b')
}

document.write(`
<header class=" mb-0 mt-0 mx-0 clearfix">

${hasParse ? `${parsedData1} ||| ${parsedData2}` : ""}

<ul class="nav" style="float: left;">
    <li class="nav-item" style="vertical-align: baseline;">
        <a href="index.html" class="font-weight-bold nav-link"
            style="font-size: 1.5rem; padding-left: 5rem; padding-right: 50px; width: 10rem;">
            <img class="navImg" src='includes/logo-trans.png' draggable="false">
            AEKI
        </a>
    </li>
</ul>

<div style="float: right;">

    <div id="options" class="dropdown nav-title" style="display: none;">
        <a class="dropbtn">

            <i class="fa fa-align-justify" style="font-size:20px;margin-top:15px"></i>
        </a>
        <div class="dropdown-content">
            <button onclick="logout()">Logout</button>
        </div>
    </div>

    <!-- <button id="loginBtn" onclick="closeAll()" class="nav-title float-right nav-item"
        style="border: none; outline:none;">Login</button> -->
    <!-- <button id="loginBtn" onclick="add_note(54,50,50)" class="nav-title float-right nav-item"
        style="display: none; border: none; outline:none;">Login</button> -->

    <button id="loginBtn" onclick="googleLogin()" class="nav-title float-right nav-item"
        style="display: none; border: none; outline:none;">Login</button>

</div>

</header>
`)