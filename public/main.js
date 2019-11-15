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
    return url + '?sz=40';
  }
  return url;
}


// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
  	loadRecentData();

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

// Template for messages.
const ENTRY_TEMPLATE =
    '<tr class="entry-container">' +
      '<td class="category"></td>' +
      '<td class="time"></td>' +
      '<td class="type"></td>' +
      '<td class="note"></td>' +
      '<td><button>X</button></td>' +
      '<td><button hidden>Sure?</button></td>' +
    '</tr>';

function createAndInsertEntry(category, id, timestamp) {
  const container = document.createElement('table');
  container.innerHTML = ENTRY_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);
  div.setAttribute('time', timestamp);
  let confirmButton = div.firstChild.lastChild.firstChild;
  div.firstChild.lastChild.previousSibling.firstChild.addEventListener('click', 
  		(event) => {confirmButton.removeAttribute('hidden')});
  confirmButton.addEventListener('click', (event) => {deleteEntry(category, id)});

  // figure out where to insert new data entry.
  const existingEntries = entryListElement.children;
  if (existingEntries.length === 0) {
    entryListElement.appendChild(div);
  } else {
    let entryListNode = existingEntries[0];

    while (entryListNode) {
      const entryListNodeTime = entryListNode.getAttribute('time');

      if (!entryListNodeTime) {
        throw new Error(
          `Child ${entryListNode.id} has no 'time' attribute`
        );
      }

      if (entryListNodeTime < timestamp) {
        break;
      }

      entryListNode = entryListNode.nextSibling;
    }

    entryListElement.insertBefore(div, entryListNode);
  }

  return div;
}

