import { chainHull_2D, sortPointX, sortPointY } from "../Algorithms/convexHull.js"
//import { generateKMLFile } from "../Algorithms/createKmlFiles.js";


let map;
let pos = {};
let firstClick = false;
let initialPoint;
let markers = [];
let globalPolygon = null;
let pointsAreDrawable = false;
let drones = [];
let droneIsActive = false;
let dronActivated;
let mapRotationValue;
let kmlFile;
const TILE_SIZE = 256;

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
                map.setCenter(pos)
            }
        );
    }
}


function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        mapId: "b2f47c230bbbf5a3",
        heading: 90.0,
        tilt: 0.0
    });
    map.addListener("click", (e) => {
        placeMarker(e.latLng, map);
    })
    getUserLocation();
    globalPolygon = new google.maps.Polygon({
        paths: [],
        strokeColor: "#31a2a3",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#5de6e8",
        fillOpacity: 0.35,
        map: map
    })
}

function createPolygon(map) {
    let points = [];
    let hullPoints = [];
    if (markers.length > 0) {
        for (let i = 0; i < markers.length; i++) {
            points.push(markers[i].getPosition());
        }
        points.sort(sortPointX)
        points.sort(sortPointY)
        chainHull_2D(points, points.length, hullPoints)
        hullPoints.forEach((hullPoint, index) => {
            hullPoints[index] = { lat: hullPoint.lat(), lng: hullPoint.lng() };
        });
        globalPolygon.setPath([])
        globalPolygon.setPath(hullPoints)
        globalPolygon.setMap(map);
    }
}

function placeMarker(position, map) {
    if (pointsAreDrawable) {
        if (!firstClick) {
            const icon = {
                url: "https://icon-library.com/images/google-maps-pin-icon/google-maps-pin-icon-13.jpg", // url
                scaledSize: new google.maps.Size(40, 40), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            };
            firstClick = true;
            initialPoint = new google.maps.Marker({
                position: position,
                map: map,
                icon: icon
            });
        } else {
            let marker = new google.maps.Marker({
                position: position,
                map: map
            })
            markers.push(marker)
            createPolygon(map)
        }
    }
}

function drawPoints() {
    let button = document.getElementById("drawPoints")
    if (button.innerText == "Dibujar puntos") {
        button.innerText = "Parar dibujo"
    } else {
        button.innerText = "Dibujar puntos"
    }
    pointsAreDrawable = !pointsAreDrawable;
}

function createDroneInTheMenu(drone) {
    if (!drone.created) {
        let div = document.createElement("div");
        div.className = "card mb-3 rounded";
        let ulList = document.createElement("ul");
        ulList.className = "list-group list-group-flush";
        let cardHeader = document.createElement("li");
        cardHeader.className = "list-group-item";
        cardHeader.textContent = "Dron: " + drone.name;
        div.appendChild(cardHeader);
        let liVelocity = document.createElement("li");
        liVelocity.className = "list-group-item";
        liVelocity.textContent = "Velocidad: " + drone.velocity + ' km/h';
        ulList.appendChild(liVelocity);
        let liHeight = document.createElement("li");
        liHeight.className = "list-group-item";
        liHeight.textContent = "Altura: " + drone.height + ' m';
        ulList.appendChild(liHeight);
        let liBatery = document.createElement("li");
        liBatery.className = "list-group-item";
        liBatery.textContent = "Duración de la batería: " + drone.batery + ' min';
        ulList.appendChild(liBatery);
        let liFow = document.createElement("li");
        liFow.className = "list-group-item";
        liFow.textContent = "Fov: " + drone.fov + 'º';
        ulList.appendChild(liFow);
        div.appendChild(ulList);
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "Activar dron";
        checkbox.id = drone.name + "_checkbox";
        checkbox.onchange = activateDrone;
        let checkboxLabel = document.createElement("label");
        checkboxLabel.htmlFor = checkbox.id;
        checkboxLabel.appendChild(document.createTextNode("Activar dron"));
        ulList.appendChild(checkboxLabel);
        ulList.appendChild(checkbox);
        let droneMenu = document.getElementById("canvasBody");
        droneMenu.appendChild(div)
    }

}

function createDrone() {
    let drone = {};
    drone.velocity = document.getElementById("velocidad").value;
    drone.name = document.getElementById("name").value;
    drone.height = document.getElementById("altura").value;
    drone.batery = document.getElementById("bateria").value;
    drone.fov = document.getElementById("fov").value;
    drone.active = false;
    drone.created = false;
    createDroneInTheMenu(drone)
    drones.push(drone);
}

