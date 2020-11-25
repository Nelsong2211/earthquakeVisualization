// Earthquakes & Tectonic Plates GeoJSON URL Variables
var earthquakes_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var plates_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Initialize all of the LayerGroups we'll be using
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// Define Variables for Tile Layers that will be the background of our map
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var grayMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
});

var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

// Define baseMaps Object to Hold Base Layers
var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayMap,
    "Outdoors": outdoorsMap,
    "Dark Map": darkMap
};

// Create an overlays object to add to the layer control
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicPlates
};

// Create the map with our layers
// center in Niger and zoom 2.4 to get a center map
//  Outdoors & earthquakes as Default
var myMap = L.map("map", {
    center: [17.6078, 8.0817],
    zoom: 2.4,
    layers: [satelliteMap, earthquakes]
});

// Create a Layer Control
// Pass in baseMaps and overlayMaps 
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    //Add the Layer Control to the Map
}).addTo(myMap);

//=====================================================
//  function get color for every magnitude.
function getColor(d) {

    return d < 1 ? 'rgb(255,255,178)' : 
           d < 2 ? 'rgb(254,204,92)' :
           d < 3 ? 'rgb(253,141,60)' :
           d < 4 ? 'rgb(240,59,32)' :
                   'rgb(189,0,38)';
}
//===================================================

// Retrieve earthquakes_URL (USGS Earthquakes GeoJSON Data) with D3
d3.json(earthquakes_URL, function(earthquake_data) {
    // Function to Determine Size of Marker Based on the Magnitude of each Earthquake
    // *3 to make it bigger in the map
    function EarthquakeSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3;
    }
    // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into two separate functions
    // to calculate the color and radius.
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 0.8,
          fillColor: getColor(feature.properties.mag),
          color: "black",
          radius: EarthquakeSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }

    // Create a GeoJSON Layer Containing the Features Array on the earthquake_data Object
    L.geoJSON(earthquake_data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup Describing the Place & Time of the Earthquake
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
        // Add earthquakeData to earthquakes LayerGroups 
        }).addTo(earthquakes);
        // Add earthquakes Layer to the Map
        earthquakes.addTo(myMap);


    // Retrieve plates_URL (Tectonic Plates GeoJSON Data) with D3
    d3.json(plates_URL, function(plate_data) {
        // Create a GeoJSON Layer the plate_data
        //declare width and color
        L.geoJson(plate_data, {
            color: "#ff4d4d",
            weight: 2
        // Add plate_data to tectonicPlates LayerGroups 
        }).addTo(tectonicPlates);
        // Add tectonicPlates Layer to the Map
        tectonicPlates.addTo(myMap);
    });
    
//  create a legend
// legent possition
var legend = L.control({position: 'bottomright'});
  // declare magnitude and attribute number.
legend.onAdd = function () {    
    var div = L.DomUtil.create('div', 'info legend'),
    magnitudeGrades = [0, 1, 2, 3, 4];
    

    div.innerHTML+='Magnitude<br><hr>'
// atribute  color for each magnitude
    for (var i = 0; i < magnitudeGrades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(magnitudeGrades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            magnitudeGrades[i] + (magnitudeGrades[i + 1] ? '&ndash;' + magnitudeGrades[i + 1] + '<br>' : '+');
    }

return div;
};

    // Add Legend to the Map
    legend.addTo(myMap);
});