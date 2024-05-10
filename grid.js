import { Tile } from "./tile.js";
import { delay } from "./utils.js";

export class Grid {
  tiles = [];
  selectedTile = null;
  isGameBlocked = false;

  constructor(wrapper, matrix) {
    this.wrapper = wrapper;
    this.addTiles(matrix);
  }

  addTiles(matrix) {
    for (let row = 0; row < matrix.length; row++) {
      for (let column = 0; column < matrix[0].length; column++) {
        this.createTile(row, column, matrix[row][column]);
      }
    }
  }

  async createTile(row, column, value) {
    const tile = new Tile(this.wrapper, row, column, value, this.handleTileClick);
    this.tiles.push(tile);
    await tile.waitForAnimationEnd();
  }

  handleTileClick = (row, column) => {
    if (this.isGameBlocked) return;

    if (!this.selectedTile) {
      this.selectTile(row, column);
      return;
    }

    const isSelectedNeighbours = this.isSelectedTileNeighboursWith(row, column);
    if (!isSelectedNeighbours) {
      this.unselectTile();
      this.selectTile(row, column);
      return;
    }

    const firstElementPosition = { row: this.selectedTile.row, column: this.selectedTile.column, };
    const secondElementPosition = { row, column };

    const event = new CustomEvent("swap", {
      detail: {
        firstElementPosition,
        secondElementPosition
      }
    });

    this.wrapper.dispatchEvent(event);
  }

  selectTile(row, column) {
    this.selectedTile = this.findTileBy(row, column);
    this.selectedTile.select();
  }

  unselectTile() {
    this.selectedTile.unselect();
    this.selectedTile = null;
  }

  findTileBy(row, column) {
    return this.tiles.find(tile => tile.row === row && tile.column === column);
  }

  isSelectedTileNeighboursWith(row, column) {
    const isColumnNeighbours = this.selectedTile.column === column && Math.abs(this.selectedTile.row - row) === 1;
    const isRowNeighbours = this.selectedTile.row === row && Math.abs(this.selectedTile.column - column) === 1;
    return isColumnNeighbours || isRowNeighbours;
  }

  async swap(firstTilePosition, secondTilePosition, swapResult) {
    this.isGameBlocked = true;

    const firstTile = this.findTileBy(firstTilePosition.row, firstTilePosition.column);
    const secondTile = this.findTileBy(secondTilePosition.row, secondTilePosition.column);
    this.unselectTile();
    const firstTileAnimation = this.moveTileTo(firstTile, secondTilePosition);
    const secondTileAnimation = this.moveTileTo(secondTile, firstTilePosition);
    await Promise.all([firstTileAnimation, secondTileAnimation]);

    if (!swapResult) {
      const firstTileAnimation = this.moveTileTo(firstTile, firstTilePosition);
      const secondTileAnimation = this.moveTileTo(secondTile, secondTilePosition);
      await Promise.all([firstTileAnimation, secondTileAnimation]);
      this.isGameBlocked = false;
      return;
    }

    for (let i = 0; i < swapResult.length; i += 2) {
      await this.removeTiles(swapResult[i]);
      await this.dropTiles(swapResult[i], swapResult[i + 1]);
      await delay(100);
    }

    this.isGameBlocked = false;
  }

  async moveTileTo(tile, position) {
    tile.setPositionBy(position.row, position.column);
    await tile.waitForTransitionEnd();
  }

  async removeTiles(grid) {
    const animations = [];
    for (let row = 0; row < grid.length; row++) {
      for (let column = 0; column < grid[0].length; column++) {
        if (grid[row][column] === null) {
          const tile = this.findTileBy(row, column);
          const tileAnimation = tile.remove();
          this.removeTileFromArrayBy(row, column);
          animations.push(tileAnimation);
        }
      }
    }
    await Promise.all(animations);
  }

  removeTileFromArrayBy(row, column) {
    return this.tiles = this.tiles.filter(tile => tile.row !== row || tile.column !== column);
  }

  async dropTiles(gridBefore, gridAfter) {
    const animations = [];
    for (let column = 0; column < gridBefore[0].length; column++) {
      const columnBefore = gridBefore.map(elementsInRow => elementsInRow[column]);
      const columnAfter = gridAfter.map(elementsInRow => elementsInRow[column]);
      const columnAnimation = this.dropTilesInColumn(columnBefore, columnAfter, column);
      animations.push(columnAnimation);
    }

    await Promise.all(animations);
  }

  async dropTilesInColumn(columnBefore, columnAfter, column) {
    let updatedColumn = [...columnBefore];
    while (updatedColumn.includes(null)) {
      updatedColumn = await this.dropTilesInColumnOnce(updatedColumn, column);
      updatedColumn = await this.addTileInColumnOnce(updatedColumn, columnAfter, column);
    }
  }

  async dropTilesInColumnOnce(columnBefore, column) {
    const animations = [];
    const updatedColumn = [...columnBefore];
    for (let row = updatedColumn.length - 1; row > 0; row--) {
      if (updatedColumn[row] === null && updatedColumn[row - 1] !== null) {
        const tile = this.findTileBy(row - 1, column);
        const tileAnimation = this.moveTileTo(tile, { row, column });
        updatedColumn[row] = updatedColumn[row - 1];
        updatedColumn[row - 1] = null;
        animations.push(tileAnimation);
      }
    }
    await Promise.all(animations);
    return updatedColumn;
  }

  async addTileInColumnOnce(columnBefore, columnAfter, column) {
    const updatedColumn = [...columnBefore];
    if (updatedColumn[0] === null) {
      const countEmpty = updatedColumn.filter(value => value === null).length;
      await this.createTile(0, column, columnAfter[countEmpty - 1]);
      updatedColumn[0] = columnAfter[countEmpty - 1];
    }

    return updatedColumn;
  }
}