import { cloneDeep } from "lodash";
import { Actions } from "./definitions";
/**
 * The module works only when an immutable object is being pushed.
 * This helps in detecting changes faster and also pushing it on the stack only if there is a real change.
 *
 * Immutable JS is one such library, but you can use it any other immutable library such as —
 * {@link https://github.com/rtfeldman/seamless-immutable seamless-immutable}
 * or even the native immutables such as `string` , `Boolean`, `RegEx` etc.
 *
 *  @external Immutable
 * @see {@link https://facebook.github.io/immutable-js}
 */

/**
 * @example
 * ```javascript
 * const histable = require('histable')
 * const history = histable.create()
 * history.push(1)
 * history.push(2)
 * history.push(3)
 * history.undo() // 2
 * history.undo() // 1
 * history.undo() // undefined
 * ```
 * @module histable
 */
const getLast = (list: Array<any>) => list[list.length - 1];
const toArray = (x?: any, i?: number) => Array.prototype.slice.call(x, i);

/**
 * Creates a new {@link History}
 * @class
 * @param {number} [limit=100] - Limits the maximum number of {@link undo} operations.
 */
class History {
  private limit: number;
  private UNDO_HISTORY: Array<any>;
  private REDO_HISTORY: Array<any>;
  constructor(limit: number) {
    this.UNDO_HISTORY = [];
    this.REDO_HISTORY = [];
    this.limit = limit > 0 ? limit + 1 : 100;
  }

  /**
   * Adds the `value` to the history data structure.
   * Addition only happens if the new value is not the same as the last one.
   * @param {...external:Immutable} value - the {@link external:Immutable} that needs to be saved.
   * @returns {History}
   */
  push() {
    // eslint-disable-next-line prefer-rest-params
    const values = toArray(arguments);
    values.forEach((value) => {
      const isDefined = value !== undefined;
      const last = getLast(this.UNDO_HISTORY);
      const isDiff = last !== value;
      if ([isDefined, isDiff].every(Boolean)) {
        this.UNDO_HISTORY.push(value);
      }
      if (this.UNDO_HISTORY.length > this.limit) {
        this.UNDO_HISTORY.shift();
      }
      this.REDO_HISTORY = [];
    });
    return this;
  }

  /**
   * Moves the state one step forward if possible
   * @returns {external:Immutable}
   */
  redo() {
    if (this.REDO_HISTORY.length > 0) {
      const pop = this.REDO_HISTORY.pop();
      this.UNDO_HISTORY.push(pop);
      return pop;
    }
  }

  /**
   * Moves the state one step backwords if possible
   * @returns {external:Immutable}
   */
  undo() {
    if (this.UNDO_HISTORY.length > 0) {
      const pop = this.UNDO_HISTORY.pop();
      this.REDO_HISTORY.push(pop);
      return getLast(this.UNDO_HISTORY);
    }
  }

  /**
   * Determines if {@link undo} is possible or not
   * @returns {boolean}
   */
  get canUndo() {
    return this.UNDO_HISTORY.length > 1;
  }

  /**
   * Determines if {@link redo} is possible or not
   * @returns {boolean}
   */
  get canRedo() {
    return this.REDO_HISTORY.length > 0;
  }

  /**
   * A logging Util to view whats in the history data structure
   */
  log() {
    console.log("UNDO:", this.UNDO_HISTORY);
    console.log("REDO:", this.REDO_HISTORY);
  }
}

const HISTORY_TRACK: Actions[] = [
  "onDragNodeStop",
  "onEndConnection",
  "onDeleteLink",
  "onDeleteNodes",
  "onNodeAdded",
];
export class UndoRedoManager<T> {
  history: any;
  current: T;
  constructor(initialState: T, maxLength = 2000) {
    this.history = new History(maxLength);
    this.current = initialState;
    this.history.push(initialState);
  }

  save(currentState: T, source: Actions): void {
    this.current = currentState;
    if (HISTORY_TRACK.includes(source)) {
      this.history.push(cloneDeep(currentState));
    }
  }

  canUndo(): boolean {
    return this.history.canUndo;
  }

  canRedo(): boolean {
    return this.history.canRedo;
  }

  undo(): T {
    const ret = this.history.undo();
    return ret || this.current;
  }

  redo(): T {
    const ret = this.history.redo();
    return ret || this.current;
  }
}
