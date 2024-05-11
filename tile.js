export class Tile {
  constructor(wrap, row, column, value, handleTileClick) {
    this.handleTileClick = handleTileClick;
    this.tileElement = document.createElement("div");
    this.tileElement.classList.add("tile");
    this.tileElement.classList.add(`tile${value}`);
    this.setPositionBy(row, column);
    wrap.append(this.tileElement);
    this.tileElement.addEventListener("click", this.clickHandler);
  }

  setPositionBy(row, column) {
    this.row = row;
    this.column = column;
    this.tileElement.style.setProperty("--row", row);
    this.tileElement.style.setProperty("--column", column);
  }

  clickHandler = () => this.handleTileClick(this.row, this.column);

  select() {
    this.tileElement.classList.add("selected");
  }

  unselect() {
    this.tileElement.classList.remove("selected");
  }

  async remove() {
    this.tileElement.removeEventListener("click", this.clickHandler);
    this.tileElement.classList.add("hide");
    await this.waitForAnimationEnd();
    this.tileElement.remove();
  }

  waitForAnimationEnd() {
    return new Promise(resolve => {
      this.tileElement.addEventListener(
        "animationend", resolve, { once: true });
    });
  }

  waitForTransitionEnd() {
    return new Promise(resolve => {
      this.tileElement.addEventListener(
        "transitionend", resolve, { once: true });
    });
  }
}