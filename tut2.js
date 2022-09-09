// Global constants and global variable
const BOOKING_LIST = "BOOKING_LIST"; //identifier for window local storage
const MAX_SERIAL_NO = 99999999; //upper limit for serial number
const MIN_SERIAL_NO = 10000000; //lower limit for serial number
const MAX_CAPACITY = 10;
const INACTIVE_DURATION = 60000; //60000 milliseconds or 60 seconds
var bookingList = {};
let timeout;

document.addEventListener("DOMContentLoaded", function () {
    bookingList = load_storage(); //retrieve storage from previous session.
    updateAvailability(); //update the availability on home page on initialization.

    // 'listen' to the event which the book button is clicked. 
    // execute createBooking function upon the occurence of the event.
    const nameValue = document.getElementById("nameField");
    const phoneValue = document.getElementById("phoneField");
    const submitName = document.getElementById("nameSubmit");
    submitName.addEventListener("click", function () {
        createBooking(nameValue.value, phoneValue.value);
    });

    // 'listen' to the event which the display tab is clicked.
    // execute createBookingListTable function upon the occurence of the event.
    const displayButton = document.getElementById("display");
    displayButton.addEventListener("click", createBookingListTable);
})

//function to open the respective navigation tab.
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (tabName == 'Book'){
      stop_inactive_countdown(timeout);
      inactive_countdown();
    }
    else if (tabName == 'Cancel') {
      stop_inactive_countdown(timeout);
      displayCancelList();
    }
    else{
      stop_inactive_countdown(timeout);
    }
    console.log("switching tab...");
  }

//function to open the default tab (for initialization of the web).
function defaultTab(tabName) {
    console.log("switching tab..");
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
  }

//function to update availability of the seats on home tab.
function updateAvailability(){
    let num = Object.keys(bookingList).length;
    let x = "There are currently " + (MAX_CAPACITY - num) + " seats available.";
    document.getElementById("homepage").innerHTML= x;
}

//function to create a booking with full name and phone number
function createBooking(fullName, phoneNum){
  let identifier = generateRandomSerialNo();
  while (identifier in bookingList){
    identifier = generateRandomSerialNo();
  }
  const recordDetails = {};
  if (!fullName && !phoneNum){ //check if full name and phone number fields are empty.
    alert("Please key in your full name and phone number.");
    return;
  }
  else if (!fullName){ //check if full name field is empty.
    alert("Please key in your full name.");
    return;
  }
  else if (!phoneNum){ //check if phone number field is empty.
    alert("Please key in your phone number.");
    return;
  }
  else if (Object.keys(bookingList).length >= MAX_CAPACITY) { //check if the reservation is fully booked
    alert("Reservation is fully booked. Try again later!");
    return;
  }
  else { //make a booking
    const date = new Date();
    const timeStamp = date.toLocaleString();
    recordDetails.full_name = fullName;
    recordDetails.phone = phoneNum;
    recordDetails.timestamp = timeStamp;
    bookingList[identifier] = recordDetails;   
    updateAvailability();
    save_storage();
    alert("Booking made.");
    stop_inactive_countdown(timeout);
    clear_new_booking_input();
    inactive_countdown();
  }
}

//function to cancel a booking of a stated serial ID.
function cancelBooking(serial_id){
    delete bookingList[serial_id];
    updateAvailability();
    save_storage();
    alert("Booking cancelled.");
    displayCancelList();
}

//function to display the booking list for cancellation
function displayCancelList() {
  const cancelBookTable = document.getElementById("cancel_table");
  if (Object.keys(bookingList).length == 0){ //display a message if no booking has been made.
    cancelBookTable.innerHTML = "No booking has been made.";
    cancelBookTable.style.border = "none";
  }
  else {
    cancelBookTable.innerHTML = "";
    cancelBookTable.innerHTML += (
    "<tr id='displayTableHeader'>" +
    '<th>No</th>' +
    '<th>Serial No</th>' +
    '<th>Full Name</th>' +
    '<th>Phone Number</th>' +
    '<th>Timestamp</th>' +
    '<th>Action</th>' +
    '</tr>'
    );
    var i = 1;
    cancelBookTable.style.border = "1px solid";
    for (const key of Object.keys(bookingList)){
      cancelBookTable.innerHTML += (
      "<tr>" +
      `<td>${i}</th>` +
      `<td>${key}</th>` +
      `<td>${bookingList[key].full_name}</th>` +
      `<td>${bookingList[key].phone}</th>` +
      `<td>${bookingList[key].timestamp}</th>` +
      `<td><button id="cancel_btn" class="btn btn-danger" onclick="cancelBooking(${key})">Cancel</button></th>` +
      '</tr>'
      )
      ++i;
    }
  }
}

//function to populate and display booking list on Display tab.
function createBookingListTable() {
  const bookingTable = document.getElementById("table");
  if (Object.keys(bookingList).length == 0){ //display a message if no booking has been made.
    bookingTable.innerHTML = "No booking has been made.";
    bookingTable.style.border = "none";
  }
  else {
    bookingTable.innerHTML = "";
    bookingTable.innerHTML += (
    "<tr id='displayTableHeader'>" +
    '<th>No</th>' +
    '<th>Serial No</th>' +
    '<th>Full Name</th>' +
    '<th>Phone Number</th>' +
    '<th>Timestamp</th>' +
    '</tr>'
    );
    var i = 1;
    bookingTable.style.border = "1px solid";
    for (const key of Object.keys(bookingList)){
      bookingTable.innerHTML += (
      "<tr>" +
      `<td>${i}</th>` +
      `<td>${key}</th>` +
      `<td>${bookingList[key].full_name}</th>` +
      `<td>${bookingList[key].phone}</th>` +
      `<td>${bookingList[key].timestamp}</th>` +
      '</tr>'
      )
      ++i;
    }
  }
}

//function to retrieve booking list from local storage
function load_storage() {
  const booking_list = JSON.parse(window.localStorage.getItem(BOOKING_LIST));
  if (booking_list == null){ //create a new booking list if it doesn't exist
  	let initiated_data = initiate_storage();
    console.log("No existing list. New list created");
    return initiated_data;
  }
  console.log("Existing list retrieved");
  return booking_list;
}

//function to create a new booking list
function initiate_storage() {
  const booking_list = {};
  return booking_list;
}

//function to generate a random serial number in a defined range
function generateRandomSerialNo() {
  const identifier = Math.floor(Math.random() * (MAX_SERIAL_NO-MIN_SERIAL_NO) + MIN_SERIAL_NO);
  return identifier;
}
 
//function to save the booking list to local storage
function save_storage() {
  console.log("data saved");
  let data_string = JSON.stringify(bookingList);
  window.localStorage.setItem(BOOKING_LIST, data_string);
}

//function to generate the pop up message
function pop_up_message() {
  let text = "Seems like you are taking awhile.\nPress OK to continue or Cancel to clear the page.";
  if (confirm(text) != true) {
    clear_new_booking_input()
    inactive_countdown();
  }
  else {inactive_countdown();}
}

//function to clear the inputs on booking tab
function clear_new_booking_input() {
  document.getElementById('nameField').value = '';
  document.getElementById('phoneField').value = '';
  return;
}

//function to perform countdown
function inactive_countdown() {
  console.log("initialize inactive countdown..");
  timeout = setTimeout(function() {
    pop_up_message()
  },Number(INACTIVE_DURATION));
  return;
}

//function to stop the interval countdown
function stop_inactive_countdown(timeout) {
  console.log("stopping countdown..")
  clearTimeout(timeout);
  return;
}