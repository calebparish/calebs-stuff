function generateMaze(width, height) {
    if (width < 1 || height < 1) {
        throw new RangeError("Width and height must be at least 1");
    }

    const visited = Array(height).fill(null).map(() => Array(width).fill(false));
    const walls = {
        h: Array(height + 1).fill(null).map(() => Array(width).fill(true)),
        v: Array(height).fill(null).map(() => Array(width + 1).fill(true))
    };

    const stack = [{ x: 0, y: 0 }];
    visited[0][0] = true;

    const directions = [
        { dx: 0, dy: -1, wall: "h", wx: 0, wy: 0 },
        { dx: 1, dy: 0, wall: "v", wx: 1, wy: 0 },
        { dx: 0, dy: 1, wall: "h", wx: 0, wy: 1 },
        { dx: -1, dy: 0, wall: "v", wx: 0, wy: 0 }
    ];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        for (const dir of directions) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx]) {
                neighbors.push({ dir, nx, ny });
            }
        }

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            const { dir, nx, ny } = next;

            walls[dir.wall][current.y + dir.wy][current.x + dir.wx] = false;

            visited[ny][nx] = true;
            stack.push({ x: nx, y: ny });
        } else {
            stack.pop();
        }
    }

    return { width, height, walls };
}

function solveMaze(maze) {
    const { width, height, walls } = maze;
    const queue = [{ x: 0, y: 0, path: [] }];
    const visited = Array(height).fill(null).map(() => Array(width).fill(false));
    visited[0][0] = true;

    const directions = [
        { dx: 0, dy: -1, check: (x, y) => !walls.h[y][x] },
        { dx: 1, dy: 0, check: (x, y) => !walls.v[y][x + 1] },
        { dx: 0, dy: 1, check: (x, y) => !walls.h[y + 1][x] },
        { dx: -1, dy: 0, check: (x, y) => !walls.v[y][x] }
    ];

    while (queue.length > 0) {
        const { x, y, path } = queue.shift();

        if (x === width - 1 && y === height - 1) {
            return [...path, { x, y }];
        }

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx] && dir.check(x, y)) {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny, path: [...path, { x, y }] });
            }
        }
    }

    return null;
}

function countWalls(maze) {
    const { width, height, walls } = maze;
    let count = 0;
    for (let y = 0; y <= height; y++) {
        for (let x = 0; x < width; x++) {
            if (walls.h[y][x]) count++;
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x <= width; x++) {
            if (walls.v[y][x]) count++;
        }
    }
    return count;
}

function countReachable(maze, startX, startY) {
    const { width, height, walls } = maze;
    const visited = Array(height).fill(null).map(() => Array(width).fill(false));
    visited[startY][startX] = true;
    const queue = [{ x: startX, y: startY }];
    let count = 1;

    const directions = [
        { dx: 0, dy: -1, check: (x, y) => !walls.h[y][x] },
        { dx: 1, dy: 0, check: (x, y) => !walls.v[y][x + 1] },
        { dx: 0, dy: 1, check: (x, y) => !walls.h[y + 1][x] },
        { dx: -1, dy: 0, check: (x, y) => !walls.v[y][x] }
    ];

    while (queue.length > 0) {
        const { x, y } = queue.shift();
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx] && dir.check(x, y)) {
                visited[ny][nx] = true;
                count++;
                queue.push({ x: nx, y: ny });
            }
        }
    }

    return count;
}

function wallsConsistent(maze) {
    const { width, height, walls } = maze;

    for (let y = 0; y <= height; y++) {
        if (walls.h[y].length !== width) return false;
    }
    for (let y = 0; y < height; y++) {
        if (walls.v[y].length !== width + 1) return false;
    }

    return true;
}

