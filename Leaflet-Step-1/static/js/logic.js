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

// Create Map, Passing In satelliteMap & earthquakes as Default Layers to Display on Load
var myMap = L.map("map", {
    center: [17.6078, 8.0817],
    zoom: 2.4,
    layers: [outdoorsMap, earthquakes]
});

// Create a Layer Control + Pass in baseMaps and overlayMaps + Add the Layer Control to the Map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

//=====================================================
function getColor(d) {

    return d < 1 ? 'rgb(255,255,178)' : 
           d < 2 ? 'rgb(254,204,92)' :
           d < 3 ? 'rgb(253,141,60)' :
           d < 4 ? 'rgb(240,59,32)' :
                   'rgb(189,0,38)';
}
//===================================================

// Retrieve earthquakes_URL (USGS Earthquakes GeoJSON Data) with D3
d3.json(earthquakes_URL, function(earthquakeData) {
    // Function to Determine Size of Marker Based on the Magnitude of the Earthquake
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3;
    }
    // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 0.8,
          fillColor: getColor(feature.properties.mag),
          color: "black",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }

    // Create a GeoJSON Layer Containing the Features Array on the earthquakeData Object
    L.geoJSON(earthquakeData, {
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
    d3.json(plates_URL, function(plateData) {
        // Create a GeoJSON Layer the plateData
        L.geoJson(plateData, {
            color: "#ff4d4d",
            weight: 2
        // Add plateData to tectonicPlates LayerGroups 
        }).addTo(tectonicPlates);
        // Add tectonicPlates Layer to the Map
        tectonicPlates.addTo(myMap);
    });
    // ==============================================
// Here we create a legend control object.
var legend = L.control({position: 'bottomright'});
  
legend.onAdd = function (map) {    
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4],
    labels = [];

    div.innerHTML+='Magnitude<br><hr>'

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

return div;
};

    // Add Legend to the Map
    legend.addTo(myMap);
});