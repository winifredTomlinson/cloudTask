import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { DashboardService, LogService, MostUsedService, SystemConfigService } from './../../services';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { CusHttpService } from './../../services/custom-http.service';
import { EventNotifyService, EventType } from './../../services';

declare let $: any;
@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.css'],
  templateUrl: './dashboard.html',
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

export class DashboardPage {
  @ViewChild('secondSidebar')
  private secondSidebar: ElementRef;
  private sideBar: HTMLElement;

  private selectedGroupId: any;
  private dashboardInfo: any = {};
  private logs: Array<any>;
  private mostUsedServers: Array<any>;
  private systemConfig: any;
  private locations: Array<any>;
  private groups: Array<any>;
  private jobs: Array<any>;
  private detailId: any;
  private baseUrl: string;

  private subscribers: Array<any> = [];
  constructor(
    private _http: CusHttpService,
    private _route: ActivatedRoute,
    private _eventNotifyService: EventNotifyService,
    private _dashboardService: DashboardService,
    private _logService: LogService,
    private _mostUsedService: MostUsedService,
    private _systemConfigService: SystemConfigService) {
    this.baseUrl = 'http://10.16.75.24:3000/cloudtask/v2';
  }

  ngOnInit() {
    let url = `${this.baseUrl}/locations`;
    this._http.get(url)
        .then((res: any) => {
          let jobs = res.json() || [];
          this.locations = jobs.data.worklocation;
          this.groups = this.locations.map((item) => item.group);
        })
    this.selectedGroupId = 0;
    this._eventNotifyService.subscribe(EventType.SidebarMini, (state: any) => {
      if (window.innerWidth < 767) {
        state = !state;
      }
      if (state) {
        $(this.sideBar).slimScroll({ destroy: true }).height("auto");
        this.sideBar.style.overflow = null;
      } else {
        this.fixSidebar();
      }
    });


    let systemSubscriber = this._systemConfigService.ConfigSubject.subscribe(data => {
      this.systemConfig = data;
    });
    this.subscribers.push(systemSubscriber);
    this._logService.getLog('', 10, 1).then((data) => {
      this.logs = data.rows;
    }).catch((err) => {
      console.error('Get top logs error', err);
    });

    this.mostUsedServers = this._mostUsedService.get();
  }

  ngAfterViewInit() {
    this.sideBar = this.secondSidebar.nativeElement.querySelector('.sidebar');
    $(window, ".wrapper").resize(() => {
      this.fixSidebar();
    });
    this.fixSidebar();
  }

  private fixSidebar() {
    console.log('=============----------------===========');    
    $(this.sideBar).slimScroll({ destroy: true }).height("auto");
    $(this.sideBar).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }

    private toggleMenus(groupIndex: any) {
      if (this.selectedGroupId === groupIndex) {
        this.selectedGroupId = null;
      } else {
        this.selectedGroupId = groupIndex;
      }
    }
    private getJobs(groupId: any){
      let url = `${this.baseUrl}/groups/${groupId}/jobs`;
      this._http.get(url)
        .then((res: any) => {
          let jobs = res.json() || [];
          this.jobs = jobs.data.job;
          console.log(this.jobs);
        })
    }

    private toggleDetailBox(groupIndex: any) {
      if (this.detailId === groupIndex) {
        this.detailId = null;
      } else {
        this.detailId = groupIndex;
      }
    }

    private refresh(){
      
    }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }
}