function countWallNeighbors(walls, width, height, type, y, x) {
    let count = 0;
    if (type === "h") {
        if (x > 0 && walls.h[y][x - 1]) count++;
        if (x + 1 < width && walls.h[y][x + 1]) count++;
        if (y > 0 && walls.v[y - 1][x]) count++;
        if (y < height && walls.v[y][x]) count++;
        if (y > 0 && walls.v[y - 1][x + 1]) count++;
        if (y < height && walls.v[y][x + 1]) count++;
    } else {
        if (y > 0 && walls.v[y - 1][x]) count++;
        if (y + 1 < height && walls.v[y + 1][x]) count++;
        if (x > 0 && walls.h[y][x - 1]) count++;
        if (walls.h[y][x]) count++;
        if (x > 0 && walls.h[y + 1][x - 1]) count++;
        if (walls.h[y + 1][x]) count++;
    }
    return count;
}

function getWallNeighbors(walls, width, height, type, y, x) {
    const neighbors = [];
    if (type === "h") {
        if (x > 0 && walls.h[y][x - 1]) neighbors.push({ t: "h", y: y, x: x - 1 });
        if (x + 1 < width && walls.h[y][x + 1]) neighbors.push({ t: "h", y: y, x: x + 1 });
        if (y > 0 && walls.v[y - 1][x]) neighbors.push({ t: "v", y: y - 1, x: x });
        if (y < height && walls.v[y][x]) neighbors.push({ t: "v", y: y, x: x });
        if (y > 0 && walls.v[y - 1][x + 1]) neighbors.push({ t: "v", y: y - 1, x: x + 1 });
        if (y < height && walls.v[y][x + 1]) neighbors.push({ t: "v", y: y, x: x + 1 });
    } else {
        if (y > 0 && walls.v[y - 1][x]) neighbors.push({ t: "v", y: y - 1, x: x });
        if (y + 1 < height && walls.v[y + 1][x]) neighbors.push({ t: "v", y: y + 1, x: x });
        if (x > 0 && walls.h[y][x - 1]) neighbors.push({ t: "h", y: y, x: x - 1 });
        if (walls.h[y][x]) neighbors.push({ t: "h", y: y, x: x });
        if (x > 0 && walls.h[y + 1][x - 1]) neighbors.push({ t: "h", y: y + 1, x: x - 1 });
        if (walls.h[y + 1][x]) neighbors.push({ t: "h", y: y + 1, x: x });
    }
    return neighbors;
}

function allWallsBoundaryConnected(maze) {
    const { width, height, walls } = maze;
    const visitedH = Array(height + 1).fill(null).map(() => Array(width).fill(false));
    const visitedV = Array(height).fill(null).map(() => Array(width + 1).fill(false));
    const queue = [];

    for (let x = 0; x < width; x++) {
        if (walls.h[0][x]) { visitedH[0][x] = true; queue.push({ t: "h", y: 0, x: x }); }
        if (walls.h[height][x]) { visitedH[height][x] = true; queue.push({ t: "h", y: height, x: x }); }
    }
    for (let y = 0; y < height; y++) {
        if (walls.v[y][0]) { visitedV[y][0] = true; queue.push({ t: "v", y: y, x: 0 }); }
        if (walls.v[y][width]) { visitedV[y][width] = true; queue.push({ t: "v", y: y, x: width }); }
    }

    while (queue.length > 0) {
        const cur = queue.shift();
        const nbs = getWallNeighbors(walls, width, height, cur.t, cur.y, cur.x);
        for (const nb of nbs) {
            if (nb.t === "h" && !visitedH[nb.y][nb.x]) {
                visitedH[nb.y][nb.x] = true;
                queue.push(nb);
            } else if (nb.t === "v" && !visitedV[nb.y][nb.x]) {
                visitedV[nb.y][nb.x] = true;
                queue.push(nb);
            }
        }
    }

    for (let y = 0; y <= height; y++)
        for (let x = 0; x < width; x++)
            if (walls.h[y][x] && !visitedH[y][x]) return false;
    for (let y = 0; y < height; y++)
        for (let x = 0; x <= width; x++)
            if (walls.v[y][x] && !visitedV[y][x]) return false;
    return true;
}

