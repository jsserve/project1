import {
    Pipe,
    PipeTransform
} from '@angular/core';
declare var document: any;
declare var VTTCue;
@Pipe({
    name: 'searchVideoTimeline'
})



export class SearchVideoTimelinePipe implements PipeTransform {

    public transform(value, keys: string, term: any) {
        let team = term[0];//team
        let event = term[1];//event
        let search = term[2];//search field
        // console.log('team', team);
        // console.log('event', event);
        // console.log('search', search);

        let fData = (value || []).filter((item) => {
            if (event && event.length) {
                if (event.indexOf(item['key']) > -1) {
                    return true
                } else return false
            } else if (search) {
                if (item['key'].toLowerCase().indexOf(search.toLowerCase()) != -1)
                    return true
                else {
                    let valF = false;
                    item['values'].filter((val) => {
                        if (val.team.toLowerCase().indexOf(search.toLowerCase()) != -1) {
                            valF = true;
                        }
                    })
                    return valF;
                }
            }
            else return true
        });
        let greenLineHeight;
        if (fData.length > 0) {
            if (fData.length <= 3) {
                greenLineHeight = fData.length * 30 + 35;
            }
            else {
                greenLineHeight = fData.length * 30 + 50;
            }

            document.styleSheets[0].addRule('.range-slider /deep/ .irs-slider.single::after', 'height: ' + greenLineHeight + 'px !important');
            document.styleSheets[0].addRule('vg-scrub-bar-cue-points .cue-point-container .cue-point', 'pointer-events:auto !important');
            document.styleSheets[0].addRule('vg-scrub-bar-cue-points', 'pointer-events:auto !important');
        }


        return fData;
    }
}
