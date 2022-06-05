
class TSP {
  constructor(grid, startPoint){
    this.grid = grid;
    this.visited = [];
    this.startPoint = startPoint;
    this.startIndex = -1;
    this.numVisited = 1;
    this.path = [];
    this.cost = 0;
  }
  initialize() {
    for (let i = 0; i < this.grid.length; i++) {
      this.visited.push(false);
    }
  }

  getIndexOf(point) {
    for (let i = 0; i < this.grid.length; i++) {
      if ((point.x == this.grid[i].x) && (point.y == this.grid[i].y)) {
        return i;
      }
    }
    return -1
  }

  calculateCostToCity(startPoint, finalPoint) {
    if (startPoint.x == finalPoint.x && startPoint.y == finalPoint.y) {
      return 0;
    }
  
    const radlat1 = (Math.PI * startPoint.x) / 180;
    const radlat2 = (Math.PI * finalPoint.x) / 180;
  
    const theta = startPoint.y - finalPoint.y;
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
  setPath() {
    this.startIndex = this.getIndexOf(this.startPoint);
    if (this.startIndex >= this.grid.length) {
      this.startIndex = this.startIndex % this.grid.length;
    }
    let currentPoint = this.startPoint;
    this.path.push(this.grid[this.startIndex]);
    this.visited[this.startIndex] = true;
    let nextPoint = null;
    let currentIndex = this.startIndex;
    while (this.numVisited < this.grid.length) {
      let minCost = Number.POSITIVE_INFINITY;
      for (let i = 0; i < this.grid.length; i++) {
        if (!this.visited[i]) {
          let tempCost = this.calculateCostToCity(this.grid[currentIndex], this.grid[i]);
          if (tempCost < minCost) {
            minCost = tempCost;
            nextPoint = this.grid[i];           
          }
        }
      }
      if (minCost === Number.POSITIVE_INFINITY) {
        break;
      } else {
        currentIndex = this.getIndexOf(nextPoint);
        this.cost += minCost;
        this.path.push(nextPoint);
        this.visited[currentIndex] = true;
        currentPoint = nextPoint;
        this.numVisited++;
      }
    }
    if (this.calculateCostToCity(currentPoint, this.grid[this.startIndex]) === Number.POSITIVE_INFINITY) {
      this.path = [];
      this.cost = 0;
    } else if (this.path.length < this.grid.length) {
      this.path = [];
      this.cost = 0;
    }
    return this.path;
  }
};

if (typeof exports !== 'undefined') {
  exports.TSP = TSP;
}