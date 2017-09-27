import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({
    name: 'searchVideoEvent'
})
export class SearchVideoEventPipe implements PipeTransform {

    public transform(value, keys: string, term: any) {
        let team = term[0];
        let event = term[1];
        let search = term[2];
        if (term) {
            // console.log('team' + term[0]);
            // console.log('event' + event);
        }
        if (!search || search.length == 0) {
            if ((!team || team.length == 0) && (!event || event.length == 0)) return value;
        }
        return (value || []).filter((item) => {


            let result = false;
            if (team && team.length > 0) {
                team.forEach(e => {
                    // console.log('item' + item['key']);
                    // console.log('e' + e);
                    item['value'].forEach(t => {
                        // console.log('t', t);
                    });


                });
            }

        });

    }




}
