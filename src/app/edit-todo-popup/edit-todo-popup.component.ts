import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ListService } from '../list.service';
import { IListItem } from '../list-item';
import { IPopupData } from '../popup-data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-todo-popup',
  templateUrl: './edit-todo-popup.component.html',
  styleUrls: [ './edit-todo-popup.component.scss' ]
})
export class EditTodoPopupComponent implements OnInit, OnDestroy {
  minDate: Date = new Date();
  formNewTodo: FormGroup;
  successSubmitted = true;
  isPending = false;

  subscriptions: Subscription = new Subscription();

  constructor(
    private listService: ListService,
    private snackBar: MatSnackBar,
    public dialogAddTodo: MatDialogRef<EditTodoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPopupData) {
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3500
    });
  }

  onSubmit(): void {
    let {task, name, deadline} = this.formNewTodo.controls;
    task = task.value;
    name = name.value.toLowerCase();
    deadline = deadline.value;

    this.formNewTodo.disable();
    this.isPending = true;
    this.successSubmitted = true;

    if (this.data.todoId) {
      this.updateTodo(this.data.todoId, task, deadline);
    } else {
      this.addNewTodo(task, name, deadline);
    }
  }

  addNewTodo(task: AbstractControl, name: AbstractControl, deadline: AbstractControl): void {
    this.subscriptions.add(this.listService.addNewTodo(task, name, deadline).subscribe((result: IListItem) => {
      if (result) {
        this.openSnackBar('New task was successfully created', '✔');
        this.dialogAddTodo.close();
      } else {
        this.successSubmitted = false;
        this.formNewTodo.enable();
        this.isPending = false;
      }
    }));
  }

  updateTodo(todoId: AbstractControl, task: AbstractControl, deadline: AbstractControl): void {
    this.subscriptions.add(this.listService.updateTodo(todoId, task, deadline).subscribe((result: IListItem) => {
      if (result) {
        this.openSnackBar('Your task was successfully updated', '✔');
        this.dialogAddTodo.close();
      } else {
        this.successSubmitted = false;
        this.formNewTodo.enable();
        this.isPending = false;
      }
    }));
  }

  get nameControl(): AbstractControl {
    return this.formNewTodo.get('name');
  }

  get taskControl(): AbstractControl {
    return this.formNewTodo.get('task');
  }

  getErrorMessageName(): string {
    if (this.nameControl.hasError('required')) {
      return 'You must enter a name';
    }
    return this.nameControl.hasError('minlength') ? 'Name must be at least 2 characters' : '';
  }

  getErrorMessageTask(): string {
    if (this.taskControl.hasError('required')) {
      return 'You must enter a task';
    }
    return this.taskControl.hasError('minlength') ? 'Task must be at least 5 characters' : '';
  }
}
