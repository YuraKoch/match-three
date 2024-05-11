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
    this.matrix = Array(this.rowsCount).fill().map(() => new Array(this.columnsCount).fill(null));

    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        do {
          this.matrix[row][column] = this.getRandomValue();
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
    const absValue = Math.abs(this.matrix[row][column]);
    let elementsInRow = 1;

    let currentRow = row - 1;
    while (currentRow >= 0 && Math.abs(this.matrix[currentRow][column]) === absValue) {
      elementsInRow++;
      currentRow--;
    }

    currentRow = row + 1;
    while (currentRow <= this.rowsCount - 1 && Math.abs(this.matrix[currentRow][column]) === absValue) {
      elementsInRow++;
      currentRow++;
    }

    return elementsInRow >= 3;
  }

  isHorizontalRow(row, column) {
    const absValue = Math.abs(this.matrix[row][column]);
    let elementsInRow = 1;

    let currentColumn = column - 1;
    while (currentColumn >= 0 && Math.abs(this.matrix[row][currentColumn]) === absValue) {
      elementsInRow++;
      currentColumn--;
    }

    currentColumn = column + 1;
    while (currentColumn <= this.columnsCount - 1 && Math.abs(this.matrix[row][currentColumn]) === absValue) {
      elementsInRow++;
      currentColumn++;
    }

    return elementsInRow >= 3;
  }

  swap(firstElement, secondElement) {
    this.swap2Elements(firstElement, secondElement);
    const isRowWithFisrtElement = this.isRow(firstElement.row, firstElement.column);
    const isRowWithSecondElement = this.isRow(secondElement.row, secondElement.column);
    if (!isRowWithFisrtElement && !isRowWithSecondElement) {
      this.swap2Elements(firstElement, secondElement);
      return null;
    }

    const swapStates = [];
    let removedElements = 0;
    do {
      removedElements = this.removeAllRows();

      if (removedElements > 0) {
        this.score += removedElements;
        swapStates.push(deepClone(this.matrix));
        this.dropElements();
        this.fillBlanks();
        swapStates.push(deepClone(this.matrix));
      }
    } while (removedElements > 0)

    return swapStates;
  }

  swap2Elements(firstElement, secondElement) {
    const temp = this.matrix[firstElement.row][firstElement.column];
    this.matrix[firstElement.row][firstElement.column] = this.matrix[secondElement.row][secondElement.column];
    this.matrix[secondElement.row][secondElement.column] = temp;
  }

  removeAllRows() {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        this.markElementsToRemoveFor(row, column);
      }
    }
    this.removeMarkedElements();
    return this.calculateRemovedElements();
  }

  markElementsToRemoveFor(row, column) {
    const value = this.matrix[row][column];
    if (this.isVerticalRow(row, column)) {
      this.markVerticalElementsToRemove(row, column, value);
    }
    if (this.isHorizontalRow(row, column)) {
      this.markHorizontalElementsToRemove(row, column, value);
    }
  }

  markVerticalElementsToRemove(row, column, value) {
    const absValue = Math.abs(value);
    this.matrix[row][column] = -1 * Math.abs(this.matrix[row][column]);

    let currentRow = row - 1;
    while (currentRow >= 0 && Math.abs(this.matrix[currentRow][column]) === absValue) {
      this.matrix[currentRow][column] = -1 * Math.abs(this.matrix[currentRow][column]);
      currentRow--;
    }

    currentRow = row + 1;
    while (currentRow <= this.rowsCount - 1 && Math.abs(this.matrix[currentRow][column]) === absValue) {
      this.matrix[currentRow][column] = -1 * Math.abs(this.matrix[currentRow][column]);
      currentRow++;
    }
  }

  markHorizontalElementsToRemove(row, column, value) {
    const absValue = Math.abs(value);
    this.matrix[row][column] = -1 * Math.abs(this.matrix[row][column]);

    let currentColumn = column - 1;
    while (currentColumn >= 0 && Math.abs(this.matrix[row][currentColumn]) === absValue) {
      this.matrix[row][currentColumn] = -1 * Math.abs(this.matrix[row][currentColumn]);
      currentColumn--;
    }

    currentColumn = column + 1;
    while (currentColumn <= this.columnsCount - 1 && Math.abs(this.matrix[row][currentColumn]) === absValue) {
      this.matrix[row][currentColumn] = -1 * Math.abs(this.matrix[row][currentColumn]);
      currentColumn++;
    }
  }

  removeMarkedElements() {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.matrix[row][column] < 0) this.matrix[row][column] = null;
      }
    }
  }

  calculateRemovedElements() {
    let count = 0;
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.matrix[row][column] === null) count++;
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
      if (this.matrix[row][column] === null) {
        emptyIndex = row;
        break;
      }
    }

    if (emptyIndex === undefined) return;

    for (let row = emptyIndex - 1; row >= 0; row--) {
      if (this.matrix[row][column] !== null) {
        this.matrix[emptyIndex][column] = this.matrix[row][column];
        this.matrix[row][column] = null;
        emptyIndex--;
      }
    }
  }

  fillBlanks() {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.matrix[row][column] === null) this.matrix[row][column] = this.getRandomValue();
      }
    }
  }
}