function activateDrone() {
    for (let i = 0; i < drones.length; i++) {
        let droneCheckbox = drones[i].name + "_checkbox";
        let checkbox = document.getElementById(droneCheckbox)
        if (droneCheckbox != checkbox.id) {
            continue;
        }
        let isDroneActive = document.getElementById(droneCheckbox).checked;
        if (isDroneActive) {
            drones[i].active = true;
            droneIsActive = true;
            dronActivated = drones[i];
            for (let j = 0; j < drones.length; j++) {
                if (dronActivated.name != drones[j].name) {
                    document.getElementById(drones[j].name + '_checkbox').disabled = true;
                }
            }
            if (dronActivated.name + '_checkbox' != checkbox.id) {
                window.alert('Ya hay un dron activo');
            }
            break;
        } else {
            checkbox.disabled = false;
            drones[i].active = false;
            droneIsActive = false;
            dronActivated = {};
        }
    }
}

function getTanFromDegrees(degrees) {
    return Math.tan(degrees * Math.PI / 180);
}


function calculateDroneUsage() {
    let minsionTime = dronActivated.batery * 60 * 0.7;
    let tg = getTanFromDegrees(dronActivated.fov / 2);
    let Sb = 2 * dronActivated.height * dronActivated.velocity * minsionTime * tg;
    return Sb;
}

function createBorderRectangle(polygon) {
    let jsPolygon = [];
    let highestPointLat = -100000;
    let lowestPointLng = 1000000;
    for (let i = 0; i < polygon.length; i++) {
        let tmp = [polygon[i].lat(), polygon[i].lng()];
        jsPolygon.push(tmp);
    }
    for (let i = 0; i < jsPolygon.length; i++) {
        if (jsPolygon[i][0] > highestPointLat) {
            highestPointLat = jsPolygon[i][0];
        }
        if (jsPolygon[i][1] < lowestPointLng) {
            lowestPointLng = jsPolygon[i][1];
        }
    }
    return [jsPolygon, highestPointLat, lowestPointLng];
}

function translateGoogleToJsPoint(googlePoint) {
    let point = { x: googlePoint.lat(), y: googlePoint.lng() };
    return point;
}

function translateArrayToJsPoint(arrayPoint) {
    let point = { x: arrayPoint[0], y: arrayPoint[1] };
    return point;
}

function mapRotation() {
    let rotation;
    rotation = parseInt(document.getElementById("rotationValue").value);
    map.setHeading(rotation);
}

function getBounds(polygon) {
    let bounds = new google.maps.LatLngBounds();
    let paths = polygon.getPath();
    paths.forEach(function (element, index) {
        bounds.extend(element);
    });
    return bounds;
}

function getRectangleVertexs(rectangle) {
    let bounds = rectangle.getBounds();
    let northEastVertex = bounds.getNorthEast();
    let southWestVertex = bounds.getSouthWest();
    let northWestVertex = new google.maps.LatLng(northEastVertex.lat(), southWestVertex.lng());
    let southEastVertex = new google.maps.LatLng(southWestVertex.lat(), northEastVertex.lng());
    return [northEastVertex, southWestVertex, northWestVertex, southEastVertex]
}

function getDistanceBetweenTwoPoints(cord1, cord2) {
    if (cord1[0] == cord2[0] && cord1[1] == cord2[1]) {
        return 0;
    }

    const radlat1 = (Math.PI * cord1[0]) / 180;
    const radlat2 = (Math.PI * cord2[0]) / 180;

    const theta = cord1[1] - cord2[1];
    const radtheta = (Math.PI * theta) / 180;

    let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    if (dist > 1) {
        dist = 1;
    }

    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344; //convert miles to km
    dist = dist * 1000; //km to m
    return dist;
}

function distanceBetweenEachGridPoints() {
    let distance = dronActivated.height * Math.tan((dronActivated.fov * Math.PI / 180) / 2);
    return distance * 2
}

function translatePolygonToJs() {
    console.log(globalPolygon.getPath())
    let paths = globalPolygon.getPath().Ld;
    paths.pop();
    let jsPolygon = [];
    for (let i = 0; i < paths.length; i++) {
        let tmp = [paths[i].lat(), paths[i].lng()];
        jsPolygon.push(tmp);
    }
    return jsPolygon

}

function project(latLng) {
    let siny = Math.sin((latLng.lat() * Math.PI) / 180);
  
    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);
  
    return new google.maps.Point(
      TILE_SIZE * (0.5 + latLng.lng() / 360),
      TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
    );
  }

