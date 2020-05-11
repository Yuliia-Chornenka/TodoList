import { Component, OnDestroy, OnInit } from '@angular/core';

import { ListService } from '../list.service';
import { IListItem } from '../list-item';
import { TaskStates } from './task-states.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: [ './main-page.component.scss' ]
})
export class MainPageComponent implements OnInit, OnDestroy {

  searchValue = '';
  searchFieldName = 'title';
  searchedFields = [ 'title', 'author' ];

  selectedTasks = TaskStates.All;
  taskCompleted: boolean | string = '';

  selectedAuthor = '';
  authors = [];

  selectedDeadline = '';
  deadlines: string[] = [];

  selectedCreationDate = '';
  creationDates: string[] = [];

  subscriptions: Subscription = new Subscription();

  constructor(private listService: ListService) {
  }

  ngOnInit(): void {
    this.getList();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getList(): void {
    this.subscriptions.add(this.listService.getTodoList()
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
    }));
  }

  filterTaskByCompleted(): void {
    switch (this.selectedTasks) {
      case TaskStates.Done:
        this.taskCompleted = true;
        break;
      case TaskStates.NotDone:
        this.taskCompleted = false;
        break;
      case TaskStates.All:
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
    this.selectedTasks = TaskStates.All;
  }
}
