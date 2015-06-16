if (typeof Error === "undefined") {
    Error = function(message) {
        this.message = message;
    };
    Error.prototype.message = "";
};

function assert(condition, message) {
    if (!condition) throw new Error(message || "Assertion failed!");
};

// assert unittests
// assert(false, "Test assert");
//assert(true, "Nothing");

// generates a (uniformly) random non-negative integer which less than upper
function randomInt(upper) {
    with(Math) {
        return floor(random() * upper);
    };
};

// randomInt unittests
/*console.log(randomInt(0));
var arr = [];
for (k = 0; k < 10; k++){
	arr = [];
	console.log(k);
	for (i = 0; i < 100000; i++) {
		arr.push(randomInt(k));
	};
	for (i = -1; i < k+3; i++) {
		console.log(i + " : " + arr.filter(function (x) { return x === i;}).length/100000);
	};
};*/

// generates a random integer in the range [lower, upper)
function randomIntRange(lower, upper) {
    return randomInt(upper - lower) + lower;
};

// returns a random element of arr
function randomElt(arr) {
    return arr[randomInt(arr.length)];
};

// picks a random element of arr and removes it (mutates) from arr. returns the removed element
function popRandomElt(arr) {
    assert(arr.length > 0, "Cannot remove from an empty list");
    var randIndex = randomInt(arr.length);
    var element = arr[randIndex];
    arr.splice(randIndex, 1);
    return element;
};


function shuffle(arr) {
    var temp, curr, top = arr.length;
    if (top) {
        while (--top) {
            current = randomInt(top + 1);
            temp = arr[current];
            arr[current] = arr[top];
            arr[top] = temp;
        }
    }
    return arr;
};

//shuffle unittests
/*for (i = 0; i < 10; i++) {
	var test = [1,2,3,4,5,6,7,8,9,10];
	console.log(shuffle(test));
}*/

function copyApply(fun, arr) {
    return fun(arr.slice());
}

// popRandomElt unittests
/*var arr = [1,2];
var rndarr = [];
while (arr.length > 0) {
	rndarr.push(popRandomElt(arr));
};
console.log(rndarr);
console.log(arr);
*/

// generates a random assignment of keys to values. the length of keys cannot be greater than the length of values.  
function randomMapping(keys, values) {
    assert(keys.length <= values.length);
    var mapping = {};
    for (var key in keys) {
        mapping[keys[key]] = popRandomElt(values);
    }
    return mapping;
};

// randomMapping unittests
/*var keys = ['aa','ab','ac','ad','ae'];
var values = ['a','b','c','d','e', 'f'];
console.log(randomMapping(keys,values));*/

function arrayMin(arr) {
  return arr.reduce(function (p, v) {
    return ( p < v ? p : v );
  });
}

function arrayMax(arr) {
  return arr.reduce(function (p, v) {
    return ( p > v ? p : v );
  });
}


function Point(xcoord, ycoord) {
    this.x = xcoord;
    this.y = ycoord;
}

function distSq(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
}

const RT3 = Math.sqrt(3);
const EPS = 0.01

function DICEPROBS(x) {
    var result;
    switch (x) {
        case 2:
        case 12:
            result = 1;
            break;
        case 3:
        case 11:
            result = 2;
            break;

        case 4:
        case 10:
            result = 3;
            break;

        case 5:
        case 9:
            result = 4;
            break;

        case 6:
        case 8:
            result = 5;
            break;

        case 7:
            result = 6;
            break;
        default:
            result = 0;
            break;
    }
    return result / 36;
}

function Vertex(point) {
    this.p = point;
    this.adhexes = [];
    this.adverts = [];
}

function Hex(location) {
    this.center = location;
    this.neighbors = [];
    this.vertices = [];
};