function coordinateToPixel(coordinate) {
    let latLng = new google.maps.LatLng({ lat: coordinate[0], lng: coordinate[1] })
    let projection = map.getProjection();
    let bounds = map.getBounds();
    let topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
    let bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
    let scale = Math.pow(2, map.getZoom());
    let worldPoint = projection.fromLatLngToPoint(latLng);
    return [Math.floor((worldPoint.x - bottomLeft.x) * scale), Math.floor((worldPoint.y - topRight.y) * scale)];
}

function transformToPixelToGetTheLengthAndHeight(NE, SW, NW, SE) {
    
    let neGoogle = new google.maps.LatLng({lat: NE[0], lng: NE[1]});
    let swGoogle = new google.maps.LatLng({lat: SW[0], lng: SW[1]});
    let nwGoogle = new google.maps.LatLng({lat: NW[0], lng: NW[1]});
    let seGoogle = new google.maps.LatLng({lat: SE[0], lng: SE[1]});
    let projection = map.getProjection();
    let bounds = map.getBounds();
    let topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
    let bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
    let scale = Math.pow(2, map.getZoom());
    const worldCoordinateNe = map.getProjection().fromLatLngToPoint(neGoogle);
    const pixelNe = [Math.floor((worldCoordinateNe.x - bottomLeft.x) * scale), Math.floor((worldCoordinateNe.y - topRight.y) * scale)];
    const worldCoordinateSw = map.getProjection().fromLatLngToPoint(swGoogle);
    const pixelSw = [Math.floor((worldCoordinateSw.x - bottomLeft.x) * scale), Math.floor((worldCoordinateSw.y - topRight.y) * scale)];
    const worldCoordinateNw = map.getProjection().fromLatLngToPoint(nwGoogle);
    const pixelNw = [Math.floor((worldCoordinateNw.x - bottomLeft.x) * scale), Math.floor((worldCoordinateNw.y - topRight.y) * scale)];
    const worldCoordinateSe = map.getProjection().fromLatLngToPoint(seGoogle);
    const pixelSe = [Math.floor((worldCoordinateSe.x - bottomLeft.x) * scale), Math.floor((worldCoordinateSe.y - topRight.y) * scale)];
    let length = Math.sqrt( Math.pow((pixelNe[0]-pixelNw[0]), 2) + Math.pow((pixelNe[1]-pixelNw[1]), 2) );
    let height = Math.sqrt( Math.pow((pixelNe[0]-pixelSe[0]), 2) + Math.pow((pixelNe[1]-pixelSe[1]), 2) );
    return pixelNe
}

