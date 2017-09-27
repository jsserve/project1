import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({
    name: 'searchEvent'
})
export class SearchEventPipe implements PipeTransform {

    public transform(value, keys: string, term: any) {
        let team = term[0];
        let event = term[1];
        let search = term[2];
        // console.log(search);

        if (!search || search.length == 0) {
            if ((!team || team.length == 0) && (!event || event.length == 0)) return value;
            return (value || []).filter((item) => {
                //keys.split(',').some(key => item.hasOwnProperty(key) && term.indexOf(item[key]) > -1)
                let result = false;
                if (team && team.length > 0) {
                    team.forEach(t => {
                        if (t == item['team']) {
                            result = true;
                            if (event && event.length > 0) {
                                result = false;
                                event.forEach(e => {
                                    if (e == item['name'])
                                        result = true;
                                });
                            }
                        }
                    });
                }
                if ((!team || team.length == 0) && event && event.length > 0) {
                    result = false;
                    event.forEach(e => {
                        if (e == item['name'])
                            result = true;
                    });
                }
                return result;
            });
        }
        else {
            return (value || []).filter((item) => {
                let result = false;
                if ((!search || search.length > 0)) {
                    if ((item['name'] && item['name'].toLowerCase().indexOf(search.toLowerCase()) != -1) || (item['team'] && item['team'].toLowerCase().indexOf(search.toLowerCase()) != -1)) {
                        result = true;
                    }
                    if ((!team || team.length == 0) && event && event.length > 0) {
                        result = false;
                        event.forEach(e => {
                            if (e == item['name'])
                                result = true;
                        });
                    }
                    if (team && team.length > 0) {
                        team.forEach(t => {
                            if (t == item['team']) {
                                result = true;
                                if (event && event.length > 0) {
                                    result = false;
                                    event.forEach(e => {
                                        if (e == item['name'])
                                            result = true;
                                    });
                                }
                            }
                        });
                    }
                }


                return result;

            });
        }

    }

    // transform(items: Array<any>, filter: { [key: string]: any }): Array<any> {
    //     return items.filter(item => {
    //         let notMatchingField = Object.keys(filter)
    //             .find(key => item[key] !== filter[key]);

    //         return !notMatchingField; // true if matches all fields
    //     });
    // }
    // if (term.length == 0) return value;
    //         return (value || []).filter((item) => {
    //             keys.split(',').some(key => {
    //                 var result = false;
    //                 if (item.hasOwnProperty(key)) {
    //                     term.forEach(t => {
    //                         if (new RegExp(t, 'gi').test(item[key]))
    //                             result = true;
    //                     });

    //                 }
    //                 return result;
    //             })
    //         });



}