function countOpenPassages(walls, width, height, cx, cy) {
    let open = 0;
    if (cy > 0 && !walls.h[cy][cx]) open++;
    if (cy < height - 1 && !walls.h[cy + 1][cx]) open++;
    if (cx > 0 && !walls.v[cy][cx]) open++;
    if (cx < width - 1 && !walls.v[cy][cx + 1]) open++;
    return open;
}

function countDeadEnds(maze) {
    const { width, height, walls } = maze;
    let count = 0;
    for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
            if (countOpenPassages(walls, width, height, x, y) === 1) count++;
    return count;
}

function removeWalls(maze, count) {
    const { width, height, walls } = maze;
    const candidates = [];
    for (let y = 0; y < height; y++) {
        for (let x = 1; x < width; x++) {
            if (walls.v[y][x]) candidates.push({ wall: "v", y, x });
        }
    }
    for (let y = 1; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (walls.h[y][x]) candidates.push({ wall: "h", y, x });
        }
    }

    function touchesDeadEnd(c) {
        if (c.wall === "v") {
            return (c.x > 0 && countOpenPassages(walls, width, height, c.x - 1, c.y) === 1) ||
                   (c.x < width && countOpenPassages(walls, width, height, c.x, c.y) === 1);
        } else {
            return (c.y > 0 && countOpenPassages(walls, width, height, c.x, c.y - 1) === 1) ||
                   (c.y < height && countOpenPassages(walls, width, height, c.x, c.y) === 1);
        }
    }

    const deadEndCandidates = candidates.filter(touchesDeadEnd);
    const otherCandidates = candidates.filter(c => !touchesDeadEnd(c));

    for (let i = deadEndCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deadEndCandidates[i], deadEndCandidates[j]] = [deadEndCandidates[j], deadEndCandidates[i]];
    }
    for (let i = otherCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherCandidates[i], otherCandidates[j]] = [otherCandidates[j], otherCandidates[i]];
    }

    const ordered = [...deadEndCandidates, ...otherCandidates];
    let removed = 0;
    for (let i = 0; i < ordered.length && removed < count; i++) {
        const c = ordered[i];
        if (createsTwoByTwo(walls, width, height, c.wall, c.y, c.x)) continue;
        walls[c.wall][c.y][c.x] = false;
        if (allWallsBoundaryConnected(maze)) {
            removed++;
        } else {
            walls[c.wall][c.y][c.x] = true;
        }
    }
}

function createsTwoByTwo(walls, width, height, type, y, x) {
    if (type === "v") {
        if (y + 1 < height && !walls.v[y + 1][x] && !walls.h[y + 1][x - 1] && !walls.h[y + 1][x]) return true;
        if (y > 0 && !walls.v[y - 1][x] && !walls.h[y][x - 1] && !walls.h[y][x]) return true;
    } else {
        if (x + 1 < width && !walls.h[y][x + 1] && !walls.v[y - 1][x + 1] && !walls.v[y][x + 1]) return true;
        if (x > 0 && !walls.h[y][x - 1] && !walls.v[y - 1][x] && !walls.v[y][x]) return true;
    }
    return false;
}

function allWallsTouching(maze) {
    const { width, height, walls } = maze;
    for (let y = 0; y <= height; y++) {
        for (let x = 0; x < width; x++) {
            if (walls.h[y][x] && countWallNeighbors(walls, width, height, "h", y, x) === 0) {
                return false;
            }
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x <= width; x++) {
            if (walls.v[y][x] && countWallNeighbors(walls, width, height, "v", y, x) === 0) {
                return false;
            }
        }
    }
    return true;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { generateMaze, solveMaze, countWalls, countReachable, wallsConsistent, countWallNeighbors, removeWalls, allWallsTouching, allWallsBoundaryConnected, countOpenPassages, countDeadEnds, createsTwoByTwo };
}
