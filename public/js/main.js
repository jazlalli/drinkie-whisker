window.WG = (function (window, document) {

  var wg = window.WG || {};

  function formatCoordinates(lat, lng) {
    // CONVERT 56°37′16″ 006°04′06″ TO 56.621111, 6.068333
    var latDeg = lat.substring(0, lat.indexOf('°'))
    var latMin = lat.substring(lat.indexOf('°') + 1, lat.indexOf('′'));
    var latSec = lat.substring(lat.indexOf('′') + 1, lat.indexOf('″'));

    var lngDeg = lng.substring(0, lng.indexOf('°'));
    var lngMin = lng.substring(lng.indexOf('°') + 1, lng.indexOf('′'));
    var lngSec = lng.substring(lng.indexOf('′') + 1, lng.indexOf('″'));

    var dddLat = parseInt(latDeg, 10) + ((parseInt(latMin, 10) + (parseInt(latSec, 10) / 60)) / 60);
    var dddLng = parseInt(lngDeg, 10) + ((parseInt(lngMin, 10) + (parseInt(lngSec, 10) / 60)) / 60);

    return {
      lat: dddLat,
      lng: 0 - dddLng
    };
  }

  wg.ajax = function ajax(url, callback) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400){
        callback(JSON.parse(request.responseText));
      } else {
        callback({data: 'something went wrong try again'});
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
  };

  wg.showOnMap = function showOnMap (whiskies) {

    var options = {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-77}]},{"featureType":"road"}]
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), options);
    var markerBounds = new google.maps.LatLngBounds();
    var openInfoWindow = null;

    if (whiskies && whiskies.length) {

      whiskies.forEach(function (w, idx) {
        var grid = new OsGridRef(w.lat, w.long);
        var p = OsGridRef.osGridToLatLon(grid).toString().split(',');
        var coords = formatCoordinates(p[0].substring(0, p[0].length-1), p[1].substring(1, p[1].length-1));
        var coordsLatLng = new google.maps.LatLng(coords.lat, coords.lng);


        var marker = new Marker({
          position: coordsLatLng,
          title: w.name,
          map: map,
          icon: {
            path: SQUARE_PIN,
            fillColor: '#0E77E9',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 0.2
          },
          label: '<i class="map-icon-bar"></i>'
        });

        var infowindow = new google.maps.InfoWindow({
            content: '<h4 style="text-align:center;">' + w.name + '</h4>'
        });
        google.maps.event.addListener(marker, 'click', function() {
          if (openInfoWindow)
            openInfoWindow.close();

          openInfoWindow = infowindow;
          infowindow.open(map, marker);
          map.panTo(marker.position);
        });

        markerBounds.extend(coordsLatLng);
        marker.setMap(map);
      });

      map.fitBounds(markerBounds);
    }
  }

  wg.showRelated = function showRelated (whisky) {
    var list = document.querySelector('#whiskies .similar ul.data');
    list.innerHTML = '';

    wg.ajax('/api/whisky/like/' + whisky, function (data) {
      data.data.forEach(function (item, idx) {

        var li = document.createElement('li');
        li.className = 'whisky list-unstyled';
        li.innerHTML = item.name;

        list.appendChild(li);

        if (!idx) {
          document.querySelector('#whiskies .flavour div.data').innerHTML = item.description;
        }
      });
    });
  }

  wg.showWhiskies = function showWhiskies (region) {
    var list = document.querySelector('#regions .similar ul.data');
    list.innerHTML = '';

    wg.ajax('/api/whisky/in/' + region, function (data) {
      data.data.forEach(function (item, idx) {

        var li = document.createElement('li');
        li.className = 'whisky list-unstyled';
        li.innerHTML = item.name;

        list.appendChild(li);
      });

      wg.showOnMap(data.data);
    });
  };

  wg.getAllWhiskies = function getAllWhiskies () {
    var select = document.querySelector('#whiskies select.data');
    select.addEventListener('change', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();

      wg.showRelated(evt.target.value);
    });

    wg.ajax('/api/whisky', function (data) {
      var option = document.createElement('option');
      option.innerHTML = '-- select --';
      select.appendChild(option);

      data.data.forEach(function (item) {
        var option = document.createElement('option');
        option.innerHTML = item.name;
        option.value = item.name;
        select.appendChild(option);
      });
    });
  };

  wg.getAllRegions = function getAllRegions () {
    var select = document.querySelector('#regions select.data');
    select.addEventListener('change', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();

      wg.showWhiskies(evt.target.value);
    });

    wg.ajax('/api/whisky/regions', function (data) {
      var option = document.createElement('option');
      option.innerHTML = '-- select --';
      select.appendChild(option);

      data.data.forEach(function (item, idx) {
        var option = document.createElement('option');
        option.innerHTML = item;
        option.value = item;

        select.appendChild(option);
      });
    });
  };

  var init = function init () {
    wg.getAllWhiskies();
    wg.getAllRegions();
  }

  init();

})(window, document)