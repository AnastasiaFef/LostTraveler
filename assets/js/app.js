var latitude;
var longitude;
var map;
var radius = 3 //in kilometers
var type;
var address;



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

      address= place.formatted_address;

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
  type = $(this).data("type");
  var queryURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius='+radius*1000+'&type='+type+'&key=AIzaSyDZFVJF-MiHZ5CyrDPgTYj3ibc5MoTgMZg'
  
  // address = $('#pac-input').data();
  console.log('0000000000 address 000000000', address)
  //// no Uber button
  table_lines_gplaces = [];
  table_lines_uber = [];
  $("#table").html('');
  $(".error").html('');

    //// Clear inputfield, display entered address before results or error message

  //// REMOVE OLD PINS ON MAP



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
    $('#search_address').html('');
    $('#for_uber_button').html('');

    if(response.status==="INVALID_REQUEST"){
      $(".error.place_error").text("Address is not correct");
      setTimeout(hideError, 5000);
      return;
    }
    if(response.status==="ZERO_RESULTS"){
      $(".error.place_error").text("Couldn't find anything, please edit your search parameters");
      setTimeout(hideError, 5000);
      return;
    }
    set_markers(response);
    for(let j=0; j<table_lines_gplaces.length; j++){
      $("#table_gplaces").append(table_lines_gplaces[j]);
    }
    displaySingleTable();
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
    var price_x= data.prices[indexUberX-1].estimate;
    var duration= data.prices[indexUberX].duration / 60;
    var distance = data.prices[indexUberX].distance;

    // adding info to the table
    var tr_uber=("<tr>"+"<td nowrap>"+distance+' mi'+"</td>"+"<td nowrap>"+duration+' min'+"</td>"+"<td nowrap>"+price_x+"</td>"+"</tr>");
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
    var price_lev = response.results[i].price_level;
    console.log(price_lev, ' ---- price_lev')
    var price_level='';
    if(!price_lev){
      price_level = "&#45";
    }
    else{
      for(let d=0;d<price_lev;d++){
        price_level += "&#36";
      }
    }
    console.log(price_level, ' ---- price_level')

    var rating = response.results[i].rating;
    var address= response.results[i].vicinity;

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
    var uberApiUrl = 'https://api.uber.com/v1.2/estimates/price';
    getUberData(uberApiUrl, lat, lng, i);
  }
}

$(document).on('click','#show_uber',function showUberData(){
  $(".error").html('');
  if(table_lines_uber.length<table_lines_gplaces.length){
    $(".error.uber_not_ready").text("Please try again later");
    setTimeout(hideError, 5000);
    return;
  }
  $("#for_uber_button").html($("<button>").attr("id","hide_uber").attr('class','btn btn-primary').attr('type',"button").append("Hide Uber data"));
  $('#table').html('');
  var header_gplaces=$('<tr>').html("<th class='name'> Name </th> <th class='address'> Address </th> <th class='price_level'> Price </th> <th class='rating'> Rating </th>");
  var table_gplaces=$('<table>').attr('id','table_gplaces').attr('class','col-md-9 col-sm-9 col-xs-9 col-lg-9').append(header_gplaces);
  $('#table').append(table_gplaces);
  for(let x=0;x<table_lines_gplaces.length;x++){
    $('#table_gplaces').append(table_lines_gplaces[x]);
  }

  var header_uber=$('<tr>').html("<th class='distance'> Distance </th> <th class='duration'> Duration </th> <th class='price'> Price </th>")
  var table_uber=$('<table>').attr('id','table_uber').append(header_uber);
  $('#table').append($('<div>').attr('class','col-md-2 col-sm-2 col-xs-2 col-lg-2').append(table_uber));
  
  for(let x=0;x<table_lines_uber.length;x++){
    $('#table_uber').append(table_lines_uber[x]);
  }
})

function hideError() {
    $(".error").html('');
};

function displaySingleTable(){
  // /////////ADD SEARCH ADDRESS HERE
  var search_result_message=$('<h5>').attr('class','text-primary').html("Showing "+type+"s around "+address);
  $('#search_address').html(search_result_message);
  $('#pac-input').val('');



  $("#for_uber_button").html($("<button>").attr("id","show_uber").attr('class','btn btn-primary').append("Get Uber estimates"));
  $('#table').html('');
  var header_gplaces=$('<tr>').html("<th class='name'> Name </th> <th class='address'> Address </th> <th class='price_level'> Price </th> <th class='rating'> Rating </th>");
  var table_gplaces=$('<table>').attr('id','table_gplaces').attr('class','col-md-11 col-sm-11 col-xs-11 col-lg-11').append(header_gplaces);
  $('#table').append(table_gplaces);
  for(let x=0;x<table_lines_gplaces.length;x++){
    $('#table_gplaces').append(table_lines_gplaces[x]);
  }
}

$(document).on('click','#hide_uber', displaySingleTable)
