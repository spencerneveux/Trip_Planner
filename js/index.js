/*
 * Plugin Name: Long Beach Transit - Trip Planner 
 * Plugin URI: http://www.ridelbt.communecommunication.com
 * Description: A custom trip planner for the Long Beach Transit bus system, using GTFS feed supplied to Google Maps. 
 * Author: Spencer Neveux 
 * Version: 0.0.1 
*/
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
  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById("directions-panel"));
  const control = document.getElementById("floating-panel");
  control.style.display = "block";

  // Create the search box and link it to the UI element.
  const input = document.getElementById("start");
  const input2 = document.getElementById("end");
  const searchBox = new google.maps.places.SearchBox(input);
  const searchBox2 = new google.maps.places.SearchBox(input2);

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
    searchBox2.setBounds(map.getBounds());
  });

  const onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };

  //Event listeners for input options
  document.getElementById("when").addEventListener("change", showHideWhen);
  document.getElementById("datePicker").addEventListener("change", showHideWhen);
  document.getElementById("lbt-trip-planner-button").addEventListener("click", onChangeHandler);
}
 
//Calculates and displays the route using values from start & end input values
function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  var start = strReplaceUSA(document.getElementById("start").value);
  var end = strReplaceUSA(document.getElementById("end").value);
  var when = document.getElementById("when");

  //Identify if departure or arrival time is selected
  if (when.value === "depart" || when.value === "arrive") {
    const dateContainer = document.getElementById("date-time-container");
    dateContainer.style.display = "block";
    var date = document.getElementById("datePicker");
  }
  else {
    const dateContainer = document.getElementById("date-time-container");
    dateContainer.style.display = "none";
    var date = new Date();
  }

  if (when.value === "any") {
    //Get directions and display on map
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: 'TRANSIT',
        transitOptions: {
        departureTime: new Date(),
        modes: ['BUS'],
        routingPreference: 'FEWER_TRANSFERS'
      }
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
  else if (when.value === "depart") {
    //Get directions and display on map
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: 'TRANSIT',
        transitOptions: {
        departureTime: new Date(date.value),
        modes: ['BUS'],
        routingPreference: 'FEWER_TRANSFERS'
      }
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
  else if (when.value === "arrive") {
    //Get directions and display on map
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: 'TRANSIT',
        transitOptions: {
        arrivalTime: new Date(date.value),
        modes: ['BUS'],
        routingPreference: 'FEWER_TRANSFERS'
      }
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
 
}
//===================================
// Utility Functions
//===================================

/*
* Given a string, attempt to replace substring ', USA'
* @param string str
*/
function strReplaceUSA(str) {
    return str.replace(", USA", "");
}


/*
* Show or hide the DOM element with id date-time-container 
* @param 
*/
function showHideWhen() {
    const when = document.getElementById("when");
  const dateContainer = document.getElementById("date-time-container");

  if (when.value === "depart" || when.value === "arrive") {
    dateContainer.style.display = "block";
    var date = document.getElementById("datePicker");
  }
  else {
    dateContainer.style.display = "none";
    var date = new Date();
  }
}
