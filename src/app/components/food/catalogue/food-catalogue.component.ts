import {
  Component,
  ElementRef,
  QueryList,
  Signal,
  ViewChildren,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FoodService } from 'src/app/services/food.service';
import { FoodCatalogueFormComponent } from './forms/food-form.component';
import { CatalogueEntry } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-food-catalogue',
  standalone: true,
  imports: [
    FormsModule,
    FoodCatalogueFormComponent,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './food-catalogue.component.html',
  styleUrls: ['./food-catalogue.component.scss'],
})
export class FoodCatalogueComponent {
  @ViewChildren('foodExpansionPanel', { read: ElementRef }) domElements!: QueryList<ElementRef>;

  // usersInput: WritableSignal<string> = signal('');
  usersInputSplitted: Signal<string[]> = computed(() =>
    this.foodService.usersSearchQuery$$().toLowerCase().split(' ').filter(Boolean),
  );

  constructor(public foodService: FoodService) {}

  get usersInput() {
    return this.foodService.usersSearchQuery$$();
  }

  get filteredSelectedCatalogue(): CatalogueEntry[] {
    return this.foodService.catalogueFilteredListSelected$$();
  }

  get filteredLeftOutCatalogue(): CatalogueEntry[] {
    return this.foodService.catalogueFilteredListLeftOut$$();
  }

  onSearchInput(value: string): void {
    this.foodService.usersSearchQuery$$.set(value);
  }

  nameIncludesSearchQuery(textToSearchIn: string): boolean {
    const lowerCaseText = textToSearchIn.toLowerCase();
    return this.usersInputSplitted().every((word) => lowerCaseText.includes(word));
  }

  onOwnershipChanged(foodId: string): void {
    this.findPanelByFoodId(foodId).then((element) => {
      element?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  private findPanelByFoodId(foodId: string): Promise<ElementRef | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const element = this.domElements.find((el) => el.nativeElement.getAttribute('data-food-id') === foodId);
        resolve(element);
      }, 0);
    });
  }
}
