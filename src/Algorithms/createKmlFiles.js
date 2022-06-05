function generateKMLFile(path, fov, range, height) {
    let kmlFile = document.implementation.createDocument(null, '', null);
    let kmlRootNode = kmlFile.createElement('kml');
    kmlRootNode.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', "http://www.opengis.net/kml/2.2");
    let docElement = kmlFile.createElement('Document');
    let nameElement = kmlFile.createElement('name');
    nameElement.innerHTML = 'QGC KML';
    docElement.appendChild(nameElement);
    let openElement = kmlFile.createElement('open');
    openElement.innerHTML = 1;
    let styleElement = kmlFile.createElement('Style');
    styleElement.setAttribute('id','yellowLineGreenPoly');
    let lineStyleElement = kmlFile.createElement('LineStyle');
    let colorElement = kmlFile.createElement('color');
    colorElement.innerHTML = '7f00ffff';
    lineStyleElement.appendChild(colorElement);
    let widthElement = kmlFile.createElement('width');
    widthElement.innerHTML = 4;
    lineStyleElement.appendChild(widthElement);
    styleElement.appendChild(lineStyleElement);
    let polyStyleElement = kmlFile.createElement('PolyStyle');
    let colorElement2 = kmlFile.createElement('color');
    colorElement2.innerHTML = '7f00ff00';
    polyStyleElement.appendChild(colorElement2);
    styleElement.appendChild(polyStyleElement);
    docElement.appendChild(styleElement);
    let placemarkElement = kmlFile.createElement('Placemark');
    let styleUrlElement = kmlFile.createElement('styleUrl');
    styleUrlElement.innerHTML = 'yellowLineGreenPoly';
    placemarkElement.appendChild(styleUrlElement);
    let nameElement2 = kmlFile.createElement('name');
    nameElement2.innerHTML = 'Absolute';
    placemarkElement.appendChild(nameElement2);
    let visibilityElement = kmlFile.createElement('visibility');
    visibilityElement.innerHTML = 0;
    placemarkElement.appendChild(visibilityElement);
    let descriptionElement = kmlFile.createElement('description');
    descriptionElement.innerHTML = 'Transparent purple line';
    placemarkElement.appendChild(descriptionElement);
    let lookAtElement = kmlFile.createElement('LookAt');
    let longitudeElement = kmlFile.createElement('longitude');
    longitudeElement.innerHTML = path[0].y;
    lookAtElement.appendChild(longitudeElement);
    let latitudeElement = kmlFile.createElement('latitude');
    latitudeElement.innerHTML = path[0].x;
    lookAtElement.appendChild(latitudeElement);
    let altitudeElement = kmlFile.createElement('altitude');
    altitudeElement.innerHTML = height;
    lookAtElement.appendChild(altitudeElement);
    let headingElement = kmlFile.createElement('heading');
    headingElement.innerHTML = -100;
    lookAtElement.appendChild(headingElement);
    let tiltElement = kmlFile.createElement('tilt');
    tiltElement.innerHTML = fov;
    lookAtElement.appendChild(tiltElement);
    let rangeElement = kmlFile.createElement('range');
    rangeElement.innerHTML = range;
    lookAtElement.appendChild(rangeElement);
    placemarkElement.appendChild(lookAtElement);
    let lineStringElement = kmlFile.createElement('LineString');
    let extruderElement = kmlFile.createElement('extruder');
    extruderElement.innerHTML = 1;
    lineStringElement.appendChild(extruderElement);
    let tessellateElement = kmlFile.createElement('tessellate');
    tessellateElement.innerHTML = 1;
    lineStringElement.appendChild(tessellateElement);
    let altitudeModeElement = kmlFile.createElement('altitudeMode');
    altitudeModeElement.innerHTML = 'absolute';
    lineStringElement.appendChild(altitudeModeElement);
    let coordinateString = '';
    for (let i = 0; i < path.length; i++) {
        let tmp = path[i].y.toString() + ',' + path[i].x.toString() + '\n';
        coordinateString += tmp;
    }
    let coordinateElement = kmlFile.createElement('coordinates');
    coordinateElement.innerHTML = coordinateString;
    lineStringElement.appendChild(coordinateElement);
    placemarkElement.appendChild(lineStringElement);
    docElement.appendChild(placemarkElement);
    kmlRootNode.appendChild(docElement);
    console.log(kmlRootNode)
    return kmlRootNode;
}

if (typeof exports !== 'undefined') {
    exports.generateKMLFile = generateKMLFile;
  }