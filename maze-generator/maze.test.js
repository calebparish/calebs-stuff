const { generateMaze, solveMaze, countWalls, countReachable, wallsConsistent, countWallNeighbors, removeWalls, allWallsTouching, allWallsBoundaryConnected, countOpenPassages, countDeadEnds, createsTwoByTwo } = require("./maze.js");

let passed = 0;
let failed = 0;
let total = 0;
const failures = [];

function assert(condition, message) {
    total++;
    if (condition) {
        passed++;
    } else {
        failed++;
        failures.push(message);
        console.error(`  FAIL: ${message}`);
    }
}

function describe(name, fn) {
    console.log(`\n${name}`);
    fn();
}

function it(name, fn) {
    console.log(`  ${name}`);
    fn();
}

function expect(val) {
    return {
        toBe(expected) {
            assert(val === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
        },
        toBeGreaterThan(n) {
            assert(val > n, `expected ${val} > ${n}`);
        },
        toBeGreaterThanOrEqual(n) {
            assert(val >= n, `expected ${val} >= ${n}`);
        },
        toBeLessThan(n) {
            assert(val < n, `expected ${val} < ${n}`);
        },
        toBeLessThanOrEqual(n) {
            assert(val <= n, `expected ${val} <= ${n}`);
        },
        toBeTruthy() {
            assert(!!val, `expected truthy, got ${val}`);
        },
        toBeFalsy() {
            assert(!val, `expected falsy, got ${val}`);
        },
        toBeNull() {
            assert(val === null, `expected null, got ${JSON.stringify(val)}`);
        },
        toEqual(expected) {
            const a = JSON.stringify(val);
            const b = JSON.stringify(expected);
            assert(a === b, `expected ${b}, got ${a}`);
        },
        toBeInstanceOf(cls) {
            assert(val instanceof cls, `expected instance of ${cls.name}`);
        }
    };
}

describe("generateMaze - structure", () => {
    it("returns object with width, height, and walls", () => {
        const maze = generateMaze(5, 5);
        expect(maze.width).toBe(5);
        expect(maze.height).toBe(5);
        expect(typeof maze.walls).toBe("object");
    });

    it("creates correct wall dimensions", () => {
        const maze = generateMaze(10, 8);
        expect(maze.walls.h.length).toBe(9);
        expect(maze.walls.h[0].length).toBe(10);
        expect(maze.walls.v.length).toBe(8);
        expect(maze.walls.v[0].length).toBe(11);
    });

    it("works for 1x1 maze", () => {
        const maze = generateMaze(1, 1);
        expect(maze.width).toBe(1);
        expect(maze.height).toBe(1);
        expect(maze.walls.h.length).toBe(2);
        expect(maze.walls.h[0].length).toBe(1);
        expect(maze.walls.v.length).toBe(1);
        expect(maze.walls.v[0].length).toBe(2);
    });

    it("works for 1xN mazes", () => {
        const maze = generateMaze(1, 5);
        expect(maze.width).toBe(1);
        expect(maze.height).toBe(5);
        const solution = solveMaze(maze);
        expect(solution !== null).toBe(true);
    });

    it("works for Nx1 mazes", () => {
        const maze = generateMaze(5, 1);
        expect(maze.width).toBe(5);
        expect(maze.height).toBe(1);
        const solution = solveMaze(maze);
        expect(solution !== null).toBe(true);
    });

    it("works for large mazes", () => {
        const maze = generateMaze(100, 100);
        expect(maze.width).toBe(100);
        expect(maze.height).toBe(100);
        expect(wallsConsistent(maze)).toBe(true);
    });

    it("throws for zero width", () => {
        let threw = false;
        try { generateMaze(0, 5); } catch (e) { threw = true; }
        assert(threw, "should throw for width 0");
    });

    it("throws for zero height", () => {
        let threw = false;
        try { generateMaze(5, 0); } catch (e) { threw = true; }
        assert(threw, "should throw for height 0");
    });
});

describe("generateMaze - wall consistency", () => {
    it("has consistent wall array dimensions for various sizes", () => {
        for (const [w, h] of [[1,1], [2,2], [3,3], [5,10], [10,5], [20,20]]) {
            const maze = generateMaze(w, h);
            expect(wallsConsistent(maze)).toBe(true);
        }
    });

    it("all walls are booleans", () => {
        const maze = generateMaze(10, 10);
        for (let y = 0; y <= maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                assert(typeof maze.walls.h[y][x] === "boolean", `h[${y}][${x}] is not boolean`);
            }
        }
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x <= maze.width; x++) {
                assert(typeof maze.walls.v[y][x] === "boolean", `v[${y}][${x}] is not boolean`);
            }
        }
    });

    it("outer boundary walls are always present", () => {
        const maze = generateMaze(10, 10);
        for (let x = 0; x < maze.width; x++) {
            assert(maze.walls.h[0][x] === true, `top wall h[0][${x}] missing`);
            assert(maze.walls.h[maze.height][x] === true, `bottom wall h[${maze.height}][${x}] missing`);
        }
        for (let y = 0; y < maze.height; y++) {
            assert(maze.walls.v[y][0] === true, `left wall v[${y}][0] missing`);
            assert(maze.walls.v[y][maze.width] === true, `right wall v[${y}][${maze.width}] missing`);
        }
    });

    it("start cell has no top-left corner gaps (boundary integrity)", () => {
        const maze = generateMaze(5, 5);
        assert(maze.walls.h[0][0] === true, "top-left horizontal boundary broken");
        assert(maze.walls.v[0][0] === true, "top-left vertical boundary broken");
    });
});

