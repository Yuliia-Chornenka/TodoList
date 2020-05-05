import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ModalWindowAddEditTodoComponent } from './modal-window-add-edit-todo/modal-window-add-edit-todo.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent {
  title = 'ToDoList';

  constructor(public dialog: MatDialog) {}

  openDialogNewTodo() {
    this.dialog.open(ModalWindowAddEditTodoComponent, {
      data: {
        title: '',
        deadline: '',
        author: '',
        todoId: '',
        modalTitle: 'Create new task'
      }
    });
  }
}
