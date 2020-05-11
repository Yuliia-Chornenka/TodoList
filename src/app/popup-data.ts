import { AbstractControl } from '@angular/forms';

export interface IPopupData {
  title: string;
  deadline: string;
  author: string;
  todoId: AbstractControl;
  modalTitle: string;
}
