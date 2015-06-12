    var resourceColors = {
        'clay': '#BE5935',
        'wood': '#237529',
        'sheep': '#7FDF39',
        'wheat': '#e9cc2e',
        'ore': '#929292',
        'desert': '#f8fec2'
    };
    
    var hexagon = function(X, Y, S, ctx, linecolor, linewidth, fill, fillcolor, isHor) {
        var RT3 = Math.sqrt(3);
        ctx.save();
        if (isHor) {
            ctx.translate(Y, -X);
            ctx.rotate(Math.PI / 6);
        } else {
            ctx.translate(X, Y);
        }
        ctx.beginPath();
        ctx.moveTo(S * RT3 / 2, S * 1 / 2);
        ctx.lineTo(S * 0, S * 1);
        ctx.lineTo(S * (-RT3 / 2), S * 1 / 2);
        ctx.lineTo(S * (-RT3 / 2), S * (-1 / 2));
        ctx.lineTo(S * 0, S * (-1));
        ctx.lineTo(S * RT3 / 2, S * (-1 / 2));
        ctx.closePath();
        ctx.lineWidth = S * linewidth;
        ctx.strokeStyle = linecolor;
        ctx.stroke();
        if (fill) {
            ctx.fillStyle = fillcolor;
            ctx.fill();
        }

        ctx.restore();
    };

    function rollCircle(X, Y, S, ctx, number,isHor) {
        if (number != 0) {
            ctx.save();
            if (isHor) {
                ctx.translate(Y, -X);
            } else {
                ctx.translate(X, Y);
            }
            ctx.beginPath();
            ctx.arc(0, 0, S, 0, 2 * Math.PI);
            ctx.fillStyle = '#f8fec2'
            ctx.fill();
            // ctx.lineWidth = S*0.25
            // ctx.stroke();
            ctx.font = "bold " + S * 1.3 + "px sans-serif";
            if (number === 6 || number === 8) {
                ctx.fillStyle = 'red';
            } else {
                ctx.fillStyle = 'black';
            }
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(number, 0, 0);
            ctx.restore();
        }
    };

    var roundedHex = function(X, Y, S, radius, ctx, linecolor, linewidth, fill, fillcolor, isHor) {
        var RT3 = Math.sqrt(3);
        var R = radius * S;
        ctx.save();
        if (isHor) {
            ctx.translate(Y, -X);
            ctx.rotate(Math.PI / 6);
        } else {
            ctx.translate(X, Y);
        }
        ctx.beginPath();
        ctx.moveTo(S * RT3 / 2, S * 0);
        ctx.arcTo(S * RT3 / 2, S * 1 / 2, S * 0, S * 1, R);
        ctx.arcTo(S * 0, S * 1, S * (-RT3 / 2), S * 1 / 2, R);
        ctx.arcTo(S * (-RT3 / 2), S * 1 / 2, S * (-RT3 / 2), S * (-1 / 2), R);
        ctx.arcTo(S * (-RT3 / 2), S * (-1 / 2), S * 0, S * (-1), R);
        ctx.arcTo(S * 0, S * (-1), S * RT3 / 2, S * (-1 / 2), R);
        ctx.arcTo(S * RT3 / 2, S * (-1 / 2), S * RT3 / 2, S * 0, R);
        ctx.closePath();
        ctx.lineWidth = S * linewidth;
        ctx.strokeStyle = linecolor;
        ctx.stroke();
        if (fill) {
            ctx.fillStyle = fillcolor;
            ctx.fill();
        }
        ctx.restore();
    };

    (function() {
        var isSmall = false,
            fcanvas = document.getElementById('foreground'),
            fcontext = fcanvas.getContext('2d');
        var isHor, board, setup, rolls, scale;

        function generateRolls() {return setup.generate(function(s, r) {
            return hexFilter(noRedAdjacent, s, r);
        });};

        initialize();

        function initialize() {
            window.addEventListener('resize', resizeCanvas, false);
            document.getElementById('button1').addEventListener('click', reroll, false);
            document.getElementById('button2').addEventListener('click', remap, false);
            document.getElementById('button3').addEventListener('click', toggleMap, false);
            toggleMap();
            resizeCanvas();
        }

        function toggleMap() {
            isSmall = !isSmall;
            if (isSmall) {
                setup = new Setup(new BoardGraph(smallMap), smallGame);
            } else {
                setup = new Setup(new BoardGraph(largeMap), largeGame);
            }
            minX = arrayMin(setup.board.vertices.map(function(v) {
                return v.p.x;
            })),
            maxX = arrayMax(setup.board.vertices.map(function(v) {
                return v.p.x;
            })),
            minY = arrayMin(setup.board.vertices.map(function(v) {
                return v.p.y;
            })),
            maxY = arrayMax(setup.board.vertices.map(function(v) {
                return v.p.y;
            })),
            centerX = (minX + maxX) / 2,
            centerY = (minY + maxY) / 2;
            remap();
            redraw();
        }

        function remap() {
            setup.shuffleResources();
            redrawResources();
            reroll();
        } 

        function reroll() {
            rolls = generateRolls();
            redrawRolls();
        }

        function redrawRolls() {
            for (var i = 0; i < setup.board.hexes.length; i++) {
                rollCircle(
                    scale * (setup.board.hexes[i].center.x - centerX) + (isHor ? -fcanvas.height / 2 : fcanvas.width / 2),
                    scale * (setup.board.hexes[i].center.y - centerY) + (isHor ? fcanvas.width / 2 : fcanvas.height / 2),
                    scale * .36,
                    fcontext,
                    rolls[i],
                    isHor);
            }
        }

        function redrawResources() {
            for (var i = 0; i < setup.board.hexes.length; i++) {
                roundedHex(
                    scale * (setup.board.hexes[i].center.x - centerX) + (isHor ? -fcanvas.height / 2 : fcanvas.width / 2),
                    scale * (setup.board.hexes[i].center.y - centerY) + (isHor ? fcanvas.width / 2 : fcanvas.height / 2),
                    scale * 0.92,
                    0.25,
                    fcontext,
                    resourceColors[setup.rules.resources[i]],
                    0.01,
                    true,
                    resourceColors[setup.rules.resources[i]],
                    isHor);

            }
        }

        function redrawFrame() {
            for (var i = 0; i < setup.board.hexes.length; i++) {
                roundedHex(
                    scale * (setup.board.hexes[i].center.x - centerX) + (isHor ? -fcanvas.height / 2 : fcanvas.width / 2),
                    scale * (setup.board.hexes[i].center.y - centerY) + (isHor ? fcanvas.width / 2 : fcanvas.height / 2),
                    scale * 1.08,
                    0.25,
                    fcontext,
                    'rgb(0,0,0)',
                    0.01,
                    true,
                    'rgb(0,0,0)',
                    isHor
                );
            }
        }

        function redraw() {
            fcontext.rect(0, 0, fcanvas.width, fcanvas.height);
            fcontext.fillStyle = '#66B8E4';
            fcontext.fill();
            scale = 0.9 * Math.min(fcanvas.width, fcanvas.height) / Math.max(maxX - minX, maxY - minY);
            redrawFrame();
            redrawResources();
            redrawRolls();
        }

        function resizeCanvas() {
            fcanvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            fcanvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if (fcanvas.width > fcanvas.height) {
                fcanvas.width *= 2 / 3;
            } else {
                fcanvas.height *= 2 / 3;
            }
            if (fcanvas.width > fcanvas.height) {
                isHor = true;
            } else {
                isHor = false;
            }
            redraw();
        }
    })();