import { animate, sequence, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, debounceTime, filter, take } from 'rxjs';

import { FoodService } from 'src/app/components/refactor/service/food.service';
import { BodyWeight } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-body-weight-form',
  templateUrl: './body-weight-form.component.html',
  styleUrls: ['./body-weight-form.component.scss'],
  animations: [
    trigger('countdown-bar', [
      transition(':enter', [sequence([style({ width: '0%' }), animate('2s', style({ width: '100%' }))])]),
    ]),
  ],
})
export class BodyWeightFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedDateISO!: string;

  countdownBarIsVisible: boolean = false;
  waitBarVisible: boolean = false;
  bodyWeightPrevValue: string = '';

  bodyWeightForm: FormGroup = new FormGroup({
    bodyWeight: new FormControl(
      '',
      // a two- or a three-digit number with or without a decimal part with only one digit after a dot (or a comma)
      [Validators.required, Validators.pattern(/^\d{2,3}([.,]\d)?$/)]
    ),
  });

  private bodyWeightChange$!: Subscription;

  constructor(private cdRef: ChangeDetectorRef, public foodService: FoodService) {}

  onWeightInput() {
    this.bodyWeightForm.controls['bodyWeight'].markAsTouched();
    if (this.bodyWeightForm.valid && this.bodyWeightForm.get('bodyWeight')?.value !== this.bodyWeightPrevValue) {
      this.countdownBarIsVisible = false;
      this.cdRef.detectChanges();
      this.countdownBarIsVisible = true;
    } else {
      this.countdownBarIsVisible = false;
    }
  }

  onEnterPress() {
    this.bodyWeightChange$.unsubscribe(); // Unsubscribe so that debounce wont fire up
    this.bodyWeightChange$ = this.bodyWeightForm.valueChanges // reinitalize subscription
      .pipe(
        debounceTime(2000),
        filter(() => this.bodyWeightForm.get('bodyWeight')?.value !== this.bodyWeightPrevValue)
      )
      .subscribe(() => {
        if (this.bodyWeightForm.valid) {
          this.onSubmit();
        }
      });
  }

  onSubmit(): void {
    this.bodyWeightForm.get('bodyWeight')?.disable();
    this.countdownBarIsVisible = false;
    this.waitBarVisible = true;

    const bodyWeightObj: BodyWeight = {
      body_weight: this.bodyWeightForm.get('bodyWeight')?.value.replace(',', '.'),
      date_iso: this.selectedDateISO,
    };

    this.foodService.postRequestResult$.pipe(take(1)).subscribe((respoonse) => {
      if (respoonse.result) {
        this.bodyWeightForm.get('bodyWeight')?.enable();
        this.waitBarVisible = false;
        this.bodyWeightPrevValue = bodyWeightObj.body_weight;

        this.foodService.diary$$.update((diary) => {
          diary[this.selectedDateISO]['body_weight'] = parseFloat(bodyWeightObj.body_weight);
          return diary;
        });
      } else {
        this.bodyWeightForm.get('bodyWeight')?.enable();
        this.waitBarVisible = false;
      }
    });

    this.foodService.postBodyWeight(bodyWeightObj);
  }

  ngOnInit(): void {
    this.bodyWeightChange$ = this.bodyWeightForm.valueChanges
      .pipe(
        debounceTime(2000),
        filter(() => this.bodyWeightForm.get('bodyWeight')?.value !== this.bodyWeightPrevValue)
      )
      .subscribe(() => {
        if (this.bodyWeightForm.valid) {
          this.onSubmit();
        }
      });
  }

  ngOnChanges(): void {
    if (this.selectedDateISO) {
      const weight = this.foodService.diary$$()?.[this.selectedDateISO]?.['body_weight'];
      this.bodyWeightForm.patchValue({ bodyWeight: weight });
      this.bodyWeightPrevValue = String(weight);
    }
  }

  ngOnDestroy(): void {
    this.bodyWeightChange$.unsubscribe();
  }
}
