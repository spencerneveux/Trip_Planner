/*
 * Plugin Name: Long Beach Transit - Trip Planner 
 * Plugin URI: http://www.ridelbt.communecommunication.com
 * Description: A custom trip planner for the Long Beach Transit bus system, using GTFS feed supplied to Google Maps. 
 * Author: Spencer Neveux 
 * Version: 0.0.1 
*/

//=======================================
// Main
//=======================================
const LONGBEACH = { lat: 33.77, lng: -118.19 };

function initMap() {
  //Initialize Service Objects
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const directionsService = new google.maps.DirectionsService();

  //Get map element & set panel to display output results
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: LONGBEACH, 
    fullscreenControl: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.BOTTOM_LEFT,
    }
  });

  //Setters for directions renderer
  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById("directions-panel"));

  //Get extra control panel
  const control = document.getElementById("floating-panel");
  control.style.display = "block";

  //Create the search box and link it to the UI element.
  const input = document.getElementById("start");
  const input2 = document.getElementById("end");
  const searchBox = new google.maps.places.SearchBox(input);
  const searchBox2 = new google.maps.places.SearchBox(input2);

  //Set map controls and setup listener for when bounds change
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
    searchBox2.setBounds(map.getBounds());
  });

  //
  const onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };

  //Event listeners for input options
  document.getElementById("when").addEventListener("change", showHideDateTimeContainer);
  document.getElementById("datePicker").addEventListener("change", showHideDateTimeContainer);
  document.getElementById("lbt-trip-planner-button").addEventListener("click", onChangeHandler);
}

//=======================================
// Directions Manager - Strategy Pattern
//=======================================

/*
*
* Description - This class employs the Strategy Design pattern to handle custom 
* outputs depending upon user selected options.
*
*/
class DirectionsManager {
    constructor() {
        this._strategy = null;
    }

    set_strategy(strategy) {
        this._strategy = strategy;
    }

    get_strategy() {
        return this._strategy;
    }

    doAction() {
        this._strategy.doAction();
    }
}

class LeaveNow {
    constructor(startAddress, endAddress, directionsService, directionsRenderer) {
        this._when = "now";
        this._startAddress = startAddress;
        this._endAddress = endAddress;
        this._directionsService = directionsService;
        this._directionsRenderer = directionsRenderer;
    }

    set_startAddress(startAddress) {
        this._startAddress = startAddress;
    }

    get_startAddress() {
        return this._startAddress;
    }

    set_endAddress(endAddress) {
        this._endAddress = endAddress;
    }

    get_endAddress() {
        return this._endAddress;
    }

    set_directionsService(directionsService) {
        this._directionsService = directionsService;
    }

    get_directionsService() {
        return this._directionsService;
    }

    set_directionsRenderer(directionsRenderer) {
        this._directionsRenderer = directionsRenderer;
    }

    get_directionsRenderer() {
        return this._directionsRenderer;
    }

    doAction() {
        console.log(this._when);
        this.buildDirectionService();
    }

    buildDirectionService() {
        this._directionsService.route(
            {
              origin: this._startAddress,
              destination: this._endAddress,
              travelMode: 'TRANSIT',
              transitOptions: {
                departureTime: new Date(),
                modes: ['BUS'],
                routingPreference: 'FEWER_TRANSFERS'
                }
            },
            (response, status) => {
              if (status === "OK") {
                this._directionsRenderer.setDirections(response);
              } else {
                const errorHandler = new ErrorHandler(status);
                errorHandler.handle();
              }
            }
        );
    }
}

class DepartAt {
    constructor(date, startAddress, endAddress, directionsService, directionsRenderer) {
        this._when = "depart";
        this._date = date;
        this._startAddress = startAddress;
        this._endAddress = endAddress;
        this._directionsService = directionsService;
        this._directionsRenderer = directionsRenderer;
    }

    set_date(date) {
        this._date = date;
    }

    get_date() {
        return this._date;
    }

    set_startAddress(startAddress) {
        this._startAddress = startAddress;
    }

    get_startAddress() {
        return this._startAddress;
    }

    set_endAddress(endAddress) {
        this._endAddress = endAddress;
    }

    get_endAddress() {
        return this._endAddress;
    }

    set_directionsService(directionsService) {
        this._directionsService = directionsService;
    }

    get_directionsService() {
        return this._directionsService;
    }

    set_directionsRenderer(directionsRenderer) {
        this._directionsRenderer = directionsRenderer;
    }

    get_directionsRenderer() {
        return this._directionsRenderer;
    }

    doAction() {
        console.log(this._when);
        this.buildDirectionService();
    }

    buildDirectionService() {
        this._directionsService.route(
            {
              origin: this._startAddress,
              destination: this._endAddress,
              travelMode: 'TRANSIT',
              transitOptions: {
                departureTime: new Date(this._date.value),
                modes: ['BUS'],
                routingPreference: 'FEWER_TRANSFERS'
                }
            },
            (response, status) => {
              if (status === "OK") {
                this._directionsRenderer.setDirections(response);
              } else {
                const errorHandler = new ErrorHandler(status);
                errorHandler.handle();
              }
            }
        );
    }
}

