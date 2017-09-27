import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({
    name: 'className'
})
export class ClassNamePipe implements PipeTransform {

    public transform(value, keys: string, term: string) {

        let replaced;
        if (value) {
            replaced = value.split(' ').join('-').toLowerCase();
        }
        return replaced;

    }

}