function BoardGraph(mapData) {
    this.vertices = [];
    this.vertices.length = mapData.vertexrowlengths.reduce(function(a, b) {
        return a + b;
    }, 0);
    //generate vertices
    var i = mapData.vertexrowlengths.length;
    var vindex = 0;
    while (i--) {
        var j = mapData.vertexrowlengths[i];
        while (j--) {
            this.vertices[vindex] = new Vertex(
                new Point(
                    mapData.vertexrowstarts[i][0] + j * RT3,
                    mapData.vertexrowstarts[i][1]
                )
            );
            vindex++;
        }
    }
    //add adjacent vertices
    var vindex1 = this.vertices.length;
    while (vindex1--) {
        var vindex2 = vindex1;
        while (vindex2--) {
            if (distSq(this.vertices[vindex1].p, this.vertices[vindex2].p) < (1 + EPS)) {
                this.vertices[vindex1].adverts.push(vindex2);
                this.vertices[vindex2].adverts.push(vindex1);
            }
        }
    }
    //generate hexes
    this.hexes = [];
    this.hexes.length = mapData.hexrowlengths.reduce(function(a, b) {
        return a + b;
    }, 0);
    var k = mapData.hexrowlengths.length;
    var hindex = 0;
    while (k--) {
        var l = mapData.hexrowlengths[k];
        while (l--) {
            var hex = new Hex(
                new Point(
                    mapData.hexrowstarts[k][0] + l * RT3,
                    mapData.hexrowstarts[k][1]
                )
            );
            // add vertices to hexes
            var vindex = this.vertices.length;
            while (vindex--) {
                if (distSq(hex.center, this.vertices[vindex].p) < 1 + EPS) {
                    hex.vertices.push(vindex);
                    this.vertices[vindex].adhexes.push(hindex)
                }
            }
            this.hexes[hindex] = hex;
            hindex++;
        }
    }
    // add adjacent hexes
    var hindex1 = this.hexes.length;
    while (hindex1--) {
        var hindex2 = hindex1;
        while (hindex2--) {
            if (distSq(this.hexes[hindex1].center, this.hexes[hindex2].center) < 3 + EPS) {
                this.hexes[hindex1].neighbors.push(hindex2);
                this.hexes[hindex2].neighbors.push(hindex1);
            }
        }
    }
};



function Setup(board, rules) {
    this.board = board;
    this.rules = rules;
    this.desert = [];
    this.shuffleResources = function() {
        shuffle(rules.resources);
        this.desert = [];
        var idx = rules.resources.indexOf('desert');
        while (idx != -1) {
            this.desert.push(idx);
            idx = rules.resources.indexOf('desert', idx + 1);
        }
        this.desert.sort(function(a,b) { return a - b;});
    };
    this.generate = function(criteria) {
        var roll = copyApply(shuffle, this.rules.rollnumbers);
        var result = roll.slice();
        for (var desind = 0; desind < this.desert.length; desind++) {
            result.splice(this.desert[desind], 0, 0);
        }
        while (!criteria(this, result)) {
            roll = shuffle(roll);
            result = roll.slice();
            for (desind = 0; desind < this.desert.length; desind++) {
                result.splice(this.desert[desind], 0, 0);
            }
        }
        return result;
    };

    this.equalize = function(rolls) {
        var resources = ["sheep", "wood", "wheat", "clay", "ore"];
        for(var d = 2; d < 7; d++) {
            // Setup resource balances 
            var dresources = {
                    lower : [[], [], [], [], []], 
                    upper : [[], [], [], [], []]
                }
            dresources.diffs = function() {
                        return dresources.lower.map(
                            function(e, i) {
                                return dresources.upper[i].length - e.length;
                            }
                        )
                    };
            dresources.maxdiff = function() {
                    var mx = -Infinity,
                        mxi;
                    for (var diffi = 0; diffi < dresources.diffs().length; diffi++) {
                        if (mx < dresources.diffs()[diffi]) { mx = dresources.diffs()[diffi]; mxi = diffi;}
                    }
                    return mxi;
                };
            dresources.mindiff = function() {
                    var mn = Infinity,
                        mni;
                    for (var diffi = 0; diffi < dresources.diffs().length; diffi++) {
                        if (mn > dresources.diffs()[diffi]) { mn = dresources.diffs()[diffi]; mni = diffi;}
                    }
                    return mni;
                };
            for (var resindex = 0; resindex < resources.length; resindex++) {
                rolls.map(function(elem, index) {
                    if (elem === d && rules.resources[index] === resources[resindex]) {
                        dresources.lower[resindex].push(index);
                    } else if (elem === (14 - d) && rules.resources[index] === resources[resindex]) {
                        dresources.upper[resindex].push(index);
                    }
                });
            }
            // Equalize rolls
            while (dresources.diffs()[dresources.maxdiff()] > 1 || dresources.diffs()[dresources.mindiff()] < -1) {
                var swapi1 = dresources.mindiff(),
                    swapi2 = dresources.maxdiff(),
                    swapupper2 = dresources.upper[swapi2].pop(),
                    swaplower1 = dresources.lower[swapi1].pop();
                dresources.lower[swapi2].push(swaplower1);
                dresources.upper[swapi1].push(swapupper2);
                rolls[swapupper2] = d;
                rolls[swaplower1] = 14 - d;
                // console.log('Swapping a ' + d + ' and ' + (14 - d) + ' in hexes ' + swapupper2 + ' and ' + swaplower1);
            }
        }
        return rolls;
    };
};

