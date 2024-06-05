let _grid;
let _player_one_score_container;
let _player_two_score_container;
let _title;
let _activate_computer_button;

let _isPlayerOne = true;

let _player_one_score = 0;
let _player_two_score = 0;
let _is_end_of_game = false;

let _bordersArray = [];
let _milli = 750;

let _isComputerPlaying = false;
let _last_clicked;
let _rulesButton;
let _rulesDiv;

function begin() {
    _grid = document.getElementById("grid");
    _player_one_score_container = document.getElementById("player_one_score_container");
    _player_two_score_container = document.getElementById("player_two_score_container");
    _title = document.getElementById("title");
    _rulesButton = document.getElementById("rulesButton");
    _rulesDiv = document.getElementById("rulesDiv");
    _rulesDiv.style.display = "none";

    createGrid();

    prefillGrid();
    redraw();

    activateComputer();
}

function redraw() {
    for (let i = 0; i < _bordersArray.length; i++) {
        let border = _bordersArray[i];
        //if (border.sqOne) border.sqOne.innerHTML = border.sqOne.borderCount.toString();
        //if (border.sqTwo) border.sqTwo.innerHTML = border.sqTwo.borderCount.toString();
        if (border.isClicked) border.div.style.backgroundColor = "black";
    }
}

function prefillGrid() {

    // lets prefill the grid with random non-pointers.

    // Remember, each border, except the outermost borders
    // of the grid, belong to two (2) squares.

    // pick a list of borders where the border count
    // of each square is less than two.
    let selectedBorders = _bordersArray.filter(b => (!b.isClicked)
        && (!b.sqOne || b.sqOne.borderCount < 2)
        && (!b.sqTwo || b.sqTwo.borderCount < 2)
    );


    if (selectedBorders.length > 0) {
        //choose a random border from the list and select it.
        let i = Math.floor(Math.random() * selectedBorders.length);
        let border = selectedBorders[i];
        border.isClicked = true;
        if (border.sqOne) border.sqOne.borderCount++;
        if (border.sqTwo) border.sqTwo.borderCount++;
        prefillGrid();
    }

    return;

}

function activateComputer() {
    if (!_isComputerPlaying) {
        setTimeout(computersMove, _milli);
        _isComputerPlaying = true;
        //_activate_computer_button.style.display = "none"
        //_grid.style.marginTop = "22px";
    }
}

function createGrid() {

    let size = 11;
    let top = 8;
    let left = 12;
    let r = 0; c = 0
    let e;

    for (r = 0; r < size; r++) {
        for (c = 0; c < size; c++) {

            let tb = getBorder(true, top, left, r, c);
            let lb = getBorder(false, top, left, r, c);
            let cm = getCellMarker(top, left, r, c);
            linkRelatedCellMarkers(tb);
            linkRelatedCellMarkers(lb);
            left += 43;
        }

        //right-most border
        let rb = getBorder(false, top, left, r, c);
        linkRelatedCellMarkers(rb);

        left = 12;
        top += 43;
    }

    // bottom-most border
    for (c = 0; c < size; c++) {
        let bb = getBorder(true, top, left, r, c);
        linkRelatedCellMarkers(bb);
        left += 43;
    }

}

function linkRelatedCellMarkers(xx) {
    xx.sqOne = (xx.cellOneID) ? document.getElementById(xx.cellOneID) : false;
    xx.sqTwo = (xx.cellTwoID) ? document.getElementById(xx.cellTwoID) : false;
}

