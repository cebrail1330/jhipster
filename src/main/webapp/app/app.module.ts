import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import './vendor';
import { CebrailappSharedModule } from 'app/shared/shared.module';
import { CebrailappCoreModule } from 'app/core/core.module';
import { CebrailappAppRoutingModule } from './app-routing.module';
import { CebrailappHomeModule } from './home/home.module';
import { CebrailappEntityModule } from './entities/entity.module';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { MainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
import { ErrorComponent } from './layouts/error/error.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
  imports: [
    BrowserModule,
    CebrailappSharedModule,
    CebrailappCoreModule,
    CebrailappHomeModule,
    // jhipster-needle-angular-add-module JHipster will add new module here
    CebrailappEntityModule,
    CebrailappAppRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  declarations: [MainComponent, NavbarComponent, ErrorComponent, PageRibbonComponent, ActiveMenuDirective, FooterComponent],
  bootstrap: [MainComponent],
})
export class CebrailappAppModule {}
