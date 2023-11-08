import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MatDialogModal } from 'src/app/components/shared-components/mat-dialog-modal/mat-dialog-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  constructor(private dialog: MatDialog) {}

  openModal(question: string): Observable<boolean> {
    const dialogRef = this.dialog.open(MatDialogModal, {
      width: '90%',
      data: { question },
    });

    return dialogRef.afterClosed();
  }
}
