import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { AlertComponent } from '../../alert/alert.component';

@Component({
  selector: 'app-device-input',
  templateUrl: './device-input.component.html',
  styleUrls: ['./device-input.component.scss']
})
export class DeviceInputComponent implements OnInit {
  data: any = {};
  form: FormGroup;
  startDate: string;
  endDate: string;
  en: any;
  isChosen = false;
  login: Observable<any> = new Observable<any>();
  page = 0;
  size = 15;
  orgList: Array<any>;
  count: number;
  deviceList: Array<any>;
  hasData: boolean;
  updateUrl = `http://119.29.144.125:8080/cgfeesys/User/setUserDetail`;
  cols: Array<any>;
  isAdd: boolean;
  keys: Array<any>;
  selectedDevice: string;
  selectionMode = 'single';
  searchOrg: Array<any>;
  initForm: any;
  param: any = {
    page: this.page,
    size: this.size
  };
  requiredItems = {
    assetName: '设备名称',
    assetType: '设备类型',
    assetState: '设备状态',
    buyNum: '购置数量',
    assetLife: '理论年限'
  };
  bsModalRef: BsModalRef;

  constructor(
    private http: Http,
    private store: Store<any>,
    private modalService: BsModalService
  ) {
    this.form = new FormGroup({
      assetName: new FormControl('', Validators.nullValidator),
      assetType: new FormControl('', Validators.nullValidator),
      assetState: new FormControl('', Validators.nullValidator),
      useOrg: new FormControl('', Validators.nullValidator),
      buyDate: new FormControl('', Validators.nullValidator),
      buyNum: new FormControl('', Validators.nullValidator),
      assetLife: new FormControl('', Validators.nullValidator),
      assetModel: new FormControl('', Validators.nullValidator),
      assetNo: new FormControl('', Validators.nullValidator),
      assetUser: new FormControl('', Validators.nullValidator),
      scrapDate: new FormControl('', Validators.nullValidator)
    });
    this.searchOrg = [];
    this.keys = Object.keys(this.form.value);
    this.en = {
      firstDayOfWeek: 0,
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
    this.login = store.select('login');
    this.cols = [
      { field: 'assetName', header: '资产名称' },
      { field: 'assetType', header: '资产类别' },
      { field: 'assetState', header: '资产状态' },
      { field: 'assetModel', header: '设备型号' },
      { field: 'assetNo', header: '设备编号' },
      { field: 'assetUser', header: '设备管理人' },
      { field: 'useOrg', header: '资产单位' },
      { field: 'buyNum', header: '购置数量' },
      { field: 'assetLife', header: '资产理论年限' },
      { field: 'buyDate', header: '购置日期' },
      { field: 'scrapDate', header: '报废日期' }
    ];
    this.initForm = {
      assetName: '',
      assetType: '',
      assetState: '',
      useOrg: '',
      buyDate: '',
      buyNum: '',
      assetLife: '',
      assetModel: '',
      assetNo: '',
      assetUser: '',
      scrapDate: ''
    };
  }

  showConfirm() {
    if (this.selectedDevice) {
      const initialState = {
        title: '警告',
        message: '确认删除该记录？'
      };
      this.bsModalRef = this.modalService.show(ConfirmComponent, {initialState});
      this.bsModalRef.content.confirmEmit.subscribe(res => {
        this.staffLeave(this.selectedDevice);
        this.bsModalRef.hide();
      })
      this.bsModalRef.content.cancelEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    }else {
      const initialState = {
        title: '警告',
        message: '请选择一条记录！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    }
  }

  selectedOrg($event) {
    this.orgList = ($event);
  }

  selectedSearchOrg($event) {
    this.searchOrg = ($event);
  }
  getStaffInfo(staffId) {
    this.deviceList.forEach(item => {
      if (item.id === staffId) {
        this.form.patchValue(item);
        this.endDate = item.scrapDate;
        this.startDate = item.buyDate;
      }
    });
  }
  getInfo() {
    if (this.searchOrg.length !== 0) {
      this.param.orgList = this.searchOrg.map(el => el.data);
    } else {
      this.param.orgList = [this.orgList[0].data];
    }
    const myHeaders: Headers = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    this.http.post('http://119.29.144.125:8080/cgfeesys/FixedAsset/get', JSON.stringify(this.param) , {
              headers: myHeaders
            })
            .map(res => res.json())
            .subscribe(res => {
              if (res.code) {
                this.count = res.data.count;
                if (res.data.count > 0) {
                  this.hasData = true;
                  this.deviceList = res.data.fixedAssetDataList;
                }
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

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth();
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    } else {
      return '';
    }
  }

  add() {
    this.form.reset();
    this.form.patchValue(this.initForm);
    // this.form.patchValue({orgName: this.orgName});
    this.isChosen = true;
    this.isAdd = true;
  }

  search() {
    if (this.searchOrg && this.searchOrg.length !== 0) {
      this.getInfo();
      this.toFirstPage();
    } else {
      const initialState = {
        title: '警告',
        message: '请输入要查询的设备！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    }
  }

  update() {
    if (this.selectedDevice) {
      this.getStaffInfo(this.selectedDevice);
      this.isChosen = true;
      this.isAdd = false;
    } else {
      const initialState = {
        title: '警告',
        message: '请选择一个设备！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    }
  }

  delete() {
    this.showConfirm();
  }

  select(val) {
    this.selectedDevice = val === this.selectedDevice ? '' : val;
  }

  check(val) {
    return val === this.selectedDevice;
  }

  staffLeave(selectedUser) {
    this.http.get(`http://119.29.144.125:8080/cgfeesys/FixedAsset/delete?id=${selectedUser}`)
            .map(res => res.json())
            .subscribe(res => {
              const initialState = {
                title: '通知',
                message: res.message
              };
              this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
              this.bsModalRef.content.submitEmit.subscribe(res => {
                this.bsModalRef.hide();
              })
              if (res.code) {
                this.toFirstPage();
              }
            });
  }

  addDevice() {
    const spaceArr = [];
    Object.keys(this.requiredItems).forEach(item => {
      if (this.form.value[item] === '') {
        spaceArr.push(this.requiredItems[item]);
      }
    });
    // const spaceArr = this.keys.filter(el => !this.form.value[el] && this.form.value[el] !== 0).map(el => this.requiredItems[el]);
    if (spaceArr.length > 0) {
      const initialState = {
        title: '警告',
        message: `${spaceArr.join(',')}为空`
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    } else if (!this.startDate) {
      const initialState = {
        title: '警告',
        message: '请选择购置日期！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    } else {
      const myHeaders: Headers = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      this.form.value.buyDate = this.dateFormat(this.startDate);
      this.form.value.scrapDate = this.dateFormat(this.endDate);
      this.form.value.useOrg = this.orgList[0].data;
      this.http.post(`http://119.29.144.125:8080/cgfeesys/FixedAsset/add`, JSON.stringify(this.form.value), {
                headers: myHeaders
              })
              .map(res => res.json())
              .subscribe(res => {
                if (res.code) {
                  const initialState = {
                    title: '',
                    message: '未选择机构！'
                  };
                  this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
                  this.bsModalRef.content.submitEmit.subscribe(res => {
                    this.bsModalRef.hide();
                  })
                  this.toFirstPage();
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
  }

  updateDevice() {
    const spaceArr = this.keys.filter(el => !this.form.value[el] && this.form.value[el] !== 0).map(el => this.requiredItems[el]);
    if (spaceArr.length > 0) {
      const initialState = {
        title: '警告',
        message: `${spaceArr.join(',')}为空`
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    } else if (!this.startDate) {
      const initialState = {
        title: '警告',
        message: '请选择购置日期！'
      };
      this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
      this.bsModalRef.content.submitEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    } else {
      const myHeaders: Headers = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const keys = Object.keys(this.form.value);
      keys.forEach(el => {
        this.data[el] = this.form.value[el];
      });
      this.data.id = this.selectedDevice;
      this.data.buyDate = this.dateFormat(this.startDate);
      this.data.scrapDate = this.dateFormat(this.endDate);
      this.data.useOrg = this.orgList[0].data;
      this.http.post(`http://119.29.144.125:8080/cgfeesys/FixedAsset/update`, JSON.stringify(this.data), {
                headers: myHeaders
              })
              .map(res => res.json())
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
                  this.toFirstPage();
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
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  submit() {
    if (this.isAdd) {
      this.addDevice();
    } else {
      this.updateDevice();
    }
  }

  toFirstPage() {
    this.selectedDevice = '';
    if (document.getElementsByClassName('ui-paginator-page')[0]) {
      const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
      this.isChosen = false;
      element.click();
    } else {
      this.param.page = 0;
      this.getInfo();
    }
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin) {
        this.orgList = [{data: res.orgCode, label: res.orgName}];
        this.getInfo();
      }
    });
  }
}

