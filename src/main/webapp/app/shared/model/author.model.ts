import { Moment } from 'moment';
import { IBook } from 'app/shared/model/book.model';

export interface IAuthor {
  id?: number;
  name?: string;
  birthDate?: Moment;
  books?: IBook[];
}

export class Author implements IAuthor {
  constructor(public id?: number, public name?: string, public birthDate?: Moment, public books?: IBook[]) {}
}
