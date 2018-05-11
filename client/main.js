let viewer;
let videoLayer;
var videoElement = document.getElementById('videoElement');
let events = {
    'rotate': {
        pressed: false,
        initialPoint: []
    }
};
let tsunamiView;
let canvas2;

/*
Weebsocketst
*/
let connectToWebsocketServer = (url) => {

    var ws = new WebSocket(url);
    ws.onmessage = function (event) {
        let data = JSON.parse(event.data);
        if (data.event == "MOVE") {
            handleMove([data.x, data.y]);
        }
        if (data.event == "PRESS") {
            if (data.button == "TRIGGER")
                handleTriggerPress([data.x, data.y]);
            if (data.button == "TRIANGLE")
                handleTrianglePress([data.x, data.y]);
        }
        if (data.event == "RELEASE") {
            if (data.button == "TRIGGER")
                handleTriggerRelease([data.x, data.y]);
            if (data.button == "TRIANGLE")
                handleTriangleRelease([data.x, data.y]);
        }
    };
}

connectToWebsocketServer("ws://localhost:8765");

/* 
Model setup
*/
let data = {
    bathymetry: 'bathymetry.png',
    bathymetryMetadata: {
        zmin: -6709,
        zmax: 10684
    },
    earthquake: [{
        depth: 22900,
        strike: 17,
        dip: 13.0,
        rake: 108.0,
        U3: 0.0,
        cn: -36.122,   //centroid N coordinate, e
        ce: -72.898,
        Mw: 9,
        reference: 'center'
    }],
    coordinates: 'spherical',
    waveWidth: parseInt(2159 / 2),
    waveHeight: parseInt(960 / 2),
    displayWidth: parseInt(2159),
    displayHeight: parseInt(960),
    xmin: -179.99166666666667,
    xmax: 179.67499999999998,
    ymin: -79.991666666666646,
    ymax: 79.841666666666654,
    isPeriodic: true
}

let output = {
    stopTime: 30 * 60 * 60,
    displayOption: 'heights'
};

let niterations = 0;

let lifeCycle = {
    dataWasLoaded: (model) => {
        var videoElement = document.getElementById('videoElement');
        var stream = model.canvas.captureStream(15);
        videoElement.srcObject = stream;
        var options = { mimeType: 'video/webm' };

        document.body.appendChild(model.canvas);
        tsunamiView = TsunamiView({
            containerID0: 'cesiumContainer',
            videoElement: videoElement,
            bbox: [[data.xmin, data.ymin], [data.xmax, data.ymax]]
        });



    },
    modelStepDidFinish: (model, controller) => {
        // videoLayer.rectangle.material = model.canvas;

        if (model.discretization.stepNumber % 1000 == 0) {
            // console.log(model.currentTime/60/60, controller.stopTime/60/60);
        }
        niterations = niterations + 1;

        if (niterations % 10 == 0) {
            niterations = 0;
            return false;
        }
        else {
            return true;
        }

    }
}

let thismodel;






/* 
rotation functions
*/

let unitCircleToWindowCoordinates = (xy) => {
    let radius = window.innerHeight / 2;
    let x2 = xy[0] * radius + window.innerWidth / 2;
    let y2 = xy[1] * radius + window.innerHeight / 2;
    return [x2, y2];
}

let windowToUnitCircleCoordinates = (xy) => {
    let radiusInPixels = window.innerHeight / 2;
    let x2 = (xy[0] - window.innerWidth / 2) / radiusInPixels;
    let y2 = (xy[1] - window.innerHeight / 2) / radiusInPixels;
    return [x2, y2];
}

let rotateFromDifference = (difference) => {
    difference = Cesium.Ellipsoid.WGS84.cartesianToCartographic(difference);
    tsunamiView.viewer.camera.rotateRight(-Cesium.Math.toRadians(difference.longitude) * 4)
}

let rotateBetweenPoints = (startPixelCoordinates, endPixelCoordinates) => {
    let startPosition = new Cesium.Cartesian2(startPixelCoordinates[0], startPixelCoordinates[1])
    let endPosition = new Cesium.Cartesian2(endPixelCoordinates[0], endPixelCoordinates[1])

    var viewer = tsunamiView.viewer;
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var start = viewer.camera.pickEllipsoid(startPosition, ellipsoid);
    var end = viewer.camera.pickEllipsoid(endPosition, ellipsoid);

    if (start != undefined && end != undefined) {

        start = Cesium.Ellipsoid.WGS84.cartesianToCartographic(start);
        end = Cesium.Ellipsoid.WGS84.cartesianToCartographic(end);

        let latDifference = end.latitude - start.latitude;
        let lonDifference = end.longitude - start.longitude;
        console.log(latDifference, lonDifference);


        const speed = 0.05;
        tsunamiView.viewer.camera.rotateRight(lonDifference * speed);
        tsunamiView.viewer.camera.rotateUp(-latDifference * speed);
    }
}

let rotateToDirection = (startPixelCoordinates, endPixelCoordinates) => {
    let xDifference = endPixelCoordinates[0] - startPixelCoordinates[0];
    let yDifference = endPixelCoordinates[1] - startPixelCoordinates[1];
    if(Math.abs(xDifference)>15 || Math.abs(yDifference)>15)
        arrowContainer.style.display = 'block';
    else
        arrowContainer.style.display = 'none';
    xDifference = Math.abs(xDifference) < 15 ? 0.0 : xDifference;
    yDifference = Math.abs(yDifference) < 15 ? 0.0 : yDifference;

    drawArrow(canvas2, Math.sqrt(xDifference*xDifference+yDifference*yDifference)-10);
    let rotationSpeed = 0.0001;
    tsunamiView.viewer.camera.rotateRight(rotationSpeed * xDifference);
    tsunamiView.viewer.camera.rotateUp(rotationSpeed * yDifference);
}

