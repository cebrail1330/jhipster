import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CebrailappSharedModule } from 'app/shared/shared.module';
import { BookComponent } from './book.component';
import { BookDetailComponent } from './book-detail.component';
import { BookUpdateComponent } from './book-update.component';
import { BookDeleteDialogComponent } from './book-delete-dialog.component';
import { bookRoute } from './book.route';
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";

@NgModule({
    imports: [CebrailappSharedModule, RouterModule.forChild(bookRoute), NgMultiSelectDropDownModule,NgMultiSelectDropDownModule.forRoot()],
  declarations: [BookComponent, BookDetailComponent, BookUpdateComponent, BookDeleteDialogComponent],
  entryComponents: [BookDeleteDialogComponent],
})
export class CebrailappBookModule {}
