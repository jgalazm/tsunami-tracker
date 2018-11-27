var TsunamiView = function (params) {
  var containerID0 = params.containerID0;
  var videoElement = params.videoElement;
  var bbox = params.bbox;
  var currentPin = undefined;
  var rotate = true;
  var slaveCameraOffsets = [];

  var createViewer = function (canvasID) {
    Cesium.BingMapsApi.defaultKey = 'AhuWKTWDw_kUhGKOyx9PgQlV3fdXfFt8byGqQrLVNCMKc0Bot9LS7UvBW7VW4-Ym';
    var viewer = new Cesium.Viewer(canvasID, {
      // sceneMode: Cesium.SceneMode.SCENE2D,
      imageryProvider: new Cesium.createTileMapServiceImageryProvider({
        url: '/node_modules/cesium/Build/Cesium/Assets/Textures/NaturalEarthII'
      }),
      baseLayerPicker: false,
      animation: false,
      fullscreenButton: false,
      scene3DOnly: true,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      shadows: false,
      skyAtmosphere: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false
    });
    viewer.scene.globe.enableLighting = false;
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0;
    viewer.imageryLayers.addImageryProvider(new Cesium.createTileMapServiceImageryProvider({
      url: '../node_modules/cesium-tsunamilab/Build/Cesium/Assets/Textures/NaturalEarthII'
    }));
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
    //   modelMatrix : viewer.scene.primitives._primitives[0].modelMatrix,  // primitive to debug
    //   length : 100000000000000.0,
    //   width : 10.0
    // }));
    // debugger;
    // var terrainProvider = Cesium.createDefaultTerrainProviderViewModels();({
    //   requestWaterMask: true
    // });
    // viewer.terrainProvider = terrainProvider;

    // viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: 'http://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
    //   requestWaterMask: true
    // });
    // var terrainProvider = Cesium.createWorldTerrain({
    //   requestWaterMask: true
    // });
    // viewer.terrainProvider = terrainProvider;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.skyBox.show = false;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1e3 * 10;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1e9 * 10;


    var videoLayer = viewer.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(bbox[0][0], Math.max(bbox[0][1], -89.99999),
          bbox[1][0], Math.min(bbox[1][1], 89.99999)),
        height: 0,
        material: videoElement,
        asynchronous: true
      }
    });
    videoLayer.rectangle.material.transparent = true;

    return viewer;
  }

  var viewer = createViewer(containerID0);

  var viewers = [viewer];

  // var setSlaves = function (masterCamera, slaveCamera, slaveViewer, slaveIndex) {

  //   masterCamera.offset = 0;
  //   slaveViewer.scene.preRender.addEventListener(function () {
  //     Cesium.Cartesian3.clone(masterCamera.position, slaveCamera.position);
  //     Cesium.Cartesian3.clone(masterCamera.direction, slaveCamera.direction);
  //     Cesium.Cartesian3.clone(masterCamera.up, slaveCamera.up);
  //     Cesium.Cartesian3.clone(masterCamera.write, slaveCamera.write);
  //     slaveCamera.lookAtTransform(masterCamera.transform);

  //     Cesium.Cartesian3.multiplyByScalar(slaveCamera.position, 0.8, slaveCamera.position);
  //     slaveCamera.rotate(slaveCamera.up, slaveCameraOffsets[slaveIndex] / 180 * Math.PI);
  //     slaveCamera.offset = slaveCameraOffsets[slaveIndex];
  //   });
  // }

  // var makeSlaves = function (container1) {
  //   var viewer1 = createViewer(container1);


  //   slaveCameraOffsets = [0];
  //   setSlaves(viewer.camera, viewer1.camera, viewer1, 0);


  //   viewers = [viewer1, viewer2, viewer3, viewer4];
  //   return [viewer1, viewer2, viewer3, viewer4];
  // }

  // var rotateSlaves = function () {
  //   if (viewers.length > 1) {

  //     slaveCameraOffsets = slaveCameraOffsets.map((offset) => {
  //       return offset + 90;
  //     });

  //   }

  // }

  var previousTime = Date.now();


  var flyTo = function (viewer, lat, lng, scale) {
    var scale = scale ? scale : 3;
    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees((lng - 5) - 3 * scale, (lat - 5) - 3 * scale,
        (lng + 5) + 3 * scale, (lat + 5) + 3 * scale)
    });
  }

  var setColormap = function (cmap, labelsMap, canvas) {
    var cbwater = canvas;

    //setup colorbar
    if (typeof cmap == "string") {
      var watermap = getColormapArray(cmap, 1, 0);
    } else {
      var watermap = cmap;
    }
    cbwater.width = Math.min(window.innerWidth / 4, 300);
    cbwater.height = 50;

    colorbar(watermap, labelsMap, cbwater);
  }

  return {
    viewers: viewers,
    viewer: viewer,
    setColormap: setColormap,
    // makeSlaves: makeSlaves,
    rotate: rotate,
    // rotateSlaves
  };
}
