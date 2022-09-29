/* starting js to create the globe */

var wwd = new WorldWind.WorldWindow("canvasOne"); //this binds the html with id='canvasOne' with the js file

wwd.addLayer(new WorldWind.BMNGOneImageLayer()); //the fallback if online request is not available

wwd.addLayer(new WorldWind.BMNGLandsatLayer()); //online image

wwd.addLayer(new WorldWind.CompassLayer());

wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));

wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

/* layer is basically layer is the way we display information
it is also used for storing shapes  */

/* ------------ Drawing placemarks ---------------  */

let placemarkLayer = new WorldWind.RenderableLayer("Placemark");
wwd.addLayer(placemarkLayer); //adds to layer

let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

placemarkAttributes.imageOffset = new WorldWind.Offset(
  WorldWind.OFFSET_FRACTION,
  0.3,
  WorldWind.OFFSET_FRACTION,
  0.0
); //changes the position of the pin

placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE; // changes the color of the pin
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
  WorldWind.OFFSET_FRACTION,
  0.5,
  WorldWind.OFFSET_FRACTION,
  1.0
); //changes the position of the text

placemarkAttributes.imageSource =
  WorldWind.configuration.baseUrl + "images/pushpins/plain-red.png";

var position = new WorldWind.Position(55.0, -106.0, 100.0); // x y z coordinates of the mark
var placemark = new WorldWind.Placemark(position, false, placemarkAttributes);

/* 1st argumnet is about the position (coordinates)
2nd refers to the ability of the size of the placemark to scale accroding to camera zoom (false) 
the 3rd argumnet binds the previous info that weve typed */

placemark.label =
  "Canada\n" +
  "Lat " +
  placemark.position.latitude.toPrecision(4).toString() +
  "\n" +
  "Lon " +
  placemark.position.longitude.toPrecision(5).toString(); //what the marker says
placemark.alwaysOnTop = true; //if its over other shapes

placemarkLayer.addRenderable(placemark); //adds to globe

/*------  Displaying 3D shapes ---------- */

var polygonLayer = new WorldWind.RenderableLayer(); //same thing as before
wwd.addLayer(polygonLayer);

var polygonAttributes = new WorldWind.ShapeAttributes(null); // dont know about null
polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.75); // RGBA where a --> opacity
polygonAttributes.outlineColor = WorldWind.Color.RED; // the periphery of the shape
polygonAttributes.drawOutline = true; // to draw the outline
polygonAttributes.applyLighting = true; // for shading

/* the boundaries of our polygon
    in our case we will create a triangle 
    */
var boundaries = [];
boundaries.push(new WorldWind.Position(20.0, -75.0, 700000.0)); // x y z
boundaries.push(new WorldWind.Position(25.0, -85.0, 700000.0));
boundaries.push(new WorldWind.Position(20.0, -85.0, 500000.0));
boundaries.push(new WorldWind.Position(14.0, -76.0, 500000.0));

/* to construct the polygon with the aformentioned boundaries */

var polygon = new WorldWind.Polygon(boundaries, polygonAttributes);
polygon.extrude = true; // to display it out of the earth
// if false we would see a triangle without the thickness
// basically a hovering triangle
polygonLayer.addRenderable(polygon);

/* -------- COLLADA 3D ----------- */

var modelLayer = new WorldWind.RenderableLayer();
wwd.addLayer(modelLayer);

var position = new WorldWind.Position(40.6401, 22.9444, 60000.0); // latitude, longitude, and altitude
var config = {
  dirPath: WorldWind.configuration.baseUrl + "examples/collada_models/duck/",
}; //i assume this is the path fot the duck to load

var colladaLoader = new WorldWind.ColladaLoader(position, config);

/* 1st param : the file we want 
    2nd param: a callback funct which works async and loads the model and the scale */

colladaLoader.load("duck.dae", function (colladaModel) {
  //"duck.dae"
  colladaModel.scale = 3000;
  modelLayer.addRenderable(colladaModel);
});

/* ----------- Accessing a map imagery service ---------  */

var serviceAddress = "https://neo.gsfc.nasa.gov/wms/wms"; //this is the correct site
//"https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0"; //this site cant be reached

let layerName = "AVHRR_CLIM_W";
/* ---------- possible layerNames -----------
  AVHRR_CLIM_W --> sea surface temperature
  MOD_LSTD_CLIM_M --> surface temperature 
  MODAL2_M_CLD_FR --> cloud fraction 
  MODAL2_M_CLD_OT --> cloud thickness
  AURA_UVI_CLIM_M --> uv index 

   */