function getBorder(isHorizontal, top, left, r, c) {


    let div = document.createElement("div");

    div.onclick = borderClick;

    div.onmouseover = function () {
        if (!this.border.isClicked && (_isPlayerOne || !_isComputerPlaying))
            this.style.backgroundColor = getColor();
    }
    div.onmouseout = function () {
        if (!this.border.isClicked) this.style.backgroundColor = "#F5F5F5";
    }

    let border = new Object();

    border.row = r;
    border.col = c;
    border.idx = _bordersArray.length;
    border.isClicked = false;
    border.div = div;
    div.border = border;


    if (isHorizontal) {
        div.className = "border_horz";
        div.style.top = (top).toString() + "px";
        div.style.left = (left).toString() + "px";
        border.cellOneID = (r < 11) ? "r" + r.toString() + "c" + c.toString() : false;
        border.cellTwoID = (r > 0) ? "r" + (r - 1).toString() + "c" + c.toString() : false;
    } else {
        div.className = "border_vert";
        div.style.top = (top + 4).toString() + "px";
        div.style.left = (left - 4).toString() + "px";
        border.cellOneID = (c < 11) ? "r" + r.toString() + "c" + c.toString() : false;
        border.cellTwoID = (c > 0) ? "r" + r.toString() + "c" + (c - 1).toString() : false;
    }

    _grid.appendChild(div);
    _bordersArray.push(border);

    return border;
}

function getCellMarker(top, left, r, c) {

    let e = document.createElement("div")
    e.id = "r" + r.toString() + "c" + c.toString();
    e.className = "cell_marker";
    e.style.top = (top + 10).toString() + "px";
    e.style.left = (left + 6).toString() + "px";
    e.borderCount = 0;
    _grid.appendChild(e);
    return e;

}

function borderClick() {

    if (this.border.isClicked) return false;
    if (_isComputerPlaying && !_isPlayerOne) return;
    processMove(this.border);

}

function processMove(border) {

    let div = border.div;

    border.isClicked = true;

    div.style.backgroundColor = getColor();

    if (_last_clicked) _last_clicked.style.backgroundColor = "black";

    _last_clicked = div;

    let totalScore = _player_one_score + _player_two_score;

    if (border.sqOne) incrementBorderCount(border.sqOne);
    if (border.sqTwo) incrementBorderCount(border.sqTwo);

    if (_player_one_score + _player_two_score === totalScore) {
        _isPlayerOne = !_isPlayerOne;
        _player_one_score_container.classList.toggle("score_container_off");
        _player_two_score_container.classList.toggle("score_container_off");
    }

    _player_one_score_container.innerHTML = _player_one_score.toString();
    _player_two_score_container.innerHTML = _player_two_score.toString();

    if (_player_one_score > 60) {
        _title.innerHTML = "<< WINNER !"
        _is_end_of_game = true;
    }

    if (_player_two_score > 60) {
        _title.innerHTML = "WINNER ! >>"
        _is_end_of_game = true;
    }

}

function incrementBorderCount(marker) {

    marker.borderCount += 1;

    if (marker.borderCount === 4) {
        marker.style.backgroundColor = getColor();
        _player_one_score += (_isPlayerOne) ? 1 : 0;
        _player_two_score += (_isPlayerOne) ? 0 : 1;
    }

}

function getColor() {
    return _isPlayerOne ? "blue" : "red";
}

function computersMove() {
    if (!_isPlayerOne) calculateMove();
    setTimeout(computersMove, _milli);
}

function calculateMove() {

    // Are there any unclicked borders?
    let unclickedCount = _bordersArray.filter(b => !b.isClicked).length;
    if (unclickedCount === 0) return false;

    //Try to find a pointer...
    let border = _bordersArray.find(b => !b.isClicked
        && (b.sqOne.borderCount === 3 || b.sqTwo.borderCount === 3)
    );

    if (border) {
        processMove(border);
        return true;
    }

    //Find Random border that does not create a pointer for the other player
    let selectedBorders = _bordersArray.filter(b => !b.isClicked
        && (!b.sqOne || b.sqOne.borderCount < 2)
        && (!b.sqTwo || b.sqTwo.borderCount < 2)
    );

    if (selectedBorders.length > 0) {
        selectRandomBorder(selectedBorders);
        return true;
    }


    // finally try to find the best unclicked border...

    selectedBorders = _bordersArray.filter(b => !b.isClicked);
    if (selectedBorders.length === 0) return false;

    //still here? get point counts for each of the selected borders
    for (let i = 0; i < selectedBorders.length; i++) {
        let border = selectedBorders[i];
        let newPoints = getPointCount(border.idx);
        border.pointCount = newPoints;
    }

    //now for diagnostics, lets see if my algorythm
    //resulted in any point counts...
    let withPointCounts = selectedBorders.filter(b => b.pointCount > 0);

    //now find and process the border with the
    //lowest number of possible point counts.
    let bestBorder = selectedBorders[0];
    for (let i = 1; i < selectedBorders.length; i++) {
        let border = selectedBorders[i];
        if (border.pointCount < bestBorder.pointCount) bestBorder = border;
    }

    processMove(bestBorder);

    return true;
}

