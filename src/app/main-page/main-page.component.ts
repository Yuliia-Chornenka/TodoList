import { Component, OnInit } from '@angular/core';

import { ListService } from '../list.service';
import { IListItem } from '../list-item';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: [ './main-page.component.scss' ]
})
export class MainPageComponent implements OnInit {

  searchValue = '';
  searchFieldName = 'title';
  searchedFields = [ 'title', 'author' ];

  selectedTasks = 'all';
  taskCompleted: boolean | string = '';

  selectedAuthor = '';
  authors = [];

  selectedDeadline = '';
  deadlines: string[] = [];

  selectedCreationDate = '';
  creationDates: string[] = [];

  constructor(private listService: ListService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.listService.getTodoList()
        .subscribe(items => {
          items.forEach((todo: IListItem) => {
            if (!this.authors.includes(todo.author)) {
              this.authors.push(todo.author);
              this.authors.sort();
            }

            if (!this.deadlines.includes(todo.deadline)) {
              this.deadlines.push(todo.deadline);
              this.deadlines.sort();
            }

            if (!this.creationDates.includes(todo.createdAt)) {
              this.creationDates.push(todo.createdAt);
              this.creationDates.sort();
            }
          });
        });
  }

  filterTaskByCompleted() {
    switch (this.selectedTasks) {
      case 'done':
        this.taskCompleted = true;
        break;
      case 'not-done':
        this.taskCompleted = false;
        break;
      case 'all':
        this.taskCompleted = '';
        break;
      default:
        this.taskCompleted = '';
        break;
    }
  }

  resetSearchInput(): void {
    this.searchValue = '';
  }

  resetSelectedAuthor(): void {
    this.selectedAuthor = '';
  }

  resetSelectedDeadline(): void {
    this.selectedDeadline = '';
  }

  resetSelectedCreationDate(): void {
    this.selectedCreationDate = '';
  }

  resetAllFilters(): void {
    this.searchValue = '';
    this.searchFieldName = 'title';
    this.selectedAuthor = '';
    this.selectedDeadline = '';
    this.selectedCreationDate = '';
    this.taskCompleted = '';
    this.selectedTasks = 'all';
  }
}
