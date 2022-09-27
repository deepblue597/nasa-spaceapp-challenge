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

/* to construct the polygon with the aformentioned boundaries */

var polygon = new WorldWind.Polygon(boundaries, polygonAttributes);
polygon.extrude = true; // to display it out of the earth
// if false we would see a triangle without the thickness
// basically a hovering triangle
polygonLayer.addRenderable(polygon);

/* -------- COLLADA 3D ----------- */

var modelLayer = new WorldWind.RenderableLayer();
wwd.addLayer(modelLayer);

var position = new WorldWind.Position(40.6401, 22.9444, 40000.0); // latitude, longitude, and altitude
var config = {
  dirPath: WorldWind.configuration.baseUrl + "examples/collada_models/duck/",
}; //i assume this is the path fot the duck to load

var colladaLoader = new WorldWind.ColladaLoader(position, config);

/* 1st param : the file we want 
    2nd param: a callback funct which works async and loads the model and the scale */

colladaLoader.load("duck.dae", function (colladaModel) {
  colladaModel.scale = 3000;
  modelLayer.addRenderable(colladaModel);
});

/* ----------- Accessing a map imagery service ---------  */

var serviceAddress = "https://neo.gsfc.nasa.gov/wms/wms"; //this is the correct site
//"https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0"; //this site cant be reached

var layerName = "MOD_LSTD_CLIM_M";

var createLayer = function (xmlDom) {
  var wms = new WorldWind.WmsCapabilities(xmlDom);
  var wmsLayerCapabilities = wms.getNamedLayer(layerName);
  var wmsConfig =
    WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapabilities);
  var wmsLayer = new WorldWind.WmsLayer(wmsConfig);
  wwd.addLayer(wmsLayer);
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
