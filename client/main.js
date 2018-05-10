let viewer;
let videoLayer;
var videoElement = document.getElementById('videoElement');

let data = {
    bathymetry: 'bathymetry.png',
    bathymetryMetadata: {
        zmin: -6709,
        zmax: 10684
    },
    earthquake: [{  
        depth:  22900,
        strike:  17 ,
        dip:  13.0 ,
        rake:  108.0 ,
        U3:  0.0 ,
        cn:  -36.122 ,   //centroid N coordinate, e
        ce:  -72.898 ,
        Mw: 9,
        reference:'center'
      }],
    coordinates: 'spherical',
    waveWidth: parseInt(2159/2),
    waveHeight: parseInt(960/2),  
    displayWidth: parseInt(2159),
    displayHeight: parseInt(960),
    xmin : -179.99166666666667,
    xmax :  179.67499999999998  ,
    ymin :  -79.991666666666646,
    ymax : 79.841666666666654, 
    isPeriodic: true
}

let output = {
    stopTime: 30*60*60,
    displayOption: 'heights'
};

let niterations = 0;

let lifeCycle = {
    dataWasLoaded : (model)=>{
        var videoElement = document.getElementById('videoElement');
        var stream = model.canvas.captureStream(15);
        videoElement.srcObject = stream;
        var options = {mimeType: 'video/webm'};

        document.body.appendChild(model.canvas);
        tsunamiView = TsunamiView({
            containerID0: 'cesiumContainer',
            videoElement: videoElement,
            bbox: [[data.xmin, data.ymin], [data.xmax,data.ymax]]
        });
        
                   

    },
    modelStepDidFinish: (model, controller) =>{
        // videoLayer.rectangle.material = model.canvas;

        if(model.discretization.stepNumber % 1000==0){
            console.log(model.currentTime/60/60, controller.stopTime/60/60);
        }
        niterations = niterations + 1;

        if( niterations%10 == 0){
            niterations = 0;
            return false;
        }
        else{
            return true;
        }
        
    }
}

let thismodel;


let loadEarthquakeControl = ()=>{

    thismodel = new NAMI.driver(data, output, lifeCycle);
    
    
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth*0.01;
    canvas.height = canvas.width;
    
    let container = document.getElementById('earthquake-container');
    container.appendChild(canvas);
    
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    
    let x = canvas.width*0.5;
    let y = canvas.height;
    let r = canvas.width*0.5;
    ctx.arc(x, y-r,r, 0, 2*Math.PI, false);
    ctx.fillStyle = '#ff5555';
    ctx.fill();

    let mousedown = false;
    window.onmousemove = (e)=>{
        
        container.style.top = `${e.clientY}px`;
        container.style.left = `${e.clientX}px`;

    };

    window.onmousedown = (e) =>{
        let viewer = tsunamiView.viewer;
        console.log(e,viewer);
        var mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);

        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
        if (cartesian) {
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            console.log(longitudeString,latitudeString);
            thismodel.model.newEarthquake = [Object.assign(data.earthquake[0],{ cn:  latitudeString,   ce:  longitudeString })];
        }      
    };
}

setTimeout(loadEarthquakeControl, 1000);