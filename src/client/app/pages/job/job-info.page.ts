import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { DashboardService, LogService, MostUsedService, SystemConfigService } from './../../services';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { CusHttpService } from './../../services/custom-http.service';
import { EventNotifyService, EventType } from './../../services';

declare let $: any;
@Component({
  selector: 'job-info',
  templateUrl: './job-info.html',
  styleUrls: ['./job-info.css'],
})

export class JobInfoPage {
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

    private refresh(){
      
    }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }
}