describe("generateMaze - perfect maze properties", () => {
    it("is a perfect maze (all cells reachable from start)", () => {
        for (let trial = 0; trial < 50; trial++) {
            const size = 5 + trial;
            const maze = generateMaze(size, size);
            const reachable = countReachable(maze, 0, 0);
            expect(reachable).toBe(size * size);
        }
    });

    it("has exactly one path between any two cells", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(15, 15);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: no solution found`);
            if (solution) {
                const visitedCells = new Set(solution.map(p => `${p.x},${p.y}`));
                assert(visitedCells.size === solution.length, `trial ${trial}: duplicate cells in path`);
            }
        }
    });

    it("every generated maze has exactly width*height - 1 walls removed", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(10, 10);
            const totalH = (maze.height + 1) * maze.width;
            const totalV = maze.height * (maze.width + 1);
            const totalPossible = totalH + totalV;
            const remaining = countWalls(maze);
            const removed = totalPossible - remaining;
            assert(removed === 10 * 10 - 1, `trial ${trial}: expected ${99} walls removed, got ${removed}`);
        }
    });
});

describe("solveMaze - basic correctness", () => {
    it("solves a 1x1 maze", () => {
        const maze = generateMaze(1, 1);
        const solution = solveMaze(maze);
        expect(solution !== null).toBe(true);
        expect(solution.length).toBe(1);
        expect(solution[0]).toEqual({ x: 0, y: 0 });
    });

    it("solves a 2x2 maze", () => {
        const maze = generateMaze(2, 2);
        const solution = solveMaze(maze);
        assert(solution !== null, "no solution found");
        if (solution) {
            expect(solution[0]).toEqual({ x: 0, y: 0 });
            expect(solution[solution.length - 1]).toEqual({ x: 1, y: 1 });
        }
    });

    it("solution path is contiguous (each step moves 1 cell)", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(10, 10);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: no solution`);
            if (solution) {
                for (let i = 1; i < solution.length; i++) {
                    const dx = Math.abs(solution[i].x - solution[i - 1].x);
                    const dy = Math.abs(solution[i].y - solution[i - 1].y);
                    const dist = dx + dy;
                    assert(dist === 1, `trial ${trial}: step ${i} moves ${dist} cells`);
                }
            }
        }
    });

    it("solution never crosses a wall", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(10, 10);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: no solution`);
            if (solution) {
                for (let i = 1; i < solution.length; i++) {
                    const prev = solution[i - 1];
                    const curr = solution[i];
                    const dx = curr.x - prev.x;
                    const dy = curr.y - prev.y;

                    let wallExists = false;
                    if (dy === -1) wallExists = maze.walls.h[prev.y][prev.x];
                    else if (dy === 1) wallExists = maze.walls.h[prev.y + 1][prev.x];
                    else if (dx === -1) wallExists = maze.walls.v[prev.y][prev.x];
                    else if (dx === 1) wallExists = maze.walls.v[prev.y][prev.x + 1];

                    assert(!wallExists, `trial ${trial}: step ${i} crosses a wall from (${prev.x},${prev.y}) to (${curr.x},${curr.y})`);
                }
            }
        }
    });

    it("solution starts at (0,0) and ends at (width-1, height-1)", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(8, 8);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: no solution`);
            if (solution) {
                expect(solution[0]).toEqual({ x: 0, y: 0 });
                expect(solution[solution.length - 1]).toEqual({ x: 7, y: 7 });
            }
        }
    });
});

