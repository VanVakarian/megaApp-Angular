import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { FoodService } from 'src/app/services/food.service';
import { InputWithProgressComponent } from 'src/app/shared/components/input-with-progress/input-with-progress.component';
import { BodyWeight, InputWithProgressSubmitData } from 'src/app/shared/interfaces';

interface BodyWeightForm {
  bodyWeight: FormControl<string>;
}

@Component({
  selector: 'app-body-weight',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, InputWithProgressComponent],
  templateUrl: './body-weight.component.html',
  styleUrl: './body-weight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyWeightComponent {
  public weightValidators = [Validators.required, Validators.pattern(/^\d{2,3}([.,]\d)?$/)];

  public form = new FormGroup<BodyWeightForm>({
    bodyWeight: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor(private foodService: FoodService) {
    effect(() => {
      this.applyWeight();
    });
  }

  private applyWeight(): void {
    const selectedDateISO = this.foodService.selectedDayIso$$();
    const weight = this.foodService.diary$$()?.[selectedDateISO]?.['bodyWeight'];
    if (!weight) return;
    this.form.patchValue({ bodyWeight: String(weight) });
  }

  public async submitWeight(data: InputWithProgressSubmitData): Promise<void> {
    const weight: BodyWeight = {
      bodyWeight: data.value.replace(',', '.'),
      dateISO: this.foodService.selectedDayIso$$(),
    };

    try {
      const result = await firstValueFrom(this.foodService.setUserBodyWeight(weight));
      if (!result) data.reject();
      data.resolve();
    } catch {
      data.reject();
    }
  }
}