let layerArrName = [
  "AVHRR_CLIM_W",
  "MOD_LSTD_CLIM_M",
  "MODAL2_M_CLD_FR",
  "AURA_UVI_CLIM_M",
];

let layerArr = [
  new WorldWind.BMNGLayer(),
  new WorldWind.BingAerialWithLabelsLayer(null),
];

for (let i = 0; i < layerArr.length; i++) {
  wwd.addLayer(layerArr[i]);
}

var createLayer = function (xmlDom) {
  var wms = new WorldWind.WmsCapabilities(xmlDom);
  var wmsLayerCapabilities = wms.getNamedLayer(layerName);
  var wmsConfig =
    WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapabilities);
  var wmsLayer = new WorldWind.WmsLayer(wmsConfig);

  wwd.addLayer(wmsLayer);
  layerArr.push(wmsLayer);
  console.log(layerArr);
};

var logError = function (jqXhr, text, exception) {
  console.log(
    "There was a failure retrieving the capabilities document: " +
      text +
      " exception: " +
      exception
  );
};

$.get(serviceAddress).done(createLayer).fail(logError);

/* ---- Examples------------ */

// Adjust the Navigator to place Alaska in the center of the
// WorldWindow.
wwd.navigator.lookAtLocation.latitude = 65;
wwd.navigator.lookAtLocation.longitude = -150;
wwd.navigator.range = 2e6; // 2 million meters above the ellipsoid

// Redraw the WorldWindow.
wwd.redraw();

/* -------- functions ------------- */

function changeCoordinates() {
  let x = document.forms["coordinates"]["x-axis"].value;
  let y = document.forms["coordinates"]["y-axis"].value;
  // console.log(x);
  // console.log(y);
  if (x == "" || y == "") {
    window.alert("please enter both x and y coordinates");
  } else {
    wwd.navigator.lookAtLocation.latitude = x;
    wwd.navigator.lookAtLocation.longitude = y;
    wwd.navigator.range = 2e6;
    wwd.redraw();
  }
}
/* --- These functions are not finished ----- */
function hello() {
  console.log("hello world");

  layerName = "AVHRR_CLIM_W";

  layerCreation();
  console.log(layerName);
  //wwd.redraw();
}

function changeLayerName() {
  layerName = "MOD_LSTD_CLIM_M";
  console.log(wwd.get);
  console.log(layerName);
  layerCreation();
}

/* -------- disabling layers  -------- */

function disablingLayers() {
  for (let i = 0; i < layerArr.length; i++) {
    layerArr[i].enabled = false;
  }

  console.log(layerArr);
}

function enablingLayers() {
  for (let i = 0; i < layerArr.length; i++) {
    layerArr[i].enabled = true;
  }

  console.log(layerArr);
}

/* ------------ Picking imageryService -------------- */

function pickImageryService() {
  var select = document.getElementById("service");
  var value = select.options[select.selectedIndex].value;

  layerName = value;
  layerCreation();
}

function layerCreation() {
  var createLayer = function (xmlDom) {
    var wms = new WorldWind.WmsCapabilities(xmlDom);
    var wmsLayerCapabilities = wms.getNamedLayer(layerName);
    var wmsConfig =
      WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapabilities);
    var wmsLayer = new WorldWind.WmsLayer(wmsConfig);

    wwd.addLayer(wmsLayer);
    layerArr.push(wmsLayer);
    console.log(layerArr);
  };

  var logError = function (jqXhr, text, exception) {
    console.log(
      "There was a failure retrieving the capabilities document: " +
        text +
        " exception: " +
        exception
    );
  };

  $.get(serviceAddress).done(createLayer).fail(logError);
}

/* -------------- Placing placemarks ------------------ */

function createPlacemark() {
  let x = Number(document.forms["placemark"]["x-axis"].value);
  let y = Number(document.forms["placemark"]["y-axis"].value);
  console.log(typeof y);
  let location = document.forms["placemark"]["name"].value;
  if (location == "") {
    window.alert("please enter a valid name");
  } else {
    let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

    placemarkAttributes.imageOffset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION,
      0.3,
      WorldWind.OFFSET_FRACTION,
      0.0
    ); //changes the position of the pin

    placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE; // changes the color of the pin
    placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION,
      0.5,
      WorldWind.OFFSET_FRACTION,
      1.0
    ); //changes the position of the text

    placemarkAttributes.imageSource =
      WorldWind.configuration.baseUrl + "images/pushpins/plain-red.png";

    var position = new WorldWind.Position(x, y, 100.0); // x y z coordinates of the mark
    var placemark1 = new WorldWind.Placemark(
      position,
      false,
      placemarkAttributes
    );

    placemark1.label =
      location +
      "\n" +
      "Lat " +
      placemark1.position.latitude.toPrecision(4).toString() +
      "\n" +
      "Lon " +
      placemark1.position.longitude.toPrecision(5).toString(); //what the marker says
    placemark1.alwaysOnTop = true; //if its over other shapes
    placemarks.push(placemark1);
    placemarkLayer.addRenderable(placemark1); //adds to globe
    console.log(placemarks);
  }
}

