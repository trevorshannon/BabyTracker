// Signs-in.
function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

// Signs-out.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=50';
  }
  return url;
}


// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var picUrl = getProfilePicUrl();
    var name = getUserName();

    // Set the user's profile pic and name.
    userPicture.setAttribute('src', addSizeToGoogleProfilePic(picUrl));
    userName.textContent = name;

    // Show user's profile and sign-out button.
    signOutButton.removeAttribute('hidden');
    userPicture.removeAttribute('hidden');
    userName.removeAttribute('hidden');
    dataEntry.removeAttribute('hidden');
    dataSummary.removeAttribute('hidden');

    // Hide sign-in button.
    signInButton.setAttribute('hidden', true);

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    signOutButton.setAttribute('hidden', true);
    userPicture.setAttribute('hidden', true);
    userName.setAttribute('hidden', true);
    dataEntry.setAttribute('hidden', true);
    dataSummary.setAttribute('hidden', true);

    // Show sign-in button.
    signInButton.removeAttribute('hidden');

  }
}

function initializeDateTime() {
  let now = new Date();
  let day = now.getDay();
  let month = now.getMonth();
  date.value = now.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
  let hour = now.getHours();
  let minute = now.getMinutes();
  time.value = (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute);
}

function recordEvent(category, detail) {
  console.log('recording: ', category, detail, date.value, time.value, note.value);
}

// initialize Firebase
initFirebaseAuth();

// Remove the warning about timstamps change. 
var firestore = firebase.firestore();
let signInButton = document.getElementById('sign-in');
let signOutButton = document.getElementById('sign-out');
let userPicture = document.getElementById('profile-pic');
let userName = document.getElementById('user-name');
let dataEntry = document.getElementById('data-entry');
let dataSummary = document.getElementById('data-summary');
let date = document.getElementById('date');
let time = document.getElementById('time');
let note = document.getElementById('note');
let feedLeft = document.getElementById('feed-left');
let feedRight = document.getElementById('feed-right');
let sleepStart = document.getElementById('sleep-start');
let sleepEnd = document.getElementById('sleep-end');
let medTimolol = document.getElementById('med-timolol');
let medNystatin = document.getElementById('med-nystatin');
let medVitd = document.getElementById('med-vitd');


signOutButton.addEventListener('click', signOut);
signInButton.addEventListener('click', signIn);
feedLeft.addEventListener('click', (event) => {recordEvent('feed', 'left')});
feedRight.addEventListener('click', (event) => {recordEvent('feed', 'right')});
sleepStart.addEventListener('click', (event) => {recordEvent('sleep', 'start')});
sleepEnd.addEventListener('click', (event) => {recordEvent('sleep', 'end')});
medTimolol.addEventListener('click', (event) => {recordEvent('med', 'timolol')});
medNystatin.addEventListener('click', (event) => {recordEvent('med', 'nystatin')});
medVitd.addEventListener('click', (event) => {recordEvent('med', 'nystatin')});

initializeDateTime();