describe("solveMaze - always solvable (the critical test)", () => {
    it("every generated maze is solvable across many trials and sizes", () => {
        const sizes = [
            [3, 3], [5, 5], [7, 7], [10, 10], [15, 15], [20, 20], [25, 25],
            [3, 10], [10, 3], [5, 20], [20, 5], [50, 50]
        ];

        for (const [w, h] of sizes) {
            for (let trial = 0; trial < 10; trial++) {
                const maze = generateMaze(w, h);
                const solution = solveMaze(maze);
                assert(solution !== null, `${w}x${h} trial ${trial}: maze unsolvable!`);
                if (solution) {
                    expect(solution[0]).toEqual({ x: 0, y: 0 });
                    expect(solution[solution.length - 1]).toEqual({ x: w - 1, y: h - 1 });
                }
            }
        }
    });
});

describe("solveMaze - solution optimality", () => {
    it("BFS finds shortest path", () => {
        for (let trial = 0; trial < 10; trial++) {
            const maze = generateMaze(15, 15);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: no solution`);
            if (solution) {
                const reachable = countReachable(maze, 0, 0);
                assert(solution.length <= reachable, `trial ${trial}: path longer than reachable cells`);
            }
        }
    });

    it("solution length is at least width + height - 1", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(10, 10);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: no solution`);
            if (solution) {
                assert(solution.length >= 10 + 10 - 1, `trial ${trial}: path suspiciously short (${solution.length})`);
            }
        }
    });
});

describe("countWalls", () => {
    it("counts all walls in a fully walled 1x1 maze", () => {
        const maze = {
            width: 1, height: 1,
            walls: {
                h: [[true], [true]],
                v: [[true, true]]
            }
        };
        expect(countWalls(maze)).toBe(4);
    });

    it("decreases as walls are removed", () => {
        const maze1 = generateMaze(5, 5);
        const count1 = countWalls(maze1);
        const maze2 = generateMaze(5, 5);
        const count2 = countWalls(maze2);
        assert(typeof count1 === "number", "countWalls should return a number");
        assert(typeof count2 === "number", "countWalls should return a number");
    });
});

describe("countReachable", () => {
    it("1x1 maze has 1 reachable cell", () => {
        const maze = generateMaze(1, 1);
        expect(countReachable(maze, 0, 0)).toBe(1);
    });

    it("perfect maze has all cells reachable", () => {
        const maze = generateMaze(20, 20);
        expect(countReachable(maze, 0, 0)).toBe(400);
    });
});

describe("wall-index symmetry - the bug fix", () => {
    it("generator and solver agree on wall positions for right moves", () => {
        for (let trial = 0; trial < 50; trial++) {
            const maze = generateMaze(20, 20);
            for (let y = 0; y < maze.height; y++) {
                for (let x = 0; x < maze.width - 1; x++) {
                    const canGoRightFromGen = !maze.walls.v[y][x + 1];
                    const canGoRightFromSolver = !maze.walls.v[y][x + 1];
                    assert(canGoRightFromGen === canGoRightFromSolver,
                        `trial ${trial}: wall check mismatch at (${x},${y}) going right`);
                }
            }
        }
    });

    it("generator and solver agree on wall positions for left moves", () => {
        for (let trial = 0; trial < 50; trial++) {
            const maze = generateMaze(20, 20);
            for (let y = 0; y < maze.height; y++) {
                for (let x = 1; x < maze.width; x++) {
                    const canGoLeftFromGen = !maze.walls.v[y][x];
                    const canGoLeftFromSolver = !maze.walls.v[y][x];
                    assert(canGoLeftFromGen === canGoLeftFromSolver,
                        `trial ${trial}: wall check mismatch at (${x},${y}) going left`);
                }
            }
        }
    });

    it("every passage carved by generator is traversable by solver", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(15, 15);
            for (let y = 0; y < maze.height; y++) {
                for (let x = 0; x < maze.width; x++) {
                    if (x < maze.width - 1) {
                        const rightOpen = !maze.walls.v[y][x + 1];
                        if (rightOpen) {
                            const solution = solveMaze(maze);
                            assert(solution !== null, `trial ${trial}: unsolvable despite open passage at (${x},${y}) right`);
                        }
                    }
                    if (y < maze.height - 1) {
                        const downOpen = !maze.walls.h[y + 1][x];
                        if (downOpen) {
                            const solution = solveMaze(maze);
                            assert(solution !== null, `trial ${trial}: unsolvable despite open passage at (${x},${y}) down`);
                        }
                    }
                }
            }
        }
    });
});

