import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ListService } from '../list.service';

@Component({
  selector: 'app-modal-window-add-edit-todo',
  templateUrl: './modal-window-add-edit-todo.component.html',
  styleUrls: [ './modal-window-add-edit-todo.component.scss' ]
})
export class ModalWindowAddEditTodoComponent implements OnInit {
  minDate: Date = new Date();
  formNewTodo: FormGroup;
  successSubmitted = true;
  isPending = false;

  constructor(
    private listService: ListService,
    private snackBar: MatSnackBar,
    public dialogAddTodo: MatDialogRef<ModalWindowAddEditTodoComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit(): void {
    this.formNewTodo = new FormGroup({
      task: new FormControl(this.data.title, [ Validators.required, Validators.minLength(5) ]),
      name: new FormControl({
        value: this.data.author,
        disabled: !!this.data.author
      }, [ Validators.required, Validators.minLength(2) ]),
      deadline: new FormControl(this.data.deadline, Validators.required)
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3500
    });
  }

  onSubmit() {
    const task = this.formNewTodo.controls.task.value;
    const name = this.formNewTodo.controls.name.value.toLowerCase();
    const deadline = this.formNewTodo.controls.deadline.value;

    this.formNewTodo.disable();
    this.isPending = true;
    this.successSubmitted = true;

    if (this.data.todoId) {
      this.listService.updateTodo(this.data.todoId, task, deadline)
          .subscribe((result) => {
            if (result) {
              this.openSnackBar('Your task was successfully updated', '✔');
              this.dialogAddTodo.close();
            } else {
              this.successSubmitted = false;
              this.formNewTodo.enable();
              this.isPending = false;
            }
          });
    } else {
      this.listService.addNewTodo(task, name, deadline)
          .subscribe((result) => {
            if (result) {
              this.openSnackBar('New task was successfully created', '✔');
              this.dialogAddTodo.close();
            } else {
              this.successSubmitted = false;
              this.formNewTodo.enable();
              this.isPending = false;
            }
          });
    }
  }

  getErrorMessageName() {
    if (this.formNewTodo.get('name').hasError('required')) {
      return 'You must enter a name';
    }
    return this.formNewTodo.get('name').hasError('minlength') ? 'Name must be at least 2 characters' : '';
  }

  getErrorMessageTask() {
    if (this.formNewTodo.get('task').hasError('required')) {
      return 'You must enter a task';
    }
    return this.formNewTodo.get('task').hasError('minlength') ? 'Task must be at least 5 characters' : '';
  }
}