function createFile() {
    let textFile = null
    let xml = new XMLSerializer().serializeToString(kmlFile);
    let data = new Blob([xml], {type: 'text/kml'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);
    
    // returns a URL you can use as a href
    let create = document.getElementById('createFile');
    create.addEventListener('click', function () {
        let link = document.createElement('a');
        link.setAttribute('download', 'info.txt');
        link.href = textFile.toString();
        document.body.appendChild(link);
    
        // wait for the link to be added to the document
        window.requestAnimationFrame(function () {
          let event = new MouseEvent('click');
          link.dispatchEvent(event);
          document.body.removeChild(link);
        });
    
      }, false);
}

function calculateDroneMaximumDistance() {
    let maxDistance = dronActivated.velocity * dronActivated.batery * 0.7 * 60
    return Math.sqrt(maxDistance) * 6.6
}

function calculatePath() {
    if (globalPolygon == null) {
        window.alert("Tienes que crear un poligono primero");
    } else {
        let shape = globalPolygon.getPath();
        let areaInMeters = google.maps.geometry.spherical.computeArea(shape);
        let droneArea = calculateDroneUsage();
        let boundingbox = new google.maps.Rectangle({
            map: map,
            fillOpacity: 0,
            strokeOpacity: 0,
            bounds: getBounds(globalPolygon)
        })
        let tmp = getRectangleVertexs(boundingbox)
        let NE = [tmp[0].lat(), tmp[0].lng()];
        let SW = [tmp[1].lat(), tmp[1].lng()];
        let NW = [tmp[2].lat(), tmp[2].lng()];
        let SE = [tmp[3].lat(), tmp[3].lng()];
        let distanceNorthSide = getDistanceBetweenTwoPoints(NW, NE);
        let distanceWestSide = getDistanceBetweenTwoPoints(NW, SW);
        let distanceBetweenPoints = distanceBetweenEachGridPoints();
        let grid = new CustomGrid(NE, SW, NW, SE, distanceNorthSide, distanceWestSide, distanceBetweenPoints, map);
        //console.log(grid.grid)
        if (areaInMeters > droneArea) {
            let newPolygons = [];
            let polygonDivisions = (areaInMeters / droneArea) + 1;
            let lengthHeightOfTheBoundingBox = transformToPixelToGetTheLengthAndHeight(NE, SW, NW, SE)
            let randomGrid = new CustomGrid(NE, SW, NW, SE, lengthHeightOfTheBoundingBox[0], lengthHeightOfTheBoundingBox[1], distanceBetweenPoints, map);
            randomGrid.randomConstructor(globalPolygon);
            let voronoi = d3.voronoi().extent([0, 0], lengthHeightOfTheBoundingBox);
            let kmeans_ = new kmeans(randomGrid.randomGrid, polygonDivisions);
            let googleCircles = [];
            for(let i = 0; i < kmeans_.centroids.length; i++) {
                console.log(calculateDroneMaximumDistance())
                let centerLatLng = new google.maps.LatLng({ lat: kmeans_.centroids[i][0], lng: kmeans_.centroids[i][1] } );
                let circle = new google.maps.Circle({
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    map,
                    center: centerLatLng,
                    radius: calculateDroneMaximumDistance(),
                })
            }
            // let pixelCentroids = [];
            // for (let i = 0; i < kmeans_.centroids.length; i++) {
            //     let pixel = coordinateToPixel(kmeans_.centroids[i]);
            //     pixelCentroids.push(pixel);
            // }
            // let cells = voronoi(pixelCentroids);
            // //console.log(cells)
            // let paths = [];
            // let polygonPoints = [];
            // for (let i = 0; i < cells.cells.length; i++) {
            //     let edges = [];
            //     for (let j = 0; j < cells.cells[i].halfedges.length; j++) {
            //         edges.push(cells.edges[cells.cells[i].halfedges[j]]);
            //     }
            //     let polygon = new Polygon(edges);
            //     newPolygons.push(polygon);
            // }
            // for (let i = 0; i < newPolygons.length; i++) {

            //     let points = []
            //     for (let j = 0; j < grid.grid.length; j++) {
            //         let point = { x: grid.grid[j][0], y: grid.grid[j][1] }
            //         if (newPolygons[i].isInside(point)) {
            //             points.push(point);
            //         }
            //     }
            //     polygonPoints.push(points);
            // }
            // for (let i = 0; i < polygonPoints.length; i++) {
            //     let TSP_ = new TSP(polygonPoints[i], translateGoogleToJsPoint(initialPoint.getPosition()));
            //     TSP_.initialize();
            //     let path = TSP_.setPath();
            //     paths.push(path);
            // }
            // console.log(paths);
        } else {
            let jsPoints = [];
            let arrayPolygon = translatePolygonToJs();
            for (let i = 0; i < arrayPolygon.length; i++) {
                jsPoints.push(translateArrayToJsPoint(arrayPolygon[i]));
            }
            let finalJsPolygon = new Polygon(arrayPolygon);
            let points = [];
            points.push(translateGoogleToJsPoint(initialPoint.getPosition()));
            for (let i = 0; i < grid.grid.length; i++) {
                for (let j = 0; j < grid.grid[i].length; j++) {
                    let point = { x: grid.grid[i][j][0], y: grid.grid[i][j][1] };
                    if (finalJsPolygon.isInside(point)) {
                        points.push(point);
                    }


                }

            }
            let TSP_ = new TSP(points, points[0]);
            TSP_.initialize();
            let path = TSP_.setPath();
            let googlePoints = [];
            console.log(path);
            kmlFile = generateKMLFile(path, dronActivated.fov, dronActivated.batery*60, dronActivated.height);
            for (let i = 0; i < path.length; i++) {
                let tmp = { lat: path[i].x, lng: path[i].y };
                let googlePoint = new google.maps.LatLng(tmp);
                googlePoints.push(googlePoint);
                let tmpMarker = new google.maps.Marker({
                    position: googlePoint,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    title: i.toString()
                });
            }
            googlePoints.push(initialPoint.getPosition())
            const drawnPath = new google.maps.Polyline({
                path: googlePoints,
                map: map,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
            })
        }

    }
}

window.initMap = initMap;
document.getElementById("drawPoints").onclick = drawPoints;
document.getElementById("creteDronebutton").onclick = createDrone;
document.getElementById("createPath").onclick = calculatePath;
document.getElementById("mapRotationButton").onclick = mapRotation;
document.getElementById("createFile").onclick = createFile;