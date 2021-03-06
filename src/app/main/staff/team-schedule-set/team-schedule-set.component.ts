import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { work_post, politics, educational } from '../../../store/translate';

@Component({
  selector: 'app-team-schedule-set',
  templateUrl: './team-schedule-set.component.html',
  styleUrls: ['./team-schedule-set.component.scss']
})
export class TeamScheduleSetComponent implements OnInit {
  form: FormGroup;
  login: Observable<any> = new Observable<any>();
  startTime: string;
  endTime: string;
  modList: Array<any>;
  orgCode: string;
  en: any;

  constructor(
    private http: Http,
    private store: Store<any>
  ) {
    this.form = new FormGroup({
      scheduleType: new FormControl('', Validators.nullValidator)
    });
    this.login = store.select('login');
    this.en = {
      firstDayOfWeek: 0,
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
  }

  getInfo() {
    const myHeaders: Headers = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    this.http.get(`http://119.29.144.125:8080/cgfeesys/Schedule/getScheduleMould?stationCode=${this.orgCode}`)
            .map(res => res.json())
            .subscribe(res => {
              if (res.code) {
                this.modList = res.data;
              }else {
                alert(res.message);
              }
            });
  }

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth();
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    }else {
      return '';
    }
  }

  submit() {
    if (!this.form.value.scheduleType) {
      alert('请选择模板！');
    }else if (!this.startTime) {
      alert('请选择开始时间');
    }else if (!this.endTime) {
      alert('请选择结束时间');
    }else {
      const myHeaders: Headers = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      this.http.post('http://119.29.144.125:8080/cgfeesys/Schedule/setTeamSchedule', JSON.stringify({
        stationCode: this.orgCode,
        scheduleType: +this.form.value.scheduleType,
        startTime: this.dateFormat(this.startTime),
        endTime: this.dateFormat(this.endTime)
      }), {
        headers: myHeaders
      }).map(res => res.json())
        .subscribe(res => {
          if (res.code) {
            alert(res.message);
          }
        });
    }
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.orgType === 3) {
        this.orgCode = res.orgCode;
        this.getInfo();
      }
    });
  }

}
