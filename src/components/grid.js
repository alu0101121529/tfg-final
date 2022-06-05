class CustomGrid {
  constructor(NE, SW, NW, SE, distanceNorthSide, distanceWestSide, distanceBetweenPoints, map) {
    this.earthRadius = 6378000;
    this.map = map
    this.lengthProportion = Math.abs(Math.round(distanceNorthSide / distanceBetweenPoints)) + 1;
    this.heightProportion = Math.abs(Math.round(distanceWestSide / distanceBetweenPoints)) + 1;
    this.grid = new Array(this.lengthProportion);
    for (let i = 0; i <= this.lengthProportion; i++) {
      this.grid[i] = new Array(this.heightProportion)
    }
    for (let i = 0; i <= this.lengthProportion; i++) {
      for(let j = 0; j <= this.heightProportion; j++) {
        this.grid[i][j] = new Array(2).fill(null)
      }
    }
    
    for (let i = 0; i <= this.lengthProportion; i++) {
      for (let j = 0; j <= this.heightProportion; j++) {
        if ((i == 0) && (j == 0)) {
          this.grid[i][j][0] = NW[0];
          this.grid[i][j][1] = NW[1];
        } else if ((i == this.lengthProportion) && (j == 0)) {
          this.grid[i][j][0] = SW[0];
          this.grid[i][j][1] = SW[1];
        } else if ((i == 0) && (j == this.heightProportion)) {
          this.grid[i][j][0] = NE[0];
          this.grid[i][j][1] = NE[1];
        } else if ((i == this.lengthProportion) && (j == this.heightProportion)) {
          this.grid[i][j][0] = SE[0];
          this.grid[i][j][1] = SE[1];
        } else if ((i != j) && (j == 0)) {
          this.grid[i][j] = this.calculateTheNewCoordinate(this.grid[i-1][j], [distanceBetweenPoints,0])
        } else if (j != 0)  {
          if (j == this.heightProportion || i == this.lengthProportion) {
            continue;
          }
          if ( (i == this.lengthProportion) && (j == 1)) {
            this.grid[i][j] = this.calculateTheNewCoordinate(this.grid[i-1][j-1], [distanceBetweenPoints, 0])
          }
          this.grid[i][j] = this.calculateTheNewCoordinate(this.grid[i][j-1], [0,-distanceBetweenPoints])
        }
        
      }
    }
    
  }
  randomConstructor(polygon) {
  //   this.proportion = this.lengthProportion * this.heightProportion;
  //   this.grid = new Array(this.proportion);
  //   for (let i = 0; i < this.proportion; i++) {
  //     this.grid[i] = new Array(2);
  //   }
  //   for (let i = 0; i < this.proportion; i++) {
  //     this.grid[i][0] = Math.round(Math.random() * this.length);
  //     this.grid[i][1] = Math.round(Math.random() * this.height);
  //   }
  // }
    const numberOfRandomPoints = 10000;
    this.randomGrid = new Array(numberOfRandomPoints);
    let bounds = new google.maps.LatLngBounds();
    for (let i=0; i < polygon.getPath().getLength(); i++) {
      bounds.extend(polygon.getPath().getAt(i));
    }
    let sw = bounds.getSouthWest();
    let ne = bounds.getNorthEast();
    for (let i = 0; i < numberOfRandomPoints; i++) {
      this.randomGrid[i] = new Array(2);
    }
    for (let i = 0; i < numberOfRandomPoints; i++) {
      this.randomGrid[i][0] = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
      this.randomGrid[i][1] = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
    }
  }

  calculateTheNewCoordinate(oldCoordinate, distance) {
    let newLatitude = oldCoordinate[0] + (distance[1] / this.earthRadius) * (180/Math.PI);
    let newLongitude = oldCoordinate[1] + (distance[0] / this.earthRadius) * (180/Math.PI);
    return [newLatitude, newLongitude];
  }
};

if (typeof exports !== 'undefined') {
  exports.CustomGrid = CustomGrid;
}
// TENER EN CUENTA LA DIRECCIÓN DEL VIENTO PARA GENERAR EL GRID