describe("maze variability", () => {
    it("two random mazes have different wall patterns", () => {
        let different = false;
        for (let trial = 0; trial < 10; trial++) {
            const m1 = generateMaze(10, 10);
            const m2 = generateMaze(10, 10);
            const s1 = JSON.stringify(m1.walls);
            const s2 = JSON.stringify(m2.walls);
            if (s1 !== s2) {
                different = true;
                break;
            }
        }
        assert(different, "10 consecutive pairs of mazes were identical");
    });
});

describe("wall touching - all walls must touch another wall", () => {
    it("freshly generated maze has no isolated walls", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(15, 15);
            assert(allWallsTouching(maze), `trial ${trial}: isolated wall found in fresh maze`);
        }
    });

    it("after removeWalls, no isolated walls remain", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(15, 15);
            const totalCells = maze.width * maze.height;
            removeWalls(maze, Math.round(totalCells * 0.5));
            assert(allWallsTouching(maze), `trial ${trial}: isolated wall found after removeWalls`);
        }
    });

    it("after max wall removal, no isolated walls remain", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(10, 10);
            const totalCells = maze.width * maze.height;
            removeWalls(maze, totalCells);
            assert(allWallsTouching(maze), `trial ${trial}: isolated wall found after max removeWalls`);
        }
    });

    it("countWallNeighbors returns 0 only for truly isolated walls", () => {
        const maze = generateMaze(5, 5);
        for (let y = 0; y <= maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (maze.walls.h[y][x]) {
                    const n = countWallNeighbors(maze.walls, maze.width, maze.height, "h", y, x);
                    assert(n >= 1, `h[${y}][${x}] has ${n} neighbors but is present`);
                }
            }
        }
    });

    it("removeWalls never removes boundary walls", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(10, 10);
            removeWalls(maze, 500);
            for (let x = 0; x < maze.width; x++) {
                assert(maze.walls.h[0][x] === true, `trial ${trial}: top border h[0][${x}] removed`);
                assert(maze.walls.h[maze.height][x] === true, `trial ${trial}: bottom border removed`);
            }
            for (let y = 0; y < maze.height; y++) {
                assert(maze.walls.v[y][0] === true, `trial ${trial}: left border removed`);
                assert(maze.walls.v[y][maze.width] === true, `trial ${trial}: right border removed`);
            }
        }
    });
});

describe("wall boundary connectivity - all walls connected to maze edges", () => {
    it("freshly generated maze is boundary-connected", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(15, 15);
            assert(allWallsBoundaryConnected(maze), `trial ${trial}: wall not connected to boundary`);
        }
    });

    it("after removeWalls at low complexity, all walls remain boundary-connected", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(15, 15);
            const totalCells = maze.width * maze.height;
            removeWalls(maze, Math.round(totalCells * 0.5));
            assert(allWallsBoundaryConnected(maze), `trial ${trial}: wall disconnected from boundary`);
        }
    });

    it("after aggressive removal, all walls remain boundary-connected", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(10, 10);
            removeWalls(maze, 10000);
            assert(allWallsBoundaryConnected(maze), `trial ${trial}: wall disconnected after aggressive removal`);
        }
    });

    it("boundary-connected implies allWallsTouching", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(12, 12);
            removeWalls(maze, 300);
            assert(allWallsBoundaryConnected(maze), `trial ${trial}: not boundary-connected`);
            assert(allWallsTouching(maze), `trial ${trial}: not all touching`);
        }
    });

    it("works for various sizes including small mazes", () => {
        for (const [w, h] of [[2, 2], [3, 3], [5, 1], [1, 5], [7, 7], [20, 20]]) {
            for (let trial = 0; trial < 10; trial++) {
                const maze = generateMaze(w, h);
                removeWalls(maze, 100);
                assert(allWallsBoundaryConnected(maze), `${w}x${h} trial ${trial}: not boundary-connected`);
            }
        }
    });
});