let rotateUnitSphere = (start, end) => {
    /* 
        rotates the cesium globe as if it was a unit sphere using 
        start: [x,y], such that ||x,y|| <=1  iff (x,y) is in the circle
        end: same thing    
    */

    let startPixelCoordinates = unitCircleToWindowCoordinates(start);
    let endPixelCoordinates = unitCircleToWindowCoordinates(end);

    /* this one fails at the periodic boundary where lon = 180 = -180 */
    // rotateBetweenPoints(startPixelCoordinates, endPixelCoordinates);

    rotateToDirection(startPixelCoordinates, endPixelCoordinates);
}


/* 
earthquake pointer functions
*/

let pointerContainer;
let arrowContainer;
let initialMovementPoint;

let drawArrow = (canvas, length) => {
    let x1 = canvas.width/2;
    let y1 = canvas.height/2;
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.lineCap="round";
    ctx.lineWidth=5;
    ctx.moveTo(x1,y1);
    ctx.lineTo(x1+length,y1);
    ctx.moveTo(x1+length,y1);
    ctx.lineTo(x1+length-15,y1+canvas.height/10);
    ctx.moveTo(x1+length,y1);
    ctx.lineTo(x1+length-15,y1-canvas.height/10);
    ctx.stroke();
}

let loadEarthquakeControl = () => {

    thismodel = new NAMI.driver(data, output, lifeCycle);

    //Circle
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth * 0.01;
    canvas.height = canvas.width;

    pointerContainer = document.getElementById('earthquake-container');
    pointerContainer.appendChild(canvas);

    let ctx = canvas.getContext("2d");
    ctx.beginPath();

    let x = canvas.width * 0.5;
    let y = canvas.height;
    let r = canvas.width * 0.5;
    ctx.arc(x, y - r, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#ff5555';
    ctx.fill();

    //Arrow
    canvas2 = document.createElement('canvas');
    canvas2.width = window.innerWidth * 0.5;
    canvas2.height = canvas2.width/10;
    // canvas2.style = "position: absolute;"
    arrowContainer = document.getElementById('arrow-container');
    arrowContainer.appendChild(canvas2);
    
    drawArrow(canvas2, 50);
}

let startEarthquakeFromUnitCircleCoordinates = (xycircle) => {

    let xypixel = unitCircleToWindowCoordinates(xycircle);

    let viewer = tsunamiView.viewer;
    var mousePosition = new Cesium.Cartesian2(xypixel[0], xypixel[1]);

    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
    if (cartesian) {
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        thismodel.model.newEarthquake = [Object.assign(data.earthquake[0], { cn: latitude, ce: longitude })];
    }
}
/* 
mouse events
*/

let mousedown = false;
let circlePoint;
window.onmousemove = (e) => {
    circlePoint = windowToUnitCircleCoordinates([e.clientX, e.clientY]);
    handleMove(circlePoint);
};

window.onmousedown = (e) => {
    if (e.button == 1) {
        handleTrianglePress(circlePoint);
    }
    else if (e.button === 0) {
        handleTriggerPress(circlePoint);        
    }
};

window.onmouseup = (e) => {
    if (e.button == 0) {
        handleTriggerRelease();
    }
};



setTimeout(loadEarthquakeControl, 1000);
setTimeout(() => {
    tsunamiView.viewer.clock.onTick.addEventListener(() => {
        if (events['rotate'].pressed) {
            rotateUnitSphere(events['rotate'].initialPoint, circlePoint);
        }
    });
}, 1500);


function handleMove(currentCirclePoint){
    const radius = window.innerHeight/2.0;
    const xoffset = window.innerWidth/2.0;
    const yoffset = window.innerHeight/2.0;
    const windowX = currentCirclePoint[0] * radius + xoffset;
    const windowY = currentCirclePoint[1] * radius + yoffset;

    if( pointerContainer ) {
        pointerContainer.style.top = `${windowY}px`;
        pointerContainer.style.left = `${windowX}px`;
    }
    if (arrowContainer) {
        if(initialMovementPoint && initialMovementPoint.length == 2 && initialMovementPoint[0] != NaN){
            let angle = Math.atan2(-windowX+initialMovementPoint[0],windowY-initialMovementPoint[1])*(180/Math.PI)+90;
            arrowContainer.style.transform = 'translate(-50%, -50%) rotate(' + angle + 'deg)';
        }
    }

    circlePoint = currentCirclePoint;
}

function handleTrianglePress(currentCirclePoint){
    startEarthquakeFromUnitCircleCoordinates(circlePoint);

}

function handleTriggerPress(currentCirclePoint){
    events['rotate'].pressed = true;
    const radius = window.innerHeight/2.0;
    const xoffset = window.innerWidth/2.0;
    const yoffset = window.innerHeight/2.0;
    const windowX = currentCirclePoint[0] * radius + xoffset;
    const windowY = currentCirclePoint[1] * radius + yoffset;
    console.log('currentCirclePoint', currentCirclePoint)
    initialMovementPoint = [windowX, windowY];
    if( arrowContainer ) {
        // arrowContainer.style.display = 'block';
        arrowContainer.style.top = `${windowY}px`;
        arrowContainer.style.left = `${windowX}px`;
    }
    if (events['rotate'].initialPoint.length == 0) {
        events['rotate'].initialPoint = circlePoint;
    }
}
function handleTriggerRelease(currentCirclePoint){
    if( arrowContainer ) {
        arrowContainer.style.display = 'none';
    }
    events['rotate'].pressed = false;
    events['rotate'].initialPoint = [];
    circlePoint = [];
}