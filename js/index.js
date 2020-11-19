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
  //Instantiate Error Handler
  const errorHandler = new ErrorHandler();

  //Instantiate InfoWindow object to help render information tob
  const infoWindow = new google.maps.InfoWindow();
  
  //Instantiate TransitLayer object to display transit stops and routes
  const transityLayer = new google.maps.TransitLayer();

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

  //Setters for transit layer, directions renderer, and panel to display direction info
  transityLayer.setMap(map);  
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

  const onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };

  //Listen for geolocation click to identify starting location
  document.getElementById("geolocation-button").addEventListener("click", () => {
    updateStartingLocation(map, infoWindow);
  })

  //Event listeners for input options
  document.getElementById("when").addEventListener("change", showHideDateTimeContainer);
  document.getElementById("datePicker").addEventListener("change", showHideDateTimeContainer);
  document.getElementById("lbt-trip-planner-button").addEventListener("click", onChangeHandler);
}

//===============================================
// Directions Manager - Strategy Design Pattern
//===============================================

/** 
*
* Description - This class employs the Strategy Design pattern to handle custom 
* outputs depending upon user selected options.
*
*/
class DirectionsManager {
    constructor() {
        this._strategy = null;
    }

    set strategy(strategy) {
        this._strategy = strategy;
    }

    get strategy() {
        return this._strategy;
    }

    doAction() {
        this._strategy.doAction();
    }
}


/**
 * Abstract Class Departure. Used for different strategies.
 * @class Departure
 */
class Departure {
    /**
     * Simple constructor for the abstract Departure class
     * @param  {Date} date
     * @param  {String} startAddress
     * @param  {String} endAddress
     * @param  {String} routePreference
     * @param  {DirectionsService} directionsService
     * @param  {DirectionsRenderer} directionsRenderer
     */
    constructor(date, startAddress, endAddress, routePreference, directionsService, directionsRenderer) {
        this._date = date;
        this._startAddress = startAddress;
        this._endAddress = endAddress;
        this._routePreference = routePreference;
        this._directionsService = directionsService;
        this._directionsRenderer = directionsRenderer;
    }

    set date(date) {
        this._date = date;
    }

    get date() {
        return this._date;
    }

    set startAddress(startAddress) {
        this._startAddress = startAddress;
    }

    get startAddress() {
        return this._startAddress;
    }

    set endAddress(endAddress) {
        this._endAddress = endAddress;
    }

    get endAddress() {
        return this._endAddress;
    }

    set routePreference(routePreference) {
      this._routePreference = routePreference;
    }

    get routePreference() {
      return this._routePreference;
    }

    set directionsService(directionsService) {
        this._directionsService = directionsService;
    }

    get directionsService() {
        return this._directionsService;
    }

    set directionsRenderer(directionsRenderer) {
        this._directionsRenderer = directionsRenderer;
    }

    get directionsRenderer() {
        return this._directionsRenderer;
    }

    toString() {
        console.log(
            "Starting Address: " + this._startAddress + "\n" + 
            "Ending Address: " +  this._endAddress
        );
    }

}

/**
 * Strategy class to help with leave now pattern. 
 * @extends {Departure}
 */
class LeaveNow extends Departure {
    constructor(date, startAddress, endAddress, routePreference, directionsService, directionsRenderer) {
        super(date, startAddress, endAddress, routePreference, directionsService, directionsRenderer);
        this._when = "now";
    }

    doAction() {
        console.log(this._when);
        this.buildDirectionService();
    }

    buildDirectionService() {
        this.directionsService.route(
          {
            origin: this.startAddress,
            destination: this.endAddress,
            travelMode: 'TRANSIT',
            transitOptions: {
              departureTime: new Date(),
              modes: ['BUS'],
              routingPreference: this.routePreference != "" ? this.routePreference : null
              }
          },
          (response, status) => {
            if (status === "OK") {
              this.directionsRenderer.setDirections(response);
            } else {
              const errorHandler = new ErrorHandler();
              errorHandler.handleDirectionsServiceError(status);
            }
          }
        );
    }
}

/**
 * Strategy class to help with leave now pattern. 
 * @extends {Departure}
 */
class DepartAt extends Departure {
    constructor(date, startAddress, endAddress, routePreference, directionsService, directionsRenderer) {
        super(date, startAddress, endAddress, routePreference, directionsService, directionsRenderer);
        this._when = "depart";
    }

    doAction() {
        console.log(this._when);
        this.buildDirectionService();
    }

    buildDirectionService() {
        this.directionsService.route(
          {
            origin: this.startAddress,
            destination: this.endAddress,
            travelMode: 'TRANSIT',
            transitOptions: {
              departureTime: new Date(this._date.value),
              modes: ['BUS'],
              routingPreference: this.routePreference != "" ? this.routePreference : null
              }
          },
          (response, status) => {
            if (status === "OK") {
              this.directionsRenderer.setDirections(response);
            } else {
              const errorHandler = new ErrorHandler();
              errorHandler.handleDirectionsServiceError(status);
            }
          }
        );
    }
}