function vertexFilter(filter, setup, rolls) {
    return setup.board.vertices.every(function(vertex, vertindex) {
        return filter(vertex, vertindex, setup, rolls);
    });
};


function hexFilter(filter, setup, rolls) {
    return setup.board.hexes.every(function(hex, hexindex) {
        return filter(hex, hexindex, setup, rolls);
    });
};

function noRedAdjacent(hex, hexindex, setup, rolls) {
    if (rolls[hexindex] === 6 || rolls[hexindex] === 8) {
        return hex.neighbors.every(function(neighbor, neighborindex) {
            return rolls[neighbor] != 6 &&
                rolls[neighbor] != 8;
        });
    } else {
        return true;
    }
};

function pipMax(max, vert, setup, rolls) {
    return vert.adhexes.map(
        function(i) {
            return DICEPROBS(rolls[i]) * 36;
        }
    ).reduce(
        function(a, b) {
            return a + b;
        }, 0) <= max;
};

function filterCombine(hexFilters, vertexFilters, setup, rolls) {
    function hexCombination(hex, hexindex, setup, rolls) {
        return hexFilters.every(function(hexfilter) {
            return hexfilter(hex, hexindex, setup, rolls);
        });
    };

    function vertexCombination(vertex, vertexindex, setup, rolls) {
        return vertexFilters.every(function(vertexfilter) {
            return vertexfilter(vertex, vertexindex, setup, rolls);
        });
    };
    return hexFilter(hexCombination, setup, rolls) && vertexFilter(vertexCombination, setup, rolls);
}

const smallMap = {
    //inMapQ : function(x,y) {return 0 <= x && x <= 4 && 0 <= y && y <= 4 && -2 <= x - y && x - y <= 2,
    vertexrowlengths: [3, 4, 4, 5, 5, 6, 6, 5, 5, 4, 4, 3],
    vertexrowstarts: [
        [-RT3 * (0 / 2), (-2 / 2)],
        [-RT3 * (1 / 2), (-1 / 2)],
        [-RT3 * (1 / 2), (1 / 2)],
        [-RT3 * (2 / 2), (2 / 2)],
        [-RT3 * (2 / 2), (4 / 2)],
        [-RT3 * (3 / 2), (5 / 2)],
        [-RT3 * (3 / 2), (7 / 2)],
        [-RT3 * (2 / 2), (8 / 2)],
        [-RT3 * (2 / 2), (10 / 2)],
        [-RT3 * (1 / 2), (11 / 2)],
        [-RT3 * (1 / 2), (13 / 2)],
        [-RT3 * (0 / 2), (14 / 2)]
    ],
    hexrowlengths: [3, 4, 5, 4, 3],
    hexrowstarts: [
        [-RT3 * (0 / 2), (0 / 2)],
        [-RT3 * (1 / 2), (3 / 2)],
        [-RT3 * (2 / 2), (6 / 2)],
        [-RT3 * (1 / 2), (9 / 2)],
        [-RT3 * (0 / 2), (12 / 2)]
    ]
};

const smallGame = {
    rollnumbers: [2,
        3, 3,
        4, 4,
        5, 5,
        6, 6,
        8, 8,
        9, 9,
        10, 10,
        11, 11,
        12
    ],
    resources: ["desert",
        "sheep", "sheep", "sheep", "sheep",
        "wood", "wood", "wood", "wood",
        "wheat", "wheat", "wheat", "wheat",
        "clay", "clay", "clay",
        "ore", "ore", "ore"
    ]
};

const largeGame = {
    rollnumbers: [2, 2,
        3, 3, 3,
        4, 4, 4,
        5, 5, 5,
        6, 6, 6,
        8, 8, 8,
        9, 9, 9,
        10, 10, 10,
        11, 11, 11,
        12, 12
    ],
    resources: ["desert", "desert",
        "sheep", "sheep", "sheep", "sheep", "sheep", "sheep",
        "wood", "wood", "wood", "wood", "wood", "wood",
        "wheat", "wheat", "wheat", "wheat", "wheat", "wheat",
        "clay", "clay", "clay", "clay", "clay",
        "ore", "ore", "ore", "ore", "ore"
    ]
};

