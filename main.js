 var viewer = new Cesium.Viewer('cesiumContainer');
let camera = viewer.camera;



let rotateBetweenPoints = (difference)=>{
    difference  = Cesium.Ellipsoid.WGS84.cartesianToCartographic(difference);    
    camera.rotateRight(-Cesium.Math.toRadians(difference.longitude)*4) 
}



let rotateBetweenPoints = (startPixelCoordinates, endPixelCoordinates) => {
    let startPosition = new Cesium.Cartesian2(startPixelCoordinates[0],startPixelCoordinates[1])
    let endPosition = new Cesium.Cartesian2(endPixelCoordinates[0],endPixelCoordinates[1])

    var ellipsoid = viewer.scene.globe.ellipsoid;
    var start = viewer.camera.pickEllipsoid(startPosition, ellipsoid);
    var end = viewer.camera.pickEllipsoid(endPosition, ellipsoid);

    if(start != undefined && end != undefined){    
        
        rotateFromDifference(difference);
    }
}


/* codigo websockets
var ws = new WebSocket("ws://192.168.4.16:8765/");
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
        previousPoint = [data.x, data.y];
    }
    else if(data.event=="MOVE"){
        previousPoint = currentPoint.slice();
    }
    
    currentPoint = [data.x , data.y];

    normalizedCurrentPoint = normalize(currentPoint, startMovingPoint);
    normalizedPreviousPoint = normalize(previousPoint, startMovingPoint);

    console.log(normalizedCurrentPoint, normalizedPreviousPoint);
    rotateBetweenPoints(normalizedCurrentPoint, normalizedPreviousPoint);
};
*/

function mouseevent(type, x, y)
{
    var ev = new MouseEvent(type, {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y,
        'clientX': x,
        'clientY': y
    });

    var el = window;

    el.dispatchEvent(ev);
}


// document.addEventListener('keydown', function(e) {
//     let midclick = () =>{};
// }, false);

let x = window.innerWidth/2;
let y = window.innerHeight/2;
let startmovement = false;

window.addEventListener('mousemove',function(e){
    console.log('e',e.screenX);
});

setTimeout(function(){
    /*mouseevent('mousedown',x,y);
    for(let i =0; i<100; i++){
        x +=10;
        mouseevent('mousemove',x,y);
        console.log('x',x);
    }
    mouseevent('mouseup',x,y)*/

},5000)


// document.addEventListener('keydown', function(e) {
//     if(e.key==e){
//         startmovement = true;
//         mouseevent('mousedown',x,y);
//     }
// }, false);

// document.addEventListener('keydown', function(e) {
//     mouseevent('mousedown',x,y);
// }, false);

// document.addEventListener('keydown', function(e) {
//     mouseevent('mousedown',x,y);
// }, false);


// viewer.canvas.addEventListener('click',(e)=>{
//     console.log('canvas',e);
// }, false);


// var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);  
// handler.setInputAction((a)=>{
//     // rotateBetweenPoints([a.startPosition.x, a.startPosition.y], [a.endPosition.x,a.endPosition.y]);
//     console.log(a)
    
// }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
