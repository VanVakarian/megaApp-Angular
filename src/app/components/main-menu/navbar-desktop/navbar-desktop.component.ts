import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MainMenuService } from 'src/app/services/main-menu.service';
import { DarkSwitchComponent } from 'src/app/components/settings/dark-switch/dark-switch.component';

@Component({
  selector: 'app-navbar-desktop',
  standalone: true,
  imports: [NgClass, NgFor, RouterLink, MatButtonModule, DarkSwitchComponent],
  templateUrl: './navbar-desktop.component.html',
})
export class NavbarDesktopComponent implements OnInit {
  constructor(private mainMenuService: MainMenuService) {}

  ngOnInit(): void {}

  get desktopButtons() {
    return this.mainMenuService.prepButtons('desktop');
  }
}
