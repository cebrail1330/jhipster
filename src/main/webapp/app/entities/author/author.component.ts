import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router, Data } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAuthor } from 'app/shared/model/author.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { AuthorService } from './author.service';
import { AuthorDeleteDialogComponent } from './author-delete-dialog.component';
import { IBook} from 'app/shared/model/book.model';
import { BookService } from 'app/entities/book/book.service';

import {FormBuilder} from '@angular/forms';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
@Component({
  selector: 'jhi-author',
  templateUrl: './author.component.html',
})
export class AuthorComponent implements OnInit, OnDestroy {
  authors?: IAuthor[];
  books: IBook[] = [];
  eventSubscriber?: Subscription;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;
  birthDateLessThanOrEqualDp:any;
  birthDateGreaterThanOrEqualDp:any;
  dropdownList :any= [];
  selectedItems :any = [];
  dropdownSettings ={};
  selectedItemsId: number|string="";
  searchForm=this.fb.group({
    "name.contains": "",
    "birthDate.greaterThanOrEqual": "",
    "birthDate.lessThanOrEqual": "",
    "bookId.in": "",

  });
  constructor(
    protected authorService: AuthorService,
    protected bookService: BookService,
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

    criteria["bookId.in"]=this.selectedItemsId
    criteria["bookId.in"]==="" ? delete(criteria["bookId.in"]): ""

    this.authorService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
        ...criteria
      })
      .subscribe(
        (res: HttpResponse<IAuthor[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }
  protected convertDateFromClient(searchForm: any): any {
    const copy: any = Object.assign({}, searchForm, {

      "birthDate.greaterThanOrEqual": searchForm["birthDate.greaterThanOrEqual"] && searchForm["birthDate.greaterThanOrEqual"].isValid() ? searchForm["birthDate.greaterThanOrEqual"].format(DATE_FORMAT) : "",
      "birthDate.lessThanOrEqual": searchForm["birthDate.lessThanOrEqual"] && searchForm["birthDate.lessThanOrEqual"].isValid() ? searchForm["birthDate.lessThanOrEqual"].format(DATE_FORMAT) : "",
      "name.contains":searchForm["name.contains"]  ? searchForm["name.contains"]:"",
    });
    return copy;
  }
  ngOnInit(): void {
    this.handleNavigation();
    this.registerChangeInAuthors();
    this.bookService.query().subscribe((res: HttpResponse<IBook[]>) => {(this.books = res.body || []).values(); (this.dropdownList=res.body ||[]).values()});
    this.dropdownList = [];
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'title',
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

  trackId(index: number, item: IAuthor): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  registerChangeInAuthors(): void {
    this.eventSubscriber = this.eventManager.subscribe('authorListModification', () => this.loadPage());
  }

  delete(author: IAuthor): void {
    const modalRef = this.modalService.open(AuthorDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.author = author;
  }

  sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected onSuccess(data: IAuthor[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/author'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? 'asc' : 'desc'),
        },
      });
    }
    this.authors = data || [];
    this.ngbPaginationPage = this.page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
