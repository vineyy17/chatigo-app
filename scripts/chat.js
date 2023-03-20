import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, serverTimestamp, Timestamp,
    addDoc, onSnapshot, where, query, orderBy
} from 'firebase/firestore'
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut, signInWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
  }

  //init firebase app
  initializeApp(firebaseConfig)

  // init services
  const db = getFirestore();
  const auth = getAuth();


class Chatroom {
    constructor(room, username){
        this.room = room;
        this.username =username;
        this.chats = collection(db, 'chats');
        this.unsub;
    }
    async addChat(message){
        const now = new Date();
        const timestamp = Timestamp.fromDate(now);

        const chat = {
            message: message,
            room: this.room,
            username: this.username,
            created_at: timestamp.toDate()
        };
        const response = await addDoc(this.chats, chat)
        return response;
    }
    getChats(callback){
        const q = query(this.chats, where("room", "==", this.room), orderBy("created_at"))

        this.unsub = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach(change => {
            if(change.type === 'added'){
                callback(change.doc.data())
            }
          });
        });
    }
    updateName(username){
        this.username = username;
        localStorage.setItem('username', username);
    }
    updateRoom(room){
        this.room = room;
        console.log("room updated");
        if(this.unsub){
            this.unsub();
        }
    }

}

const { ChatUI } = require("./ui.js");

// DOM queries

// chat queries
const chatList = document.querySelector(".chat-list");
const newChatForm = document.querySelector(".new-chat");
const updateMssg = document.querySelector(".update-mssg");
const rooms = document.querySelector(".chat-rooms");
const chatInterface = document.querySelector(".chat-interface-hidden");
const chatDiv = document.querySelector(".my-4.chat-interface-hidden.col-12");
const logOutButton = document.querySelector(".logout-btn");

// form queries
const createAccountForm = document.querySelector('.create-account-form');
const loginForm = document.querySelector('.login-form');
const showLoginLink = document.querySelector(".show-login-link");
const showCreateAccountLink = document.querySelector('.show-create-account-link');
const landingInterface = document.querySelector('.container')
const signUpMessage = document.querySelector(".signup-update")
const loginMessage = document.querySelector(".login-update")


// form manipulations

// Show the login form when the "Sign in" link is clicked
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    createAccountForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
  
  // Show the create account form when the "Create an account" link is clicked
  showCreateAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    createAccountForm.style.display = 'block';
  });

  // Sign users up
  createAccountForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const name = createAccountForm.name.value
    const email = createAccountForm.email.value
    const password = createAccountForm.password.value

    if (name === ""){
        const noNameErrorMessage = "Please fill in the avatar field";
        signUpMessage.textContent = `${noNameErrorMessage}`
        setTimeout(() => signUpMessage.textContent = '', 5000);
    } else if (email === ""){
        const noEmailErrorMessage = "Please enter an email";
        signUpMessage.textContent = `${noEmailErrorMessage}`
        setTimeout(() => signUpMessage.textContent = '', 5000);
    } else if (password === ""){
        const noPasswordErrorMessage = "Please enter a password";
        signUpMessage.textContent = `${noPasswordErrorMessage}`
        setTimeout(() => signUpMessage.textContent = '', 5000);
    } else {
        createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
        createAccountForm.reset();
        const userName = name.trim();
        landingInterface.style.display = 'none';
        chatInterface.style.display = 'block';
        chatDiv.classList.remove('chat-interface');
        chatDiv.classList.add('chat-ui');
        chatroom.updateName(userName);
        updateMssg.textContent = `Sign up successful. You are now logged in as ${userName}`
        setTimeout(() => updateMssg.textContent = '', 3000);
        localStorage.setItem('sessionToken', '#@12345');
    })

    .catch((err) => {
        console.log(err.code, err.message)
        if (err.code === 'auth/weak-password') {
            let passwordErrorMessage = "Password should be at least 6 characters";
            signUpMessage.textContent = `${passwordErrorMessage}`
            setTimeout(() => signUpMessage.textContent = '', 5000);
        } else if (err.code === 'auth/invalid-email') {
            let emailErrorMessage = "Enter a valid email";
            signUpMessage.textContent = `${emailErrorMessage}`
            setTimeout(() => signUpMessage.textContent = '', 5000);
        } else if (err.code === 'auth/email-already-in-use') {
            let emailInUseErrorMessage = "This email is already in use, login instead.";
            signUpMessage.textContent = `${emailInUseErrorMessage}`
            setTimeout(() => signUpMessage.textContent = '', 5000);
        } else if (createAccountForm.password.value === '') {
            let nilErrorMessage = "Please enter a password";
            signUpMessage.textContent = `${nilErrorMessage}`
            setTimeout(() => signUpMessage.textContent = '', 5000);
        }
    });

    };

  });

