import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  Signal,
  ViewChildren,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { FoodService } from 'src/app/services/food.service';

@Component({
  selector: 'app-food-catalogue',
  templateUrl: './food-catalogue.component.html',
  styleUrls: ['./food-catalogue.component.scss'],
})
export class FoodCatalogueComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChildren('foodExpansionPanel', { read: ElementRef }) domElements!: QueryList<ElementRef>;

  usersInput: string = '';
  usersInput$$: WritableSignal<string> = signal('');
  usersInputSplitted$$: Signal<string[]> = computed(() => this.usersInput$$().split(' '));

  constructor(public foodService: FoodService) {}

  onSearchInput(value: string) {
    this.usersInput = value;
    this.usersInput$$.set(value);
  }

  nameIncludesSearchQuery(textToSearchIn: string): boolean {
    let lowerCaseText = textToSearchIn.toLowerCase();
    return this.usersInputSplitted$$().every((word) => lowerCaseText.includes(word));
  }

  onOwnershipChanged(foodId: number): void {
    this.findPanelByFoodId(foodId).then((element) => {
      element.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }

  findPanelByFoodId(foodId: number): Promise<ElementRef> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const domElementsArray = this.domElements.toArray();
        const index = domElementsArray.findIndex(
          (element) => element.nativeElement.getAttribute('data-food-id') === foodId.toString()
        );
        resolve(domElementsArray[index]);
      }, 1);
    });
  }

  ngOnChanges(): void {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}
}