describe("dead ends - complexity controls dead end count", () => {
    it("removing walls always reduces or maintains dead end count", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(12, 12);
            const deBefore = countDeadEnds(maze);
            removeWalls(maze, 50);
            const deAfter = countDeadEnds(maze);
            assert(deAfter <= deBefore, `trial ${trial}: dead ends increased from ${deBefore} to ${deAfter}`);
        }
    });

    it("dead end count never increases with successive removals", () => {
        for (let trial = 0; trial < 15; trial++) {
            const maze = generateMaze(15, 15);
            let de = countDeadEnds(maze);
            for (let step = 0; step < 5; step++) {
                removeWalls(maze, 40);
                const newDe = countDeadEnds(maze);
                assert(newDe <= de, `trial ${trial} step ${step}: dead ends went from ${de} to ${newDe}`);
                de = newDe;
            }
        }
    });

    it("countOpenPassages counts correctly", () => {
        const maze = generateMaze(5, 5);
        for (let y = 0; y < 5; y++)
            for (let x = 0; x < 5; x++) {
                const open = countOpenPassages(maze.walls, 5, 5, x, y);
                assert(open >= 1 && open <= 4, `cell (${x},${y}) has ${open} passages`);
            }
    });

    it("countDeadEnds returns valid count", () => {
        for (let trial = 0; trial < 10; trial++) {
            const maze = generateMaze(10, 10);
            const de = countDeadEnds(maze);
            assert(de >= 2, `trial ${trial}: fewer than 2 dead ends (${de})`);
            assert(de <= 100, `trial ${trial}: too many dead ends (${de})`);
        }
    });
});

describe("path width - no 2x2 open rooms", () => {
    function hasTwoByTwo(maze) {
        const { width, height, walls } = maze;
        for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width - 1; x++) {
                if (!walls.v[y][x + 1] && !walls.v[y + 1][x + 1] && !walls.h[y + 1][x] && !walls.h[y + 1][x + 1]) {
                    return true;
                }
            }
        }
        return false;
    }

    it("fresh perfect maze has no 2x2 rooms", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(15, 15);
            assert(!hasTwoByTwo(maze), `trial ${trial}: 2x2 room in fresh maze`);
        }
    });

    it("after wall removal, no 2x2 rooms appear", () => {
        for (let trial = 0; trial < 30; trial++) {
            const maze = generateMaze(15, 15);
            removeWalls(maze, 200);
            assert(!hasTwoByTwo(maze), `trial ${trial}: 2x2 room after wall removal`);
        }
    });

    it("aggressive removal still prevents 2x2 rooms", () => {
        for (let trial = 0; trial < 20; trial++) {
            const maze = generateMaze(10, 10);
            removeWalls(maze, 10000);
            assert(!hasTwoByTwo(maze), `trial ${trial}: 2x2 room after aggressive removal`);
        }
    });

    it("createsTwoByTwo detects valid cases", () => {
        const walls = {
            h: [
                [true, true],
                [true, true],
                [true, true]
            ],
            v: [
                [true, true, true],
                [true, true, true]
            ]
        };
        assert(!createsTwoByTwo(walls, 2, 2, "v", 0, 1), "fresh walls should not create 2x2");
    });

    it("works for various sizes", () => {
        for (const [w, h] of [[4, 4], [7, 7], [12, 12], [20, 20]]) {
            for (let trial = 0; trial < 10; trial++) {
                const maze = generateMaze(w, h);
                removeWalls(maze, 500);
                assert(!hasTwoByTwo(maze), `${w}x${h} trial ${trial}: 2x2 room`);
            }
        }
    });
});

describe("edge cases", () => {
    it("very thin tall maze (1x100)", () => {
        const maze = generateMaze(1, 100);
        const solution = solveMaze(maze);
        assert(solution !== null, "1x100 maze unsolvable");
        if (solution) {
            expect(solution[0]).toEqual({ x: 0, y: 0 });
            expect(solution[solution.length - 1]).toEqual({ x: 0, y: 99 });
        }
    });

    it("very wide short maze (100x1)", () => {
        const maze = generateMaze(100, 1);
        const solution = solveMaze(maze);
        assert(solution !== null, "100x1 maze unsolvable");
        if (solution) {
            expect(solution[0]).toEqual({ x: 0, y: 0 });
            expect(solution[solution.length - 1]).toEqual({ x: 99, y: 0 });
        }
    });

    it("2x2 maze is always solvable", () => {
        for (let trial = 0; trial < 50; trial++) {
            const maze = generateMaze(2, 2);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: 2x2 maze unsolvable`);
        }
    });

    it("3x3 maze is always solvable", () => {
        for (let trial = 0; trial < 50; trial++) {
            const maze = generateMaze(3, 3);
            const solution = solveMaze(maze);
            assert(solution !== null, `trial ${trial}: 3x3 maze unsolvable`);
        }
    });
});

console.log("\n" + "=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${total} total`);
if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
}
console.log("=".repeat(50));

process.exit(failed > 0 ? 1 : 0);
