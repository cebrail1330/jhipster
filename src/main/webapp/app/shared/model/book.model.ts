import { Moment } from 'moment';
import { IAuthor } from 'app/shared/model/author.model';

export interface IBook {
  id?: number;
  title?: string;
  description?: string;
  publicationDate?: Moment;
  price?: number;
  authors?: IAuthor[];
}

export class Book implements IBook {
  constructor(
    public id?: number,
    public title?: string,
    public description?: string,
    public publicationDate?: Moment,
    public price?: number,
    public authors?: IAuthor[]
  ) {}
}
