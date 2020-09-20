import { Component, OnInit, Input } from '@angular/core';
import { Result } from 'src/app/_models/Result';

@Component({
  selector: 'app-user-results',
  templateUrl: './user-results.component.html',
  styleUrls: ['./user-results.component.css']
})
export class UserResultsComponent implements OnInit {

  constructor() { }

  @Input() results: Result[];

  ngOnInit() {
  }

}