const largeMap = {
    //inMapQ : function(x,y) {return 0 <= x && x <= 5 && 0 <= y && y <= 6 && -3 <= x - y && x - y <= 2;},
    vertexrowlengths: [3, 4, 4, 5, 5, 6, 6, 7, 7, 6, 6, 5, 5, 4, 4, 3],
    vertexrowstarts: [
        [-RT3 * (0 / 2), (-2 / 2)],
        [-RT3 * (1 / 2), (-1 / 2)],
        [-RT3 * (1 / 2), (1 / 2)],
        [-RT3 * (2 / 2), (2 / 2)],
        [-RT3 * (2 / 2), (4 / 2)],
        [-RT3 * (3 / 2), (5 / 2)],
        [-RT3 * (3 / 2), (7 / 2)],
        [-RT3 * (4 / 2), (8 / 2)],
        [-RT3 * (4 / 2), (10 / 2)],
        [-RT3 * (3 / 2), (11 / 2)],
        [-RT3 * (3 / 2), (13 / 2)],
        [-RT3 * (2 / 2), (14 / 2)],
        [-RT3 * (2 / 2), (16 / 2)],
        [-RT3 * (1 / 2), (17 / 2)],
        [-RT3 * (1 / 2), (19 / 2)],
        [-RT3 * (0 / 2), (20 / 2)]
    ],
    hexrowlengths: [3, 4, 5, 6, 5, 4, 3],
    hexrowstarts: [
        [-RT3 * (0 / 2), (0 / 2)],
        [-RT3 * (1 / 2), (3 / 2)],
        [-RT3 * (2 / 2), (6 / 2)],
        [-RT3 * (3 / 2), (9 / 2)],
        [-RT3 * (2 / 2), (12 / 2)],
        [-RT3 * (1 / 2), (15 / 2)],
        [-RT3 * (0 / 2), (18 / 2)]
    ]
};

const altLargeMap = {
    //inMapQ : function(x,y) {return 0 <= x && x <= 5 && 0 <= y && y <= 6 && -3 <= x - y && x - y <= 2;},
    vertexrowlengths: [3, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 3],
    vertexrowstarts: [
        [-RT3 * (0 / 2), (-2 / 2)],
        [-RT3 * (1 / 2), (-1 / 2)],
        [-RT3 * (1 / 2), (1 / 2)],
        [-RT3 * (2 / 2), (2 / 2)],
        [-RT3 * (2 / 2), (4 / 2)],
        [-RT3 * (3 / 2), (5 / 2)],
        [-RT3 * (3 / 2), (7 / 2)],
        [-RT3 * (2 / 2), (8 / 2)],
        [-RT3 * (2 / 2), (10 / 2)],
        [-RT3 * (1 / 2), (11 / 2)],
        [-RT3 * (1 / 2), (13 / 2)],
        [-RT3 * (0 / 2), (14 / 2)],
        [-RT3 * (0 / 2), (16 / 2)],
        [-RT3 * (-1/ 2), (17 / 2)],
        [-RT3 * (-1/ 2), (19 / 2)],
        [-RT3 * (-2/ 2), (20 / 2)]
    ],
    hexrowlengths: [3, 4, 5, 5, 5, 4, 3],
    hexrowstarts: [
        [-RT3 * (0 / 2), (0 / 2)],
        [-RT3 * (1 / 2), (3 / 2)],
        [-RT3 * (2 / 2), (6 / 2)],
        [-RT3 * (1 / 2), (9 / 2)],
        [-RT3 * (0 / 2), (12 / 2)],
        [-RT3 * (-1 / 2), (15 / 2)],
        [-RT3 * (-2 / 2), (18 / 2)]
    ]
};

const altLargeGame = {
    rollnumbers: [2, 2,
        3, 3, 3,
        4, 4, 4,
        5, 5, 5,
        6, 6, 6,
        8, 8, 8,
        9, 9, 9,
        10, 10, 10,
        11, 11, 11,
        12, 12
    ],
    resources: ["desert",
        "sheep", "sheep", "sheep", "sheep", "sheep", "sheep",
        "wood", "wood", "wood", "wood", "wood", "wood",
        "wheat", "wheat", "wheat", "wheat", "wheat", "wheat",
        "clay", "clay", "clay", "clay", "clay",
        "ore", "ore", "ore", "ore", "ore"
    ]
};