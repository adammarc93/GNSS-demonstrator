import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  QueryList,
  ViewChildren,
  Renderer2
} from '@angular/core';
import { NgForm } from '@angular/forms';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { Result } from '../_models/Result';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import { GameService } from '../_services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit {
  bsConfig: Partial<BsDatepickerConfig>;
  @ViewChild('game') gameForm: NgForm;
  buttonEnabled = true;

  // script
  dst: string;
  rad: number;
  ob0: number[];
  el0: number[];
  alm: any;
  tle0: any;
  tmask: number;
  tle: any;
  alm2: any;
  te: any;
  tidx: number;
  tsec: number;
  hdopth: number;
  max_points: number;
  dt: Date;

  //game
  result: Result;
  selectedSatellites: any[];
  counter: number;
  avgHDOP: number;
  interval: number;
  isStoped: boolean;

  @ViewChild('timeRange') slider: ElementRef;
  @ViewChild('timeInfo') sliderInfo: ElementRef;
  @ViewChild('date') dateinp: ElementRef;
  @ViewChild('trackPoint') slider2: ElementRef;
  @ViewChild('trackInfo') slider2Info: ElementRef;

  // g()
  @ViewChild('bd') bd: ElementRef;
  @ViewChild('ga') ga: ElementRef;
  @ViewChild('gl') gl: ElementRef;
  @ViewChild('gp') gp: ElementRef;

  // plotTrack()
  @ViewChild('fig3') fig3: ElementRef;
  @ViewChild('xmin3') xmin3: ElementRef;

  @ViewChild('xhalf3') xhalf3: ElementRef;
  @ViewChild('xmax3') xmax3: ElementRef;
  @ViewChild('ymin3') ymin3: ElementRef;
  @ViewChild('yhalf3') yhalf3: ElementRef;
  @ViewChild('ymax3') ymax3: ElementRef;

  // draw functions
  @ViewChildren('ch') ch: QueryList<ElementRef>;
  @ViewChildren('a') a: QueryList<ElementRef>;
  @ViewChildren('v') v: QueryList<ElementRef>;
  @ViewChildren('p') p: QueryList<ElementRef>;
  @ViewChildren('s') s: QueryList<ElementRef>;

  // Fig 3
  @ViewChild('t0') t0: ElementRef;
  @ViewChild('g3') svg: HTMLElement;

  @ViewChild('fig1') fig1: ElementRef;
  @ViewChild('fig2') fig2: ElementRef;

  @ViewChildren('dst') tables: QueryList<ElementRef>;

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private alertify: AlertifyService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.result = new Result();
    this.bsConfig = Object.assign(
      {},
      { dateInputFormat: 'YYYY-MM-DD', containerClass: 'theme-dark-blue' }
    );
    this.buttonEnabled = true;
  }

  ngAfterViewInit() {
    this.loadVariables();
  }

  setResult() {
    this.gameService
      .setResult(this.authService.decodedToken.nameid, this.result)
      .subscribe(
        next => {
          this.alertify.success('Wynik zapisany');
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  // game
  satelliteClick(event: any) {
    let selected = this.s.find(
      el => el.nativeElement.id == event.srcElement.id
    );

    let index = this.selectedSatellites.findIndex(
      el => el == selected.nativeElement.id
    );

    if (index > -1) {
      this.selectedSatellites.splice(index, 1);
      this.renderer.setAttribute(selected.nativeElement, 'stroke', '');
      this.renderer.setAttribute(selected.nativeElement, 'stroke-width', '');

      return;
    }

    let first: ElementRef;

    this.renderer.setAttribute(selected.nativeElement, 'stroke', 'black');
    this.renderer.setAttribute(selected.nativeElement, 'stroke-width', '3');

    this.selectedSatellites.push(event.srcElement.id);

    if (this.selectedSatellites.length > 4) {
      first = this.s.find(
        el => el.nativeElement.id == this.selectedSatellites[0]
      );
      this.selectedSatellites = this.selectedSatellites.slice(1, 5);
      this.renderer.setAttribute(first.nativeElement, 'stroke', '');
      this.renderer.setAttribute(first.nativeElement, 'stroke-width', '');
      first = null;
    }
  }

  clearSatellitesCollection(array : any[]) {
    let preparedCollection = this.prepareSatellitesCollection(
      this.selectedSatellites
    );

    preparedCollection.forEach(s => {
      let find = array.find(el => el[2] == s);

      if (find == undefined) {
        let id = 's' + s;
        let index = this.selectedSatellites.findIndex(ss => ss == id);
        let selected = this.s.find(el => el.nativeElement.id == id);

        this.selectedSatellites.splice(index, 1);
        this.renderer.setAttribute(selected.nativeElement, 'stroke', '');
        this.renderer.setAttribute(selected.nativeElement, 'stroke-width', '');
      }
    });
  }

  moveSlider() {
    let myVar = setInterval(() => {
      this.slider.nativeElement.value =
        Number(this.slider.nativeElement.value) + 50;
      this.sliderOnInput();

      if (this.isStoped) {
        clearInterval(myVar);
      }

      if (Number(this.slider.nativeElement.value) >= 86400) {
        this.setResult();
        clearInterval(myVar);
        this.stopGame();
      }
    }, this.interval);
  }

  prepareSatellitesCollection(array: any[]) {
    let result: number[] = [];

    array.forEach(el => {
      result.push(parseInt(el.toString().slice(1)));
    });

    return result;
  }

  prepareCollection(array: any[]) {
    let result = [];
    let prepareArray = this.prepareSatellitesCollection(
      this.selectedSatellites
    );

    array.forEach(el => {
      prepareArray.forEach(s => {
        if (el[2] == s) {
          result.push(el);
        }
      });
    });

    return result;
  }

  countAvgHDOP(hdop: number) {
    if (!Number.isNaN(hdop) && hdop < 10) {
      this.counter++;

      if (this.counter == 1) {
        this.avgHDOP = hdop;
      } else {
        this.avgHDOP =
          (this.avgHDOP * (this.counter - 1) + hdop) / this.counter;
      }
    }
  }

  countResult(hdop: number) {
    if (!Number.isNaN(hdop) && hdop < 10) {
      this.counter++;
      this.result.value = (this.counter * this.interval) / 1000;
    }
  }

  startGame() {
    this.buttonEnabled = false;
    this.loadVariables();
    this.slider2Oninput();
    this.moveSlider();
  }

  stopGame() {
    this.buttonEnabled = true;
    this.isStoped = true;
  }

  // script
  loadVariables() {
    this.selectedSatellites = [];
    this.counter = 0;
    this.result.value = 0;
    this.interval = 50;
    this.isStoped = false;

    this.dst = 'p';
    this.rad = Math.PI / 180;
    this.ob0 = [54.41519308 * this.rad, 18.56955655 * this.rad, 16.3];
    this.el0 = [
      61,
      52,
      54,
      50,
      34,
      27,
      8,
      9,
      13,
      20,
      43,
      47,
      52,
      47,
      20,
      15,
      8,
      7,
      17,
      40,
      43,
      44,
      43,
      30,
      19,
      26,
      31,
      27,
      49,
      61,
      65,
      63,
      60,
      56,
      49,
      57
    ];
    this.alm = this.read_yuma(this.get_almanac());
    this.tle0 = this.read_tle(this.get_tle(), 0);
    this.tmask = 0x1111; // 1-gps 2-glonass 4-galileo 8-beidou
    this.tle = this.filter_tle(this.tle0, this.tmask);
    this.alm2 = this.read_tle(this.get_tle(), 1);
    this.te = this.read_track(this.get_track_elevation());
    this.tidx = 14;
    this.tsec = 0;
    this.hdopth = 0.8;
    this.max_points = 104;

    this.dt = new Date();

    this.slider.nativeElement.value = 0;
    this.slider2.nativeElement.value = Math.floor(Math.random() * 21);

    this.dt.setHours(0, 0, 0);
    this.dt.setSeconds(this.slider.nativeElement.value);
    this.sliderInfo.nativeElement.innerHTML = this.dt.toString();

    this.dateinp.nativeElement.value = this.dt.toISOString().substring(0, 10);

    this.slider2Info.nativeElement.innerHTML =
      'Track point number: ' + this.slider2.nativeElement.value;
    //this.slider2.nativeElement.setAttribute('max', this.te.length);
  }

  g() {
    var m = 0;

    if (this.bd.nativeElement.checked == true) {
      m |= 0x1000;
    }

    if (this.ga.nativeElement.checked == true) {
      m |= 0x0100;
    }

    if (this.gl.nativeElement.checked == true) {
      m |= 0x0010;
    }

    if (this.gp.nativeElement.checked == true) {
      m |= 0x0001;
    }

    // if (m == 0) {
    //   m = 1;
    //   this.bd.nativeElement.checked = true;
    //   this.ga.nativeElement.checked = true;
    //   this.gl.nativeElement.checked = true;
    //   this.gp.nativeElement.checked = true;
    // }

    this.tmask = m;
    this.tle = this.filter_tle(this.tle0, this.tmask);
    this.hdop_update();
  }

  filter_tle(tle: any[], m: number) {
    m = m || 0x1111;
    var b = [];

    for (let i = 0; i < tle.length; i++) {
      if (
        (this.is_gps(tle[i][1]) && m && 0x0001) ||
        (this.is_glonass(tle[i][1]) && m && 0x0010) ||
        (this.is_galileo(tle[i][1]) && m && 0x0100) ||
        (this.is_beidou(tle[i][1]) && m && 0x1000)
      ) {
        b.push(tle[i]);
      }
    }

    return b;
  }

  sliderOnInput() {
    var d = new Date();
    d.setHours(0, 0, 0);
    d.setSeconds(this.slider.nativeElement.value);

    this.tsec = Math.floor(d.getTime() / 1000);
    this.sliderInfo.nativeElement.innerHTML = d.toString();
    this.hdop_update();
  }

  dateinpOnchange() {
    const d = new Date(this.dateinp.nativeElement.value);
    this.tsec = Math.floor(d.getTime() / 1000);
    this.slider.nativeElement.value =
      d.getSeconds() + 60 * (d.getMinutes() + 60 * d.getHours());
    this.sliderInfo.nativeElement.innerHTML = d.toString();
    this.hdop_update();
  }

  slider2Oninput() {
    this.tidx = this.slider2.nativeElement.value - 1;
    this.slider2Info.nativeElement.innerHTML =
      'Track point number: ' + this.slider2.nativeElement.value;
    this.hdop_update();
  }

  plotTrack(xy: any[][], idx: number) {
    var xma = -999999;
    var xmi = 999999;
    var yma = -999999;
    var ymi = 999999;
    for (var i = 0; i < this.te.length; i++) {
      var x = xy[i][0];
      var y = xy[i][1];
      if (x < xmi) {
        xmi = x;
      }
      if (x > xma) {
        xma = x;
      }
      if (y < ymi) {
        ymi = y;
      }
      if (y > yma) {
        yma = y;
      }
    }

    var xmin = Math.floor(xmi / 20) * 20;
    var xmax = Math.floor((xma + 20) / 20) * 20;
    var ymin = Math.floor(ymi / 20) * 20;
    var ymax = Math.floor((yma + 20) / 20) * 20;
    var dx = xmax - xmin;
    var dy = ymax - ymin;
    var dd = dx > dy ? dx : dy;
    xmin = (xmin + xmax) / 2 - dd / 2;
    xmax = xmin + dd;
    ymin = (ymin + ymax) / 2 - dd / 2;
    ymax = ymin + dd;

    var w = this.fig3.nativeElement.width.animVal.value;
    var h = this.fig3.nativeElement.height.animVal.value;
    var xo = this.fig3.nativeElement.x.animVal.value;
    var yo = this.fig3.nativeElement.y.animVal.value;

    this.xmin3.nativeElement.innerHTML = xmin;
    this.xhalf3.nativeElement.innerHTML = (xmin + xmax) / 2;
    this.xmax3.nativeElement.innerHTML = xmax;
    this.ymin3.nativeElement.innerHTML = ymin;
    this.yhalf3.nativeElement.innerHTML = (ymin + ymax) / 2;
    this.ymax3.nativeElement.innerHTML = ymax;

    for (var i = 0; i < this.te.length; i++) {
      var x = xy[i][0];
      var y = xy[i][1];
      var xx = xo + ((x - xmin) / (xmax - xmin)) * w;
      var yy = yo + ((ymax - y) / (ymax - ymin)) * h;

      this.plotPoint(xx, yy, i, idx);

      if (i == idx && xy[idx].length > 3) {
        var p = [];
        var N = xy[idx].length - 3;
        for (var j = 0; j <= N; j++) {
          var a = -Math.PI / 2 + (2 * Math.PI * j) / N;
          var b = 90 - xy[idx][(j % N) + 3];
          p.push([xx + b * Math.cos(a), yy + b * Math.sin(a)]);
        }

        this.plotLine(p, null); // null???
      }
    }
  }

  tidx_update(idx: any) {
    this.tidx = idx;
    this.slider2.nativeElement.value = this.tidx + 1;
    this.slider2Info.nativeElement.innerHTML =
      'Track point number: ' + this.slider2.nativeElement.value;
    this.hdop_update();
  }

  hdop_update() {
    this.hdop_calc(this.tsec, this.alm, this.te[this.tidx]);
    this.plotTrack(this.te, this.tidx);
  }

  hdop_calc(tk: number, alm: any, tei: number[]) {
    var rad = Math.PI / 180;
    var opt1 = 1; // 0-default visibilty 1-visibility array
    var va = 10 * rad;

    var ll = this.PUWG2ll([tei[0], tei[1]], 1);
    var lat = ll[0] / rad;
    var lon = ll[1] / rad;
    var alt = tei[2];
    var ve = [];
    var a = [];
    var N = tei.length - 3;
    for (let i = 0; i <= N; i++) {
      ve.push([opt1 == 1 ? tei[(i % N) + 3] * rad : va]);
      a.push([((i * 360) / N) * rad]);
    }

    this.chartEA(this.ea2xy(this.mjoin2(ve, a)));

    var rllad = [lat, lon, alt];
    var rlla = [rllad[0] * rad, rllad[1] * rad, rllad[2]];
    var rXY2000 = this.ll2PUWG([rlla[0], rlla[1]], null); // null ???
    var rXY1992 = this.ll2PUWG([rlla[0], rlla[1]], 1);
    var rll = this.PUWG2ll(rXY2000, null); // null ???
    var rxyz = this.lla2xyz([rlla]);

    this.dst = 'pppp';
    this.clear();
    this.tprinta(
      'recv,tidx,lat[deg],lon[deg],alt,X1992,Y1992',
      this.mjoin2([[this.tidx, lat, lon, alt]], [rXY1992])
    );
    this.dst = 'p';

    var slla = this.tle2lla(tk, this.tle);
    var sxyz = this.lla2xyz(slla);

    var ea = this.elavazim(sxyz, rxyz);
    var dea = [];

    for (var i = 0; i < ea.length; i++) {
      dea.push([ea[i][0] / rad, ea[i][1] / rad]);
    }

    var sllad = [];

    for (var i = 0; i < slla.length; i++) {
      sllad.push([slla[i][0] / rad, slla[i][1] / rad]);
    }

    var vea = [];
    for (var i = 0; i < ea.length; i++) {
      if (ea[i][0] > this.visibility(ea[i][1], ve)) {
        vea.push([ea[i][0], ea[i][1], this.tle[i][1], i]);
      }
    }

    if (vea.length < 1) {
      return;
    }

    var dvea = [];
    for (var i = 0; i < vea.length; i++) {
      dvea.push([
        vea[i][0] / rad,
        vea[i][1] / rad,
        vea[i][2],
        sllad[vea[i][3]][0],
        sllad[vea[i][3]][1]
      ]);
    }

    this.dst = 'pp';
    this.clear();
    this.tprinta(
      'vsat,el[deg],az[deg],id,lat[deg],lon[deg]',
      this.prepareCollection(dvea)
    );
    this.dst = 'p';

    var xyea = this.ea2xy(vea);
    this.pointEA(xyea); // tprinta('xyea,x,y,id',xyea);

    vea = this.prepareCollection(vea);
    this.clearSatellitesCollection(vea);

    if (vea.length < 1) {
      return;
    }

    var A = [];
    for (var i = 0; i < vea.length; i++) {
      A.push([
        -Math.cos(vea[i][0]) * Math.cos(vea[i][1]),
        -Math.cos(vea[i][0]) * Math.sin(vea[i][1]),
        -Math.sin(vea[i][0]),
        -1
      ]);
    }

    var AT = this.transpose(A); // tprinta('AT,1,2,3,4,...',AT);
    var ATA = this.mmul(AT, A); // tprinta('ATA,1,2,3,4',ATA);
    var Q = this.minv4(ATA); // tprinta('Q,1,2,3,4',Q);
    var HDOP = Math.sqrt(Q[0][0] + Q[1][1]);

    // this.countAvgHDOP(HDOP);
    this.countResult(HDOP);

    var tt = new Date(tk * 1000);
    this.dst = 'ppp';
    this.clear();
    this.tprinta2(',' + tt.toISOString() + ',hdop', [[tk, HDOP]], this.hdopth);
    this.dst = 'p';

    var ll_test = [];
    var ea = [];
    for (var t = tk - 12 * 600; t < tk + 12 * 600; t += 600) {
      slla = this.tle2lla(t, this.tle);
      sxyz = this.lla2xyz(slla);
      var elaz = this.elavazim(sxyz, rxyz);
      var lli = [];
      var eai = [];
      var rad = Math.PI / 180;

      for (var i = 0; i < slla.length; i++) {
        lli.push(slla[i][1] / rad);
        lli.push(slla[i][0] / rad);
        eai.push(elaz[i][0]);
        eai.push(elaz[i][1]);
      }
      ll_test.push(lli);
      ea.push(eai);
    }

    var ii = [];

    for (var i = 0; i < slla.length; i++) {
      ii.push(this.tle[i][1]);
    }

    this.chartXY1(ll_test, ii);
    this.pointXY1(ll_test[12], ii);

    var ea2 = [];
    ii = [];

    for (var i = 0; i < ea.length; i++) {
      var t1 = [];
      for (var j = 0; j < vea.length; j++) {
        t1.push(ea[i][2 * vea[j][3]]);
        t1.push(ea[i][2 * vea[j][3] + 1]);
        if (i == 0) {
          ii.push(vea[j][2]);
        }
      }
      ea2.push(t);
    }

    this.chartEA1(this.ea2xy2(ea2), ii);
  }

  visibility2(
    az: number,
    ela: { [x: string]: number; length: number },
    off: number
  ) {
    var N = ela.length - off;
    var daz = (2 * Math.PI) / N;
    var idx = Math.floor(az / daz);
    return (
      ela[idx + off] +
      ((az - daz * idx) * (ela[((idx + 1) % N) + off] - ela[idx + off])) / daz
    );
  }

  visibility(az: number, ela: any[] | number[][]) {
    var N = ela.length - 1;
    var daz = (2 * Math.PI) / N;
    var idx = Math.floor(az / daz);
    return (
      ela[idx][0] + ((az - daz * idx) * (ela[idx + 1][0] - ela[idx][0])) / daz
    );
  }

  ea2xy(ea: any[] | number[][]) {
    var rad = Math.PI / 180;
    var xy = [];
    for (var i = 0; i < ea.length; i++) {
      var r = (Math.PI / 2 - ea[i][0]) / rad;
      var ph = Math.PI / 2 - ea[i][1];
      var t = [r * Math.cos(ph), r * Math.sin(ph)];
      for (var j = 2; j < ea[i].length; j++) {
        t.push(ea[i][j]);
      }
      xy.push(t);
    }
    return xy;
  }

  ea2xy2(ea: any[] | number[][]) {
    var rad = Math.PI / 180;
    var xy = [];

    for (var i = 0; i < ea.length; i++) {
      var t = [];
      for (var j = 0; j < ea[i].length; j += 2) {
        var r = (Math.PI / 2 - ea[i][j]) / rad;
        var ph = Math.PI / 2 - ea[i][j + 1];
        t.push(r * Math.cos(ph));
        t.push(r * Math.sin(ph));
      }
      xy.push(t);
    }
    return xy;
  }

  calcHDOP2a(
    tk: any,
    tle: any,
    rlla: any,
    te: { [x: string]: number; length: number }
  ) {
    // using tle
    var slla = this.tle2lla(tk, tle);
    var sxyz = this.lla2xyz(slla);
    var ea = this.elavazim(sxyz, this.lla2xyz([rlla]));
    var ea1 = [];

    for (var i = 0; i < ea.length; i++) {
      var va = this.visibility2(ea[i][1], te, 3) * this.rad;
      if (ea[i][0] > va) {
        ea1.push(ea[i]);
      }
    }

    if (ea1.length < 2) {
      return NaN;
    }

    var A = [];

    for (var i = 0; i < ea1.length; i++) {
      A.push([
        -Math.cos(ea1[i][0]) * Math.cos(ea1[i][1]),
        -Math.cos(ea1[i][0]) * Math.sin(ea1[i][1]),
        -Math.sin(ea1[i][0]),
        -1
      ]);
    }

    var Q = this.minv4(this.mmul(this.transpose(A), A));

    return Math.sqrt(Q[0][0] + Q[1][1]);
  }

  calcHDOP2(
    tk: any,
    alm: any,
    rlla: any,
    te: { [x: string]: number; length: number }
  ) {
    // using alm
    var sxyz = this.alm2xyz(tk, alm);
    var ea = this.elavazim(sxyz, this.lla2xyz([rlla]));
    var ea1 = [];

    for (var i = 0; i < ea.length; i++) {
      var va = this.visibility2(ea[i][1], te, 3) * this.rad;
      if (ea[i][0] > va) {
        ea1.push(ea[i]);
      }
    }

    if (ea1.length < 2) {
      return NaN;
    }

    var A = [];

    for (var i = 0; i < ea1.length; i++) {
      A.push([
        -Math.cos(ea1[i][0]) * Math.cos(ea1[i][1]),
        -Math.cos(ea1[i][0]) * Math.sin(ea1[i][1]),
        -Math.sin(ea1[i][0]),
        -1
      ]);
    }

    var Q = this.minv4(this.mmul(this.transpose(A), A));
    return Math.sqrt(Q[0][0] + Q[1][1]);
  }

  calcHDOP(tk: any, alm: any, rlla: any) {
    var ea = this.elavazim(this.alm2xyz(tk, alm), this.lla2xyz([rlla]));
    var va = (10 * Math.PI) / 180;
    var ea1 = [];

    for (var i = 0; i < ea.length; i++) {
      if (ea[i][0] > va) {
        ea1.push(ea[i]);
      }
    }

    var A = [];

    for (var i = 0; i < ea1.length; i++) {
      A.push([
        -Math.cos(ea1[i][0]) * Math.cos(ea1[i][1]),
        -Math.cos(ea1[i][0]) * Math.sin(ea1[i][1]),
        -Math.sin(ea1[i][0]),
        -1
      ]);
    }

    var Q = this.minv4(this.mmul(this.transpose(A), A));

    return Math.sqrt(Q[0][0] + Q[1][1]);
  }

  clear() {
    this.tables.forEach(t => {
      if (t.nativeElement.id == this.dst) {
        t.nativeElement.innerHTML = '';
      }
    });
  }

  print(s: string) {
    this.tables.forEach(t => {
      if (t.nativeElement.id == this.dst) {
        t.nativeElement.innerHTML += s + '<br>\n';
      }
    });
  }

  printa(a: string[]) {
    for (var i = 0; i < a.length; i++) {
      this.print(a[i]);
    }
  }

  tprinta(
    t: string,
    a:
      | any[]
      | {
          toPrecision: (
            arg0: number
          ) => { replace: (arg0: RegExp, arg1: string) => string };
        }[][]
  ) {
    var s = '<table class="table table-striped table-dark mt-3">';
    var h = t.split(',');

    s += '<tr>';

    for (var j = 0; j < h.length; j++) {
      s += '<th>' + h[j] + '</th>';
    }

    s += '</tr>';

    for (var i = 0; i < a.length; i++) {
      s += '<tr><td>' + (i + 1) + '</td>';
      for (var j = 0; j < a[i].length; j++) {
        s += '<td>' + a[i][j].toPrecision(7).replace(/\.?0*$/, '') + '</td>';
      }
      s += '</tr>';
    }

    s += '</table>';
    this.print(s);
  }

  tprinta2(
    t: string,
    a:
      | number[][]
      | {
          toPrecision: (
            arg0: number
          ) => { replace: (arg0: RegExp, arg1: string) => string };
        }[][],
    th: number
  ) {
    var s = '<table class="table table-striped table-dark mt-3">';
    var h = t.split(',');

    s += '<tr>';

    for (var j = 0; j < h.length; j++) {
      if (j == 1) {
        let date = new Date(h[j]);
        s +=
          '<th >' +
          date.getFullYear() +
          '-' +
          date.getMonth() +
          '-' +
          date.getDay() +
          ' ' +
          date.getHours() +
          ':' +
          date.getMinutes() +
          '</th>';
      } else {
        s += '<th>' + h[j] + '</th>';
      }
    }

    s += '</tr>';

    for (var i = 0; i < a.length; i++) {
      s += '<tr><td>' + (i + 1) + '</td>';
      for (var j = 0; j < a[i].length; j++) {
        s +=
          '<td>' +
          a[i][j].toPrecision(j < 1 ? 6 : 3).replace(/\.?0*$/, '') +
          '</td>';
      }
      s += '</tr>';
    }

    s += '</table>';
    this.print(s);
  }

  // ---- svg drawing functions ----

  draw(s: any[] | string[]) {
    var i = 0;

    this.p.forEach(el => {
      this.renderer.setAttribute(el.nativeElement, 'points', '');
      this.renderer.setAttribute(
        el.nativeElement,
        'stroke',
        this.get_color(i + 1)
      );
      i++;
    });

    for (var i = 0; i < s.length; i++) {
      this.renderer.setAttribute(
        this.ch.toArray()[i].nativeElement,
        'points',
        s[i]
      );
      this.renderer.setAttribute(
        this.ch.toArray()[i].nativeElement,
        'stroke-dasharray',
        '2,2'
      );
    }
  }

  draw_id(s: any[] | string[], id: number[]) {
    var i = 0;

    this.p.forEach(el => {
      this.renderer.setAttribute(el.nativeElement, 'points', '');
      this.renderer.setAttribute(
        el.nativeElement,
        'stroke',
        this.get_color(i + 1)
      );
      i++;
    });

    for (var i = 0; i < s.length; i++) {
      this.renderer.setAttribute(
        this.ch.toArray()[id[i] - 1].nativeElement,
        'points',
        s[i]
      );
      this.renderer.setAttribute(
        this.ch.toArray()[id[i] - 1].nativeElement,
        'stroke-dasharray',
        '2,2'
      );
    }
  }

  draw1(s: any[] | string[]) {
    var i = 0;

    this.a.forEach(el => {
      this.renderer.setAttribute(el.nativeElement, 'points', '');
      this.renderer.setAttribute(
        el.nativeElement,
        'stroke',
        this.get_color(i + 1)
      );
      i++;
    });

    for (var i = 0; i < s.length; i++) {
      this.renderer.setAttribute(
        this.a.toArray()[i].nativeElement,
        'points',
        s[i]
      );
      this.renderer.setAttribute(
        this.a.toArray()[i].nativeElement,
        'stroke-dasharray',
        '2,2'
      );
      this.renderer.setAttribute(
        this.a.toArray()[i].nativeElement,
        'stroke-width',
        '3'
      );
    }
  }

  draw2(s: any[] | string[]) {
    for (var i = 0; i < s.length; i++) {
      this.renderer.setAttribute(
        this.v.toArray()[i].nativeElement,
        'points',
        s[i]
      );
    }
  }

  pointXY1(xy, id) {
    var w = 800;
    var h = 400;
    var xo = 100;
    var yo = 100;
    var xm = 180;
    var ym = 90;
    var i = 0;

    this.p.forEach(el => {
      this.renderer.setAttribute(el.nativeElement, 'cx', '-99');
      this.renderer.setAttribute(el.nativeElement, 'cy', '-99');
      this.renderer.setAttribute(
        el.nativeElement,
        'fill',
        this.get_color(i + 1)
      );
      i++;
    });

    for (var i = 0; i < xy.length; i += 2) {
      var ii = i / 2;

      if (this.p.toArray()[id[ii] - 1]) {
        this.renderer.setAttribute(
          this.p.toArray()[id[ii] - 1].nativeElement,
          'cx',
          (xo + (w / 2) * (1 + xy[i] / xm)).toString()
        );
        this.renderer.setAttribute(
          this.p.toArray()[id[ii] - 1].nativeElement,
          'cy',
          (yo + (h / 2) * (1 - xy[i + 1] / ym)).toString()
        );
        this.renderer.setAttribute(
          this.p.toArray()[id[ii] - 1].nativeElement,
          'onmousemove',
          "document.getElementById('status1').innerHTML=this.id.substring(1);"
        );
        this.renderer.setAttribute(
          this.p.toArray()[id[ii] - 1].nativeElement,
          'onmouseout',
          "document.getElementById('status1').innerHTML=''"
        );
      }
    }
  }

  chartXY1(data: any[] | number[][], id: any[] | number[]) {
    var s = new Array(data[0].length / 2).fill('');
    var w = 800;
    var h = 400;
    var xo = 100;
    var yo = 100;
    var xm = 180;
    var ym = 90;

    w = this.fig1.nativeElement.width.animVal.value;
    h = this.fig1.nativeElement.height.animVal.value;
    xo = this.fig1.nativeElement.x.animVal.value;
    yo = this.fig1.nativeElement.y.animVal.value;

    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[0].length; j += 2) {
        s[j / 2] +=
          ' ' +
          (xo + (w / 2) * (1 + data[i][j] / xm)) +
          ' ' +
          (yo + (h / 2) * (1 - data[i][j + 1] / ym)) +
          ' ';
      }
    }

    this.draw_id(s, id);
  }

  pointXY(xy: number[]) {
    var w = 800;
    var h = 400;
    var xo = 100;
    var yo = 100;
    var xm = 180;
    var ym = 90;

    var i = 0;

    this.p.forEach(el => {
      this.renderer.setAttribute(el.nativeElement, 'cx', '-99');
      this.renderer.setAttribute(el.nativeElement, 'cy', '-99');
      this.renderer.setAttribute(
        el.nativeElement,
        'fill',
        this.get_color(i + 1)
      );
      i++;
    });

    for (var i = 0; i < xy.length; i += 2) {
      var ii = i / 2;

      if (this.p.toArray()[ii - 1]) {
        this.renderer.setAttribute(
          this.p.toArray()[ii - 1].nativeElement,
          'cx',
          (xo + (w / 2) * (1 + xy[i] / xm)).toString()
        );
        this.renderer.setAttribute(
          this.p.toArray()[ii - 1].nativeElement,
          'cy',
          (yo + (h / 2) * (1 - xy[i + 1] / ym)).toString()
        );
        this.renderer.setAttribute(
          this.p.toArray()[ii - 1].nativeElement,
          'onmousemove',
          "document.getElementById('status1').innerHTML=this.id.substring(1);"
        );
        this.renderer.setAttribute(
          this.p.toArray()[ii - 1].nativeElement,
          'onmouseout',
          "document.getElementById('status1').innerHTML=''"
        );
      }
    }
  }

  chartXY(data: number[][]) {
    var s = new Array(data[0].length / 2).fill('');
    var w = 800;
    var h = 400;
    var xo = 100;
    var yo = 100;
    var xm = 180;
    var ym = 90;

    w = this.fig1.nativeElement.width.animVal.value;
    h = this.fig1.nativeElement.height.animVal.value;
    xo = this.fig1.nativeElement.x.animVal.value;
    yo = this.fig1.nativeElement.y.animVal.value;

    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[0].length; j += 2) {
        s[j / 2] +=
          ' ' +
          (xo + (w / 2) * (1 + data[i][j] / xm)) +
          ' ' +
          (yo + (h / 2) * (1 - data[i][j + 1] / ym)) +
          ' ';
      }
    }

    this.draw(s);
  }

  chartEA(data: any[] | number[][]) {
    var s = new Array(data[0].length / 2).fill('');
    var w = 400;
    var h = 400;
    var xo = 100;
    var yo = 100;
    var xm = 90;
    var ym = 90;

    w = this.fig2.nativeElement.width.animVal.value;
    h = this.fig2.nativeElement.height.animVal.value;
    xo = this.fig2.nativeElement.x.animVal.value;
    yo = this.fig2.nativeElement.y.animVal.value;

    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[0].length; j += 2) {
        s[j / 2] +=
          ' ' +
          (xo + (w / 2) * (1 + data[i][j] / xm)) +
          ' ' +
          (yo + (h / 2) * (1 - data[i][j + 1] / ym)) +
          ' ';
      }
    }

    this.draw2(s);
  }

  chartEA1(data: any[] | number[][], id: any[]) {
    var s = new Array(data[0].length / 2).fill('');
    var w = 400;
    var h = 400;
    var xo = 100;
    var yo = 100;
    var xm = 90;
    var ym = 90;

    w = this.fig2.nativeElement.width.animVal.value;
    h = this.fig2.nativeElement.height.animVal.value;
    xo = this.fig2.nativeElement.x.animVal.value;
    yo = this.fig2.nativeElement.y.animVal.value;

    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[0].length; j += 2) {
        s[j / 2] +=
          ' ' +
          (xo + (w / 2) * (1 + data[i][j] / xm)) +
          ' ' +
          (yo + (h / 2) * (1 - data[i][j + 1] / ym)) +
          ' ';
      }
    }

    this.draw1(s);
  }

  pointEA(xy: any[] | number[][]) {
    var w = 400;
    var h = 400;
    var xo = 100;
    var yo = 100;
    var xm = 90;
    var ym = 90;
    var i = 0;

    this.s.forEach(el => {
      this.renderer.setAttribute(el.nativeElement, 'cx', '-99');
      this.renderer.setAttribute(el.nativeElement, 'cy', '-99');
      this.renderer.setAttribute(
        el.nativeElement,
        'fill',
        this.get_color(i + 1)
      );
      i++;
    });

    for (var i = 0; i < xy.length; i++) {
      var id = xy[i][2];
      if (this.s.toArray()[id - 1]) {
        this.renderer.setAttribute(
          this.s.toArray()[id - 1].nativeElement,
          'cx',
          (xo + (w / 2) * (1 + xy[i][0] / xm)).toString()
        );
        this.renderer.setAttribute(
          this.s.toArray()[id - 1].nativeElement,
          'cy',
          (yo + (h / 2) * (1 - xy[i][1] / ym)).toString()
        );
        this.renderer.setAttribute(
          this.s.toArray()[id - 1].nativeElement,
          'onmousemove',
          "document.getElementById('status2').innerHTML=this.id.substring(1);"
        );
        this.renderer.setAttribute(
          this.s.toArray()[id - 1].nativeElement,
          'onmouseout',
          "document.getElementById('status2').innerHTML=''"
        );
      }
    }
  }

  // ---- Fig3 -----

  plotLine(xy: any[] | string[][], id: any) {
    var p = '';

    for (var i = 0; i < xy.length; i++) {
      p += xy[i][0] + ',' + xy[i][1] + ' ';
    }

    this.renderer.setAttribute(this.t0.nativeElement, 'points', p);
  }

  plotPoint(x: any, y: any, i: number, idx: number) {}

  // ---- array and matrix functions ----

  mjoin(A: any[], b: any[] | number[]) {
    if (A == null || b == null) {
      return;
    }

    var Ab = A.slice();

    for (var i = 0; i < A.length; i++) {
      Ab[i] = A[i].slice();
      Ab[i].push(b[i]);
    }

    return Ab;
  }

  mjoin2(A, B) {
    var AB = A.slice();

    for (var i = 0; i < A.length; i++) {
      AB[i] = A[i].slice();

      for (var j = 0; j < B[i].length; j++) {
        AB[i].push(B[i][j]);
      }
    }

    return AB;
  }

  minv4(A) {
    var I = [
      [1, 0, 0, 0],
      [0, 1, 0, 0]
    ];
    var A1 = [];

    for (var i = 0; i < I.length; i++) {
      var Ab = this.mjoin(A, I[i]);
      var x = this.gauss(Ab);
      A1.push(x);
    }

    return A1;
  }

  gauss2(A, b) {
    return this.gauss(this.mjoin(A, b));
  }

  gauss(A) {
    var i;
    var j;
    var k;
    var n = A.length;

    for (k = 0; k < n; k++) {
      for (i = k; ++i < n; ) {
        for (j = k; ++j <= n; ) {
          A[i][j] -= (A[i][k] / A[k][k]) * A[k][j];
        }
      }
    }

    for (i = n; i--; ) {
      A[i][n] /= A[i][i];
      for (j = i; j--; ) {
        A[j][n] -= A[j][i] * A[i][n];
      }
    }

    return A.map((x: any[]) => {
      return x[x.length - 1];
    });
  }

  mmul(A: any[] | number[][], B: any[] | number[][]) {
    var C = new Array(A.length);

    for (var i = 0; i < A.length; i++) {
      C[i] = new Array(B[0].length);

      for (var j = 0; j < B[0].length; j++) {
        var s = 0;

        for (var k = 0; k < A[0].length; k++) {
          s += A[i][k] * B[k][j];
        }
        C[i][j] = s;
      }
    }

    return C;
  }

  transpose(M: any[] | any[][]) {
    var MT = [];

    for (var j = 0; j < M[0].length; j++) {
      var a = [];
      for (var i = 0; i < M.length; i++) a.push(M[i][j]);
      MT.push(a);
    }

    return MT;
  }

  // ----  geographic functions ----

  elavazim(sxyz: any[] | any[][], oxyz: any[] | any[][]) {
    var ox = oxyz[0][0];
    var oy = oxyz[0][1];
    var oz = oxyz[0][2];
    var el_az = [];

    for (var i = 0; i < sxyz.length; i++) {
      var sx = sxyz[i][0];
      var sy = sxyz[i][1];
      var sz = sxyz[i][2];
      var r = Math.sqrt(
        (sx - ox) * (sx - ox) + (sy - oy) * (sy - oy) + (sz - oz) * (sz - oz)
      );
      var dx = (sx - ox) / r;
      var dy = (sy - oy) / r;
      var dz = (sz - oz) / r;
      var olla = this.xyz2lla(oxyz);
      var lat = olla[0][0];
      var lon = olla[0][1];

      var east = -Math.sin(lon) * dx + Math.cos(lon) * dy;
      var north =
        -Math.cos(lon) * Math.sin(lat) * dx -
        Math.sin(lon) * Math.sin(lat) * dy +
        Math.cos(lat) * dz;
      var up =
        Math.cos(lon) * Math.cos(lat) * dx +
        Math.sin(lon) * Math.cos(lat) * dy +
        Math.sin(lat) * dz;
      var elevation = Math.PI / 2 - Math.acos(up);
      var azimuth = Math.atan2(east, north);

      if (azimuth < 0) {
        azimuth += 2 * Math.PI;
      }

      el_az.push([elevation, azimuth]);
    }

    return el_az;
  }

  lla2xyz(lla: any[] | any[][] | number[][]) {
    var a = 6378137;
    var e = 8.1819190842622e-2;
    var xyz = [];

    for (var i = 0; i < lla.length; i++) {
      var lat = lla[i][0];
      var lon = lla[i][1];
      var alt = lla[i][2];
      var N = a / Math.sqrt(1 - e * e * Math.sin(lat) * Math.sin(lat));
      var x = (N + alt) * Math.cos(lat) * Math.cos(lon);
      var y = (N + alt) * Math.cos(lat) * Math.sin(lon);
      var z = ((1 - e * e) * N + alt) * Math.sin(lat);

      xyz.push([x, y, z]);
    }

    return xyz;
  }

  xyz2lla(xyz: any[] | any[][]) {
    var a = 6378137;
    var e = 8.1819190842622e-2;
    var b = Math.sqrt(a * a * (1 - e * e));
    var ep = Math.sqrt((a * a - b * b) / (b * b));
    var lla = [];

    for (var i = 0; i < xyz.length; i++) {
      var x = xyz[i][0];
      var y = xyz[i][1];
      var z = xyz[i][2];
      var p = Math.sqrt(x * x + y * y);
      var th = Math.atan2(a * z, b * p);
      var lon = Math.atan2(y, x);
      var lat = Math.atan(
        (z + ep * ep * b * Math.sin(th) * Math.sin(th) * Math.sin(th)) /
          (p - e * e * a * Math.cos(th) * Math.cos(th) * Math.cos(th))
      );
      var N = a / Math.sqrt(1 - e * e * Math.sin(lat) * Math.sin(lat));
      var alt = p / Math.cos(lat) - N;

      lla.push([lat, lon, alt]);
    }

    return lla;
  }

  // ---- coordinate conversion functions ----

  denom(es: number, sphi: number) {
    var sinSphi = Math.sin(sphi);

    return Math.sqrt(1.0 - es * (sinSphi * sinSphi));
  }

  sphsr(a: number, es: number, sphi: number) {
    var dn = this.denom(es, sphi);

    return (a * (1.0 - es)) / (dn * dn * dn);
  }

  sphsn(a: number, es: number, sphi: number) {
    var sinSphi = Math.sin(sphi);

    return a / Math.sqrt(1.0 - es * (sinSphi * sinSphi));
  }

  sphtmd(
    ap: number,
    bp: number,
    cp: number,
    dp: number,
    ep: number,
    sphi: number
  ) {
    return (
      ap * sphi -
      bp * Math.sin(2.0 * sphi) +
      cp * Math.sin(4.0 * sphi) -
      dp * Math.sin(6.0 * sphi) +
      ep * Math.sin(8.0 * sphi)
    );
  }

  ll2PUWG(ll: number[], proj: number) {
    var rad = Math.PI / 180;
    var a = 6378137.0;
    var f = 1 / 298.257223563;
    var fe = 500000.0;
    var lat = ll[0] / rad;
    var lon = ll[1] / rad;

    proj = proj || 0;

    var ok = 0.999923;
    if (proj == 1) {
      ok = 0.9993;
    }

    var nfn = -5300000.0;
    var olam = 19.0 * rad;
    var strf = 0.0; // for 1992

    if (lon < 13.5 || lon > 25.5) {
      return [999999, 999999];
    }

    if (proj == 0) {
      nfn = 0;

      if (lon >= 13.5 && lon < 16.5) {
        olam = 15.0 * rad;
        strf = 5000000.0;
      }

      if (lon >= 16.5 && lon < 19.5) {
        olam = 18.0 * rad;
        strf = 6000000.0;
      }

      if (lon >= 19.5 && lon < 22.5) {
        olam = 21.0 * rad;
        strf = 7000000.0;
      }

      if (lon >= 22.5 && lon < 25.5) {
        olam = 24.0 * rad;
        strf = 8000000.0;
      }
    }
    var latRad = lat * rad;
    var lonRad = lon * rad;
    var recf = 1.0 / f;
    var b = (a * (recf - 1.0)) / recf;
    var eSquared = (a * a - b * b) / (a * a);
    var e2Squared = (a * a - b * b) / (b * b);
    var tn = (a - b) / (a + b);
    var ap =
      a *
      (1 -
        tn +
        (5 * (tn * tn - tn * tn * tn)) / 4 +
        (81 * (tn * tn * tn * tn - tn * tn * tn * tn * tn)) / 64.0);
    var bp =
      (3 *
        a *
        (tn -
          tn * tn +
          (7 * (tn * tn * tn - tn * tn * tn * tn)) / 8 +
          (55 * (tn * tn * tn * tn * tn)) / 64)) /
      2.0;
    var cp =
      (15.0 *
        a *
        (tn * tn -
          tn * tn * tn +
          (3.0 * (tn * tn * tn * tn - tn * tn * tn * tn * tn)) / 4.0)) /
      16.0;
    var dp =
      (35.0 *
        a *
        (tn * tn * tn -
          tn * tn * tn * tn +
          (11.0 * (tn * tn * tn * tn * tn)) / 16.0)) /
      48.0;
    var ep = (315.0 * a * (tn * tn * tn * tn - tn * tn * tn * tn * tn)) / 512.0;
    var dlam = lonRad - olam;
    var s = Math.sin(latRad);
    var c = Math.cos(latRad);
    var t = s / c;
    var eta = e2Squared * c * c;
    var sn = this.sphsn(a, eSquared, latRad);
    var tmd = this.sphtmd(ap, bp, cp, dp, ep, latRad);
    var t1 = tmd * ok;
    var t2 = (sn * s * c * ok) / 2.0;
    var t3 =
      (sn *
        s *
        c *
        c *
        c *
        ok *
        (5.0 - t * t + 9.0 * eta + 4.0 * (eta * eta))) /
      24.0;
    var t4 =
      (sn *
        s *
        (c * c * c * c * c) *
        ok *
        (61.0 -
          58.0 * (t * t) +
          t * t * t * t +
          270.0 * eta -
          330.0 * (t * t) * eta +
          445.0 * (eta * eta) +
          324.0 * (eta * eta * eta) -
          680.0 * (t * t) * (eta * eta) +
          88.0 * (eta * eta * eta * eta) -
          600.0 * (t * t) * (eta * eta * eta) -
          192.0 * (t * t) * (eta * eta * eta * eta))) /
      720.0;
    var t5 =
      (sn *
        s *
        (c * c * c * c * c * c * c) *
        ok *
        (1385.0 -
          3111.0 * (t * t) +
          543.0 * (t * t * t * t) -
          t * t * t * t * t * t)) /
      40320.0;
    var northing =
      nfn +
      t1 +
      dlam * dlam * t2 +
      dlam * dlam * dlam * dlam * t3 +
      dlam * dlam * dlam * dlam * dlam * dlam * t4 +
      dlam * dlam * dlam * dlam * dlam * dlam * dlam * dlam * t5;
    var t6 = sn * c * ok;
    var t7 = (sn * (c * c * c) * ok * (1.0 - t * t + eta)) / 6.0;
    var t8 =
      (sn *
        (c * c * c * c * c) *
        ok *
        (5.0 -
          18.0 * (t * t) +
          t * t * t * t +
          14.0 * eta -
          58.0 * (t * t) * eta +
          13.0 * (eta * eta) +
          4.0 * (eta * eta * eta) -
          64.0 * (t * t) * (eta * eta) -
          24.0 * (t * t) * (eta * eta * eta))) /
      120.0;
    var t9 =
      (sn *
        (c * c * c * c * c * c * c) *
        ok *
        (61.0 -
          479.0 * (t * t) +
          179.0 * (t * t * t * t) -
          t * t * t * t * t * t)) /
      5040.0;
    var easting =
      fe +
      strf +
      dlam * t6 +
      dlam * dlam * dlam * t7 +
      dlam * dlam * dlam * dlam * dlam * t8 +
      dlam * dlam * dlam * dlam * dlam * dlam * dlam * t9;

    return [easting, northing];
  }

  PUWG2ll(xy: any[] | number[], proj: number) {
    var easting = xy[0];
    var northing = xy[1];

    proj = proj | 0;

    var ok = 0.999923;

    if (proj == 1) {
      ok = 0.9993;
    }

    var rad = Math.PI / 180;
    var a = 6378137.0;
    var f = 1 / 298.257223563;
    var fe = 500000.0;

    var recf = 1.0 / f;
    var b = (a * (recf - 1)) / recf;
    var eSquared = (a * a - b * b) / (a * a);
    var e2Squared = (a * a - b * b) / (b * b);
    var tn = (a - b) / (a + b);
    var ap =
      a *
      (1.0 -
        tn +
        (5.0 * (tn * tn - tn * tn * tn)) / 4.0 +
        (81.0 * (tn * tn * tn * tn - tn * tn * tn * tn * tn)) / 64.0);
    var bp =
      (3.0 *
        a *
        (tn -
          tn * tn +
          (7.0 * (tn * tn * tn - tn * tn * tn * tn)) / 8.0 +
          (55.0 * (tn * tn * tn * tn * tn)) / 64.0)) /
      2.0;
    var cp =
      (15.0 *
        a *
        (tn * tn -
          tn * tn * tn +
          (3.0 * (tn * tn * tn * tn - tn * tn * tn * tn * tn)) / 4.0)) /
      16.0;
    var dp =
      (35.0 *
        a *
        (tn * tn * tn -
          tn * tn * tn * tn +
          (11.0 * (tn * tn * tn * tn * tn)) / 16.0)) /
      48.0;
    var ep = (315.0 * a * (tn * tn * tn * tn - tn * tn * tn * tn * tn)) / 512.0;
    var olam = 19.0 * rad;
    var strf = 0.0;
    var nfn = -5300000.0;

    if (proj == 0) {
      nfn = 0;
      if (easting < 6000000.0 && easting > 5000000.0) {
        strf = 5000000.0;
        olam = 15.0 * rad;
      }
      if (easting < 7000000.0 && easting > 6000000.0) {
        strf = 6000000.0;
        olam = 18.0 * rad;
      }
      if (easting < 8000000.0 && easting > 7000000.0) {
        strf = 7000000.0;
        olam = 21.0 * rad;
      }
      if (easting < 9000000.0 && easting > 8000000.0) {
        strf = 8000000.0;
        olam = 24.0 * rad;
      }
    }

    var tmd = (northing - nfn) / ok;
    var sr = this.sphsr(a, eSquared, 0.0);
    var ftphi = tmd / sr;

    for (var i = 0; i < 5; i++) {
      var t10 = this.sphtmd(ap, bp, cp, dp, ep, ftphi);
      sr = this.sphsr(a, eSquared, ftphi);
      ftphi = ftphi + (tmd - t10) / sr;
    }

    sr = this.sphsr(a, eSquared, ftphi);

    var sn = this.sphsn(a, eSquared, ftphi);
    var s = Math.sin(ftphi);
    var c = Math.cos(ftphi);
    var t = s / c;
    var eta = e2Squared * (c * c);
    var de = easting - fe - strf;
    var t10 = t / (2.0 * sr * sn * (ok * ok));
    var t11 =
      (t *
        (5.0 + 3.0 * (t * t) + eta - 4.0 * (eta * eta) - 9.0 * (t * t) * eta)) /
      (24.0 * sr * (sn * sn * sn) * (ok * ok * ok * ok));
    var t12 =
      (t *
        (61.0 +
          90.0 * (t * t) +
          46.0 * eta +
          45.0 * (t * t * t * t) -
          252.0 * (t * t) * eta -
          3.0 * (eta * eta) +
          100.0 * (eta * eta * eta) -
          66.0 * (t * t) * (eta * eta) -
          90.0 * (t * t * t * t) * eta +
          88.0 * (eta * eta * eta * eta) +
          225.0 * (t * t * t * t) * (eta * eta) +
          84.0 * (t * t) * (eta * eta * eta) -
          192.0 * (t * t) * (eta * eta * eta * eta))) /
      (720.0 * sr * (sn * sn * sn * sn * sn) * (ok * ok * ok * ok * ok * ok));
    var t13 =
      (t *
        (1385.0 +
          3633 * (t * t) +
          4095.0 * (t * t * t * t) +
          1575.0 * (t * t * t * t * t * t))) /
      (40320 *
        sr *
        (sn * sn * sn * sn * sn * sn * sn) *
        (ok * ok * ok * ok * ok * ok * ok * ok));
    var lat =
      ftphi -
      de * de * t10 +
      de * de * de * de * t11 -
      de * de * de * de * de * de * t12 +
      de * de * de * de * de * de * de * de * t13;
    var t14 = 1.0 / (sn * c * ok);
    var t15 =
      (1.0 + 2.0 * (t * t) + eta) / (6.0 * (sn * sn * sn) * c * (ok * ok * ok));
    var t16 =
      (1.0 *
        (5.0 +
          6.0 * eta +
          28.0 * (t * t) -
          3.0 * (eta * eta) +
          8.0 * (t * t) * eta +
          24.0 * (t * t * t * t) -
          4.0 * (eta * eta * eta) +
          4.0 * (t * t) * (eta * eta) +
          24.0 * (t * t) * (eta * eta * eta))) /
      (120.0 * (sn * sn * sn * sn * sn) * c * (ok * ok * ok * ok * ok));
    var t17 =
      (1.0 *
        (61.0 +
          662.0 * (t * t) +
          1320.0 * (t * t * t * t) +
          720.0 * (t * t * t * t * t * t))) /
      (5040.0 *
        (sn * sn * sn * sn * sn * sn * sn) *
        c *
        (ok * ok * ok * ok * ok * ok * ok));
    var dlam =
      de * t14 -
      de * de * de * t15 +
      de * de * de * de * de * t16 -
      de * de * de * de * de * de * de * t17;
    var lon = olam + dlam;

    return [lat, lon];
  }

  // ---- almanach functions ----

  alm2xyz(tsec: number, alm: any[][]) {
    var gps_epoch = new Date(Date.UTC(1980, 0, 6)).getTime() / 1000;
    var t = tsec - gps_epoch;
    var gps_frame = 1 * 1024;

    var MU = 398600500000000,
      EARTH_RATE = 7.2921151467e-5;
    var xyz = [];

    for (var i = 0; i < alm.length; i++) {
      var a = alm[i][7] * alm[i][7]; // semimajor axis
      var toe = alm[i][4]; // time of reference ephemeris
      var M_not = alm[i][10]; // mean anomaly at toe
      var ecc = alm[i][3]; // eccentricity
      var arg_peri = alm[i][9]; // argument of periapsis
      var inc = alm[i][5]; // inclination
      var Omega_not = alm[i][8]; // long of asc node at epoch
      var Omega_dot = alm[i][6]; // rate of long of asc node
      var n_not = Math.sqrt(MU / (a * a * a)); // mean motion (rad/s)
      var af0 = alm[i][11]; // clock bias
      var af1 = alm[i][12]; // clock drift
      var week = alm[i][13];

      //    var t_k = t - toe;
      var t_k = t - toe - 7 * (gps_frame + week) * 86400 + 18;
      var M_k = M_not + n_not * t_k; // mean anomaly at t
      M_k = M_k % (2 * Math.PI); // Make 0<=M_k<=360
      var E_k = M_k; // First guess for E
      var E_old = E_k + 1; // Set E-old for at least one loop

      while (Math.abs(E_k - E_old) >= 0.000005) {
        E_old = E_k;
        E_k = M_k + ecc * Math.sin(E_old);
      }

      var v = Math.atan2(
        Math.sqrt(1 - ecc * ecc) * Math.sin(E_k),
        Math.cos(E_k) - ecc
      );
      var Omega = Omega_not + (Omega_dot - EARTH_RATE) * t_k - EARTH_RATE * toe;
      var phi = v + arg_peri; // argument of latitude
      var R = a * (1 - ecc * Math.cos(E_k)); // radius to satellite
      var x =
        R *
        (Math.cos(Omega) * Math.cos(phi) -
          Math.sin(Omega) * Math.sin(phi) * Math.cos(inc));
      var y =
        R *
        (Math.sin(Omega) * Math.cos(phi) +
          Math.cos(Omega) * Math.sin(phi) * Math.cos(inc));
      var z = R * Math.sin(phi) * Math.sin(inc);

      xyz.push([x, y, z]);
    }

    return xyz;
  }

  read_yuma(s: string) {
    var alm = [];
    var a = [0];
    var ss = s.split('\n');
    var j = 0;

    for (var i = 0; i < ss.length; i++) {
      var s2 = ss[i].split(':');

      if (s2.length > 1) {
        a.push(parseFloat(s2[1]));
        if (++j == 13) {
          alm.push(a);
          a = [0];
          j = 0;
        }
      }
    }

    return alm;
  }

  get_almanac() {
    return `
******** Week 963 almanac for PRN-01 ********
ID:                         01
Health:                     000
Eccentricity:               0.7319927216E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9701853241
Rate of Right Ascen(r/s):  -0.7714607059E-008
SQRT(A)  (m 1/2):           5153.631836
Right Ascen at Week(rad):  -0.7462947611E+000
Argument of Perigee(rad):   0.614052959
Mean Anom(rad):            -0.3114386965E+001
Af0(s):                    -0.2765655518E-004
Af1(s/s):                  -0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-02 ********
ID:                         02
Health:                     000
Eccentricity:               0.1778459549E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9491769778
Rate of Right Ascen(r/s):  -0.7908900866E-008
SQRT(A)  (m 1/2):           5153.629883
Right Ascen at Week(rad):  -0.8051818717E+000
Argument of Perigee(rad):  -1.897790397
Mean Anom(rad):            -0.2727285640E+001
Af0(s):                     0.2040863037E-003
Af1(s/s):                  -0.1091393642E-010
week:                        963

******** Week 963 almanac for PRN-03 ********
ID:                         03
Health:                     000
Eccentricity:               0.1184463501E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9610353683
Rate of Right Ascen(r/s):  -0.7817468486E-008
SQRT(A)  (m 1/2):           5153.507324
Right Ascen at Week(rad):   0.2961500463E+000
Argument of Perigee(rad):   0.501340949
Mean Anom(rad):             0.2233783497E+001
Af0(s):                     0.6675720215E-005
Af1(s/s):                   0.7275957614E-011
week:                        963

******** Week 963 almanac for PRN-05 ********
ID:                         05
Health:                     000
Eccentricity:               0.5273818970E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9479485947
Rate of Right Ascen(r/s):  -0.7931758961E-008
SQRT(A)  (m 1/2):           5153.584473
Right Ascen at Week(rad):   0.2757851031E+000
Argument of Perigee(rad):   0.625648445
Mean Anom(rad):            -0.1452742723E+000
Af0(s):                    -0.1430511475E-004
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-06 ********
ID:                         06
Health:                     000
Eccentricity:               0.1093864441E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9699156790
Rate of Right Ascen(r/s):  -0.7726036106E-008
SQRT(A)  (m 1/2):           5153.526367
Right Ascen at Week(rad):  -0.7546294150E+000
Argument of Perigee(rad):  -1.248759606
Mean Anom(rad):            -0.2852781447E+001
Af0(s):                     0.4148483276E-003
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-07 ********
ID:                         07
Health:                     000
Eccentricity:               0.1116085052E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9595073797
Rate of Right Ascen(r/s):  -0.7737465154E-008
SQRT(A)  (m 1/2):           5153.644531
Right Ascen at Week(rad):   0.2408955040E+001
Argument of Perigee(rad):  -2.544183911
Mean Anom(rad):             0.2483729488E+001
Af0(s):                     0.2384185791E-003
Af1(s/s):                  -0.7275957614E-011
week:                        963

******** Week 963 almanac for PRN-08 ********
ID:                         08
Health:                     000
Eccentricity:               0.3314018250E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9684056667
Rate of Right Ascen(r/s):  -0.8091765626E-008
SQRT(A)  (m 1/2):           5153.710449
Right Ascen at Week(rad):  -0.1811065056E+001
Argument of Perigee(rad):  -0.558126701
Mean Anom(rad):            -0.5309408611E+000
Af0(s):                    -0.9059906006E-004
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-09 ********
ID:                         09
Health:                     000
Eccentricity:               0.1167774200E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9525864898
Rate of Right Ascen(r/s):  -0.8011762293E-008
SQRT(A)  (m 1/2):           5153.622070
Right Ascen at Week(rad):   0.1330538084E+001
Argument of Perigee(rad):   1.750449970
Mean Anom(rad):            -0.6944790921E+000
Af0(s):                     0.4997253418E-003
Af1(s/s):                   0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-10 ********
ID:                         10
Health:                     000
Eccentricity:               0.3267765045E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9611492185
Rate of Right Ascen(r/s):  -0.7783181344E-008
SQRT(A)  (m 1/2):           5153.614746
Right Ascen at Week(rad):   0.2926326763E+000
Argument of Perigee(rad):  -2.832894000
Mean Anom(rad):             0.1128179203E+001
Af0(s):                     0.1583099365E-003
Af1(s/s):                   0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-11 ********
ID:                         11
Health:                     000
Eccentricity:               0.1673984528E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9038945840
Rate of Right Ascen(r/s):  -0.8491782288E-008
SQRT(A)  (m 1/2):           5153.696777
Right Ascen at Week(rad):  -0.1166309636E+001
Argument of Perigee(rad):   1.739609115
Mean Anom(rad):             0.2456869844E+001
Af0(s):                    -0.7362365723E-003
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-12 ********
ID:                         12
Health:                     000
Eccentricity:               0.6932258606E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9877841583
Rate of Right Ascen(r/s):  -0.7748894201E-008
SQRT(A)  (m 1/2):           5153.604980
Right Ascen at Week(rad):  -0.2784532410E+001
Argument of Perigee(rad):   0.919132751
Mean Anom(rad):             0.1901586026E+001
Af0(s):                     0.3509521484E-003
Af1(s/s):                  -0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-13 ********
ID:                         13
Health:                     000
Eccentricity:               0.3690719604E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9683517376
Rate of Right Ascen(r/s):  -0.7828897534E-008
SQRT(A)  (m 1/2):           5153.602051
Right Ascen at Week(rad):   0.1460703619E+001
Argument of Perigee(rad):   1.625303578
Mean Anom(rad):            -0.2384427452E+001
Af0(s):                    -0.9536743164E-004
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-14 ********
ID:                         14
Health:                     000
Eccentricity:               0.9328842163E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9609095340
Rate of Right Ascen(r/s):  -0.7897471819E-008
SQRT(A)  (m 1/2):           5153.677246
Right Ascen at Week(rad):   0.1419496985E+001
Argument of Perigee(rad):  -1.956731063
Mean Anom(rad):            -0.1268277414E+001
Af0(s):                    -0.9346008301E-004
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-15 ********
ID:                         15
Health:                     000
Eccentricity:               0.1016712189E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9281866079
Rate of Right Ascen(r/s):  -0.8274630386E-008
SQRT(A)  (m 1/2):           5153.620117
Right Ascen at Week(rad):   0.1262415630E+001
Argument of Perigee(rad):   0.666828864
Mean Anom(rad):            -0.1789419673E+001
Af0(s):                    -0.3566741943E-003
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-16 ********
ID:                         16
Health:                     000
Eccentricity:               0.9852886200E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9882215825
Rate of Right Ascen(r/s):  -0.7737465154E-008
SQRT(A)  (m 1/2):           5153.540527
Right Ascen at Week(rad):  -0.2765650514E+001
Argument of Perigee(rad):   0.465423853
Mean Anom(rad):            -0.1027385131E-001
Af0(s):                     0.3242492676E-004
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-17 ********
ID:                         17
Health:                     000
Eccentricity:               0.1236152649E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9817680774
Rate of Right Ascen(r/s):  -0.7908900866E-008
SQRT(A)  (m 1/2):           5153.713379
Right Ascen at Week(rad):  -0.1749968728E+001
Argument of Perigee(rad):  -1.793149389
Mean Anom(rad):            -0.1027079158E+001
Af0(s):                    -0.1239776611E-003
Af1(s/s):                   0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-18 ********
ID:                         18
Health:                     063
Eccentricity:               0.1851224899E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9268923116
Rate of Right Ascen(r/s):  -0.8137481816E-008
SQRT(A)  (m 1/2):           5153.592285
Right Ascen at Week(rad):   0.2411746616E+000
Argument of Perigee(rad):  -1.753045304
Mean Anom(rad):             0.5765090037E+000
Af0(s):                     0.6332397461E-003
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-19 ********
ID:                         19
Health:                     000
Eccentricity:               0.9720325470E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9791974612
Rate of Right Ascen(r/s):  -0.7943188009E-008
SQRT(A)  (m 1/2):           5153.652344
Right Ascen at Week(rad):  -0.1702720922E+001
Argument of Perigee(rad):   1.122647734
Mean Anom(rad):             0.1993455222E+001
Af0(s):                    -0.4577636719E-003
Af1(s/s):                   0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-20 ********
ID:                         20
Health:                     000
Eccentricity:               0.4470825195E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9283364107
Rate of Right Ascen(r/s):  -0.8126052768E-008
SQRT(A)  (m 1/2):           5153.723145
Right Ascen at Week(rad):   0.1902181118E+000
Argument of Perigee(rad):   1.787649378
Mean Anom(rad):            -0.2098584588E+001
Af0(s):                     0.5006790161E-003
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-21 ********
ID:                         21
Health:                     000
Eccentricity:               0.2441549301E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9426815279
Rate of Right Ascen(r/s):  -0.7954617056E-008
SQRT(A)  (m 1/2):           5153.716797
Right Ascen at Week(rad):  -0.7975767575E+000
Argument of Perigee(rad):  -1.596404743
Mean Anom(rad):             0.1432127984E+001
Af0(s):                    -0.4320144653E-003
Af1(s/s):                   0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-22 ********
ID:                         22
Health:                     000
Eccentricity:               0.7274150848E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9250347567
Rate of Right Ascen(r/s):  -0.8160339911E-008
SQRT(A)  (m 1/2):           5153.532227
Right Ascen at Week(rad):   0.2405383741E+000
Argument of Perigee(rad):  -1.615515837
Mean Anom(rad):            -0.1591437656E+001
Af0(s):                    -0.2870559692E-003
Af1(s/s):                  -0.1455191523E-010
week:                        963

******** Week 963 almanac for PRN-23 ********
ID:                         23
Health:                     000
Eccentricity:               0.1196861267E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9434245498
Rate of Right Ascen(r/s):  -0.8114623721E-008
SQRT(A)  (m 1/2):           5153.534180
Right Ascen at Week(rad):   0.1329902545E+001
Argument of Perigee(rad):  -2.397668897
Mean Anom(rad):            -0.2278668914E+001
Af0(s):                    -0.2193450928E-003
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-24 ********
ID:                         24
Health:                     000
Eccentricity:               0.6801605225E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9425257330
Rate of Right Ascen(r/s):  -0.7931758961E-008
SQRT(A)  (m 1/2):           5153.605957
Right Ascen at Week(rad):   0.2351043146E+001
Argument of Perigee(rad):   0.521829854
Mean Anom(rad):            -0.2865328931E+001
Af0(s):                    -0.4577636719E-004
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-25 ********
ID:                         25
Health:                     000
Eccentricity:               0.7158756256E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9755123120
Rate of Right Ascen(r/s):  -0.7851755629E-008
SQRT(A)  (m 1/2):           5153.643066
Right Ascen at Week(rad):  -0.2842952136E+001
Argument of Perigee(rad):   0.809120562
Mean Anom(rad):             0.1455012985E+001
Af0(s):                    -0.5369186401E-003
Af1(s/s):                  -0.7275957614E-011
week:                        963

******** Week 963 almanac for PRN-26 ********
ID:                         26
Health:                     000
Eccentricity:               0.2670288086E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9571105347
Rate of Right Ascen(r/s):  -0.8011762293E-008
SQRT(A)  (m 1/2):           5153.559082
Right Ascen at Week(rad):  -0.2862987513E+001
Argument of Perigee(rad):   0.011140835
Mean Anom(rad):             0.9551981520E+000
Af0(s):                    -0.2555847168E-003
Af1(s/s):                   0.1455191523E-010
week:                        963

******** Week 963 almanac for PRN-27 ********
ID:                         27
Health:                     000
Eccentricity:               0.5474567413E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9765729159
Rate of Right Ascen(r/s):  -0.8011762293E-008
SQRT(A)  (m 1/2):           5153.629883
Right Ascen at Week(rad):  -0.1803443089E+001
Argument of Perigee(rad):   0.354412105
Mean Anom(rad):            -0.8662830678E+000
Af0(s):                     0.3662109375E-003
Af1(s/s):                   0.0000000000E+000
week:                        963

******** Week 963 almanac for PRN-28 ********
ID:                         28
Health:                     000
Eccentricity:               0.1975250244E-001
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9870651048
Rate of Right Ascen(r/s):  -0.7726036106E-008
SQRT(A)  (m 1/2):           5153.630859
Right Ascen at Week(rad):  -0.2761327205E+001
Argument of Perigee(rad):  -1.526585398
Mean Anom(rad):            -0.5027644503E-001
Af0(s):                     0.6875991821E-003
Af1(s/s):                   0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-29 ********
ID:                         29
Health:                     000
Eccentricity:               0.4954338074E-003
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9829964605
Rate of Right Ascen(r/s):  -0.7931758961E-008
SQRT(A)  (m 1/2):           5153.691895
Right Ascen at Week(rad):  -0.1739506125E+001
Argument of Perigee(rad):   0.748952263
Mean Anom(rad):             0.4764291160E+000
Af0(s):                     0.4987716675E-003
Af1(s/s):                  -0.7275957614E-011
week:                        963

******** Week 963 almanac for PRN-30 ********
ID:                         30
Health:                     000
Eccentricity:               0.3075599670E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9451802388
Rate of Right Ascen(r/s):  -0.7886042771E-008
SQRT(A)  (m 1/2):           5153.521973
Right Ascen at Week(rad):   0.2444087545E+001
Argument of Perigee(rad):  -3.115256196
Mean Anom(rad):             0.2650770109E+001
Af0(s):                     0.1049041748E-003
Af1(s/s):                  -0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-31 ********
ID:                         31
Health:                     000
Eccentricity:               0.8842945099E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9642051958
Rate of Right Ascen(r/s):  -0.7714607059E-008
SQRT(A)  (m 1/2):           5153.560059
Right Ascen at Week(rad):   0.2421005178E+001
Argument of Perigee(rad):  -0.156421849
Mean Anom(rad):             0.2278999603E+001
Af0(s):                     0.1430511475E-003
Af1(s/s):                  -0.3637978807E-011
week:                        963

******** Week 963 almanac for PRN-32 ********
ID:                         32
Health:                     000
Eccentricity:               0.1667022705E-002
Time of Applicability(s):  589824.0000
Orbital Inclination(rad):   0.9569966845
Rate of Right Ascen(r/s):  -0.7954617056E-008
SQRT(A)  (m 1/2):           5153.572754
Right Ascen at Week(rad):   0.1334996590E+001
Argument of Perigee(rad):  -2.693568398
Mean Anom(rad):            -0.1253606101E+000
Af0(s):                    -0.5321502686E-003
Af1(s/s):                   0.0000000000E+000
week:                        963
`;
  }

  // ---- track functions ----

  read_track(s: string) {
    var te = [];
    var ss = s.split('\n');

    for (var i = 0; i < ss.length; i++) {
      if (ss[i].length < 2) {
        continue;
      }

      var sss = ss[i].split(';');
      var tei = [];

      for (var j = 0; j < sss.length; j++) {
        tei.push(parseFloat(sss[j]));
      }

      te.push(tei);
    }

    return te;
  }

  get_track_elevation() {
    return `
472142.6778;728028.4988;16.22999954;41;44;39;24;23;1;16;9;1;9;13;14;16;20;15;14;13;18;4;5;17;32;15;11;7;18;22;16;12;12;16;21;17;10;39;43
472140.1755;728026.7987;16.11999893;40;40;39;24;23;1;15;10;1;11;13;16;19;17;14;16;17;14;5;6;23;29;18;7;7;17;25;20;15;13;14;17;26;15;13;37
472137.6452;728025.1245;15.97000027;36;38;38;32;21;1;15;1;1;10;12;16;17;14;14;12;18;5;6;22;27;25;20;8;9;14;26;26;19;17;14;14;15;26;16;30
472134.9664;728023.4131;15.85999966;33;35;35;32;21;1;14;1;1;12;12;16;15;15;15;18;13;6;23;29;37;23;23;9;10;13;30;30;25;21;17;16;19;16;23;15
472132.1867;728021.556;15.84000015;26;32;32;31;18;1;13;1;1;11;16;13;14;15;15;20;6;24;32;32;40;22;24;11;11;14;30;33;35;24;19;21;17;17;17;16
472129.5581;728019.776;15.73999977;15;30;30;31;22;1;12;1;1;10;14;12;14;16;20;13;27;35;37;37;31;27;26;18;14;15;22;37;39;39;26;21;22;19;16;24
472126.4379;728019.001;15.72000027;23;25;28;29;23;1;1;1;1;9;13;13;13;14;17;31;38;36;39;45;28;30;23;21;16;17;23;41;45;46;45;36;22;21;19;16
472123.4532;728017.5999;15.64999962;17;10;28;27;24;1;1;1;1;13;13;12;14;23;36;39;42;28;36;35;36;34;17;22;20;22;24;30;50;56;54;52;49;40;21;22
472120.7112;728015.0621;15.53999996;20;20;25;24;23;1;1;1;1;10;11;11;31;39;44;39;40;39;49;43;44;36;25;28;29;31;30;29;29;48;53;58;58;56;53;42
472090.9737;727998.4492;15.65999985;47;49;46;23;27;31;31;34;32;33;34;34;31;30;25;20;61;62;67;65;57;45;17;25;23;4;23;39;41;44;51;55;53;52;27;40
472088.7608;728000.721;15.77000046;44;51;53;51;45;24;25;29;26;30;25;38;23;28;23;15;55;57;56;53;42;18;22;23;17;21;36;42;46;59;57;61;59;64;58;37
472085.0081;727998.7487;15.85999966;55;37;38;43;41;18;17;18;19;18;33;15;26;36;59;59;57;58;56;38;6;20;27;27;20;21;29;47;51;52;54;55;64;65;62;59
472081.493;727997.143;15.97999954;57;56;49;34;37;29;14;14;16;15;35;12;55;57;57;59;58;42;9;7;24;30;33;31;20;23;32;47;52;52;58;55;59;60;58;63
472078.1174;727995.1744;16.13000107;55;58;51;42;31;28;11;11;15;11;25;51;53;56;58;39;14;8;8;18;35;37;38;27;22;23;28;39;57;57;58;56;61;63;57;57
472074.6075;727993.5163;16.29999924;61;52;54;50;34;27;8;9;13;20;43;47;52;47;20;15;8;7;17;40;43;44;43;30;19;26;31;27;49;61;65;63;60;56;49;57
472071.0904;727991.7918;16.43999863;51;49;52;48;42;24;7;8;11;38;42;48;37;14;14;9;7;44;47;47;51;53;31;32;20;27;34;32;31;56;55;64;68;69;66;67
472067.6997;727989.7608;16.56999969;65;58;48;46;41;21;6;6;6;35;43;36;10;14;12;43;38;59;66;59;14;30;35;35;22;24;37;34;33;20;56;62;59;58;66;67
472064.0709;727988.4545;16.72000122;61;63;61;36;39;18;5;5;6;34;38;5;24;60;62;65;54;20;7;11;30;37;41;39;23;25;40;40;43;35;16;18;61;63;64;64
472060.099;727984.9363;16.86000061;56;52;54;51;31;16;4;5;27;52;55;55;53;51;30;25;8;9;8;37;46;51;51;49;46;28;40;45;45;47;47;38;16;14;19;53
472056.6291;727983.4055;17.04999924;33;52;50;47;34;23;4;4;37;49;45;45;27;24;20;8;8;7;45;58;59;62;63;57;36;30;35;50;53;51;49;55;47;36;15;15
472053.5555;727982.5406;17.22999954;14;32;47;45;43;24;3;4;31;38;38;15;25;21;7;7;39;61;70;69;62;68;67;57;34;32;33;53;58;58;54;53;55;58;45;29
472050.0054;727980.297;17.32999992;52;14;33;42;39;24;0;0;33;34;11;69;69;73;79;79;80;77;76;80;77;77;68;49;42;34;34;38;62;67;66;64;54;57;55;52
472047.6493;727980.4399;17.37999916;56;52;23;37;37;29;0;0;27;31;43;64;72;76;74;75;68;64;60;63;61;60;54;48;46;38;38;42;66;71;72;76;73;65;61;61
472044.0983;727978.7386;17.59000015;72;72;47;42;35;30;0;0;32;67;64;67;67;63;62;63;62;63;68;69;69;68;61;68;67;39;43;46;45;43;63;72;75;72;76;73
472041.2805;727976.3079;25.19000053;54;50;45;12;18;16;0;0;28;40;41;39;44;41;56;63;60;63;63;54;50;49;65;65;65;29;35;31;33;32;26;9;32;38;46;51
472045.3518;727971.1257;31.40999985;83;83;83;83;83;83;83;83;83;83;77;77;71;71;71;71;75;75;82;67;73;73;77;77;77;75;75;75;72;72;72;46;46;8;17;14
472034.2788;727972.0279;18.03000069;45;45;52;52;47;25;61;60;68;75;75;75;74;67;68;70;70;68;73;75;77;77;73;75;78;72;56;57;61;61;59;61;61;53;45;32
472030.2342;727970.3617;25.52000046;22;14;23;31;30;16;1;11;38;81;76;72;71;71;79;79;79;73;77;60;71;71;72;78;78;78;53;54;56;56;54;63;61;53;48;44
472027.1039;727968.5395;18.37000084;64;57;64;73;73;83;83;83;82;84;82;84;84;84;85;85;85;82;84;81;69;68;53;41;37;45;47;54;77;77;75;75;74;68;72;72
472023.8196;727967.4363;18.48999977;79;79;69;33;37;30;69;71;70;78;77;73;77;71;70;73;73;62;65;65;62;55;47;43;37;50;53;59;64;77;77;82;85;85;85;83
472020.6328;727969.5761;35.11999893;80;80;80;80;80;80;80;80;80;60;49;39;8;0;0;1;0;0;0;71;71;71;71;71;71;71;71;71;55;55;55;59;59;71;71;71
472015.5248;727967.6534;19.09000015;86;86;86;85;85;81;84;84;84;59;53;50;47;52;56;56;50;53;67;87;87;87;87;87;87;87;87;87;87;87;87;87;87;87;87;87
472013.6788;727962.5569;18.96999931;72;73;69;62;62;60;0;43;46;52;51;61;61;63;66;67;68;66;69;71;69;73;61;81;81;81;81;81;82;84;84;86;86;84;84;80
472008.7397;727959.7243;19.19000053;84;84;76;74;77;70;64;33;39;77;73;76;75;76;77;77;76;74;76;77;77;78;76;77;67;59;46;32;21;17;51;81;85;85;85;84
472000.7775;727955.5979;29.14999962;6;15;28;31;34;36;3;48;52;61;56;65;64;62;61;61;62;62;58;61;53;50;56;38;17;44;40;45;34;10;5;0;0;0;0;0
471996.5088;727952.9563;30.07999992;0;0;9;19;19;19;1;26;52;52;51;53;59;59;57;63;56;62;63;57;59;63;51;16;22;60;57;59;54;58;49;0;0;0;0;0
471992.7677;727951.1325;20.07999992;57;44;10;34;38;40;57;66;79;87;84;84;84;84;80;80;76;75;75;79;83;83;85;85;85;83;83;83;87;87;87;86;86;85;85;85
471989.3426;727948.9507;29.81999969;78;78;80;80;80;73;60;60;60;43;42;46;44;49;51;48;48;46;38;49;27;30;30;20;0;0;0;0;79;79;79;83;83;81;81;80
471985.8553;727947.1008;20.13999939;79;78;80;80;79;77;67;61;57;77;76;75;76;73;70;67;52;65;55;61;64;66;67;49;43;1;12;3;18;22;27;28;30;33;71;71
471982.2563;727945.1772;20.27000046;53;60;66;67;68;67;52;47;61;63;62;61;62;54;64;67;72;73;76;78;72;66;64;62;65;12;14;14;16;23;26;28;29;30;4;6
471978.5813;727943.1826;20.43000031;11;32;46;57;55;58;47;47;76;81;77;78;78;78;79;79;79;78;82;75;72;70;39;1;1;13;14;16;14;21;24;29;29;29;29;3
471974.9815;727941.2313;20.56999969;5;10;28;44;50;48;40;52;59;69;69;71;74;76;78;80;73;74;67;65;57;52;11;2;0;14;14;17;18;18;24;26;30;32;29;29
471971.6098;727939.4009;20.67000008;26;8;8;32;42;41;40;35;53;62;70;70;66;68;67;68;67;58;65;60;50;13;11;9;0;15;14;17;21;3;24;29;27;30;32;28
471968.4537;727937.6813;20.78000069;26;22;8;12;36;37;31;35;59;63;57;62;68;63;65;66;67;65;62;34;13;22;11;9;0;11;16;19;20;16;20;25;26;27;30;28
471965.2079;727935.9016;20.90999985;26;24;8;4;25;36;31;30;51;53;58;58;63;64;62;61;55;45;20;6;24;15;11;2;0;13;20;20;21;22;10;25;28;27;26;29
471961.7741;727934.0509;21.04999924;27;23;19;4;22;32;28;33;43;50;54;56;58;54;48;40;46;25;1;17;30;14;2;1;0;4;22;17;24;24;9;13;25;30;26;27
471958.1966;727932.0937;21.14999962;25;24;21;4;2;29;25;34;39;46;48;45;43;31;28;47;20;9;28;17;18;14;1;2;0;0;24;20;24;26;26;14;13;26;31;25
471954.6041;727930.1577;21.30999947;23;23;21;14;0;25;23;32;36;42;39;35;25;27;46;41;39;1;17;20;17;16;10;1;0;0;27;28;20;27;30;23;14;17;25;25
471951.2347;727928.3209;21.39999962;23;23;21;15;1;22;22;28;32;34;31;25;25;44;31;4;4;15;22;21;17;13;1;0;0;0;24;32;32;26;30;34;29;11;25;25
471947.9449;727926.5432;21.48999977;22;21;20;16;0;20;20;25;29;27;25;20;42;36;4;5;16;21;22;19;19;13;1;0;0;0;7;32;37;36;28;29;33;30;15;24
471944.569;727924.7137;21.61000061;22;20;19;15;0;14;4;21;27;21;18;31;39;0;9;16;24;24;22;20;19;27;1;0;0;0;19;32;40;47;44;27;31;32;33;28
`;
  }

  // ---- tle functions ----

  is_gps(id: number) {
    return id >= 1 && id <= 32;
  }

  is_glonass(id: number) {
    return id >= 33 && id <= 57;
  }

  is_galileo(id: number) {
    return id >= 58 && id <= 79;
  }

  is_beidou(id: number) {
    return id >= 80 && id <= 104;
  }

  get_color(i: number) {
    var c = 'cornflowerblue';

    if (this.is_glonass(i)) {
      c = 'orangered';
    }
    if (this.is_galileo(i)) {
      c = 'limegreen';
    }
    if (this.is_beidou(i)) {
      c = 'gold';
    }

    return c;
  }

  read_tle(s: string, opt: number) {
    var alm = [];
    var tle = [];
    opt = opt || 0;
    var a = 6378137;
    var EARTH_RATE = 7.2921151467e-5;
    var ss = s.split('\n');

    for (var i = 0, j = 0; i < ss.length; i++) {
      var prn;
      var id;
      var inc;
      var raan;
      var ecc;
      var per;
      var M0;
      var n0;
      var toa;
      var a_sqr;
      var Omega;
      var Omega_dot;
      var week;
      var y;
      var d;
      var n0_dot;
      var h;

      if (ss[i].length > 2) {
        if (j == 0) {
          var name = ss[i];
          var nam = name.substring(0, 3);
          h =
            nam == 'GPS'
              ? 1
              : nam == 'COS'
              ? 2
              : nam == 'GSA'
              ? 4
              : nam == 'BEI'
              ? 8
              : 0;
          var sn = /\(PRN (.*)\)/.exec(name);

          if (sn) {
            prn = parseInt(sn[1]);
            if (!prn) prn = 1 + (i + 2) / 3;
          } else {
            prn = 1 + (i + 2) / 3;
          }
        } else if (j == 1) {
          id = parseInt(ss[i].substring(2, 7));
          y = parseInt(ss[i].substring(18, 20));
          y += y < 70 ? 2000 : 1900;
          d = parseFloat(ss[i].substring(20, 32));
          var dt = new Date(Date.UTC(y, 0, d));
          dt.setSeconds((d * 86400) % 86400);
          var gps_epoch = new Date(Date.UTC(1980, 0, 6)).getTime() / 1000;
          toa = dt.getTime() / 1000;
          week = Math.floor((toa - gps_epoch) / 86400 / 7) - 1024;
          toa = toa - gps_epoch - 7 * 86400 * (week + 1024);
          n0_dot = parseFloat(ss[i].substring(33, 43));
        } else if (j == 2) {
          inc = parseFloat(ss[i].substring(8, 16)) * this.rad;
          raan = parseFloat(ss[i].substring(17, 25)) * this.rad;
          ecc = parseFloat('0.' + ss[i].substring(26, 33));
          per = parseFloat(ss[i].substring(34, 42)) * this.rad;
          M0 = parseFloat(ss[i].substring(43, 51)) * this.rad;
          n0 = parseFloat(ss[i].substring(52, 63));
          a_sqr = Math.pow(
            398600500000000 / Math.pow((n0 / 86400) * 2 * Math.PI, 2),
            1 / 6
          );
          Omega_dot =
            (((((-3 / 2) * 0.001081874 * a * a) /
              Math.pow(a_sqr * a_sqr * (1 - ecc * ecc), 2)) *
              n0) /
              86400) *
            2 *
            Math.PI *
            Math.cos(inc);
          Omega = raan - Omega_dot * toa;
          alm.push([
            id,
            prn,
            h,
            ecc,
            toa,
            inc,
            Omega_dot,
            a_sqr,
            Omega,
            per,
            M0,
            0,
            0,
            week
          ]);
          tle.push([
            id,
            prn,
            h,
            ecc,
            d,
            inc / this.rad,
            Omega_dot,
            a_sqr,
            raan / this.rad,
            per / this.rad,
            M0 / this.rad,
            n0,
            n0_dot,
            y
          ]);
        }
        j = (j + 1) % 3;
      }
    }

    return opt == 0 ? tle : alm;
  }

  get_tle() {
    return `
GPS BIIR-2  (PRN 13)    
1 24876U 97035A   18042.38585711  .00000063  00000-0  00000-0 0  9993
2 24876  55.5077 217.7046 0034544  93.3947 266.9975  2.00565243150827
GPS BIIR-3  (PRN 11)    
1 25933U 99055A   18042.64613333 -.00000040  00000-0  00000-0 0  9999
2 25933  51.8012  67.1636 0164987  99.8507  12.4442  2.00553132134458
GPS BIIR-4  (PRN 20)    
1 26360U 00025A   18042.80656041 -.00000047  00000-0  00000-0 0  9991
2 26360  53.1668 144.8929 0042494 103.0353 226.7600  2.00550213130143
GPS BIIR-5  (PRN 28)    
1 26407U 00040A   18042.79409368 -.00000087  00000-0  00000-0 0  9990
2 26407  56.5412 335.7968 0200108 272.4107 335.9040  2.00564289128820
GPS BIIR-6  (PRN 14)    
1 26605U 00071A   18042.91265812  .00000055  00000-0  00000-0 0  9996
2 26605  55.0802 215.3237 0095463 248.3577 351.0896  2.00556101126424
GPS BIIR-7  (PRN 18)    
1 26690U 01004A   18042.63048714 -.00000047  00000-0  00000-0 0  9998
2 26690  53.0850 147.8211 0187537 259.7288 253.3852  2.00565339124820
GPS BIIR-8  (PRN 16)    
1 27663U 03005A   18042.65820253 -.00000087  00000-0  00000-0 0  9994
2 27663  56.6071 335.5542 0097491  25.5647 241.0831  2.00574784110184
GPS BIIR-9  (PRN 21)    
1 27704U 03010A   18042.77728841 -.00000033  00000-0  00000-0 0  9990
2 27704  54.0100  88.2813 0246154 268.6415  48.5078  2.00552748108987
GPS BIIR-10 (PRN 22)    
1 28129U 03058A   18042.57830634 -.00000047  00000-0  00000-0 0  9991
2 28129  52.9786 147.7870 0075072 267.5794  91.5517  2.00572374103660
GPS BIIR-11 (PRN 19)    
1 28190U 04009A   18042.86322250 -.00000050  00000-0  00000-0 0  9992
2 28190  56.1231  36.4432 0095099  63.5922 143.5248  2.00561083101869
GPS BIIR-12 (PRN 23)    
1 28361U 04023A   18042.83531741  .00000046  00000-0  00000-0 0  9996
2 28361  54.0758 210.1950 0121402 223.4059 237.1050  2.00572099 99925
GPS BIIR-13 (PRN 02)    
1 28474U 04045A   18042.64296323 -.00000033  00000-0  00000-0 0  9995
2 28474  54.3824  87.8518 0179685 251.5477  73.0495  2.00563026 97308
GPS BIIRM-1 (PRN 17)    
1 28874U 05038A   18042.86337296 -.00000052  00000-0  00000-0 0  9992
2 28874  56.2699  33.7376 0125784 257.4410 329.6248  2.00554086 90718
GPS BIIRM-2 (PRN 31)    
1 29486U 06042A   18042.78152668  .00000034  00000-0  00000-0 0  9996
2 29486  55.2508 272.6935 0088687 349.4999 101.7844  2.00571445 83312
GPS BIIRM-3 (PRN 12)    
1 29601U 06052A   18042.60064395 -.00000087  00000-0  00000-0 0  9995
2 29601  56.5817 334.4741 0067552  51.5559 309.0574  2.00567369 82289
GPS BIIRM-4 (PRN 15)    
1 32260U 07047A   18042.41511865  .00000042  00000-0  00000+0 0  9992
2 32260  53.2006 206.3469 0100322  37.2019 323.4658  2.00561198 75714
GPS BIIRM-5 (PRN 29)    
1 32384U 07062A   18042.52738712 -.00000052  00000-0  00000+0 0  9992
2 32384  56.3402  34.3500 0003813  15.4974 200.7943  2.00556603 74443
GPS BIIRM-6 (PRN 07)    
1 32711U 08012A   18042.32883759  .00000032  00000-0  00000-0 0  9990
2 32711  54.9827 272.0209 0112805 215.1531 144.1645  2.00561447 72641
GPS BIIRM-8 (PRN 05)    
1 35752U 09043A   18042.88872444 -.00000043  00000-0  00000-0 0  9996
2 35752  54.2919 149.7953 0051475  33.8217  40.6868  2.00567072 62243
GPS BIIF-1  (PRN 25)    
1 36585U 10022A   18042.52662424 -.00000085  00000-0  00000+0 0  9991
2 36585  55.8777 331.1277 0069974  45.1687 230.0999  2.00562388 56465
GPS BIIF-2  (PRN 01)    
1 37753U 11036A   18042.74043160 -.00000030  00000-0  00000-0 0  9990
2 37753  55.5837  91.2231 0071934  33.5854 123.1333  2.00563720 48159
GPS BIIF-3  (PRN 24)    
1 38833U 12053A   18042.51152726  .00000037  00000-0  00000-0 0  9990
2 38833  54.0120 268.6942 0066783  28.2653 332.1623  2.00565202 38421
GPS BIIF-4  (PRN 27)    
1 39166U 13023A   18042.36596050 -.00000058  00000-0  00000+0 0  9996
2 39166  55.9709  30.6946 0054145  17.9744 342.2310  2.00563500 34745
GPS BIIF-5  (PRN 30)    
1 39533U 14008A   18042.36184750  .00000026  00000-0  00000-0 0  9993
2 39533  54.1602 274.0319 0030965 185.5736 174.4588  2.00575270 28574
GPS BIIF-6  (PRN 06)    
1 39741U 14026A   18042.15174640 -.00000036  00000-0  00000-0 0  9990
2 39741  55.5681  90.7690 0013140 285.7108  74.2129  2.00575899 27400
GPS BIIF-7  (PRN 09)    
1 40105U 14045A   18042.73999968  .00000048  00000-0  00000-0 0  9991
2 40105  54.6008 210.2355 0009404 103.1807 256.9073  2.00562244 24980
GPS BIIF-8  (PRN 03)    
1 40294U 14068A   18042.60660749 -.00000043  00000-0  00000-0 0  9999
2 40294  55.0421 150.9743 0010964  17.8819 342.1425  2.00576704 24087
GPS BIIF-9  (PRN 26)    
1 40534U 15013A   18042.24835039 -.00000086  00000-0  00000+0 0  9999
2 40534  54.8236 329.9896 0026699 355.7373   4.2553  2.00571383 21121
GPS BIIF-10  (PRN 08)   
1 40730U 15033A   18042.41121649 -.00000059  00000-0  00000-0 0  9994
2 40730  55.5028  30.2559 0034465 324.8960  34.8913  2.00553751 18880
GPS BIIF-11  (PRN 10)   
1 41019U 15062A   18041.96156788 -.00000043  00000-0  00000+0 0  9990
2 41019  55.0486 150.7984 0033423 201.6064 158.2390  2.00564135 16699
GPS BIIF-12  (PRN 32)   
1 41328U 16007A   18042.54859440  .00000051  00000-0  00000-0 0  9992
2 41328  54.8537 210.4986 0017900 212.3850 147.4893  2.00568048 14767
COSMOS 2425 (716)       
1 29670U 06062A   18064.54369138 -.00000016  00000-0  10000-3 0  9998
2 29670  65.3304 296.0409 0022681 349.0431 130.3725  2.13104933 87103
COSMOS 2426 (717)       
1 29671U 06062B   18065.06534005 -.00000018  00000-0  10000-3 0  9996
2 29671  65.3473 296.1191 0016340 160.3239 215.7806  2.13103067 87122
COSMOS 2433 (720)       
1 32275U 07052A   18065.20105598 -.00000023  00000-0  10000-3 0  9993
2 32275  65.6406  56.8178 0005268 278.1391 177.2583  2.13104676 80635
COSMOS 2432 (719)       
1 32276U 07052B   18065.21206551 -.00000023  00000-0  10000-3 0  9996
2 32276  65.6521  56.8927 0013356 326.1350  89.8910  2.13103978 80638
COSMOS 2434 (721)       
1 32393U 07065A   18064.86762738 -.00000016  00000-0  00000-0 0  9992
2 32393  64.9458 295.0535 0004679  87.8756   0.0920  2.13102892 79335
COSMOS 2436 (723)       
1 32395U 07065C   18064.78800081 -.00000016  00000-0  10000-3 0  9993
2 32395  64.9531 295.1074 0016807   3.6084  73.2528  2.13104188 79262
COSMOS 2456 (730)       
1 36111U 09070A   18064.71997515  .00000011  00000-0  00000-0 0  9993
2 36111  64.1836 174.6364 0003720 327.8309 178.8428  2.13102829 63990
COSMOS 2457 (733)       
1 36112U 09070B   18064.50480874  .00000011  00000-0  00000-0 0  9996
2 36112  64.1655 174.5574 0006312 159.2142 309.7706  2.13101514 63998
COSMOS 2458 (734)       
1 36113U 09070C   18064.79548157  .00000010  00000-0  10000-3 0  9990
2 36113  64.1715 174.5571 0002006  35.4197 344.8319  2.13102101 64000
COSMOS 2459 (731)       
1 36400U 10007A   18065.08171978 -.00000025  00000-0  10000-3 0  9994
2 36400  65.5499  55.8954 0028530 346.9888 236.6284  2.13102235 62359
COSMOS 2461 (735)       
1 36401U 10007B   18064.74530337 -.00000026  00000-0  10000-3 0  9996
2 36401  65.5421  55.8818 0005212  42.9193 193.2020  2.13102214 62340
COSMOS 2460 (732)       
1 36402U 10007C   18064.89547503 -.00000026  00000-0  10000-3 0  9996
2 36402  65.5322  55.8467 0002801 298.0068  94.1689  2.13101696 62351
COSMOS 2464 (736)       
1 37139U 10041C   18064.88636742 -.00000017  00000-0  00000+0 0  9990
2 37139  64.5490 294.9084 0025378  13.6434 316.4803  2.13102707 58411
COSMOS 2471 (701K)      
1 37372U 11009A   18064.69806704 -.00000026  00000-0  00000-0 0  9991
2 37372  65.5309  55.7991 0009466 243.9820 138.5041  2.13107682 54620
COSMOS 2474 (742)       
1 37829U 11055A   18064.78113297  .00000011  00000-0  00000-0 0  9990
2 37829  64.5077 175.3092 0007548 244.8408 167.3639  2.13101855 49993
COSMOS 2476 (744)       
1 37867U 11064A   18065.15396905  .00000010  00000-0  00000+0 0  9991
2 37867  64.4878 175.3608 0017274 240.5552 143.6850  2.13101940 49353
COSMOS 2477 (745)       
1 37868U 11064B   18064.85955745  .00000011  00000-0  00000+0 0  9992
2 37868  64.4958 175.4178 0014856 241.3927  95.9625  2.13101705 49295
COSMOS 2475 (743)       
1 37869U 11064C   18064.43069235  .00000012  00000-0  00000-0 0  9999
2 37869  64.5031 175.4262 0019273 268.8982  56.0775  2.13101861 49293
COSMOS 2485 (747)       
1 39155U 13019A   18064.60968541  .00000012  00000-0  00000-0 0  9998
2 39155  64.6571 175.4658 0017601 235.0422 136.5743  2.13101905 37813
COSMOS 2492 (754)       
1 39620U 14012A   18065.14589000 -.00000025  00000-0  10000-3 0  9997
2 39620  65.4210  55.7377 0016871 324.1939 133.4047  2.13103446 30771
COSMOS 2500 (755)       
1 40001U 14032A   18064.74280587 -.00000027  00000-0  00000-0 0  9995
2 40001  65.3622  55.7290 0006723 231.8098 139.0301  2.13102792 28989
COSMOS 2501 (702K)      
1 40315U 14075A   18064.57280994 -.00000019  00000-0  00000-0 0  9994
2 40315  64.2760 296.1710 0014130 207.8351 195.4073  2.13098514 25381
COSMOS 2514 (751)       
1 41330U 16008A   18064.60258615 -.00000028  00000-0  00000-0 0  9999
2 41330  65.1642  55.8130 0010308 232.1940 211.7363  2.13103350 16145
COSMOS 2516 (753)       
1 41554U 16032A   18064.76885963 -.00000019  00000-0  00000-0 0  9993
2 41554  64.4957 295.9991 0010084 221.1164 241.8211  2.13101624 13755
COSMOS 2522 (752)       
1 42939U 17055A   18064.74741097 -.00000018  00000-0  00000-0 0  9993
2 42939  64.7242 295.9371 0005849 259.7431  53.1510  2.13101952  3504
GSAT0101 (PRN E11)      
1 37846U 11060A   18064.83099596 -.00000039  00000-0  00000+0 0  9996
2 37846  56.0296  64.3953 0005358 319.6846  40.2862  1.70473491 39668
GSAT0102 (PRN E12)      
1 37847U 11060B   18064.85317233 -.00000039  00000-0  00000+0 0  9990
2 37847  56.0303  64.3938 0006698 306.5126 112.6644  1.70475847 39675
GSAT0103 (PRN E19)      
1 38857U 12055A   18062.52599814 -.00000012  00000-0  00000-0 0  9998
2 38857  54.9070 184.8583 0002799 235.4692 124.4629  1.70473635 33542
GSAT0104 (PRN E20)      
1 38858U 12055B   18058.94071551 -.00000016  00000-0  00000-0 0  9997
2 38858  54.9077 184.9562 0001605 228.6387 131.2923  1.70473571 33483
GSAT0201 (PRN E18)      
1 40128U 14050A   18064.47909840 -.00000095  00000-0  00000-0 0  9990
2 40128  50.4370  34.7414 1642295  72.2692 304.9078  1.85519291 22215
GSAT0202 (PRN E14)      
1 40129U 14050B   18064.74586135 -.00000095  00000-0  00000-0 0  9999
2 40129  50.4875  33.7371 1642656  73.2230 304.0785  1.85519902 24359
GSAT0203 (PRN E26)      
1 40544U 15017A   18058.15738948 -.00000016  00000-0  00000+0 0  9995
2 40544  55.8140  64.8347 0004898 267.4570  92.5281  1.70475175 18175
GSAT0204 (PRN E22)      
1 40545U 15017B   18064.97912565 -.00000039  00000-0  00000+0 0  9997
2 40545  55.8262  64.6553 0002421 263.2599  96.7236  1.70475563 18293
GSAT0205 (PRN E24)      
1 40889U 15045A   18064.63473632 -.00000041  00000-0  00000-0 0  9993
2 40889  56.8165 304.9983 0004285  19.9146 340.1572  1.70474537 15430
GSAT0206 (PRN E30)      
1 40890U 15045B   18063.09482122 -.00000038  00000-0  00000+0 0  9993
2 40890  56.8176 305.0376 0002653  21.5765 338.4958  1.70474593 15435
GSAT0209 (PRN E09)      
1 41174U 15079A   18063.85267245 -.00000008  00000-0  00000+0 0  9994
2 41174  54.9204 184.5119 0003942 296.3321  63.5954  1.70473998 13763
GSAT0208 (PRN E08)      
1 41175U 15079B   18063.48599535 -.00000009  00000-0  00000+0 0  9995
2 41175  54.9185 184.5226 0002970 296.1687  63.7663  1.70473976 13769
GSAT0211 (PRN E02)      
1 41549U 16030A   18064.78055047 -.00000041  00000-0  00000-0 0  9994
2 41549  56.9563 304.7629 0002609 333.2444  26.7968  1.70474362 11093
GSAT0210 (PRN E01)      
1 41550U 16030B   18062.14084480 -.00000033  00000-0  00000+0 0  9997
2 41550  56.9580 304.8370 0001300 293.6338  66.4172  1.70474313 11034
GSAT0207 (PRN E07)      
1 41859U 16069A   18063.55960131 -.00000009  00000-0  00000-0 0  9997
2 41859  54.5790 185.0927 0003633 280.8378  79.0862  1.70473893  7968
GSAT0212 (PRN E03)      
1 41860U 16069B   18064.58615971 -.00000008  00000-0  00000-0 0  9991
2 41860  54.5762 185.0649 0002644 304.4764  55.4696  1.70473897  8073
GSAT0213 (PRN E04)      
1 41861U 16069C   18061.43304742 -.00000016  00000-0  00000-0 0  9993
2 41861  54.5789 185.1550 0002817 248.4731 111.4478  1.70473828  8028
GSAT0214 (PRN E05)      
1 41862U 16069D   18064.51273332 -.00000008  00000-0  00000-0 0  9997
2 41862  54.5772 185.0658 0002149 251.2598 108.6875  1.70474021  8069
GSAT0215 (PRN E21)      
1 43055U 17079A   18063.82426541 -.00000039  00000-0  00000+0 0  9993
2 43055  56.9288 304.6508 0001041 289.7923  70.2537  1.70473553  1391
GSAT0216 (PRN E25)      
1 43056U 17079B   18064.41438093 -.00000040  00000-0  00000-0 0  9998
2 43056  56.9329 304.6358 0002890 271.2172 270.9823  1.70473495  1398
GSAT0217 (PRN E27)      
1 43057U 17079C   18065.04014116 -.00000041  00000-0  00000+0 0  9995
2 43057  56.9231 304.6162 0002345 295.2280 136.0136  1.70473384  1425
GSAT0218 (PRN E31)      
1 43058U 17079D   18064.75523824 -.00000041  00000-0  00000+0 0  9994
2 43058  56.9275 304.6198 0003134 273.1654 208.2035  1.70473099  1412
BEIDOU G1               
1 36287U 10001A   18064.88655741 -.00000305  00000-0  00000-0 0  9990
2 36287   1.5120 355.7023 0001024 171.7847  95.2417  1.00274084 29830
BEIDOU G3               
1 36590U 10024A   18064.62271578 -.00000378  00000-0  00000+0 0  9995
2 36590   1.5715  37.5872 0007371 317.2322 143.1269  1.00276681 28449
BEIDOU IGSO 1           
1 36828U 10036A   18064.84040895 -.00000155  00000-0  10000-3 0  9990
2 36828  54.1595 190.9322 0061892 227.6397 162.6807  1.00247117 27884
BEIDOU G4               
1 37210U 10057A   18065.18391910 -.00000134  00000-0  00000+0 0  9996
2 37210   0.7417  42.7838 0005478 257.7184  89.5469  1.00271268 26954
BEIDOU IGSO 2           
1 37256U 10068A   18064.71913564 -.00000211  00000-0  10000-3 0  9992
2 37256  52.7726 308.1994 0058580 204.9162  27.0716  1.00257099 26462
BEIDOU IGSO 3           
1 37384U 11013A   18064.88940303 -.00000166  00000-0  10000-3 0  9993
2 37384  58.1644  70.1986 0034961 209.3241 322.7748  1.00293423 25341
BEIDOU IGSO 4           
1 37763U 11038A   18065.14662918 -.00000090  00000-0  10000-3 0  9990
2 37763  54.4646 193.3240 0049478 215.7905 261.8759  1.00259692 24312
BEIDOU IGSO 5           
1 37948U 11073A   18064.88089053 -.00000156  00000-0  10000-3 0  9990
2 37948  52.8509 307.6914 0049335 206.3868  62.6457  1.00274124 23061
BEIDOU G5               
1 38091U 12008A   18064.91610675  .00000035  00000-0  00000-0 0  9994
2 38091   2.1081  60.5783 0005646 250.2906 241.2169  1.00268756 22148
BEIDOU M3               
1 38250U 12018A   18064.74546796 -.00000067  00000-0  10000-3 0  9995
2 38250  56.4040  45.3911 0025182 235.1189 329.4788  1.86234403 39946
BEIDOU M4               
1 38251U 12018B   18065.09518515 -.00000067  00000-0  10000-3 0  9993
2 38251  56.3386  44.7967 0027159 229.2462 257.3671  1.86233748 39959
BEIDOU M6               
1 38775U 12050B   18064.56616689 -.00000007  00000-0  00000-0 0  9992
2 38775  54.8690 164.4653 0020966 236.4186  92.1749  1.86233089 37312
BEIDOU G6               
1 38953U 12059A   18065.03575162 -.00000197  00000-0  00000+0 0  9991
2 38953   1.6408  80.9237 0002755 221.1331 318.5376  1.00271435 19714
BEIDOU I1-S             
1 40549U 15019A   18064.75836058 -.00000179  00000-0  00000+0 0  9996
2 40549  54.1299 330.7798 0040001 186.7977  13.2654  1.00296704 10743
BEIDOU-3 M1             
1 40748U 15037A   18064.81626230 -.00000070  00000-0  00000-0 0  9994
2 40748  55.6110  44.6122 0009608 276.1797 293.5766  1.86231412 17772
BEIDOU-3 M2             
1 40749U 15037B   18064.61459520 -.00000070  00000-0  00000-0 0  9999
2 40749  55.6111  44.6041 0010836 288.0178 283.5092  1.86232514 17768
BEIDOU I2-S             
1 40938U 15053A   18064.58716947 -.00000132  00000-0  00000+0 0  9990
2 40938  53.8390 293.7116 0047876 173.7289   3.8177  1.00281119  9022
BEIDOU M3-S             
1 41315U 16006A   18064.81298677 -.00000008  00000-0  00000-0 0  9993
2 41315  55.0524 164.7289 0002357 320.3143  39.6853  1.86230622 14253
BEIDOU IGSO 6           
1 41434U 16021A   18064.59819922 -.00000111  00000-0  10000-3 0  9998
2 41434  55.8878  69.5252 0029691 190.9443 210.6429  1.00254532  7154
BEIDOU G7               
1 41586U 16037A   18064.14608126 -.00000273  00000-0  00000-0 0  9991
2 41586   0.8743 336.7023 0002499 317.9394  65.2992  1.00270033  6456
BEIDOU-3 M1             
1 43001U 17069A   18064.69860082 -.00000007  00000-0  00000-0 0  9997
2 43001  55.0249 164.2535 0009123 275.4777 275.1660  1.86231744  2257
BEIDOU-3 M2             
1 43002U 17069B   18065.02944097 -.00000009  00000-0  00000+0 0  9996
2 43002  55.0269 164.2771 0008891 297.0640 160.2920  1.86231509  2254
BEIDOU-3 M3             
1 43107U 18003A   18064.65837519 -.00000070  00000-0  00000-0 0  9998
2 43107  55.0208  46.2608 0004711 353.6828  20.0829  1.86232858  1017
BEIDOU-3 M4             
1 43108U 18003B   18064.58564558 -.00000070  00000-0  00000-0 0  9991
2 43108  55.0174  46.2587 0004353 248.1651 121.8592  1.86232563  1010
BEIDOU-3 M5             
1 43207U 18018A   18065.01818283 -.00000009  00000-0  00000+0 0  9994
2 43207  54.9846 164.4091 0006927 313.9517  46.0038  1.86231702   407
BEIDOU-3 M6             
1 43208U 18018B   18064.54808414 -.00000006  00000-0  00000-0 0  9995
2 43208  54.9865 164.4341 0008384 286.6037  73.3155  1.86231460   391
`;
  }

  GMST(jd: number) {
    var y = 18.697374558 + 24.06570982441908 * (jd - 2451545.0);

    return ((y % 24) * Math.PI) / 12;
  }

  Rev(n: number) {
    var x = n;

    if (x > 0.0) {
      while (x > 360.0) {
        x -= 360.0;
      }
    } else {
      while (x < 0.0) {
        x += 360.0;
      }
    }

    return x;
  }

  getMST(now: Date, lon: number) {
    var year = now.getUTCFullYear();
    var month = now.getUTCMonth() + 1;
    var day = now.getUTCDate();
    var hour = now.getUTCHours();
    var minute = now.getUTCMinutes();
    var second = now.getUTCSeconds();

    if (month == 1 || month == 2) {
      year = year - 1;
      month = month + 12;
    }

    var a = Math.floor(year / 100);
    var b = 2 - a + Math.floor(a / 4);
    var c = Math.floor(365.25 * year);
    var d = Math.floor(30.6001 * (month + 1));
    var jd =
      b + c + d - 730550.5 + day + (hour + minute / 60 + second / 3600) / 24;
    var jt = jd / 36525.0; // julian centuries since J2000.0
    var GMST =
      280.46061837 +
      360.98564736629 * jd +
      0.000387933 * jt * jt -
      (jt * jt * jt) / 38710000 +
      lon;

    if (GMST > 0.0) {
      while (GMST > 360.0) {
        GMST -= 360.0;
      }
    } else {
      while (GMST < 0.0) {
        GMST += 360.0;
      }
    }

    return GMST;
  }

  tle2lla(now: number, tle: any[][]) {
    var a = 6378135;
    var rad = Math.PI / 180;
    var deg = 180 / Math.PI;
    var lla = [];

    for (var i = 0; i < tle.length; i++) {
      var rev = tle[i][11],
        n_dot = tle[i][12],
        e = tle[i][3],
        M0 = tle[i][10] * rad,
        per = tle[i][9] * rad,
        raan = tle[i][8] * rad,
        inc = tle[i][5] * rad,
        year = tle[i][13],
        day = tle[i][4];
      var epoch = new Date(Date.UTC(year, 0, day));
      epoch.setSeconds((day * 86400) % 86400);
      var t = (now - epoch.getTime() / 1000) / 86400; // in days!
      var T = 24 / (rev + n_dot * t); // Period in hours
      var r = 1000 * Math.pow(6028.9 * 60 * T, 2 / 3); // semi major axis in m
      M0 += 2 * Math.PI * (rev * t + (n_dot * t * t) / 2);
      var E0 = M0 + e * Math.sin(M0) + (e * e * Math.sin(2 * M0)) / 2;
      for (var err = 1; Math.abs(err) > 0.00000001; E0 -= err) {
        err = E0 - e * Math.sin(E0) - M0;
      }
      // perifocal coordinate system
      var x0 = r * (Math.cos(E0) - e); // r*Cos(trueanomaly)
      var y0 = r * Math.sqrt(1 - e * e) * Math.sin(E0); //r*sin(trueanomaly)
      var r0 = Math.sqrt(x0 * x0 + y0 * y0); // distance
      per +=
        (rad *
          4.97 *
          t *
          Math.pow(a / r, 3.5) *
          (5 * Math.cos(inc) * Math.cos(inc) - 1)) /
        ((1 - e * e) * (1 - e * e));
      raan -=
        (rad * 9.95 * t * Math.pow(a / r, 3.5) * Math.cos(inc)) /
        ((1 - e * e) * (1 - e * e));
      var Px =
        Math.cos(per) * Math.cos(raan) -
        Math.sin(per) * Math.sin(raan) * Math.cos(inc);
      var Py =
        Math.cos(per) * Math.sin(raan) +
        Math.sin(per) * Math.cos(raan) * Math.cos(inc);
      var Pz = Math.sin(per) * Math.sin(inc);
      var Qx =
        -Math.sin(per) * Math.cos(raan) -
        Math.cos(per) * Math.sin(raan) * Math.cos(inc);
      var Qy =
        -Math.sin(per) * Math.sin(raan) +
        Math.cos(per) * Math.cos(raan) * Math.cos(inc);
      var Qz = Math.cos(per) * Math.sin(inc);
      var x = Px * x0 + Qx * y0; // xyz ECI coordinate system (geocentric)
      var y = Py * x0 + Qy * y0;
      var z = Pz * x0 + Qz * y0;
      var lat = Math.atan2(z, Math.sqrt(x * x + y * y));
      var lon =
        this.Rev(
          deg * Math.atan2(y, x) - this.getMST(new Date(now * 1000), 0.0)
        ) * rad;

      if (lon > Math.PI) {
        lon -= 2 * Math.PI;
      }

      var alt = r0 - a;

      lla.push([lat, lon, alt]);
    }

    return lla;
  }
}
