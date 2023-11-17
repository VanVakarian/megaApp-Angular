import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { merge } from 'rxjs';
import { MatAccordion } from '@angular/material/expansion';

import { DataSharingService } from 'src/app/services/data-sharing.service';
import { MoneyService } from 'src/app/services/money.service';

@Component({
  selector: 'app-money-account',
  templateUrl: './money-account.component.html',
})
export class MoneyAccountComponent implements OnInit {
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  constructor(private dataSharingService: DataSharingService, public moneyService: MoneyService) {}

  accountExpanded(accountId: number) {
    this.dataSharingService.accountClicked$.emit(accountId);
  }

  closeAllPanels() {
    this.accordion.closeAll();
  }

  ngOnInit(): void {
    this.moneyService.getAccounts();

    this.dataSharingService.dataChanged$.subscribe(() => {
      this.closeAllPanels();
    });
  }
}