class ArriveAt {
    constructor(date, startAddress, endAddress, directionsService, directionsRenderer) {
        this._when = "arrive";
        this._date = date;
        this._startAddress = startAddress;
        this._endAddress = endAddress;
        this._directionsService = directionsService;
        this._directionsRenderer = directionsRenderer;
    }

    set_date(date) {
        this._date = date;
    }

    get_date() {
        return this._date;
    }

    set_startAddress(startAddress) {
        this._startAddress = startAddress;
    }

    get_startAddress() {
        return this._startAddress;
    }

    set_endAddress(endAddress) {
        this._endAddress = endAddress;
    }

    get_endAddress() {
        return this._endAddress;
    }

    set_directionsService(directionsService) {
        this._directionsService = directionsService;
    }

    get_directionsService() {
        return this._directionsService;
    }

    set_directionsRenderer(directionsRenderer) {
        this._directionsRenderer = directionsRenderer;
    }

    get_directionsRenderer() {
        return this._directionsRenderer;
    }

    doAction() {
        console.log(this._when);
        this.buildDirectionService();
    }

    buildDirectionService() {
        this._directionsService.route(
            {
              origin: this._startAddress,
              destination: this._endAddress,
              travelMode: 'TRANSIT',
              transitOptions: {
                arrivalTime: new Date(this._date.value),
                modes: ['BUS'],
                routingPreference: 'FEWER_TRANSFERS'
                }
            },
            (response, status) => {
              if (status === "OK") {
                this._directionsRenderer.setDirections(response);
              } else {
                const errorHandler = new ErrorHandler(status);
                errorHandler.handle();
              }
            }
        );
    }
}

//=======================================
// Error Handler
//=======================================
class ErrorHandler {
    constructor(status) {
        this._status = status;
    }

    handle() {
        switch(this._status) {
            case "NOT_FOUND":
                window.alert("Sorry! We coudln't find at least one of the specified locations in your request.");
                break;
            case "ZERO_RESULTS":
                window.alert("Sorry! No route could be found between your origin and destination.");
                break;
            case "INVALID_REQUEST":
                window.alert("Sorry! The request provided was invalid.");
                break;
            case "OVER_QUERY_LIMIT":
                window.alert("Sorry! You have sent too many requests in a given time. Please try again later.");
                break;
            case "REQUEST_DENIED":
                window.alert("Sorry! You don't have access to use the directions service.");
                break;
            case "UNKNOWN_ERROR":
                window.alert("Whoops! We don't know what went wrong.");
                break;
        }
    }

}


//===================================
// Utility Functions
//===================================

/*
* Description - Given a string, attempt to replace substring ', USA'
* For some reason Google's Directions Service isn't handling the USA portion
* of a supplied address. It causes it to render the wrong locations, so removing
* it for now.
* @param string str
*/
function strReplaceUSA(str) {
    return str.replace(", USA", "");
}


/*
* Show or hide the DOM element with id date-time-container 
* @return Date - New date or date selected from input
*/
function showHideDateTimeContainer() {
  var date = new Date();
  const when = document.getElementById("when");
  const dateContainer = document.getElementById("date-time-container");

  if (when.value === "depart" || when.value === "arrive") {
    dateContainer.style.display = "block";
    date = document.getElementById("datePicker");
  }
  else {
    dateContainer.style.display = "none";
  }

  return date;
}


/*
*
* Description - Calculates and displays route from user supplied starting and ending location
* as well as when they want to leave [now, depart at, arrive at].
* 
* @param DirectionsService directionsService - google maps DirectionsService class
* @param DirectionsRenderer directionsRenderer - google maps DirectionsRenderer class
*
*/
function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    var when = document.getElementById("when");
    var start = strReplaceUSA(document.getElementById("start").value);
    var end = strReplaceUSA(document.getElementById("end").value);
  
    //Identify if departure or arrival time is selected & get date value
    var date = showHideDateTimeContainer();
  
    //Instantiat direction manager class to handle time inputs
    const directionsManager = new DirectionsManager();
  
    //Call respective strategy depending upon user input
    if (when.value === "any") {
      const leaveNow = new LeaveNow(start, end, directionsService, directionsRenderer);
  
      directionsManager.set_strategy(leaveNow);
      directionsManager.doAction();
    }
    else if (when.value === "depart") {
      const departAt = new DepartAt(date, start, end, directionsService, directionsRenderer);
  
      directionsManager.set_strategy(departAt);
      directionsManager.doAction();
    }
    else if (when.value === "arrive") {
      const arriveAt = new ArriveAt(date, start, end, directionsService, directionsRenderer);
  
      directionsManager.set_strategy(arriveAt);
      directionsManager.doAction();
    }
  }