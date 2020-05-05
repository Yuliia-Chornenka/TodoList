import { Pipe, PipeTransform } from '@angular/core';
import { IListItem } from './list-item';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(toDoList: IListItem[], searchValue, fieldName: string) {
    if (!toDoList.length || searchValue === '') {
      return toDoList;
    }
    return toDoList.filter((toDoItem) => toDoItem[fieldName].toLowerCase().indexOf(searchValue.toLowerCase()) !== -1);
  }
}
