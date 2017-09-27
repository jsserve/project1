import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({
    name: 'searchVideoTimelineTeam'
})
export class SearchVideoTimelineTeamPipe implements PipeTransform {

    public transform(value, keys: string, term: any) {
        let team = term[0];//team
        let event = term[1];//event
        let search = term[2];//search field
        // console.log('team', team);
        // console.log('event', event);
        // console.log('search', search);

        let fData = (value || []).filter((tItem) => {
            if (search)
                return tItem.team.toLowerCase().indexOf(search.toLowerCase()) != -1
            else if (team && team.length > 0)
                return team.indexOf(tItem.team) > -1;
            else return true
        });
        // console.log(fData)
        return fData;
    }
}