//   Log users in

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = loginForm.name.value
    const email = loginForm.email.value
    const password = loginForm.password.value

    if (name === ""){
        const noNameErrorMessage = "Please fill in the avatar field.";
        loginMessage.textContent = `${noNameErrorMessage}`
        setTimeout(() => loginMessage.textContent = '', 5000);
    } else if (email === ""){
        const noEmailErrorMessage = "Please enter an email";
        loginMessage.textContent = `${noEmailErrorMessage}`
        setTimeout(() => loginMessage.textContent = '', 5000);
    } else if (password === ""){
        const noPasswordErrorMessage = "Please enter a password.";
        loginMessage.textContent = `${noPasswordErrorMessage}`
        setTimeout(() => loginMessage.textContent = '', 5000);
    } else {
        signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
        loginForm.reset()
        const userName = name.trim();
        landingInterface.style.display = 'none';
        chatInterface.style.display = 'block';
        chatDiv.classList.remove('chat-interface');
        chatDiv.classList.add('chat-ui');
        chatroom.updateName(userName);
        updateMssg.textContent = `Login successful. You are now logged in as ${userName}`
        setTimeout(() => updateMssg.textContent = '', 3000);
        localStorage.setItem('sessionToken', '#@12345');
    })
    .catch((err) => {
        console.log(err.code, err.message)
        if (err.code === 'auth/wrong-password') {
            let passwordErrorMessage = "The password you entered is incorrect";
            loginMessage.textContent = `${passwordErrorMessage}`
            setTimeout(() => loginMessage.textContent = '', 5000);
        } else if (err.code === 'auth/invalid-email') {
            let emailErrorMessage = "Enter a valid email.";
            loginMessage.textContent = `${emailErrorMessage}`
            setTimeout(() => loginMessage.textContent = '', 5000);
        } else if (err.code === 'auth/user-not-found') {
            let userNotFoundErrorMessage = "This user does not exist.";
            loginMessage.textContent = `${userNotFoundErrorMessage}`
            setTimeout(() => loginMessage.textContent = '', 5000);
        } 
    });
    };
});

window.onload = function() {
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      landingInterface.style.display = 'none';
      chatInterface.style.display = 'block';
      chatDiv.classList.remove('chat-interface');
      chatDiv.classList.add('chat-ui');
    } else {
      updateDisplay();
    }
  };

// function to update display based on screen size
const updateDisplay = () => {
    if (window.matchMedia('(min-width: 200px) and (max-width: 1000px) and (orientation: portrait)').matches) {
        landingInterface.style.display = 'block';
        chatInterface.style.display = 'none';
    } else if (window.matchMedia('(min-width: 200px) and (max-width: 1000px) and (orientation: landscape)').matches) {
        landingInterface.style.display = 'grid';
        chatInterface.style.display = 'none'; 
    } else {
        landingInterface.style.display = 'grid';
        chatInterface.style.display = 'none';
    };
};

const listener = () => {
    if (chatInterface.style.display == 'none') {
      updateDisplay();
    }
  }
  
window.addEventListener('resize', listener);

// log users out
logOutButton.addEventListener('click', () => {
    signOut(auth)
    .then(() => {
        updateDisplay();
        localStorage.removeItem('sessionToken');
    })
    .catch((err) => {
        console.log(err.message);
    })
});

// add a new chat
newChatForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = newChatForm.message.value.trim()
    chatroom.addChat(message)
    .then(() => {
        newChatForm.reset()
    })
    .catch(err => console.log(err));
});

// update the chat room
rooms.addEventListener('click', e => {
    if(e.target.tagName === 'BUTTON'){
      chatUI.clear();
      chatroom.updateRoom(e.target.getAttribute('id'));
      chatroom.getChats(chat => chatUI.render(chat));
    }
})

const username = localStorage.username ? localStorage.username : "anon";

// class instances
const chatroom = new Chatroom('general', username);
const chatUI = new ChatUI(chatList);

chatroom.getChats((data) => chatUI.render(data));



