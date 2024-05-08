import { deepClone } from "./utils.js";

export class Game {
  constructor(rowsCount, columnsCount, elementsCount) {
    this.rowsCount = rowsCount;
    this.columnsCount = columnsCount;
    this.elementsCount = elementsCount;

    this.init();
  }

  init() {
    this.score = 0;
    this.grid = Array(this.rowsCount).fill().map(() => new Array(this.columnsCount).fill(null));

    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        do {
          this.grid[row][column] = this.getRandomValue();
        } while (this.isRow(row, column));
      }
    }
  }

  getRandomValue() {
    return Math.floor(Math.random() * this.elementsCount) + 1
  }

  isRow(row, column) {
    return this.isVerticalRow(row, column) || this.isHorizontalRow(row, column);
  }

  isVerticalRow(row, column) {
    const value = Math.abs(this.grid[row][column]);
    let elementsInRow = 1;

    let currentRow = row - 1;
    while (currentRow >= 0 && Math.abs(this.grid[currentRow][column]) == value) {
      elementsInRow++;
      currentRow--;
    }

    currentRow = row + 1;
    while (currentRow <= this.rowsCount - 1 && Math.abs(this.grid[currentRow][column]) == value) {
      elementsInRow++;
      currentRow++;
    }

    return elementsInRow >= 3;
  }

  isHorizontalRow(row, column) {
    const value = Math.abs(this.grid[row][column]);
    let elementsInRow = 1;

    let currentColumn = column - 1;
    while (currentColumn >= 0 && Math.abs(this.grid[row][currentColumn]) == value) {
      elementsInRow++;
      currentColumn--;
    }

    currentColumn = column + 1;
    while (currentColumn <= this.columnsCount - 1 && Math.abs(this.grid[row][currentColumn]) == value) {
      elementsInRow++;
      currentColumn++;
    }

    return elementsInRow >= 3;
  }

  isNeighbours(firstElement, secondElement) {
    const isColumnNeighbours = firstElement.column == secondElement.column && Math.abs(firstElement.row - secondElement.row) === 1;
    const isRowNeighbours = firstElement.row == secondElement.row && Math.abs(firstElement.column - secondElement.column) === 1;
    return isColumnNeighbours || isRowNeighbours;
  }

  swapElements(firstElement, secondElement) {
    this.swapElementsInGrid(firstElement, secondElement);
    const isRowWithFisrtElement = this.isRow(firstElement.row, firstElement.column);
    const isRowWithSecondElement = this.isRow(secondElement.row, secondElement.column);
    if (!isRowWithFisrtElement && !isRowWithSecondElement) {
      this.swapElementsInGrid(firstElement, secondElement);
      return null;
    }

    const gridStates = [];

    this.markElementsToRemoveFor(firstElement.row, firstElement.column);
    this.markElementsToRemoveFor(secondElement.row, secondElement.column);
    this.removeMarkedElements();
    this.score += this.calculateRemovedElements();
    gridStates.push(deepClone(this.grid));

    this.dropElements();
    this.fillBlanks();
    gridStates.push(deepClone(this.grid));

    let removedElements = 0;
    do {
      for (let row = 0; row < this.rowsCount; row++) {
        for (let column = 0; column < this.columnsCount; column++) {
          this.markElementsToRemoveFor(row, column);
        }
      }
      this.removeMarkedElements();
      removedElements = this.calculateRemovedElements();
      this.score += removedElements;

      if (removedElements > 0) {
        gridStates.push(deepClone(this.grid));
        this.dropElements();
        this.fillBlanks();
        gridStates.push(deepClone(this.grid));
      }
    } while (removedElements > 0)

    return gridStates;
  }

  swapElementsInGrid(firstElement, secondElement) {
    const temp = this.grid[firstElement.row][firstElement.column];
    this.grid[firstElement.row][firstElement.column] = this.grid[secondElement.row][secondElement.column];
    this.grid[secondElement.row][secondElement.column] = temp;
  }

  markElementsToRemoveFor(row, column) {
    const value = this.grid[row][column];
    if (this.isVerticalRow(row, column)) {
      this.markVerticalElementsToRemove(row, column, value);
    }
    if (this.isHorizontalRow(row, column)) {
      this.markHorizontalElementsToRemove(row, column, value);
    }
  }

  markVerticalElementsToRemove(row, column, value) {
    this.grid[row][column] = -1 * Math.abs(this.grid[row][column]);

    let currentRow = row - 1;
    while (currentRow >= 0 && this.grid[currentRow][column] == value) {
      this.grid[currentRow][column] = -1 * Math.abs(this.grid[currentRow][column]);
      currentRow--;
    }

    currentRow = row + 1;
    while (currentRow <= this.rowsCount - 1 && this.grid[currentRow][column] == value) {
      this.grid[currentRow][column] = -1 * Math.abs(this.grid[currentRow][column]);
      currentRow++;
    }
  }

  markHorizontalElementsToRemove(row, column, value) {
    this.grid[row][column] = -1 * Math.abs(this.grid[row][column]);

    let currentColumn = column - 1;
    while (currentColumn >= 0 && this.grid[row][currentColumn] == value) {
      this.grid[row][currentColumn] = -1 * Math.abs(this.grid[row][currentColumn]);
      currentColumn--;
    }

    currentColumn = column + 1;
    while (currentColumn <= this.columnsCount - 1 && this.grid[row][currentColumn] == value) {
      this.grid[row][currentColumn] = -1 * Math.abs(this.grid[row][currentColumn]);
      currentColumn++;
    }
  }

  removeMarkedElements() {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.grid[row][column] < 0) this.grid[row][column] = null;
      }
    }
  }

  calculateRemovedElements() {
    let count = 0;
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.grid[row][column] === null) count++;
      }
    }
    return count;
  }

  dropElements() {
    for (let column = 0; column < this.columnsCount; column++) {
      this.dropElementsInColumn(column);
    }
  }

  dropElementsInColumn(column) {
    let emptyIndex;

    for (let row = this.rowsCount - 1; row >= 0; row--) {
      if (this.grid[row][column] === null) {
        emptyIndex = row;
        break;
      }
    }

    if (emptyIndex === undefined) return;

    for (let row = emptyIndex - 1; row >= 0; row--) {
      if (this.grid[row][column] !== null) {
        this.grid[emptyIndex][column] = this.grid[row][column];
        this.grid[row][column] = null;
        emptyIndex--;
      }
    }
  }

  fillBlanks() {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.grid[row][column] === null) this.grid[row][column] = this.getRandomValue();
      }
    }
  }
}