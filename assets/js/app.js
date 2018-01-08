var latitude;
var longitude;
var map;
var radius = 3 //in kilometers
// var hidden= $("<div>").append("#trigger");
$("body").append($("<div>").attr("id","trigger"));
var table_lines_gplaces = [];
var table_lines_uber = [];

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

$(document).on('click','.search_button', function(){
  var type = $('.search_button').data("type");
  var queryURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius='+radius*1000+'&type='+type+'&key=AIzaSyDZFVJF-MiHZ5CyrDPgTYj3ibc5MoTgMZg'

  //// no Uber button
  table_lines_gplaces = [];
  table_lines_uber = [];
  $("#table_gplaces").clear;
  $("#table_uber").html('');

  console.log("latlng of new search is ", latitude, ",", longitude);

  getPlaces(queryURL);

  // $('#trigger').trigger("click")

  // $('#trigger').on("click",function(){ 
  //   console.log("in triggered function")

  for(let j=0; j<table_lines_gplaces.length; j++){
    $("#table_gplaces").append(table_lines_gplaces[j]);
  }
  // })
  

});

function getPlaces(queryURL){
  $.ajax({
    url: queryURL,
    method: "GET",
  }).done(function(response) {
    console.log(response);
    console.log(response.status)
    if(response.status==="INVALID_REQUEST"){
      console.log('Address is not correct');
      $(".error.place_error").text("Address is not correct");
      setTimeout(hideError, 5000);
      return;
    }
    if(response.status==="ZERO_RESULTS"){
      console.log('No search results');
      $(".error.place_error").text("We couldn't find anything, edid your search parameters");
      setTimeout(hideError, 5000);
      return;
    }
    console.log("==================================");
    set_markers(response);
    console.log("Am I done")
    for(let j=0; j<table_lines_gplaces.length; j++){
      $("#table_gplaces").append(table_lines_gplaces[j]);
    }
    
/////// ADD 1 TABLE func ref

    displaySingleTable();


    //Add "Get Uber estimates" button
    $("#for_uber_button").append($("<button>").attr("id","show_uber").attr('class','btn').append("Get Uber estimates"));
  })
}

function getUberData(uberApiUrl, lat, lng, i){
    $.ajax({
      url: uberApiUrl,
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
        console.log("88888888888888888888888");
        console.log(data);
        var indexUberX = data.prices.length - 1;
        uberX=false;
        var i=0;
        while(uberX){
          if(data.prices[i].display_name === "uberX"){
            indexUberX = i;
            uberX=true;
          }
          i++;
        }
        console.log(indexUberX + " indexUberX")
       console.log("indexUberX "+indexUberX) 
       var price_x= data.prices[indexUberX-1].estimate;
       console.log('price for uber X: '+price_x);
       var duration= data.prices[indexUberX].duration / 60;
       console.log('duration is '+duration+' min');
       var distance = data.prices[indexUberX].distance;
       console.log('distance is '+distance +' mi');

       // adding info to the table
      var tr_uber=("<tr>"+"<td nowrap>"+distance+' mi'+"</td>"+"<td nowrap>"+duration+' min'+"</td>"+"<td nowrap>"+price_x+"</td>"+"</tr>");
      console.log("tr_uber: ", tr_uber);

      table_lines_uber.push(tr_uber)
    });
}

function set_markers(response){
  // Loop through and set markers on map
  for (let i = 0; i < response.results.length; i++) { // Always use let in for loop
    var lat = response.results[i].geometry.location.lat;
    var lng = response.results[i].geometry.location.lng;
    var name = response.results[i].name;
    // var is_open= response.results[i].opening_hours.open_now;
    var price_level = response.results[i].price_level;
    var rating = response.results[i].rating;
    var address= response.results[i].vicinity;
    console.log("name: "+name+', is_open: '+', price_level: '+price_level+', rating: '+ rating+', address: '+address)

    var marker = new google.maps.Marker({
      position: {lat: lat, lng: lng},
      map: map,
      title: 'Yay',
      icon: {
        url: response.results[i].icon,
        scaledSize: new google.maps.Size(24, 18) // pixels
      }
    })
    var tr_places=("<tr>"+"<td nowrap>"+name+"</td>"+"<td nowrap>"+address+"</td>"+"<td nowrap>"+price_level+"</td>"+"<td nowrap>"+rating+"</td>"+"</tr>");

    table_lines_gplaces.push(tr_places);
    console.log(table_lines_gplaces);

    var uberApiUrl = 'https://api.uber.com/v1.2/estimates/price';
    getUberData(uberApiUrl, lat, lng, i);
  }
}

$(document).on('click','#show_uber',function showUberData(){
  if(table_lines_uber.length<20){
    console.log('Please give us a few seconds and try again later');
    $(".error.uber_not_ready").text("Please try again later");
    setTimeout(hideError, 5000);
    return;
  }
  $('#table_gplaces').attr('class','col-md-9 col-sm-9 col-xs-9 col-lg-9');
  var header_uber=$('<tr>').html("<th class='distance'> Distance </th> <th class='duration'> Duration </th> <th class='price'> Price </th>")
  var table_uber=$('<table>').attr('id','table_uber').append(header_uber);
  $('#table').append($('<div>').attr('class','col-md-2 col-sm-2 col-xs-2 col-lg-2').append(table_uber));
  
  for(let x=0;x<table_lines_uber.length;x++){
    $('#table_uber').append(table_lines_uber[x]);
  }
})

function hideError() {
    $(".error").hide();
};

function displaySingleTable(){
  $('#table_gplaces').attr('class','col-md-12 col-sm-12 col-xs-12 col-lg-12');
  var header_gplaces=$('<tr>').html("<th class='name'> Name </th> <th class='address'> Address </th> <th class='price_level'> Price </th> <th class='rating'> Rating </th>");
  var table_gplaces=$('<table>').attr('id','table_gplaces').append(header_gplaces);
  $('#table').append(table_gplaces);
  
  for(let x=0;x<table_lines_gplaces.length;x++){
    $('#table_gplaces').append(table_lines_gplaces[x]);
  }
}

