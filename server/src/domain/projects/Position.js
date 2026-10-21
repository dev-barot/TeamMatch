import { Specialty } from '../identity/Specialty.js';
import { InvalidPositionError, PositionOverfilledError } from './errors.js';

/**
 * Position Entity / Value Object
 * One open seat on a Project: a Specialty plus a headcount.
 * Enforces Rule R3: Positions never overfill (filledCount <= headcount).
 */
export class Position {
  constructor({ id = null, specialty, headcount, filledCount = 0 }) {
    if (!Specialty.isValid(specialty)) {
      throw new InvalidPositionError(`Invalid Specialty: "${specialty}". Must be one of ${Specialty.VALUES.join(', ')}.`);
    }

    const parsedHeadcount = Number.parseInt(headcount, 10);
    if (Number.isNaN(parsedHeadcount) || parsedHeadcount < 1) {
      throw new InvalidPositionError('Position headcount must be an integer greater than or equal to 1.');
    }

    const parsedFilledCount = Number.parseInt(filledCount, 10);
    if (Number.isNaN(parsedFilledCount) || parsedFilledCount < 0) {
      throw new InvalidPositionError('Position filledCount must be a non-negative integer.');
    }

    if (parsedFilledCount > parsedHeadcount) {
      throw new PositionOverfilledError(`Position "${specialty}" cannot have filledCount (${parsedFilledCount}) exceeding headcount (${parsedHeadcount}) (R3).`);
    }

    this.id = id || `pos_${Math.random().toString(36).substring(2, 9)}`;
    this.specialty = specialty;
    this.headcount = parsedHeadcount;
    this.filledCount = parsedFilledCount;
  }

  isFull() {
    return this.filledCount >= this.headcount;
  }

  get remaining() {
    return Math.max(0, this.headcount - this.filledCount);
  }

  incrementFilled() {
    if (this.filledCount + 1 > this.headcount) {
      throw new PositionOverfilledError(`Cannot accept more members for position "${this.specialty}". Headcount of ${this.headcount} is already reached (R3).`);
    }
    this.filledCount += 1;
  }

  decrementFilled() {
    this.filledCount = Math.max(0, this.filledCount - 1);
  }

  toJSON() {
    return {
      id: this.id,
      specialty: this.specialty,
      headcount: this.headcount,
      filledCount: this.filledCount,
      remaining: this.remaining,
      isFull: this.isFull(),
    };
  }
}
