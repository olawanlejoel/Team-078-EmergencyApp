import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AdminMenuModule } from '../../../components/admin.components.module';

import { AdminAddUnitPageRoutingModule } from './admin-add-unit-routing.module';

import { AdminAddUnitPage } from './admin-add-unit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminMenuModule,
    AdminAddUnitPageRoutingModule
  ],
  declarations: [AdminAddUnitPage]
})
export class AdminAddUnitPageModule {}
