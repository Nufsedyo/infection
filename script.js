let cells = [];
let whiteBloodCells = [];
let multiplyRate = 500;
let time = 0;
let wbcSpawnRate = 3000;
let mergeDistance = 30;
let infectionLevel = 0; 
let flashing = false; 

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas-container");

    cells.push(new Cell(width / 2, height / 2, false));
    setInterval(multiplyCells, multiplyRate);
    setInterval(spawnWBC, wbcSpawnRate);

    window.addEventListener("resize", () => {
        resizeCanvas(windowWidth, windowHeight);
    });

    document.getElementById("cure-btn").addEventListener("click", () => {
        location.reload();
    });

    noCursor();
}

function draw() {
    if (flashing) {
        background(frameCount % 10 < 5 ? 255 : 0);
    } else {
        background(20, 20, 20, 200);
    }

    time += 0.05;
    mergeCells();

    // Calculate infection percentage
    infectionLevel = map(cells.length, 0, 1000, 0, 100);
    infectionLevel = constrain(infectionLevel, 0, 100);

    if (infectionLevel >= 75) {
        flashing = true;
    } else {
        flashing = false;
    }

    // Update and show all infected cells
    for (let i = cells.length - 1; i >= 0; i--) {
        let cell = cells[i];
        cell.move();
        cell.show(time);

        let d = dist(mouseX, mouseY, cell.x, cell.y);
        if (d < 20) {
            cells.splice(i, 1);
        }
    }

    // Update and show white blood cells & check for collisions
    for (let i = whiteBloodCells.length - 1; i >= 0; i--) {
        let wbc = whiteBloodCells[i];
        wbc.chase();
        wbc.show();

        // Check if WBC collides with any disease cell
        for (let j = cells.length - 1; j >= 0; j--) {
            let d = dist(wbc.x, wbc.y, cells[j].x, cells[j].y);
            if (d < 20) {
                cells.splice(j, 1); // Remove the infected cell
                break;
            }
        }
    }

    // Draw cursor WBC
    drawCursorWBC();

    // Always render progress bar last so it's on top
    drawProgressBar();
}

// Function to draw the progress bar on top
function drawProgressBar() {
    push();
    fill(50);
    rect(20, height - 50, width - 40, 20); // Background bar

    fill(255, 0, 0); 
    rect(20, height - 50, (width - 40) * (infectionLevel / 100), 20);

    fill(255);
    textSize(16);
    textAlign(LEFT);
    text(`Infection: ${floor(infectionLevel)}%`, 30, height - 35);
    pop();
}

// Function to multiply cells
function multiplyCells() {
    let newCells = [];
    for (let cell of cells) {
        let newX = cell.x + random(-50, 50);
        let newY = cell.y + random(-50, 50);
        let isMutant = random(1) < 0.2;
        newCells.push(new Cell(newX, newY, isMutant));
    }
    cells = cells.concat(newCells);
}

// Function to merge nearby cells
function mergeCells() {
    let mergedCells = [];
    let merged = new Array(cells.length).fill(false);

    for (let i = 0; i < cells.length; i++) {
        if (merged[i]) continue;

        let mainCell = cells[i];
        let newX = mainCell.x;
        let newY = mainCell.y;
        let newSize = mainCell.baseSize;
        let newColor = mainCell.color;
        let newOpacity = mainCell.opacity;

        for (let j = i + 1; j < cells.length; j++) {
            if (merged[j]) continue;

            let otherCell = cells[j];
            let d = dist(mainCell.x, mainCell.y, otherCell.x, otherCell.y);

            if (d < mergeDistance) {
                newX = (newX + otherCell.x) / 2;
                newY = (newY + otherCell.y) / 2;
                newSize += otherCell.baseSize * 0.5;
                newOpacity = (newOpacity + otherCell.opacity) / 2;
                merged[j] = true;
            }
        }

        merged[i] = true;
        mergedCells.push(new Cell(newX, newY, false, newSize, newColor, newOpacity));
    }

    cells = mergedCells;
}

// Function to spawn white blood cells
function spawnWBC() {
    let x = random(width);
    let y = random(height);
    whiteBloodCells.push(new WhiteBloodCell(x, y));
}

// Infected cell class
class Cell {
    constructor(x, y, mutant, size = 20, color = null, opacity = null) {
        this.x = x;
        this.y = y;
        this.baseSize = mutant ? random(15, 30) : size;
        this.pulseSpeed = mutant ? random(0.02, 0.08) : 0.05;
        this.distortFactor = mutant ? random(0.5, 1.5) : 1;
        this.speedX = random(-0.5, 0.5);
        this.speedY = random(-0.5, 0.5);
        this.color = color || [random(200, 255), random(50, 100), random(50, 100)];
        this.opacity = opacity !== null ? opacity : random(50, 200);
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    show(t) {
        let pulse = sin(t * this.pulseSpeed + this.x * 0.01 + this.y * 0.01) * 5 * this.distortFactor;
        let size = this.baseSize + pulse;

        fill(this.color[0], this.color[1], this.color[2], this.opacity);
        noStroke();
        ellipse(this.x, this.y, size);
    }
}

// White blood cell class
class WhiteBloodCell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.size = 25;
    }

    chase() {
        if (cells.length > 0) {
            let target = cells[floor(random(cells.length))];
            let angle = atan2(target.y - this.y, target.x - this.x);
            this.x += cos(angle) * this.speed;
            this.y += sin(angle) * this.speed;
        }
    }

    show() {
        fill(255, 255, 255, 255);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}

// Draw the cursor as a white blood cell
function drawCursorWBC() {
    fill(255, 255, 255, 200);
    noStroke();
    ellipse(mouseX, mouseY, 30);
}