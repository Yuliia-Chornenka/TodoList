import { Pipe, PipeTransform } from '@angular/core';
import { IListItem } from './list-item';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(toDoList: IListItem[], searchValue, fieldName: string) {
    if (!toDoList.length || searchValue === '') {
      return toDoList;
    }
    return toDoList.filter((toDoItem) => toDoItem[fieldName] === searchValue);
  }
}
