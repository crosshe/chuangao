import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AlertComponent } from '../../alert/alert.component';

@Component({
  selector: 'app-talk-count',
  templateUrl: './talk-count.component.html',
  styleUrls: ['./talk-count.component.scss']
})
export class TalkCountComponent implements OnInit {
  cols: Array<any>;
  rows: Array<any>;
  options: any;
  selectionMode = 'single';
  orgList: Array<any>;
  year: string;
  yearList: Array<number> = [];
  quarter: string;
  staffList: Array<Object>;
  staff: any;
  updateOptions: any;
  orgType: number;
  orgCode: string;
  orgName: string;
  isChoose: boolean;
  login: Observable<any> = new Observable<any>();
  xAxisData: any;
  data1: Array<any>;
  data2: Array<any>;
  reasonList: Array<any>;
  bsModalRef: BsModalRef;

  constructor(
    private http: Http,
    private store: Store<any>,
    private modalService: BsModalService
  ) {
    this.quarter = '1';
    this.data1 = [];
    this.data2 = [];
    this.reasonList = [];
    this.staffList = [];
    this.isChoose = false;
    this.login = store.select('login');
  }

  selectedOrg($event) {
    this.orgList = $event;
    this.getStaff();
  }

  search() {
    if (!this.orgList || this.orgList.length <= 0 || this.orgList.filter(el => el.orgType !== 3).length) {
      const initialState = {
        title: '警告',
        message: '请选择收费站！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    } else if (!this.year) {
      const initialState = {
        title: '警告',
        message: '请选择年份！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    } else if (!this.quarter) {
      const initialState = {
        title: '警告',
        message: '请选择季度！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    } else {
      this.getInfo();
    }
  }

  getInfo() {
    this.http.get(`http://119.29.144.125:8080/cgfeesys/Chat/getStatistics?stationCode=${this.orgList[0].data}&year=${this.year}&quarter=${this.quarter}`)
    .map(res => res.json())
      .subscribe(res => {
        if (res.code) {
          this.reasonList = res.data.reasonList;
          this.updateChart(res.data.chatList);
        }
      });
  }

  getStaff() {
    this.http.get(`http://119.29.144.125:8080/cgfeesys/BaseInfo/getStationUserId?stationCode=${this.orgList[0].data}`)
            .map(res => res.json())
            .subscribe(res => {
              if (res.code) {
                this.staffList = res.data;
              }
            });
  }
  updateChart(arr) {
    this.data1 = [];
    this.data2 = [];
    this.xAxisData = [];
    arr.forEach(item => {
      if (!this.xAxisData.includes(item.userName)) {
        this.xAxisData.push(item.userName);
        if (item.chatType === 0) {
          this.data1.push(1);
          this.data2.push(0);
        } else if (item.chatType === 1) {
          this.data2.push(1);
          this.data1.push(0);
        }
      } else {
        if (item.chatType === 0) {
          this.data1[this.xAxisData.indexOf(item.userName)] += 1;
        } else if (item.chatType === 1) {
          this.data2[this.xAxisData.indexOf(item.userName)] += 1;
        }
      }
    });
    this.staffList = this.staffList.filter(item => {
      return !this.xAxisData.includes(item['userName']);
    });
    this.staffList.forEach(item => {
      item['reason'] = '';
      this.reasonList.forEach(ele => {
        if (ele.userName === item['userName']) {
          item['reason'] = ele.reason;
        }
      });
    });
    const series: any = [{
      name: '一般谈心',
      type: 'bar',
      stack: 'one',
      data: this.data1
    }, {
      name: '重要谈心',
      type: 'bar',
      stack: 'one',
      data: this.data2
    }];
    this.updateOptions = {
      series: series,
      xAxis: {
        data: this.xAxisData
      }
    };
  }
  show (obj) {
    this.isChoose = true;
    this.staff = obj;
  }
  saveReason () {
    const myHeaders: Headers = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const param = {
      stationCode: this.orgList[0].data,
      year: this.year,
      quarter: this.quarter,
      userId: this.staff.userId,
      reason: this.staff.reason
    };
    this.http.post('http://119.29.144.125:8080/cgfeesys/Chat/addNoChatReason', JSON.stringify(param) , {
      headers: myHeaders
    }).map(res => res.json())
    .subscribe(res => {
      if (res.code) {
        const initialState = {
          title: '通知',
          message: res.message
        };
        this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
        this.bsModalRef.content.submitEmit.subscribe(res => {
          this.bsModalRef.hide();
        })
        this.isChoose = false;
      } else {
        const initialState = {
          title: '警告',
          message: res.message
        };
        this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
        this.bsModalRef.content.submitEmit.subscribe(res => {
          this.bsModalRef.hide();
        })
      }
    });
  }
  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgType = res.orgType;
        this.orgCode = res.orgCode;
        this.orgName = res.orgName;
        this.orgList = [{
          data: res.orgCode,
          label: res.orgName
        }];
        if (this.orgType === 3) {
          this.getStaff();
          this.getInfo();
        }
      }
    });

    const year = (new Date()).getFullYear();
    for (let i = 0; i < 10; i++) {
      this.yearList[i] = year - i;
    }
    this.year = '' + year;
    this.options = {
      legend: {
        data: ['一般谈心', '重要谈心'],
        align: 'right'
      },
      tooltip: {},
      xAxis: {
        data: this.xAxisData,
        type: 'category',
        name: '谈心对象',
      },
      yAxis: {
        type: 'value',
        name: '谈心次数'
      },
      series: [{
        name: '一般谈心',
        type: 'bar',
        stack: 'one',
        data: this.data1,
        itemStyle: {
          color: '#6c9cff',
        },
        emphasis: {
          barMaxWidth: '50px'
        }
      }, {
        name: '重要谈心',
        type: 'bar',
        stack: 'one',
        data: this.data2,
        itemStyle: {
          color: '#ff966d'
        },
        emphasis: {
          barMaxWidth: '50px'
        }
      }]
    };
  }
}
