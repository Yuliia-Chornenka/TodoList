import { Component, Input, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';

import { ListService } from '../list.service';
import { IListItem } from '../list-item';
import { ModalWindowAddEditTodoComponent } from '../modal-window-add-edit-todo/modal-window-add-edit-todo.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: [ './list.component.scss' ]
})
export class ListComponent implements OnInit {

  today = new Date().toISOString();
  columns: string[] = [ 'Done', 'Author', 'Title', 'Creation date', 'Deadline' ];
  todoList: IListItem[] = [];
  sortedData: IListItem[] = [];
  isDataLoading = false;

  @Input() searchValue: string;
  @Input() searchFieldName: string;
  @Input() taskCompleted: boolean | string;
  @Input() selectedAuthor: string;
  @Input() selectedDeadline: string;
  @Input() selectedCreationDate: string;

  constructor(
    private listService: ListService,
    public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getList();
  }

  openDialogEditTodo(title, deadline, author, todoId) {
    this.dialog.open(ModalWindowAddEditTodoComponent, {
      data: {
        title,
        deadline,
        author,
        todoId,
        modalTitle: 'Edit your task',
      }
    });
  }

  getDaysToDeadline(dayOne, dayTwo) {
    const firstDate: any = new Date(dayOne);
    const secondDate: any = new Date(dayTwo);
    return (secondDate - firstDate) / (60 * 60 * 24 * 1000);
  }

  getList(): void {
    this.isDataLoading = true;
    this.listService.getTodoList()
        .subscribe(items => {
          this.sortedData = items;
          this.todoList = items;
          this.isDataLoading = false;
        });
  }

  deleteTodo(id: number): void {
    this.sortedData = this.sortedData.filter(todo => todo.todoId !== id);
    this.listService.deleteTodo(id).subscribe();
  }

  checkTodo(todo: IListItem): void {
    this.listService.checkTodo(todo).subscribe();
  }

  sortData(sort: Sort) {
    const data = this.todoList.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Done':
          return compare(a.completed, b.completed, isAsc);
        case 'Title':
          return compare(a.title.toLowerCase(), b.title.toLowerCase(), isAsc);
        case 'Author':
          return compare(a.author, b.author, isAsc);
        case 'Creation date':
          return compare(a.createdAt, b.createdAt, isAsc);
        case 'Deadline':
          return compare(a.deadline, b.deadline, isAsc);
        default:
          return 0;
      }
    });
  }
}

function compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