/**
 * Strategy class to help with leave now pattern. 
 * @extends {Departure}
 */
class ArriveAt extends Departure {
    constructor(date, startAddress, endAddress, routePreference, directionsService, directionsRenderer) {
        super(date, startAddress, endAddress, routePreference, directionsService, directionsRenderer);
        this._when = "arrive";
    }

    doAction() {
        console.log(this._when);
        this.buildDirectionService();
    }

    buildDirectionService() {
        this.directionsService.route(
          {
            origin: this.startAddress,
            destination: this.endAddress,
            travelMode: 'TRANSIT',
            transitOptions: {
              arrivalTime: new Date(this._date.value),
              modes: ['BUS'],
              routingPreference: this.routePreference != "" ? this.routePreference : null
              }
          },
          (response, status) => {
            if (status === "OK") {
              this.directionsRenderer.setDirections(response);
            } else {
              const errorHandler = new ErrorHandler();
              errorHandler.handleDirectionsServiceError(status);
            }
          }
        );
    }
}

//=======================================
// Error Handler
//=======================================
class ErrorHandler {
  constructor() {
    }

  /**
   * Description - Handler to deal with directions service errors
   * @param  {String} status
   */
  handleDirectionsServiceError(status) {
      switch(status) {
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

    
  /**
   * Description - Handler to deal with geolocation errors
   * @param  {boolean} browserHasGeolocation
   * @param  {InfoWindow} infoWindow
   * @param  {Object} pos
   */
  handleGeolocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map)
  }
}


//===================================
// Utility Functions
//===================================

/**
* Description - Given a string, attempt to replace substring ', USA'
* For some reason Google's Directions Service isn't handling the USA portion
* of a supplied address. It causes it to render the wrong locations, so removing
* it for now.
* @param {string} str
*/
function strReplaceUSA(str) {
    return str.replace(", USA", "");
}


/** 
* Show or hide the DOM element with id date-time-container 
* @return {Date} - New date or date selected from input
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

/**
 * Description - Grab the users current lat/lng and update the starting location
 * input field with those values.
 * @param  {google.maps.Map} map
 * @param  {google.maps.InfoWindow} infoWindow
 */
function updateStartingLocation(map, infoWindow) {
  const startAddress = document.getElementById("start");

  //Try HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        var latLng = "?latlng=" + position.coords.latitude + ", " + position.coords.longitude;

        //Set input value and text
        startAddress.value = pos['lat'] + ", " + pos['lng'];

        const json = fetch('https://maps.googleapis.com/maps/api/geocode/json' + latLng + '&key=AIzaSyDUh0RlZpGvwLqA2k-WC6ZdeSGYuIPjDDU')
        .then(response => response.json())
        .then(data => console.log(data['results'][0]['formatted_address'])
        );
        
        console.log(pos);
        infoWindow.setPosition(pos);
        infoWindow.setContent("Location found.");
        infoWindow.open(map);
        map.setCenter(pos);
      },
      () => {
        errorHandler.handleGeolocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    errorHandler.handleGeolocationError(false, infoWindow, map.getCenter());
  }
}

/** 
*
* Description - Calculates and displays route from user supplied starting and ending location
* as well as when they want to leave [now, depart at, arrive at].
* 
* @param {DirectionsService} directionsService - google maps DirectionsService class
* @param {DirectionsRenderer} directionsRenderer - google maps DirectionsRenderer class
*
*/
function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    var when = document.getElementById("when");
    var start = strReplaceUSA(document.getElementById("start").value);
    var end = strReplaceUSA(document.getElementById("end").value);
    var routePreference = document.getElementById("route-preference").value;
  
    //Identify if departure or arrival time is selected & get date value
    var date = showHideDateTimeContainer();
  
    //Instantiate direction manager class to handle custom routes
    const directionsManager = new DirectionsManager();
  
    //Call respective strategy depending upon user input
    if (when.value === "any") {
      const leaveNow = new LeaveNow(new Date(), start, end, routePreference, directionsService, directionsRenderer);
  
      directionsManager.strategy = leaveNow;
      directionsManager.doAction();
    }
    else if (when.value === "depart") {
      const departAt = new DepartAt(date, start, end, routePreference, directionsService, directionsRenderer);
  
      directionsManager.strategy = departAt;
      directionsManager.doAction();
    }
    else if (when.value === "arrive") {
      const arriveAt = new ArriveAt(date, start, end, routePreference, directionsService, directionsRenderer);
  
      directionsManager.strategy = arriveAt;
      directionsManager.doAction();
    }
  }