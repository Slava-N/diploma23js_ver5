'use strict';

class Vector {

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    const newVector = new Vector(this.x + vector.x, this.y + vector.y);
    return newVector;
  }

  times(multiplier=1.00) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}

class Actor {
    constructor(position = new Vector, size = new Vector(1, 1), speed = new Vector()) {

        if (!(position instanceof Vector)) {
            throw new Error("Position is of incorrect type. You must put object Vector as an argument");
        }
        if (!(size instanceof Vector)) {
            throw new Error("Position is of incorrect type. You must put object Vector as an argument");
        }
        if (!(speed instanceof Vector)) {
            throw new Error("Position is of incorrect type. You must put object Vector as an argument");
        }
        this.pos = position;
        this.size = size;
        this.speed = speed;
    }

    act() {
    }

    get type() {
        const thisType = 'actor';
        return thisType;
    }

    get left() {
        return this.pos.x;
    }

    get right() {
        return this.left + this.size.x;
    }

    get top() {
        return this.pos.y;
    }

    get bottom() {
        return this.pos.y + this.size.y;
    }

    isIntersect(argActor) {
        if (!(argActor instanceof Actor)) {
            throw new Error("Incorrect object type");
        }

        if (argActor === this) {
          return false;
        }

        if (this.left >= argActor.right) {
          return false;
        }

        if (this.right <= argActor.left) {
          return false;
        }

        if (this.top >= argActor.bottom) {
          return false;

        }

        if (this.bottom <= argActor.top) {
          return false;
        }

        return true;
    }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = grid.length;
    this.width = Math.max(0, ...grid.map(item => item.length));
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
      if ((this.status != null) && (this.finishDelay < 0)) {
          return true
      } else {
          return false;
      }
  }

  actorAt(movingActor) {
      if (!(movingActor instanceof Actor)) {
          throw new Error('Object was not passed or passed object is not Actor');
      }

      let intersection = this.actors.find(thisActor => movingActor.isIntersect(thisActor));
      return intersection;
  }

  obstacleAt(newPosition = new Vector, objSize = new Vector())  {
      if (!(newPosition instanceof Vector) || !(objSize instanceof Vector)) {
          throw new Error('Object passed is not a Vector');
      }

      let left = Math.floor(newPosition.x);
      let right = Math.ceil(newPosition.x + objSize.x);
      let top = Math.floor(newPosition.y);
      let bottom = Math.ceil(newPosition.y + objSize.y);

      if (left < 0 || right > this.width || top < 0) {
        return 'wall';
      }
      if (bottom > this.height) {
        return 'lava';
      }

      for (let horizontal = left; horizontal < right; horizontal++) {
            for (let vertical = top; vertical < bottom; vertical++) {
              let cell = this.grid[vertical][horizontal];
              if (cell) {
                return cell;
              }
            }
      }
  }

      removeActor(passedActor) {
        this.actors = this.actors.filter(item => item !== passedActor);
      }

      noMoreActors(lookedType) {
        return !this.actors.some(actor => actor.type === lookedType);
      }

      playerTouched(type, actor) {
        if (this.status !== null) {
          return;
        }
        if (type === 'lava' || type === 'fireball') {
          this.status = 'lost';
          return;
        }
        if (type === 'coin') {
          this.removeActor(actor);
          if (this.noMoreActors('coin')) {
            this.status = 'won';
          }
        }
      }
}
   //finish

let obstacles = {
    '!': 'lava',
    'x': 'wall'
}

class LevelParser {

    constructor(levelObjects = {}) {
        this.levelObjects = Object.assign({}, levelObjects);
    }

    actorFromSymbol(symbolToFind = '') {
        return this.levelObjects[symbolToFind];
    }

    obstacleFromSymbol(symbol) {
        return obstacles[symbol];
    }

    createGrid(obstaclesArray) {
        return obstaclesArray.map(newArray => Array.from(newArray).map(symb => this.obstacleFromSymbol(symb)));
    }

    createActors(objectsArray) {

        const actorsList = [];
        objectsArray.forEach((itemY, y) => {
            itemY.split('').forEach((itemX, x) => {
                const constructorActors = this.actorFromSymbol(itemX);
                if (typeof constructorActors !== 'function') {
                    return null;
                }
                const result = new constructorActors(new Vector(x, y));
                if (result instanceof Actor) {
                    actorsList.push(result);
                }
            });
        });
        return actorsList;
    }

    parse(plannedLevel) {
        return new Level(this.createGrid(plannedLevel), this.createActors(plannedLevel));
    }

}

class Player extends Actor {
    constructor(position = new Vector(0, 0)) {
        super(position.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
    }

    get type() {
        return 'player';
    }

}




