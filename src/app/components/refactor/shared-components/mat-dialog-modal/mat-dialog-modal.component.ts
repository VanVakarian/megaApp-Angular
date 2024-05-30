import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  question: string;
}

@Component({
  selector: 'app-mat-dialog-modal',
  templateUrl: './mat-dialog-modal.component.html',
})
export class MatDialogModal {
  constructor(public dialogRef: MatDialogRef<MatDialogModal>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
