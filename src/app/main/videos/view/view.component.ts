import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  Renderer2
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Video
} from './../../../models/video.model';

import {
  UserService
} from './../../../services/user.service';
import {
  VideoService
} from './../../../services/video.service';
import {
  PlaylistService
} from './../../../services/playlist.service';

import {
  GlobalVariables
} from './../../../models/global.model';

import {
  TrackingDataService
} from './../../../services/trackingData.service';
import {
  VgAPI
} from 'videogular2/core';
import {
  PerfectScrollbarComponent,
  PerfectScrollbarDirective,
  PerfectScrollbarConfigInterface
} from 'ngx-perfect-scrollbar';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { Playlist } from "app/models/playlist.model";

declare var document: any;
declare var VTTCue;

export interface ICuePoint {
  title: string;
  description: string;
  src: string;
  href: string;
}

export interface IWikiCue {
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  src: string;
  href: string;
}

export interface IMedia {
  title: string;
  src: string;
  type: string;
}

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  keyCode: any;

  globalListenFunc: Function;
  create: boolean;
  multiplay: Boolean;
  successmsg: any;
  eventsDetails: any;
  isAdmin: boolean;
  showEvent: boolean;
  shareEvent: boolean;
  eventId: any;
  eTeam: any;
  eStrat: any;
  eEnd: any;
  eName: any;
  saveClass: any;
  updateMessage: string;
  saveMessage: string;
  trackPlaylist: any = [];
  eId: any;
  vId: any;
  timer: NodeJS.Timer;
  starttime: number;
  eventPause: boolean;
  private sub: any;
  private videoId: any;
  private baseVideoUrl = GlobalVariables.BASE_VIDEO_URL;
  private baseAmazonVideoUrl = GlobalVariables.BASE_AMAZON_VIDEO_URL;
  private baseTrackingDataUrl = GlobalVariables.BASE_TRACKINGDATA_URL;
  trackingJsonData: any[];
  videoTrackingData: any = [];
  videoEvents: any = [];
  trackEvent: any = [];
  trackTeam: any = [];
  trackTeamCheck: any = [];
  trackEventCheck: any = [];
  api: VgAPI;
  video: Video;
  showEventsIngGroup: any;
  videoDuration: any;
  fancyVideoDuration: any;
  secondsCollection: any;
  roundedDuration: any;
  currentVideoTime: any;
  track: TextTrack;
  cuePointData: ICuePoint = null;
  enableOverlay: boolean;
  videoLoaded: boolean;
  isCoachOrAnalyst: boolean = false;
  public playlists: Playlist = new Playlist();

  eventPlayQueue: any = [];

  teamModel: any[];
  myOptions: IMultiSelectOption[];

  eventModel: any[];
  myOptions1: IMultiSelectOption[];
  searchArray: any = [];
  playlistName: string;
  playlistOptions: IMultiSelectOption[];
  playlistModel: any[];
  playlistSettings: IMultiSelectSettings = {
    enableSearch: false,
    checkedStyle: 'fontawesome',
    containerClasses: 'no-button-arrow',
    buttonClasses: 'btn btn-default btn-block',
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true,
    // fixedTitle: true
  };
  teamSettings: IMultiSelectSettings = {
    enableSearch: false,
    checkedStyle: 'fontawesome',
    containerClasses: 'no-button-arrow',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true
  };
  eventSettings: IMultiSelectSettings = {
    enableSearch: false,
    checkedStyle: 'fontawesome',
    containerClasses: 'no-button-arrow',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true
  };

  // Text configuration
  playlistTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Playlist selected',
    checkedPlural: 'Playlist selected',
    searchPlaceholder: 'Find',
    defaultTitle: '  Playlist  ',
    allSelected: 'All Playlist ',
  };
  teamTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Team selected',
    checkedPlural: 'Teams selected',
    searchPlaceholder: 'Find',
    defaultTitle: '  By Team  ',
    allSelected: 'All Team ',
  };
  eventTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Event selected',
    checkedPlural: 'Event selected',
    searchPlaceholder: 'Find',
    defaultTitle: '  By Event  ',
    allSelected: 'All Event',
  };

  trackUserlist: any[];

  userlistOptions: IMultiSelectOption[];
  userlistModel: any[];
  userlistSettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    containerClasses: 'no-button-arrow',
    buttonClasses: 'btn btn-default btn-block',
    fixedTitle: false,
    maxHeight: '400px',
    dynamicTitleMaxItems: 2,
    closeOnClickOutside: true
  };
  userlistTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Video selected',
    checkedPlural: 'Video selected',
    searchPlaceholder: 'Find',
    searchEmptyResult: 'Nothing found',
    searchNoRenderText: 'Type in search box',
    defaultTitle: ' Select Users  ',
    allSelected: 'All Video ',
  };
  multiPlaylist: any = [];
  events: any = [];
  eventDataId: any;

  // @HostListener('window:keypress', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) {
  //   this.keyCode = event.keyCode;
  //   console.log('test', event);
  //   if (this.keyCode == '32') {
  //     if (this.api.state == 'playing') {
  //       this.api.pause();
  //     } else {
  //       this.api.play();
  //     }
  //   }
  // }

  @ViewChild('createPlaylistModal') createPlaylistModal;
  @ViewChild('updatePlaylistModal') updatePlaylistModal;
  @ViewChild('assignEventModal') assignEventModal;
  @ViewChild('SucessModal') SucessModal;

  //@ViewChild('eventTimelineScrollbar') eventTimelineScrollbar;

  constructor(private r: Router, private route: ActivatedRoute, private playlistService: PlaylistService, private videoService: VideoService, private userService: UserService, private trackingDataService: TrackingDataService, private renderer: Renderer2) { }

  ngOnInit() {
    // this.globalListenFunc = this.renderer.listen('document', 'keypress', e => {
    //   console.log('test', e);
    // });
    var user = this.userService.loadUserFromStorage();

    if (user['role'] != 3 && user['role'] != 4) {
      this.isCoachOrAnalyst = false;
    } else {
      this.isCoachOrAnalyst = true;
    }

    // this.userService.isAdmin().subscribe(
    //   (response) => this.onIsAdminClubsSuccess(response),
    //   (error) => this.onError(error)
    // );
    this.showEvent = true;
    this.sub = this.route.params.subscribe(params => {
      this.videoId = params['id'];
      if (params['eid'] && params['edid']) {

        this.eventId = params['eid'];
        this.trackingDataService.getEventDetails(this.videoId, params['edid'], this.userService.token).subscribe(
          (response) => this.getEventDetailsSuccess(response, params['eid']),
          (error) => this.onError(error)
        )
      }
      this.getVideo(this.videoId);
    });

  }
  onIsAdminClubsSuccess(response) {
    const userAdmin = JSON.parse(response._body);

    if (userAdmin.success)
      this.isAdmin = true;

  }
  onChange() {
    //alert('hello');
    if (!this.teamModel) this.teamModel = []
    this.searchArray = this.teamModel.concat(this.eventModel);

  }

  getVideoEventsData(id: String) {
    this.trackingDataService.getEventsByVideo(id, this.userService.token).subscribe(
      (response) => this.ongetVideoEventsDataSuccess(response),
      (error) => this.onError(error)
    );
  }

  ongetVideoEventsDataSuccess(response) {
    this.events = JSON.parse(response._body);
    // console.log(this.events);
    this.trackingJsonData = [];
    var count = 1;
    this.events.forEach((element, index) => {
      element.eventData.forEach((event, index) => {
        if (typeof (event.id) != 'undefined') {
          event.id = event.id[0];
        }
        if (typeof (event.name) != 'undefined') {
          event.name = event.name[0];
        }
        if (typeof (event.team) != 'undefined') {
          event.team = event.team[0];
        }
        if (typeof (event.start) != 'undefined') {
          event.start = event.start[0];
        }
        if (typeof (event.end) != 'undefined') {
          event.end = event.end[0];
        }
        event.rowId = count;
        event.eventDataId = element._id;
        this.trackingJsonData.push(event);
        count++;
      });
    });

    this.videoEvents = this.trackingDataService.groupEvents(this.trackingJsonData, this.api.getDefaultMedia().duration);

    this.trackingJsonData.forEach((event, index) => {

      // event.checked = true;

      if (event.start !== "NaN") {
        if (this.trackEventCheck.indexOf(event.name) == -1) {
          this.trackEventCheck.push(event.name);
          this.trackEvent.push({
            'id': event.name,
            'name': event.name
          });
        }
        if (this.trackTeamCheck.indexOf(event.team) == -1) {
          this.trackTeamCheck.push(event.team);
          this.trackTeam.push({
            'id': event.team,
            'name': event.team
          });

        }
      }

      let start = parseInt(event.start);
      let end = start + 0.5;
      if (event.start !== "NaN" &&
        (event.name === "Goal" ||
          event.name === "Kick Off" ||
          event.name === "Red Card" ||
          event.name === "Yellow Card" ||
          event.name === "Change" ||
          event.name === "Free Kick"
        ) &&
        this.api.getDefaultMedia().duration > event.start) {
        this.track.addCue(
          new VTTCue(start, end, JSON.stringify({
            title: event.name,
            team: event.team
          }))
        );
      }
    });
    // console.log("TRACK", this.track);
    // console.info('Event', this.trackEvent);
    this.myOptions = this.trackTeam;
    this.myOptions1 = this.trackEvent;
    // console.info('Team', this.trackTeam);


    let greenLineHeight = this.videoEvents.length * 30 + 60;
    document.styleSheets[0].addRule('.range-slider /deep/ .irs-slider.single::after', 'height: ' + greenLineHeight + 'px !important');
    document.styleSheets[0].addRule('vg-scrub-bar-cue-points .cue-point-container .cue-point', 'pointer-events:auto !important');
    document.styleSheets[0].addRule('vg-scrub-bar-cue-points', 'pointer-events:auto !important');

    let cueData = this.track.cues;
    let intId = setInterval(function () {
      var container = document.getElementsByClassName("cue-point-container")[0];
      if (container) {
        var container_child = container.getElementsByClassName('cue-point');
        if (container_child) {
          for (var i = 0; i < cueData.length; i++) {
            let cuePoint = JSON.parse(cueData[i].text)
            let z = document.createAttribute('data-tooltip');
            z.value = cuePoint.title + " - " + cuePoint.team;
            container_child[i].setAttributeNode(z);

          }
          clearInterval(intId);
        }
      }

    }, 1000);

  }

  eventHandler(event) {
    // console.log(event, event.keyCode, event.keyIdentifier);
  }



  getVideoTrackingDataItems(id: String) {
    this.trackingDataService.getDataTrackingForVideo(id, this.userService.token).subscribe(
      (response) => this.onGetVideoTrackingDataItemsSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetVideoTrackingDataItemsSuccess(response) {
    const res = JSON.parse(response._body);
    this.videoTrackingData = res;
    if (!this.videoTrackingData[0]) return false;

    this.trackingDataService.getXmlFile(this.videoTrackingData[0]).subscribe(
      (response: any) => {
        this.trackingDataService.parseXML(response._body).then(
          (response: any) => {
            // console.log('parseXML response', response);
            if (response.recording) {
              this.videoEvents = this.trackingDataService.groupEvents(response.recording.annotations.annotation, this.api.getDefaultMedia().duration);
              this.trackingJsonData = response.recording.annotations.annotation;

              this.trackingJsonData.forEach((event, index) => {

                // event.checked = true;

                if (event.start !== "NaN") {
                  if (this.trackEventCheck.indexOf(event.name) == -1) {
                    this.trackEventCheck.push(event.name);
                    this.trackEvent.push({
                      'id': event.name,
                      'name': event.name
                    });
                  }
                  if (this.trackTeamCheck.indexOf(event.team) == -1) {
                    this.trackTeamCheck.push(event.team);
                    this.trackTeam.push({
                      'id': event.team,
                      'name': event.team
                    });

                  }
                }

                let start = parseInt(event.start);
                let end = start + 0.5;
                if (event.start !== "NaN" &&
                  (event.name === "Goal" ||
                    event.name === "Kick Off" ||
                    event.name === "Red Card" ||
                    event.name === "Yellow Card" ||
                    event.name === "Change" ||
                    event.name === "Free Kick"
                  ) &&
                  this.api.getDefaultMedia().duration > event.start) {
                  this.track.addCue(
                    new VTTCue(start, end, JSON.stringify({
                      title: event.name,
                      team: event.team
                    }))
                  );
                }
              });
              // console.log("TRACK", this.track);
              // console.info('Event', this.trackEvent);
              this.myOptions = this.trackTeam;
              this.myOptions1 = this.trackEvent;
              // console.info('Team', this.trackTeam);


              let greenLineHeight = this.videoEvents.length * 30 + 60;
              document.styleSheets[0].addRule('.range-slider /deep/ .irs-slider.single::after', 'height: ' + greenLineHeight + 'px !important');
              document.styleSheets[0].addRule('vg-scrub-bar-cue-points .cue-point-container .cue-point', 'pointer-events:auto !important');
              document.styleSheets[0].addRule('vg-scrub-bar-cue-points', 'pointer-events:auto !important');

              let cueData = this.track.cues;
              let intId = setInterval(function () {
                var container = document.getElementsByClassName("cue-point-container")[0];
                if (container) {
                  var container_child = container.getElementsByClassName('cue-point');
                  if (container_child) {
                    for (var i = 0; i < cueData.length; i++) {
                      let cuePoint = JSON.parse(cueData[i].text)
                      let z = document.createAttribute('data-tooltip');
                      z.value = cuePoint.title + " - " + cuePoint.team;
                      container_child[i].setAttributeNode(z);

                    }
                    clearInterval(intId);
                  }
                }

              }, 1000);


            }



          });
      },
      (error) => this.onError(error)
    );
  }

  getVideo(id) {
    this.videoService.getVideoById(id, this.userService.token)
      .subscribe(
      (response) => this.onGetVideoSuccess(response),
      (error) => this.onError(error)
      );
  }
  playlist: Array<IMedia>;
  onGetVideoSuccess(response) {

    this.video = JSON.parse(response._body);

    if (this.video && this.video.path) {
      this.videoLoaded = true;
      this.playlist = [{
        title: 'Intro Video',
        src: 'assets/videos/intro.mp4',
        type: 'video/mp4'
      },
      {
        title: this.video.title,
        src: this.baseAmazonVideoUrl + this.video.path,
        type: this.video.mimetype
      },
      {
        title: 'Outro Video',
        src: 'assets/videos/outro.mp4',
        type: 'video/mp4'
      }
      ];

      this.currentItem = this.playlist[this.currentIndex];


    }
    else {
      this.r.navigateByUrl('/videos');
    }

  }

  onError(error) {
    const errorBody = JSON.parse(error._body);
    console.error(errorBody);
    // alert(errorBody.message);
  }

  currentIndex = 1; //Set this to 0 to enable Intro video;
  currentItem: IMedia;

  shareEventlist(vid, e) {
    // console.log(vid, eid)
    // console.log(e);
    this.userService.getUsers(this.userService.token).subscribe(
      (response) => this.onGetUsersSuccess(response),
      (error) => this.onError(error)
    );
    // this.trackingDataService.getEventDetails(vid, e.id, this.userService.token).subscribe(
    //   (response) => this.getEventDetailsSuccess(response, e.id),
    //   (error) => this.onError(error)
    // )
    this.eventsDetails = e;
    this.assignEventModal.open();

  }
  getEventDetailsSuccess(response, eid) {
    const eventsdata = JSON.parse(response._body);
    // console.log(eventsdata.eventData);
    this.eventsDetails = eventsdata.eventData.filter(function (element, index) {
      return (element.id[0] === eid);
    })[0];

  }
  onGetUsersSuccess(response) {
    const userlist = JSON.parse(response._body);
    this.trackUserlist = [];
    userlist.forEach((usr, index) => {
      this.trackUserlist.push({
        'id': usr._id,
        'name': usr.firstName
      });
    });
    this.userlistOptions = this.trackUserlist;


  }
  usersToEvent() {
    // console.log(this.eventsDetails);
    this.trackingDataService.shareEvent(this.videoId, this.eventsDetails, this.userlistModel, this.userService.token).subscribe(
      (response) => this.shareEventSuccess(response),
      (error) => this.onError(error)
    )

  }
  shareEventSuccess(response) {
    const eventRes = JSON.parse(response._body);
    this.successmsg = eventRes.message;
    this.assignEventModal.close();
    this.SucessModal.open();
  }
  onClickPlaylistItem(item: IMedia, index: number) {
    this.currentIndex = index;
    this.currentItem = item;
  }
  onPlayerReady(api: VgAPI) {
    this.api = api;
    this.track = this.api.textTracks[0];

    //this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.playVideo.bind(this));

    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        // Set the video to the beginning

        this.multiPlaylist = [];
        //console.log("Ended");
        //this.api.getDefaultMedia().currentTime = 0;
        // this.api.pause();
        this.nextVideo();


      }
    );

    this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(
      () => {
        //console.log(this.api.getDefaultMedia().currentTime)
        this.currentVideoTime = this.api.getDefaultMedia().currentTime;
        this.playNextFromQueue(this.currentVideoTime);
        //console.log(this.eventTimelineScrollbar);
        // if( this.eventTimelineScrollbar && document.getElementsByClassName("ps--active-x")[0]){
        //   this.playNextFromQueue(this.currentVideoTime);
        //   this.eventTimelineScrollbar.elementRef.nativeElement.childNodes[0].scrollLeft += 1;
        //   if (document.getElementsByClassName("irs-slider")[0].offsetLeft > document.getElementsByClassName("ps--active-x")[0].offsetWidth / 2) {
        //     document.getElementsByClassName("ps--active-x")[0].scrollLeft = document.getElementsByClassName("irs-slider")[0].offsetLeft - (document.getElementsByClassName("ps--active-x")[0].offsetWidth / 2)
        //   }
        // }

      }
    );

    this.api.getDefaultMedia().subscriptions.loadedData.subscribe(
      () => {
        // console.log("Loaded data");

        // if (this.currentIndex == 1) {
        this.videoDuration = this.api.getDefaultMedia().duration;
        this.roundedDuration = parseInt(this.videoDuration);
        this.fancyVideoDuration = this.fancyTimeFormat(this.videoDuration);
        // console.log(this.videoDuration);
        // console.log(this.fancyVideoDuration);

        // this.getVideoTrackingDataItems(this.videoId);
        this.getVideoEventsData(this.videoId);


        //}
        if (this.currentIndex <= 2) {
          if (this.eventId) {
            this.showEvent = false;
            this.sharedEvent();
          }
          this.playVideo();
        }

      }
    );
  }

  nextVideo() {
    // console.log("Next video");
    //COMMENT THIS OUT TO ENABLE INTRO AND OUTRO
    this.currentIndex = 1;
    this.currentItem = this.playlist[this.currentIndex];
    //UNCOMMENT THIS TO ENABLE INTRO AND OUTRO
    // this.currentIndex++;

    // if (this.currentIndex === this.playlist.length) {
    //   this.currentIndex = 0;
    //   this.currentItem = this.playlist[this.currentIndex];
    // } else {
    //   this.currentItem = this.playlist[this.currentIndex];
    // }
    // console.log(this.currentItem);

  }


  playVideo() {
    this.api.play();
  }

  checkIfCurrentTime(evtGroup) {
    var ret = false;
    evtGroup.values.forEach((event) => {
      if (parseInt(event.start) <= this.api.getDefaultMedia().currentTime && parseInt(event.end) >= this.api.getDefaultMedia().currentTime) {
        ret = true;
      }
    });
    return ret;
  }

  checkIfCurrentEvent(event) {
    var ret = false;
    if (parseInt(event.start) <= this.api.getDefaultMedia().currentTime && parseInt(event.end) >= this.api.getDefaultMedia().currentTime) {
      ret = true;
    }


    // console.log('event time' + event.end);

    return ret;
  }
  sharedEvent() {
    this.api.getDefaultMedia().currentTime = this.eventsDetails.start[0];
    this.api.play();
    this.cleartimer();
    this.timer = setInterval(() => {
      if (this.api.getDefaultMedia().currentTime >= this.eventsDetails.end[0]) {
        this.api.pause();
        this.cleartimer();
      }
    }, 1000);
  }
  goToEvent(e, event) {

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.api.getDefaultMedia().currentTime = event.start;
    this.api.play();
    this.cleartimer();
    this.timer = setInterval(() => {
      if (this.api.getDefaultMedia().currentTime >= parseInt(event.end)) {
        this.api.pause();
        this.cleartimer();
      }
    }, 1000);




  }
  cleartimer() {
    if (this.timer)
      clearInterval(this.timer);
  }

  fancyTimeFormat(time) {
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~(time % 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":";
    }

    ret += "" + (mins < 10 ? "0" : "");
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  }

  public oldSliderTime = 0;
  onChangeTimelineSlider(e) {

    this.api.getDefaultMedia().currentTime = e.from / 100;


  }

  onmouseenter($event) {
    this.enableOverlay = true;
    setTimeout(() => {
      this.enableOverlay = true;
    }, 1500);

  }

  onmouseleave($event) {
    setTimeout(() => {
      this.enableOverlay = false;
    }, 1500);
  }

  onEnterCuePoint($event) {

    this.cuePointData = JSON.parse($event.text);

  }

  onExitCuePoint($event) {
    this.cuePointData = null;

  }

  fillQueue(group) {
    this.eventPlayQueue = JSON.parse(JSON.stringify(group.values));
    // console.log("Fill Queue", group);
    this.playFromQueue();
  }

  playFromQueue() {
    if (this.eventPlayQueue[0]) {
      // console.log("PLAYING QUEUE ", this.eventPlayQueue[0]);
      this.goToEvent(false, this.eventPlayQueue[0]);
    }
  }

  playNextFromQueue(time) {
    if (this.eventPlayQueue && this.eventPlayQueue.length > 0 && time >= this.eventPlayQueue[0].end) {
      this.eventPlayQueue.shift();
      this.playFromQueue();
    }
  }

  timelineClicked(event, container) {
    // console.log(container);
    let percentange = (event.layerX - 20) / container.width * 100;     //17seconds for offset fix
    let currentTime = this.roundedDuration / 100 * percentange;

    this.api.getDefaultMedia().currentTime = currentTime;
  }

  getEventIcon(eventName) {
    switch (eventName) {
      case 'Corner':
        return 'assets/event-icons/corner-flag.svg';
      case 'Goal':
        return 'assets/event-icons/net-ball.svg';
      case 'Offside':
        return 'assets/event-icons/offside.svg';
      case 'Free Kick':
        return 'assets/event-icons/foot.svg';
      case 'Shoot':
        return 'assets/event-icons/ball.svg';
      case 'Yellow Card':
        return 'assets/event-icons/cards.svg';
      case 'Red Card':
        return 'assets/event-icons/cards.svg';
      case 'Change':
        return 'assets/event-icons/player-1.svg';
      case 'Pass':
        return 'assets/event-icons/ball-2.svg';
      default:
        return 'assets/event-icons/clock.svg';
    }
  }
  ngOnDestroy() {
    this.cleartimer();
  }
  createPlaylist(vId, event, multiplay: Boolean) {
    this.create = true;
    this.multiplay = multiplay;
    this.vId = vId;
    // this.eId = event.id;
    // this.eStrat = event.start;
    // this.eEnd = event.end;
    // this.eName = event.name;
    // this.eTeam = event.team;
    // this.eventDataId = event.eventDataId;
    //  console.log(this.eventDataId);
    this.playlistName = '';
    // console.log(this.multiplay);
    // console.log(this.multiPlaylist);
    this.createPlaylistModal.open();
  }

  addToPlaylist(vId, event, multiplay: Boolean) {
    this.create = false;
    this.multiplay = multiplay;
    this.vId = vId;
    this.eId = event.id;
    this.eStrat = event.start;
    this.eEnd = event.end;
    this.eName = event.name;
    this.eTeam = event.team;
    this.eventDataId = event.eventDataId;

    this.playlistService.getPlaylists(this.userService.token).subscribe(
      (response) => this.onGetPlaylistsSuccess(response),
      (error) => this.onError(error)
    );
  }
  onGetPlaylistsSuccess(response) {
    this.playlistOptions = [];
    this.playlistModel = [];
    this.trackPlaylist = [];
    const play = JSON.parse(response._body);
    play.playlists.forEach((play, index) => {
      this.trackPlaylist.push({
        'id': play._id,
        'name': play.name
      });

    });
    this.playlistOptions = this.trackPlaylist;
    this.createPlaylistModal.open();

  }
  updatePlaylist() {
    this.playlists['vid'] = this.vId;
    this.playlists['eId'] = this.eId;
    this.playlists['eStrat'] = this.eStrat;
    this.playlists['eEnd'] = this.eEnd;
    this.playlists['eName'] = this.eName;
    this.playlists['eTeam'] = this.eTeam;
    this.playlists['playlistId'] = this.playlistModel;
    this.playlists['user'] = this.userService.user._id;
    this.playlists['token'] = this.userService.token;
    this.playlists['eventDataId'] = this.eventDataId;

    // console.log(this.multiplay);
    // console.log(this.multiPlaylist.length);
    // console.log(this.multiPlaylist);

    if (this.multiPlaylist.length > 0 && this.multiplay) {
      this.playlistService.updatePlaylistsEvents(this.multiPlaylist, this.playlists).subscribe(
        (response) => this.onGetUpdatePlaylistSuccess(response),
        (error) => this.onError(error)
      );
    } else {
      this.playlistService.updatePlaylists(this.playlists).subscribe(
        (response) => this.onGetUpdatePlaylistSuccess(response),
        (error) => this.onError(error)
      );
    }


  }
  onGetUpdatePlaylistSuccess(response) {
    this.deselectAll();
    const updateMsg = JSON.parse(response._body);
    // console.log(updateMsg.message);
    this.updateMessage = updateMsg.message;
    setTimeout(() => {
      this.createPlaylistModal.close()
      this.updateMessage = '';
    }, 1500);
    
  }
  addPlaylist() {

    this.playlists['vid'] = this.vId;
    this.playlists['eId'] = this.eId;
    this.playlists['eStrat'] = this.eStrat;
    this.playlists['eEnd'] = this.eEnd;
    this.playlists['eName'] = this.eName;
    this.playlists['eTeam'] = this.eTeam;
    this.playlists['playlistName'] = this.playlistName;
    this.playlists['user'] = this.userService.user._id;
    this.playlists['token'] = this.userService.token;
    this.playlists['eventDataId'] = this.eventDataId;
    // console.log(this.multiplay);
    // console.log('playlist', this.multiPlaylist);

    if (this.multiPlaylist.length > 0 && this.multiplay) {
      this.playlistService.createPlaylistsEvents(this.multiPlaylist, this.playlists).subscribe(
        (response) => this.onAddPlaylistSuccess(response),
        (error) => this.onError(error)
      );
    } else {
      this.playlistService.createPlaylists(this.playlists).subscribe(
        (response) => this.onAddPlaylistSuccess(response),
        (error) => this.onError(error)
      );
    }
  }

  onAddPlaylistSuccess(response) {
    this.deselectAll();
    const saveMsg = JSON.parse(response._body);

    this.saveMessage = saveMsg.message;
    this.saveClass = saveMsg.success;
    setTimeout(() => {
      this.createPlaylistModal.close()
      this.saveMessage = '';
    }, 1500);
    
  }
  onChangeEvent(e) {

  }
  onScrubBarMove(e, Container) {

    // console.log(this.api.getDefaultMedia().duration);
    // console.log(e.clientX / Container.width * this.api.getDefaultMedia().duration)
  }

  selectEvent(e, event) {

    event.checked = e.checked;
    if (e.checked) {
      this.multiPlaylist.push(event);
    } else {
      this.multiPlaylist = this.multiPlaylist.filter(item => item !== event);
    }
  }
  deselectAll() {
    this.multiplay = false;
    this.multiPlaylist = [];

    this.trackingJsonData.forEach((event, index) => {
      event.checked = false;
    });
    // console.log(this.multiPlaylist);
  }
  onKey(event) {
    this.keyCode = event.keyCode;
    if (this.api.duration <= 30) {
      var frameTime = this.api.duration / 5;
    } else {
      var frameTime = this.api.duration / 30;
    }

    if (this.keyCode == '32') {
      if (this.api.state == 'playing') {
        this.api.pause();
      } else {
        this.api.play();
      }
    }
    else if (this.keyCode == '39') {
      if (this.api.state == 'playing') {
        this.api.seekTime(this.api.currentTime + frameTime, false);
      }
    }
    else if (this.keyCode == '37') {
      if (this.api.state == 'playing') {
        this.api.seekTime(this.api.currentTime - frameTime, false);
      }
    }
  }

}
