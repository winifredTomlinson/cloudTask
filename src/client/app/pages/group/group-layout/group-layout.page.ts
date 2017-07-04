import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { GroupService, MostUsedService } from './../../../services';
import { CusHttpService } from './../../../services/custom-http.service';

declare let $: any;
declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-group-layout',
  templateUrl: './group-layout.html',
  styleUrls: ['./group-layout.css'],
  animations: [
    trigger('groupMenuState', [
      state('inactive', style({
        height: 0,
        display: 'block'
      })),
      state('active', style({
        height: '*',
        display: 'block'
      })),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out'))
    ])
  ]
})
export class GroupLayoutPage {

  @ViewChild('groupTreePanel')
  private groupTreePanel: ElementRef;

  private selectedGroupId: any;
  private groups: Array<any>;
  private filterGroups: Array<any>;  
  private currentGroups: Array<any>;
  private currentJobs: Array<any>;
  private assignTableModalOptions:any = {};

  private routerEventSubscriber: any;

  constructor(
    private _http: CusHttpService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _groupService: GroupService,
    private _mostUsedService: MostUsedService) {

  }

  ngOnInit() {
    this.groups = this._route.snapshot.data['groups'].data.worklocation;
    // if (this.groups.length > 0) {
    //   this.selectedGroupId = this.groups[0].ID;
    // }
    let guidRex = /^[0-9a-z]{8,8}-[0-9a-z]{4,4}-[0-9a-z]{4,4}-[0-9a-z]{4,4}-[0-9a-z]{12,12}$/;
    this.routerEventSubscriber = this._router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        $('body').scrollTop(0);
        let currentUrl = this._router.url.toLowerCase();
        let paths = currentUrl.split('/');
        for (let path of paths) {
          if (!path) continue;
          if (guidRex.test(path)) {
            this.selectedGroupId = path;
            break;
          }
        }
      }
    });

    this.assignTableModalOptions = {
      show: false,
      title: 'Assign Table',
      hideCloseBtn: true,
      hideFooter: true
    };
  }

  ngOnDestroy() {
    this.routerEventSubscriber.unsubscribe();
  }

  ngAfterViewInit() {
    if (!this.groups || this.groups.length === 0) return;
    $(window, ".wrapper").resize(() => {
      this.fixGroupTreePanel();
    });
    this.fixGroupTreePanel();
  }

  private addToMostUsed(groupId: any, server: any) {
    let add = server.Name || server.IP;
    this._mostUsedService.add(add, groupId);
  }

  private fixGroupTreePanel() {
    let panel = this.groupTreePanel.nativeElement;
    $(panel).slimScroll({ destroy: true }).height("auto");
    $(panel).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }

  private toggleMenus(groupId: any) {
    if (this.selectedGroupId === groupId) {
      this.selectedGroupId = null;
    } else {
      this.selectedGroupId = groupId;
    }
  }

  private showAssignTable(){
    this.assignTableModalOptions.show = true;
    let locationName = this.currentGroups[0].location;
    let url = `http://10.16.75.24:3000/cloudtask/v2/locations/${locationName}/jobsalloc`;
    this._http.get(url)
        .then((res: any) => {
          let jobs = res.json() || [];
          console.log(jobs);
          this.currentJobs = jobs.data.alloc.data;
          console.log(this.currentJobs);
          let currentServerName = this.currentGroups[0].name;
          this.currentJobs.map(job => job.name = currentServerName);
        })
  }

    private selectNode(groupId: any) {
      this.selectedGroupId = groupId;
      this.currentGroups = this.groups[groupId].server;
      this.currentGroups.map(group => group.location = this.groups[groupId].location);
      // this.currentJobs = this.groups[groupId].group;
  }
}
