import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { IListItem } from './list-item';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor(private http: HttpClient) {}

  private listsUrl = 'https://jsonplaceholder.typicode.com/todos';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

  addNewTodo(task: string, name: string, deadline: string): Observable<IListItem> {
    const newTodo = {
      title: task,
      author: name,
      deadline,
      completed: false,
      todoId: Date.now(),
      userId: Date.now() + 1,
      createdAt: new Date().toISOString()
    };

    return this.http.post<IListItem>(this.listsUrl, newTodo, this.httpOptions)
               .pipe(
                 map((item) => {
                   const todoListExist = localStorage.getItem('todoList');
                   if (todoListExist) {
                     const savedList = JSON.parse(localStorage.getItem('todoList'));
                     savedList.unshift(item);
                     localStorage.setItem('todoList', JSON.stringify(savedList));
                   } else {
                     localStorage.setItem('todoList', JSON.stringify([ item ]));
                   }
                   return item;
                 }),
                 catchError(this.handleError<IListItem>('addNewTodo'))
               );
  }

  getTodoListFromStorage() {
    const todoListExist = localStorage.getItem('todoList');
    if (todoListExist) {
      return JSON.parse(localStorage.getItem('todoList'));
    } else {
      return [];
    }
  }

  getTodoList(): Observable<IListItem[]> {
    const todoListSavedLocally = this.getTodoListFromStorage();
    return this.http.get<IListItem[]>(this.listsUrl)
               .pipe(
                 map((array) => array.map(element => {
                     element.author = `server ${element.userId}`;
                     element.todoId = element.id;
                     element.createdAt = new Date(2020, 3, element.userId + 5).toISOString();
                     element.deadline = new Date(2020, 4, element.userId + 5).toISOString();
                     return element;
                   })
                 ),
                 map(array => [ ...todoListSavedLocally, ...array ]),
                 catchError(this.handleError<IListItem[]>('getLists', []))
               );
  }

  deleteTodo(id: number): Observable<IListItem> {
    if (id <= 200) {
      const url = `${this.listsUrl}/${id}`;
      return this.http.delete<IListItem>(url, this.httpOptions).pipe(
        catchError(this.handleError<IListItem>('deleteTodo'))
      );
    } else {
      const savedList = JSON.parse(localStorage.getItem('todoList'));
      savedList.find((element: IListItem, index: number) => {
        if (element && element.todoId === id) {
          savedList.splice(index, 1);
        }
      });
      if (savedList.length) {
        localStorage.setItem('todoList', JSON.stringify(savedList));
      } else {
        localStorage.removeItem('todoList');
      }
      return of (savedList);
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
      savedList.find((element: IListItem) => {
        if (element && element.todoId === todo.todoId) {
          element.completed = todo.completed;
        }
      });
      localStorage.setItem('todoList', JSON.stringify(savedList));
      return of(todo);
    }
  }


  updateTodo(todoId, task, deadline): Observable<IListItem> {
    const dataToUpdate = JSON.stringify({
      title: task,
      deadline
    });

    if (todoId <= 200) {
      const url = `${this.listsUrl}/${todoId}`;
      return this.http.patch(url, dataToUpdate, this.httpOptions).pipe(
        catchError(this.handleError<any>('checkTodo'))
      );
    } else {
      const savedList = JSON.parse(localStorage.getItem('todoList'));
      savedList.find((item: IListItem) => {
        if (item && item.todoId === todoId) {
          item.title = task;
          item.deadline = deadline;
        }
      });
      localStorage.setItem('todoList', JSON.stringify(savedList));
      return of(savedList);
    }
  }
}
