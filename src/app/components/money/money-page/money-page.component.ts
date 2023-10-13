import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-money-page',
  templateUrl: './money-page.component.html',
  styleUrls: ['./money-page.component.css'],
})
export class MoneyPageComponent implements OnInit {
  constructor() {}

  buttons = [
    { label: 'Dashboard', link: './dashboard' },
    { label: 'Manage', link: './management' },
  ];
  ngOnInit() {}
}
