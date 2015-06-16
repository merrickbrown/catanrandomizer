    var resourceColors = {
        'clay': new RGBColor('#BE5935'),
        'wood': new RGBColor('#237529'),
        'sheep': new RGBColor('#7FDF39'),
        'wheat': new RGBColor('#e9cc2e'),
        'ore': new RGBColor('#929292'),
        'desert': new RGBColor('#f8fec2')
    };

    function RGBColor(hexcode) {
        this.r = parseInt(hexcode.substring(1,3),16);
        this.g = parseInt(hexcode.substring(3,5),16);
        this.b = parseInt(hexcode.substring(5,7),16);
        this.hex = hexcode;
        this.rgb = function() {
            return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
        };
    };

    function clamp(x, min, max) {return Math.min(max, Math.max(x, min));}
    function clamp255(x) {return clamp( Math.round(x), 0 ,255);}

    function rgbString(red,green,blue) {
        return 'rgb(' + clamp255(red) + ',' + clamp255(green) + ',' + clamp255(blue) + ')';
    }

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

    function rollCircle(X, Y, S, ctx, number, isHor, ghostliness, bgcolor) {
        if (number != 0) {
            ctx.save();
            if (isHor) {
                ctx.translate(Y, -X);
            } else {
                ctx.translate(X, Y);
            }

            // shrink-in-out animation stuff
            // ctx.beginPath();
            // ctx.arc(0, 0, S, 0, 2 * Math.PI);
            // ctx.fillStyle = bgcolor;
            // ctx.fill();

            // ctx.beginPath();
            // ctx.arc(0, 0, S*(1-ghostliness), 0, 2 * Math.PI);
            // ctx.clip();
            
            
            ctx.beginPath();
            ctx.arc(0, 0, S, 0, 2 * Math.PI);
            ctx.fillStyle = resourceColors['desert'].hex; //rgb(248,254,194)
            ctx.fill();
            // ctx.lineWidth = S*0.25
            // ctx.stroke();
            ctx.font = "bold " + S * 1.3 + "px sans-serif";
            if (number === 6 || number === 8) {
                // fade-in-out animation stuff
                ctx.fillStyle = rgbString(255 - ghostliness*7, ghostliness*254, ghostliness*194);
                // ctx.fillStyle = 'red';
            } else {
                // fade-in-out animation stuff
                ctx.fillStyle = rgbString(ghostliness*248, ghostliness*254, ghostliness*194);
                // ctx.fillStyle = 'black';
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

        function generateRolls() {
            return setup.equalize(setup.generate(function(s, r) {
                return hexFilter(noRedAdjacent, s, r);
            }));
        };

        initialize();

        function initialize() {
            window.addEventListener('resize', resizeCanvas, false);
            document.getElementById('button1').addEventListener('click',                 
                function(event) {
                    fadeinout(redrawRolls, 
                        function() {rolls = generateRolls();}, 
                        smooth,
                        15,
                        15);
                }, 
                false);
            document.getElementById('button1').addEventListener('touchstart',
                function(event) {
                    event.preventDefault();
                    fadeinout(redrawRolls, 
                        function() {rolls = generateRolls();}, 
                        smooth,
                        15,
                        15);
                },
                false);
            document.getElementById('button2').addEventListener('click', 
               remap, 
               false);
            document.getElementById('button2').addEventListener('touchstart',
                function(event) {
                    event.preventDefault();
                    remap();
                },
                false);
            document.getElementById('button3').addEventListener('click', toggleMap, false);
            document.getElementById('button3').addEventListener('touchstart',
                function(event) {
                    event.preventDefault();
                    toggleMap();
                },
                false);
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
            redrawResources(0);
            reroll();
        }

        function smooth(g) {
            return -2*g*g*g+3*g*g;
        }

        function fade(draw, dir, easeFunc, onComplete, speed) {
            var g = 0;
            var timer = window.setInterval(function() {
                draw(easeFunc(  (dir < 0) ? 1 - g : g  ));
                g += 1/speed;
                if (g > 1) {
                    window.clearInterval(timer);
                    onComplete();
                }
            }, 1000 / 60);
        }


        function reroll() {
            rolls = generateRolls();
            redrawRolls(0);
        }

        // function fadereroll() {
        //     var g = 0;
        //     var timer = window.setInterval(function() {
        //         redrawRolls(-2*g*g*g+3*g*g);
        //         g += 1/15;
        //         if (g > 1) {
        //             window.clearInterval(timer);
        //             rolls = generateRolls();
        //             fadeRollsIn();
        //         }
        //     }, 1000 / 60);
        // }

        function fadeinout(draw, swap, easeFunc, speedout, speedin) {
            fade(draw, 1, easeFunc, function() {
                swap();
                fade(draw, -1, easeFunc, function () {}, speedin);
            },
            speedout)            
        } 

        function fadeRollsIn() {
            var g = 1;
            var timer = window.setInterval(function() {
                redrawRolls(-2*g*g*g+3*g*g);
                g -= 1/15;
                if (g < 0) {
                    window.clearInterval(timer);
                }
            }, 1000 / 60);
        }



        function redrawRolls(ghostliness) {
            for (var i = 0; i < setup.board.hexes.length; i++) {
                rollCircle(
                    scale * (setup.board.hexes[i].center.x - centerX) + (isHor ? -fcanvas.height / 2 : fcanvas.width / 2),
                    scale * (setup.board.hexes[i].center.y - centerY) + (isHor ? fcanvas.width / 2 : fcanvas.height / 2),
                    scale * .36,
                    fcontext,
                    rolls[i],
                    isHor,
                    ghostliness,
                    resourceColors[setup.rules.resources[i]].hex);
            }
        }

        function redrawResources(ghostliness) {
            for (var i = 0; i < setup.board.hexes.length; i++) {
                var red = resourceColors[setup.rules.resources[i]].r,
                    green = resourceColors[setup.rules.resources[i]].g,
                    blue = resourceColors[setup.rules.resources[i]].b;
                red = (1 - ghostliness)*red + ghostliness*248;
                green = (1 - ghostliness)*green + ghostliness*254;
                blue = (1 - ghostliness)*blue + ghostliness*194;
                roundedHex(
                    scale * (setup.board.hexes[i].center.x - centerX) + (isHor ? -fcanvas.height / 2 : fcanvas.width / 2),
                    scale * (setup.board.hexes[i].center.y - centerY) + (isHor ? fcanvas.width / 2 : fcanvas.height / 2),
                    scale * 0.92,
                    0.25,
                    fcontext,
                    rgbString(red,green,blue),
                    0.01,
                    true,
                    rgbString(red,green,blue),
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
            redrawResources(0);
            redrawRolls(0);
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