// Delete a data entry from the UI.
function deleteHtmlEntry(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function removeEntryFromCache(category, id) {
  for (let i = 0; i < cachedData[category].length; i++) {
  	if (cachedData[category][i].id === id) {
  		cachedData[category].splice(i, 1);
  		return;
  	}
  }
}

function addEntryToCache(category, entry) {
  // Assume cached data is already in the right order.
  for (let i = 0; i < cachedData[category].length; i++) {
  	if (entry.time > cachedData[category][i].time) {
  	  cachedData[category] = [entry].concat(cachedData[category]);
  	  return;
  	}
  	if (entry.id === cachedData[category][i].id) {
  	  cachedData[category][i] = entry;
  	  return;
  	}
  }
  cachedData[category].push(entry);
}

// Displays a data in the UI.
function displayEntry(id, timestamp, category, type, note) {
  var div = document.getElementById(id) || createAndInsertEntry(category, id, timestamp);

  let time = new Date(timestamp.toMillis());
  let dateString = (time.getMonth() + 1) + "/" + time.getDate() + "/" + time.getFullYear();
  let hours = time.getHours();
  let hoursString = hours == 0 ? 12 : (hours > 12 ? hours - 12 : hours);
  let timeString = hoursString + ":" + (time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()) + 
  		" " + (hours >= 12 ? "PM" : "AM");
  let categoryString = '';
  let typeString = '';
  switch (category) {
  	case 'feeds':
  		categoryString = '🍼';
  		typeString = 'fed on ' + type;
  		break;
  	case 'sleeps':
  		categoryString = '😴';
  		typeString = 'sleep ' + type + 'ed';
  		break;
  	case 'meds':
  		categoryString = '💊';
  		typeString = 'took ' + type;
  		break;
  	case 'pumps':
  		categoryString = '👩‍🔬';
  		typeString = 'pumped ' + type;
  		break;
  	default: 
  		categoryString = category;
  }
  div.querySelector('.time').textContent = dateString+ " " + timeString;
  div.querySelector('.category').textContent = categoryString;
  div.querySelector('.type').textContent = typeString;
  div.querySelector('.note').textContent = note;
}

function initializeDateTime() {
  let now = new Date();
  let day = now.getDate();
  let month = now.getMonth() + 1;
  date.value = now.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + 
  		(day < 10 ? "0" + day : day);
  let hour = now.getHours();
  let minute = now.getMinutes();
  time.value = (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute);
}

function recordEvent(category, type) {
  console.log('recording: ', category, type, date.value, time.value, note.value);
  // Add a new entry to the Firebase firestore.
  let recordedTime = new Date(date.value + " " + time.value);
  return firebase.firestore().collection(category).add({
    user: getUserName(),
    note: note.value,
    type: type,
    time: firebase.firestore.Timestamp.fromDate(recordedTime),
    timeAdded: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(error) {
    console.error('Error writing new message to Firebase Database', error);
  });
}

// Deletes an entry from the Cloud Firestore.
function deleteEntry(category, id) {
  firebase.firestore().collection(category).doc(id).delete().then(function() {
    console.log("Document successfully deleted!");
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });
}

function loadRecentData() {
  let categories;
  if (entriesFilter.value == 'all') {
  	categories = ['feeds', 'sleeps', 'meds', 'pumps'];
  } else {
  	categories = [entriesFilter.value];
  }
  // TODO delete all.
  categories.forEach((category, index) => {
	  // Create the query to load entries and listen for new ones.
	  // TODO: Limit to fewer entries.
	  var query = firebase.firestore().collection(category).orderBy('time', 'desc');
	  
	  // Start listening to the query.
	  query.onSnapshot(function(snapshot) {
	    snapshot.docChanges().forEach(function(change) {
	      if (change.type === 'removed') {
	        deleteHtmlEntry(change.doc.id);
	        removeEntryFromCache(category, change.doc.id);
	      } else {
	        var data = change.doc.data();
	        displayEntry(change.doc.id, data.time, category, data.type, data.note);
	        addEntryToCache(category, {'time': data.time.toMillis(), 'type': data.type, 'id': change.doc.id});
	      }
	    });
	    analyzeData(category, cachedData[category]);
	  });
	});
}

function analyzeData(category, items) {
  let now = new Date();
  let yesterday = new Date(now.getTime() - 24*60*60*1000);
  if (category == 'sleeps') {
  	let sleepDuration = 0;
  	if (items[0].type == 'start') {
  	  items = [{'time': now.getTime(), 'type': 'end'}].concat(items);
  	}
  	for (let i = 0; i < items.length - 1; i+=2) {
  	  if (items[i].time < yesterday.getTime()) {
  	  	break;
  	  }
  	  if (items[i + 1].time < yesterday.getTime()) {
  	  	items[i + 1].time = yesterday.getTime();
  	  }
  	  if (items[i].type != 'end' || items[i+1].type != 'start') {
  	  	console.log('Missed logging a sleep!');
  	  	i += 1;
  	  }
  	  sleepDuration += items[i].time - items[i+1].time;
  	}
  	sleepAnalysis.innerHTML = parseFloat(sleepDuration / (60 * 60 * 1000)).toFixed(2);
  } else if (category == 'feeds') {
  	let count = 0;
  	for (let i = 0; i < items.length; i++) {
  	  if (items[i].time < yesterday.getTime()) {
  	  	break;
  	  }
  	  count += 1;
  	}
  	feedAnalysis.innerHTML = count;
  	// TODO: Go back further in case this was a bottle feed.
  	nextSide.innerHTML = items[0].type == 'left' ? 'Righty' : 'Lefty';
  }
}

function clearEntries() {
  entryListElement.innerHTML = '';
}

// initialize Firebase
initFirebaseAuth();

// Store recent entries locally.
let cachedData = {'sleeps': [], 'feeds': [], 'pumps': [], 'meds': []};

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
let feedBottle = document.getElementById('feed-bottle');
let sleepStart = document.getElementById('sleep-start');
let sleepEnd = document.getElementById('sleep-end');
let medTimolol = document.getElementById('med-timolol');
let medFluc = document.getElementById('med-fluc');
let pumpLeft = document.getElementById('pump-left');
let pumpRight = document.getElementById('pump-right');
let medVitd = document.getElementById('med-vitd');
let entryListElement = document.getElementById('entries');
let entriesFilter = document.getElementById('entry-filter');
let feedAnalysis = document.getElementById('feed-analysis');
let sleepAnalysis = document.getElementById('sleep-analysis');
let nextSide = document.getElementById('next-side');

signOutButton.addEventListener('click', signOut);
signInButton.addEventListener('click', signIn);
feedLeft.addEventListener('click', (event) => {recordEvent('feeds', 'left')});
feedRight.addEventListener('click', (event) => {recordEvent('feeds', 'right')});
feedBottle.addEventListener('click', (event) => {recordEvent('feeds', 'bottle')});
pumpLeft.addEventListener('click', (event) => {recordEvent('pumps', 'left')});
pumpRight.addEventListener('click', (event) => {recordEvent('pumps', 'right')});
sleepStart.addEventListener('click', (event) => {recordEvent('sleeps', 'start')});
sleepEnd.addEventListener('click', (event) => {recordEvent('sleeps', 'end')});
medTimolol.addEventListener('click', (event) => {recordEvent('meds', 'timolol')});
medFluc.addEventListener('click', (event) => {recordEvent('meds', 'fluconazole')});
medVitd.addEventListener('click', (event) => {recordEvent('meds', 'vitamin d')});
entriesFilter.addEventListener('change', (event) => {clearEntries(); loadRecentData()});

initializeDateTime();
