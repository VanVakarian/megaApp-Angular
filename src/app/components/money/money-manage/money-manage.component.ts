import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-money-manage',
  templateUrl: './money-manage.component.html',
  styleUrls: ['./money-manage.component.scss'],
})
export class MoneyManageComponent implements OnInit {
  ngOnInit(): void {}

  componentsOpenState: { [key: string]: boolean } = {
    currency: false,
    accounts: false,
    banks: false,
    categories: false,
  };

  toggleTab(tabName: string) {
    for (const tab in this.componentsOpenState) {
      if (tab === tabName) {
        this.componentsOpenState[tab] = !this.componentsOpenState[tab];
      } else {
        this.componentsOpenState[tab] = false;
      }
    }
  }
}
