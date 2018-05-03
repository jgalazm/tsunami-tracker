var viewer = new Cesium.Viewer('cesiumContainer');
let camera = viewer.camera;


let rotateToDirection = (directionVector) => {
    let minDifference = 30;
    let rotationSpeed = -0.5;
    let longMagnitude = Math.sign(directionVector[0])*Math.floor(Math.abs(directionVector[0]/15));
    let latMagnitude = Math.sign(directionVector[1])*Math.floor(Math.abs(directionVector[1]/15));
    let longRotation = rotationSpeed*longMagnitude;
    let latRotation = rotationSpeed*latMagnitude;
    if( Math.abs(directionVector[0]) > minDifference)
        camera.rotateRight(Cesium.Math.toRadians(longRotation)) 
    if( Math.abs(directionVector[1]) > minDifference)
        camera.rotateUp(Cesium.Math.toRadians(latRotation)) 
}

var ws = new WebSocket("ws://192.168.5.9:8765/");
let startMovingPoint = [];
let previousPoint = [];
let currentPoint = [];
let normalize = (point,reference)=>{
    let amplification = 1.0;
    let result =  [(point[0] -reference[0]) + window.innerWidth/2,
            (point[1] - reference[1]) + window.innerHeight/2];
    console.log(result);
    return result;
}
ws.onmessage = function(event){
    let data = JSON.parse(event.data);

    if(data.event=="START_MOVING"){
        startMovingPoint = [data.x, data.y]
    }
    
    currentPoint = [data.x , data.y];

    directionVector = [startMovingPoint[0]-currentPoint[0],startMovingPoint[1]-currentPoint[1]]
    console.log('Idderoijcetion vetctor', directionVector);
    rotateToDirection(directionVector);
};
