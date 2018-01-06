var latitude;
var longitude;
var map;
var radius = 3 //in kilometers

function initAutocomplete() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.621313, lng: -122.378955},
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      longitude = place.geometry.viewport.b.b;
      latitude = place.geometry.viewport.f.b;

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}


$(document).on('click','#search_button', function(){
  var type = $('#search_button').data("type");
  console.log(type)
  console.log(latitude)
  console.log(longitude)

  var queryURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius='+radius*1000+'&type='+type+'&key=AIzaSyDZFVJF-MiHZ5CyrDPgTYj3ibc5MoTgMZg'
  console.log(queryURL);
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(responce) {
    console.log(responce);
    console.log(responce.status)
    console.log("==================================");

    // Loop through and set markers on map
    for (var i = 0; i < responce.results.length; i++) {
        var lat = responce.results[i].geometry.location.lat;
        var lng = responce.results[i].geometry.location.lng;
        console.log('-------------------------------------')

        var marker = new google.maps.Marker({
          position: {lat: lat, lng: lng},
          map: map,
          title: 'Hello World!'
        })
         $.ajax({
         url: 'https://api.uber.com/v1.2/estimates/price',
         headers: {
           'Authorization': 'Bearer KA.eyJ2ZXJzaW9uIjoyLCJpZCI6InUrQ294MS9tUkcyZXEwZkFERXdrZnc9PSIsImV4cGlyZXNfYXQiOjE1MTYyNTc4NDQsInBpcGVsaW5lX2tleV9pZCI6Ik1RPT0iLCJwaXBlbGluZV9pZCI6MX0.beOa_9qarmZzh1ouo27s-5m7A9lk89EKQhDrBEcrLSk',
           'Accept-Language': 'en_US',
           'Access-Control-Allow-Origin': '*'
         },
         dataType: 'json',
         data: {
           start_latitude: latitude,
           start_longitude: longitude,
           end_latitude: lat,
           end_longitude: lng,
         }
         }).done(function(data) {
             console.log(data);
             console.log(data.estimate);
             var price_x= data.prices[7].estimate;
             console.log('price for uber X: '+price_x);
             var duration= data.prices[7].duration;
             console.log('duration is '+duration / 60 +' min');
        });

    }
  });
})













