let data = [[1, 1, 1],
            [1, 2, 3],
            [2, -1, 4]]

const SEPARATION = 10
function draw() {
    const CANVAS = document.getElementById('tutorial');
    if (CANVAS.getContext) {
        let width = CANVAS.width, height = CANVAS.height;
        let ctx = CANVAS.getContext('2d');
        let vertices = d3.range(10).map(function (d) {
            return [Math.random() * width, Math.random() * height];
        });
        let grid = new Grid(height, width, 10);
        grid.randomConstructor();
        let voronoi = d3.voronoi().extent([[0, 0], [width, height]]);
        for (let i = 0; i < grid.grid.length; i++) {
            drawPoint(grid.grid[i], 1.0, ctx, 'red');
        }

        let kmeans_ = new kmeans(grid.grid, 10);
        let cells = voronoi(kmeans_.centroids);
        console.log(cells)
        let edges = []
        for (let i = 0; i < cells.cells[3].halfedges.length; i++) {
            edges.push(cells.edges[cells.cells[3].halfedges[i]]);
        }
        let polygon = new Polygon(edges);
        console.log(polygon)
        let points = []
        for (let i = 0; i < grid.grid.length; i++) {
            let point = { x: grid.grid[i][0], y: grid.grid[i][1]}
            if (polygon.isInside(point)) {
                drawPoint(grid.grid[i], 1.0, ctx, 'blue');
                points.push(point)
            }
        }
        
        console.log(polygon.vertices)
        let TSP_ = new TSP(points, points[0]);
        TSP_.initialize();
        let ruta = TSP_.setPath();
        console.log(ruta);
        for (let i = 0; i < ruta.length -1; i++) {
            drawLine(ruta[i], ruta[i+1], 1.0, 'red', ctx);
        }
        for (let j = 0; j < cells.cells.length; j++) {
            for (let i = 0; i < cells.cells[j].halfedges.length; i++) {
                let initialPoint = { x: cells.edges[cells.cells[j].halfedges[i]][0][0], y: cells.edges[cells.cells[j].halfedges[i]][0][1] };
                let finalPoint = { x: cells.edges[cells.cells[j].halfedges[i]][1][0], y: cells.edges[cells.cells[j].halfedges[i]][1][1] };
                drawLine(initialPoint, finalPoint, 7.0, 'black', ctx);
            }
        }
    }

}



function drawPoint(point, radius, ctx, color) {
    let newPoint = { x: point[0], y: point[1]}
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(newPoint.x, newPoint.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawLine(firstPoint, secondPoint, width, color, ctx) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.moveTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.lineTo(secondPoint.x, secondPoint.y);
    ctx.stroke();
}