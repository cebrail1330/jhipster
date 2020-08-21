import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import {ActivatedRoute, ParamMap, Router, Data } from '@angular/router';
import {Subscription, combineLatest} from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IBook} from 'app/shared/model/book.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { BookService } from './book.service';
import { BookDeleteDialogComponent } from './book-delete-dialog.component';
import {FormBuilder} from '@angular/forms';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { IAuthor } from 'app/shared/model/author.model';
import { AuthorService } from 'app/entities/author/author.service';


@Component({
  selector: 'jhi-book',
  templateUrl: './book.component.html',
})
export class BookComponent implements OnInit, OnDestroy {


  books?: IBook[];
  authors: IAuthor[] = [];
  eventSubscriber?: Subscription;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;
  publicationDateGreaterThanOrEqualDp: any;
  publicationDateLessThanOrEqualDp: any;
  dropdownList :any= [];
  selectedItems :any = [];
  dropdownSettings ={};
  selectedItemsId: number|string="";

  title:any=[];
  searchForm=this.fb.group({
    "title.contains": "",
    "description.contains": "",
    "price.equals": "",
    "publicationDate.greaterThanOrEqual": "",
    "publicationDate.lessThanOrEqual": "",
    "authorId.in": "",

  });
  constructor(
    protected bookService: BookService,
    protected authorService: AuthorService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  loadPage(page?: number, dontNavigate?: boolean): void {
    const pageToLoad: number = page || this.page || 1;
    const criteria=this.convertDateFromClient(this.searchForm.value);
    this.selectedItemsId= this.selectedItems.map((x: {id:any;}) =>x.id).join(',');

    criteria["authorId.in"]=this.selectedItemsId
    criteria["authorId.in"]==="" ? delete(criteria["authorId.in"]): ""

    this.bookService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
        ...criteria
      })
      .subscribe(
        (res: HttpResponse<IBook[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }
  protected convertDateFromClient(searchForm: any): any {
    const copy: any = Object.assign({}, searchForm, {
      "publicationDate.greaterThanOrEqual": searchForm["publicationDate.greaterThanOrEqual"] && searchForm["publicationDate.greaterThanOrEqual"].isValid() ? searchForm["publicationDate.greaterThanOrEqual"].format(DATE_FORMAT) : "",
      "publicationDate.lessThanOrEqual": searchForm["publicationDate.lessThanOrEqual"] && searchForm["publicationDate.lessThanOrEqual"].isValid() ? searchForm["publicationDate.lessThanOrEqual"].format(DATE_FORMAT) : "",
      "price.equals":searchForm["price.equals"]  ? searchForm["price.equals"]:"",
      "title.contains":searchForm["title.contains"]  ? searchForm["title.contains"]:"",
      "description.contains":searchForm["description.contains"]  ? searchForm["description.contains"]:"",
    });

    return copy;
  }
  ngOnInit(): void {
    this.handleNavigation();
    this.registerChangeInBooks();
    this.authorService.query().subscribe((res: HttpResponse<IAuthor[]>) => {(this.authors = res.body || []).values(); (this.dropdownList=res.body ||[]).values()});
    this.dropdownList = [];
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }


  protected handleNavigation(): void {
    combineLatest(this.activatedRoute.data, this.activatedRoute.queryParamMap, (data: Data, params: ParamMap) => {
      const page = params.get('page');
      const pageNumber = page !== null ? +page : 1;
      const sort = (params.get('sort') ?? data['defaultSort']).split(',');
      const predicate = sort[0];
      const ascending = sort[1] === 'asc';
      if (pageNumber !== this.page || predicate !== this.predicate || ascending !== this.ascending) {
        this.predicate = predicate;
        this.ascending = ascending;
        this.loadPage(pageNumber, true);
      }
    }).subscribe();
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: IBook): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  registerChangeInBooks(): void {
    this.eventSubscriber = this.eventManager.subscribe('bookListModification', () => this.loadPage());
  }

  delete(book: IBook): void {
    const modalRef = this.modalService.open(BookDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.book = book;
  }

  sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected onSuccess(data: IBook[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/book'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? 'asc' : 'desc'),
        },
      });
    }
    this.books = data || [];
    this.ngbPaginationPage = this.page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