placemarks = [];

function disableplacemarks() {
  console.log(placemarks);
  for (let i = 0; i < placemarks.length; i++) {
    placemarks[i].enabled = false;
  }
}

function enableplacemarks() {
  console.log(placemarks);
  for (let i = 0; i < placemarks.length; i++) {
    placemarks[i].enabled = true;
  }
}

/* ---------- creating shapes ----------------- */

shapes = [];

function shapeCreation() {
  let x = [];
  let y = [];
  x.push(Number(document.forms["pin1"]["x-axis"].value));
  x.push(Number(document.forms["pin2"]["x-axis"].value));
  x.push(Number(document.forms["pin3"]["x-axis"].value));
  y.push(Number(document.forms["pin1"]["y-axis"].value));
  y.push(Number(document.forms["pin2"]["y-axis"].value));
  y.push(Number(document.forms["pin3"]["y-axis"].value));
  console.log(x);
  console.log(y);

  var polygonAttributes = new WorldWind.ShapeAttributes(null); // dont know about null
  polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.75); // RGBA where a --> opacity
  polygonAttributes.outlineColor = WorldWind.Color.RED; // the periphery of the shape
  polygonAttributes.drawOutline = true; // to draw the outline
  polygonAttributes.applyLighting = true; // for shading

  /* the boundaries of our polygon
      in our case we will create a triangle 
      */
  var boundaries = [];
  boundaries.push(new WorldWind.Position(x[0], y[0], 700000.0)); // x y z
  boundaries.push(new WorldWind.Position(x[1], y[1], 700000.0));
  boundaries.push(new WorldWind.Position(x[2], y[2], 700000.0));
  //boundaries.push(new WorldWind.Position(14.0, -76.0, 500000.0));

  /* to construct the polygon with the aformentioned boundaries */

  var polygon = new WorldWind.Polygon(boundaries, polygonAttributes);
  polygon.extrude = true; // to display it out of the earth
  // if false we would see a triangle without the thickness
  // basically a hovering triangle
  shapes.push(polygon);
  console.log(shapes);
  polygonLayer.addRenderable(polygon);
}

function disableShapes() {
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].enabled = false;
  }
}

function enableShapes() {
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].enabled = true;
  }
}

/* --- These create the places on earth ---- */
// let newLayering = new WorldWind.BMNGLayer();
// wwd.addLayer(newLayering);
// let newnewlAYERING = new WorldWind.BingAerialWithLabelsLayer(null);
// wwd.addLayer(newnewlAYERING);

// Create and add layers to the WorldWindow.
// var layers = [
//   // Imagery layers.
//   { layer: new WorldWind.BMNGLayer(), enabled: true },
//   { layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true },
//   // Add atmosphere layer on top of all base layers.
//   { layer: new WorldWind.AtmosphereLayer(), enabled: true }, //atmosphere layer
// ];

// for (var l = 0; l < layers.length; l++) {
//   layers[l].layer.enabled = layers[l].enabled;

//   wwd.addLayer(layers[l].layer);
// }

// // Now set up to handle clicks and taps.

// // The common gesture-handling function.
// var handleClick = function (recognizer) {
//   // Obtain the event location.
//   var x = recognizer.clientX,
//     y = recognizer.clientY;

//   // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
//   // relative to the upper left corner of the canvas rather than the upper left corner of the page.
//   var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

//   // If only one thing is picked and it is the terrain, tell the WorldWindow to go to the picked location.
//   if (pickList.objects.length === 1 && pickList.objects[0].isTerrain) {
//     var position = pickList.objects[0].position;
//     wwd.goTo(new WorldWind.Location(position.latitude, position.longitude));
//   }
// };

// // Listen for mouse clicks.
// var clickRecognizer = new WorldWind.ClickRecognizer(wwd, handleClick);

// // Create a layer manager for controlling layer visibility.
// var layerManager = new LayerManager(wwd);
