import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EditTodoPopupComponent } from './edit-todo-popup/edit-todo-popup.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent {
  title = 'ToDoList';

  constructor(public dialog: MatDialog) {}

  openDialogNewTodo() {
    this.dialog.open(EditTodoPopupComponent, {
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
