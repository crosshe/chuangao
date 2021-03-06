import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss']
})
export class LineComponent implements OnInit {
  login: Observable<any>;
  form: FormGroup;
  checkItem: string;
  keys: Array<string>;
  uploading = false;
  data: any;

  constructor(
    private http: Http,
    private store: Store<any>
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      enlaneDesignCount: new FormControl('', Validators.nullValidator),
      enlaneMtcCount: new FormControl('', Validators.nullValidator),
      enlaneBlendCount: new FormControl('', Validators.nullValidator),
      enlaneWeightCount: new FormControl('', Validators.nullValidator),
      enlaneFactCount: new FormControl('', Validators.nullValidator),
      enlaneEtcCount: new FormControl('', Validators.nullValidator),
      enlaneUlTraWideWidth: new FormControl('', Validators.nullValidator),
      enlaneAutoCount: new FormControl('', Validators.nullValidator),
      exlaneDesignCount: new FormControl('', Validators.nullValidator),
      exlaneMtcCount: new FormControl('', Validators.nullValidator),
      exlaneBlendCount: new FormControl('', Validators.nullValidator),
      exlaneWeightCount: new FormControl('', Validators.nullValidator),
      exlaneFactCount: new FormControl('', Validators.nullValidator),
      exlaneEtcCount: new FormControl('', Validators.nullValidator),
      exlaneUlTraWideWidth: new FormControl('', Validators.nullValidator),
      agriculTuralCheckCount: new FormControl('', Validators.nullValidator),
      laneMultipleCount: new FormControl('', Validators.nullValidator),
      laneVariableCount: new FormControl('', Validators.nullValidator),
      laneEmergencyCount: new FormControl('', Validators.nullValidator)
    });
    this.keys = Object.keys(this.form.value);
  }

  getInfo(orgCode) {
    this.uploading = true;
    this.http.get(`http://119.29.144.125:8080/cgfeesys/BaseInfo/getStationInfo?stationCode=${orgCode}`)
            .map(res => res.json())
            .subscribe(res => {
              if (res.code) {
                this.data = res.data;
                this.form.patchValue(res.data);
                this.checkItem = res.data.status;
              }else {
                alert(res.message);
              }
              this.uploading = false;
            }, error => {
              alert('获取信息失败！');
              this.uploading = false;
            });
  }

  submit() {
    // const spaceArr = this.keys.filter(el => !this.form.value[el]).map(el => this.trans[el]);
    // if (spaceArr.length > 0) {
    //   alert(`${spaceArr.join(',')}为空`);
    // }else {
    const myHeaders: Headers = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    this.keys.forEach(el => {
      this.data[el] = this.form.value[el];
    });
    this.http.post('http://119.29.144.125:8080/cgfeesys/BaseInfo/setDefaultStation', JSON.stringify(this.data), {
      headers: myHeaders
    }).map(res => res.json())
      .subscribe(res => {
        alert(res.message);
      });
    // }
  }

  check($event) {
    this.checkItem = $event.target.value;
  }

  test(val) {
    return val === +this.checkItem;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.orgType === 3) {
        this.getInfo(res.orgCode);
      }
    });
    window.scrollTo(0, 0);
  }
}
