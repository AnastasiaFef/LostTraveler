var latitude;
var longitude;
var map_key=config.google_map_key;

latitude = 55.780134;
longitude = 49.189847;

function initMap() {
  var enteredLocation = {lat: latitude, lng: longitude};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: enteredLocation
  });
  var marker = new google.maps.Marker({
    position: enteredLocation,
    map: map
  });
}

var defaultBounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(-33.8902, 151.1759),
  new google.maps.LatLng(-33.8474, 151.2631));

var input = document.getElementById('searchTextField');
var options = {
  bounds: defaultBounds,
  types: ['establishment']
};

autocomplete = new google.maps.places.Autocomplete(input, options);