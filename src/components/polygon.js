class Polygon {
  constructor(vertices) {
    //this.edges = edges;
    this.vertices = vertices;
    // let array_check = []
    // for (let i = 0; i < this.edges.length; i++) {
      
    //   if (array_check.indexOf(JSON.stringify(this.edges[i][0])) === -1) {
    //     array_check.push(JSON.stringify(this.edges[i][0]))
    //     this.vertices.push(this.edges[i][0])
    //   }
    //   if (array_check.indexOf(JSON.stringify(this.edges[i][1])) === -1) {
    //     array_check.push(JSON.stringify(this.edges[i][1]))
    //     this.vertices.push(this.edges[i][1])
    //   }
    // }
  }
  isInside(point) {
    let inside = false;
    for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
      let xi = this.vertices[i][0], yi = this.vertices[i][1];
      let xj = this.vertices[j][0], yj = this.vertices[j][1];
      let intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }
};


if (typeof exports !== 'undefined') {
  exports.Polygon = Polygon;
}