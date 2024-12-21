import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-food-stats',
  standalone: true,
  imports: [
    MatCardModule
  ],
  templateUrl: './food-stats.component.html',
  styleUrls: ['./food-stats.component.scss'],
})
export class FoodStatsComponent implements OnInit {
  ngOnInit(): void { }
}
