import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  Signal,
  ViewChildren,
  WritableSignal,
  computed,
  effect,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FoodService } from 'src/app/services/food.service';
import { FoodCatalogueFormComponent } from './forms/food-form.component';
import { CatalogueEntry } from 'src/app/shared/interfaces';
import { enRuTranslation } from 'src/app/shared/const';

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
    MatPaginatorModule,
  ],
  templateUrl: './food-catalogue.component.html',
  styleUrls: ['./food-catalogue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodCatalogueComponent {
  // public tempSettingShowOnlySearchResults: boolean = false; // TODO: [058] implement in app settings
  @ViewChildren('foodExpansionPanel', { read: ElementRef }) domElements!: QueryList<ElementRef>;
  public usersSearchQuery$$: WritableSignal<string> = signal('');
  public catalogueFilteredListSelected$$: Signal<CatalogueEntry[]> = computed(() => this.filterCatalogue(true));
  public catalogueFilteredListLeftOut$$: Signal<CatalogueEntry[]> = computed(() => this.filterCatalogue(false));

  public pageSize: number = 10;
  public pageIndexSelected: number = 0;
  public pageIndexLeftOut: number = 0;

  constructor(public foodService: FoodService) {
    // effect(() => { console.log('CATALOGUE FILTERED LIST SELECTED have been updated:', this.catalogueFilteredListSelected$$()) });
    // effect(() => { console.log('CATALOGUE FILTERED LIST LEFT OUT have been updated:', this.catalogueFilteredListLeftOut$$()) });
  }

  filterCatalogue(selected: boolean): CatalogueEntry[] {
    const query = this.usersSearchQuery$$()
      .split(' ')
      .filter((word) => word.length > 0);
    const catalogue = selected
      ? this.foodService.catalogueSortedListSelected$$()
      : this.foodService.catalogueSortedListLeftOut$$();
    return catalogue.filter((entry) => query.every((word) => entry.name.toLowerCase().includes(word)));
  }

  private translateToRussian(text: string): string {
    return text
      .split('')
      .map((char) => enRuTranslation[char.toLowerCase()] || char)
      .join('');
  }

  get usersInput(): string {
    return this.usersSearchQuery$$();
  }

  get filteredSelectedCatalogueLength(): number {
    return this.catalogueFilteredListSelected$$().length;
  }

  get filteredLeftOutCatalogueLength(): number {
    return this.catalogueFilteredListLeftOut$$().length;
  }

  get paginatedSelectedCatalogue(): CatalogueEntry[] {
    const startIndex = this.pageIndexSelected * this.pageSize;
    return this.catalogueFilteredListSelected$$().slice(startIndex, startIndex + this.pageSize);
  }

  get paginatedLeftOutCatalogue(): CatalogueEntry[] {
    const startIndex = this.pageIndexLeftOut * this.pageSize;
    return this.catalogueFilteredListLeftOut$$().slice(startIndex, startIndex + this.pageSize);
  }

  onSearchInput(value: string): void {
    const translatedValue = this.translateToRussian(value);
    this.usersSearchQuery$$.set(translatedValue.toLowerCase());
    this.pageIndexSelected = 0;
    this.pageIndexLeftOut = 0;
  }

  onOwnershipChanged(foodId: string): void {
    this.findPanelByFoodId(foodId).then((element) => {
      element?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  onPageChange(event: PageEvent, type: 'selected' | 'leftOut'): void {
    this.pageSize = event.pageSize;
    if (type === 'selected') {
      this.pageIndexSelected = event.pageIndex;
    } else if (type === 'leftOut') {
      this.pageIndexLeftOut = event.pageIndex;
    }
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
