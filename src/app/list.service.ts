import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { IListItem } from './list-item';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private tasks$ = new BehaviorSubject<IListItem[]>([]);

  todoListExist = localStorage.getItem('todoList');

  constructor(private http: HttpClient) {
    if (!this.todoListExist) {
      localStorage.setItem('todoList', JSON.stringify([]));
    }
  }

  private listsUrl = 'https://jsonplaceholder.typicode.com/todos';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  private handleError<T>(operation: string = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getTodoListFromStorage(): Array<IListItem> {
    return JSON.parse(localStorage.getItem('todoList'));
  }

  getTodoList(): Observable<IListItem[]> {
    const todoListSavedLocally = this.getTodoListFromStorage();
    return this.http.get<IListItem[]>(this.listsUrl)
               .pipe(
                 map((todoList: IListItem[]) => todoList.map(todoItem => {
                     todoItem.author = `server ${todoItem.userId}`;
                     todoItem.todoId = todoItem.id;
                     todoItem.createdAt = new Date(2020, 3, todoItem.userId + 5).toISOString();
                     todoItem.deadline = new Date(2020, 4, todoItem.userId + 5).toISOString();
                     return todoItem;
                   })
                 ),
                 tap((todoList) => {
                   this.tasks$.next([ ...todoListSavedLocally, ...todoList ]);
                 }),
                 switchMap(() => this.tasks$.asObservable()),
                 catchError(this.handleError<IListItem[]>('getTodoList', []))
               );
  }

  addNewTodo(task: AbstractControl, name: AbstractControl, deadline: AbstractControl): Observable<IListItem> {
    const today = new Date();
    const creationDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const newTodo = {
      title: task,
      author: name,
      deadline,
      completed: false,
      todoId: Date.now(),
      userId: Date.now() + 1,
      createdAt: creationDate.toISOString()
    };

    return this.http.post<IListItem>(this.listsUrl, newTodo, this.httpOptions)
               .pipe(
                 tap((todoItem: IListItem) => {
                   const savedList = JSON.parse(localStorage.getItem('todoList'));
                   savedList.unshift(todoItem);
                   localStorage.setItem('todoList', JSON.stringify(savedList));
                   const todoList = this.tasks$.getValue();
                   this.tasks$.next([ todoItem, ...todoList ]);
                   return todoItem;
                 }),
                 catchError(this.handleError<IListItem>('addNewTodo'))
               );
  }

  deleteTodo(id: number): Observable<IListItem> {
    const todoList = this.tasks$.getValue();
    const todoToDeleteIndex = todoList.findIndex((todoItem: IListItem) => todoItem.todoId === id);
    if (todoToDeleteIndex >= 0) {
      todoList.splice(todoToDeleteIndex, 1);
    }

    if (id <= 200) {
      const url = `${this.listsUrl}/${id}`;
      return this.http.delete<IListItem>(url, this.httpOptions).pipe(
        tap(() => {
          this.tasks$.next([ ...todoList ]);
        }),
        catchError(this.handleError<IListItem>('deleteTodo'))
      );
    } else {
      const savedList = JSON.parse(localStorage.getItem('todoList'));
      const todoItemToDeleteIndex = savedList.findIndex((todoItem: IListItem) => todoItem.todoId === id);
      if (todoItemToDeleteIndex >= 0) {
        savedList.splice(todoItemToDeleteIndex, 1);
      }
      localStorage.setItem('todoList', JSON.stringify(savedList));
      this.tasks$.next([ ...todoList ]);
      return of(savedList);
    }
  }

  checkTodo(todo: IListItem): Observable<IListItem> {
    if (todo.todoId <= 200) {
      const url = `${this.listsUrl}/${todo.todoId}`;
      return this.http.put(url, todo, this.httpOptions).pipe(
        catchError(this.handleError<any>('checkTodo'))
      );
    } else {
      const savedList = JSON.parse(localStorage.getItem('todoList'));
      const checkedItem = savedList.find((todoItem: IListItem) => todoItem.todoId === todo.todoId);
      if (checkedItem) {
        checkedItem.completed = todo.completed;
      }
      localStorage.setItem('todoList', JSON.stringify(savedList));
      return of(todo);
    }
  }

  updateTodo(todoId: AbstractControl, task: AbstractControl, deadline: AbstractControl): Observable<IListItem> {
    const todoList = this.tasks$.getValue();
    const todoToUpdate = todoList.find((todoItem: IListItem) => todoItem.todoId === +todoId);
    if (todoToUpdate) {
      todoToUpdate.title = task.toString();
      todoToUpdate.deadline = new Date(deadline.toString()).toISOString();
    }

    const dataToUpdate = JSON.stringify({
      title: task,
      deadline
    });

    if (+todoId <= 200) {
      const url = `${this.listsUrl}/${todoId}`;
      return this.http.patch(url, dataToUpdate, this.httpOptions).pipe(
        tap(() => {
          this.tasks$.next([ ...todoList ]);
        }),
        catchError(this.handleError<any>('updateTodo')),
      );
    } else {
      const savedList = JSON.parse(localStorage.getItem('todoList'));
      const itemToUpdate = savedList.find((todoItem: IListItem) => todoItem.todoId === +todoId);
      if (itemToUpdate) {
        itemToUpdate.title = task.toString();
        itemToUpdate.deadline = deadline;
      }
      localStorage.setItem('todoList', JSON.stringify(savedList));
      this.tasks$.next([ ...todoList ]);
      return of(savedList);
    }
  }
}
