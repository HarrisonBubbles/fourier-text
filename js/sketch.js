let points = [];
let theta = 0;
let path = [];
let fourier;

let textWidth = 0;
let textHeight = 0;
let textBottom = 0;


// setup p5
function setup() {
  // reset variables
  points = [];
  path = [];
  theta = 0;
  fourier = [];

  // create text svg
  var textContent = document.getElementById("textbox").value;
  let svg = myFont.getPath(textContent, 0, 0, 120).toSVG();

  // svg to xy points
  var data = Snap.path.toCubic(svg)
  dataLength = data.length,
    xy = [], //holds our series of x/y values for anchors and control points,
    pointsString = data.toString();

  // convert cubic data to GSAP bezier
  for (var i = 0; i < dataLength; i++) {
    var seg = data[i];
    if (seg[0] === "M") { // move (starts the path)
      var point = {};
      point.x = seg[1];
      point.y = seg[2];

      if (point.x > textWidth) {
        textWidth = point.x;
      }
      if (point.y < textHeight) {
        textHeight = point.y;
      }
      if (point.y < textBottom) {
        textBottom = point.y;
      }

      xy.push(point);
    } else { // seg[0] === "C" (Snap.path.toCubic should return only curves after first point)
      for (var j = 1; j < 6; j += 2) {
        var point = {};
        point.x = seg[j];
        point.y = seg[j + 1];

        if (point.x > textWidth) {
          textWidth = point.x;
        }

        if (point.y < textHeight) {
          textHeight = point.y;
        }

        if (point.y < textBottom) {
          textBottom = point.y;
        }

        xy.push(point);
      }
    }
  }

  createCanvas(textWidth + 20, -textHeight + (-textHeight * 4));
  frameRate(60);

  // 
  skip = 1;
  for (let i = 0; i < xy.length; i += skip) {
    const c = new Complex(xy[i].x, xy[i].y);
    points.push(c);
  }


  fourier = dft(points);
  fourier.sort((a, b) => b.amp - a.amp);
}

function epicycles(x, y, fourier) {
  for (let i = 0; i < fourier.length; i++) {
    let prevx = x;
    let prevy = y;
    let freq = fourier[i].freq;
    let r = fourier[i].amp;
    let phase = fourier[i].phase;

    x += r * cos(phase + theta * freq);
    y += r * sin(phase + theta * freq);

    if (freq != 0) {
      stroke(88,167,205, 100);
      strokeWeight(1.5);
      noFill();
      ellipse(x, y, r * 2);
      stroke(88,167,205);
      line(prevx, prevy, x, y);
    }
  }
  return createVector(x, y);
}


function draw() {
  /*
  if (frameCount == 1) {
    capturer.start();
  }
  */

  background('white');
  translate(8 ,height + textHeight + textBottom);

  const v = epicycles(0, 0, fourier);
  path.unshift(v);

  beginShape();
  stroke(72,89,216);
  noFill();
  for (let i = 0; i < path.length; i++) {
    vertex(path[i].x, path[i].y);
  }
  endShape();

  const dt = (TWO_PI / fourier.length);
  theta += dt;

  //capturer.capture(canvas);

  if (theta > TWO_PI) {
    theta = 0;
    path = [];
    //capturer.save();
    //capturer.stop();
    //noLoop();
  }

}