function selectRandomBorder(selectedBorders) {
    if (selectedBorders) {
        let i = Math.floor(Math.random() * selectedBorders.length);
        processMove(selectedBorders[i]);
        return true;
    }
}

function getPointCount(i) {

    let clone = makeClone(_bordersArray);


    //first we "select" the border
    let border = clone[i];
    border.isClicked = true;
    if (border.sqOne) border.sqOne.borderCount++;
    if (border.sqTwo) border.sqTwo.borderCount++;

    findPointer(clone, i);

    let afterPointCount = clone.mem.filter(m => m.borderCount === 4).length;

    let newPoints = afterPointCount - clone.beforePointCount;

    return newPoints;

}

function findPointer(clone, i) {

    //now see if there is a pointer out there
    let threeCount = clone.filter(b => !b.isClicked
        && (
            (b.sqOne && b.sqOne.borderCount === 3)
            || (b.sqTwo && b.sqTwo.borderCount === 3)
        )
    );

    let pointer = clone.find(b => !b.isClicked
        && (
            (b.sqOne && b.sqOne.borderCount === 3)
            || (b.sqTwo && b.sqTwo.borderCount === 3)
        )
    );

    if (pointer) {
        pointer.isClicked = true;
        if (pointer.sqOne) pointer.sqOne.borderCount += 1;
        if (pointer.sqTwo) pointer.sqTwo.borderCount += 1;
        findPointer(clone, i);
    }

}

function makeClone(original) {


    // first push all the cell markers into an array so they can be shared.
    let mem = [];
    for (let i = 0; i < original.length; i++) {

        let org = original[i];

        if (org.sqOne) {
            let exists = mem.find(m => m.id == org.sqOne.id);
            if (!exists) {
                let m = new Object();
                m.id = org.sqOne.id;
                m.borderCount = org.sqOne.borderCount;
                mem.push(m);
            }
        }

        if (org.sqTwo) {
            exists = mem.find(m => m.id == org.sqTwo.id);
            if (!exists) {
                let m = new Object();
                m.id = org.sqTwo.id;
                m.borderCount = org.sqTwo.borderCount;
                mem.push(m);
            }
        }

    }

    // next create the clones
    let clone = [];
    for (let i = 0; i < original.length; i++) {
        let org = original[i];
        let cln = new Object();
        cln.isClicked = org.isClicked;
        cln.row = org.row;
        cln.col = org.col;
        cln.idx = org.idx;
        cln.org = org;

        if (org.sqOne) {
            cln.sqOne = mem.find(cm => cm.id == org.sqOne.id);
        } else {
            cln.sqOne = false;
        }

        if (org.sqTwo) {
            cln.sqTwo = mem.find(cm => cm.id == org.sqTwo.id);
        } else {
            cln.sqTwo = false;
        }

        clone.push(cln);
    }

    // get before point count
    let before = mem.filter(m => m.borderCount === 4).length;
    clone.beforePointCount = before;
    clone.mem = mem;
    return clone;
}

function showRules() {
    _rulesDiv.style.display = (_rulesDiv.style.display === "none") ? "block" : "none";
    _rulesButton.innerHTML = (_rulesButton.innerHTML === "?") ? "X" : "?";
}