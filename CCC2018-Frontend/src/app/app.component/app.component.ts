import {Component, OnInit} from '@angular/core';
import {LatLngLiteral, MouseEvent} from '@agm/core';
import {Marker, DBService} from '../db.service/db.service';
import {MatDialog} from '@angular/material';

/**
 * The controller of app page.
 * @author Xinda Yu
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  /**
   * switch of map info display
   * @type {boolean}
   */
  displayAge = true;
  displayTwtSentiment = true;
  displayGameRelated = false;
  displayIncome = false;
  /**
   * the camera place and zoom of map canvas
   */
  lat: number;
  lng: number;
  zoom: number;
  /**
   * The map markers
   */
  markers: Marker[];

  /**
   *
   */
  selectedCity: string;
  /**
   * the labels of diagrams
   */
  ageLabels: string[] = ['0-19', '19-30', '30-40', '40-55', 'above'];
  twtLabels: string[] = ['Positive', 'Negative', 'Neutral'];
  gameLabels: string[] = ['Related', 'Unrelated'];
  incomeLabels = ['Negative income', 'No income', 'Weekly 1-499', 'Weekly 500-999',
    'Weekly 1000-1999', 'Weekly 2000-2999', 'Weekly Over 3K'];

  constructor(private dbService: DBService, public dialog: MatDialog) {
    // set map to Australia Center
    this.lat = -25.274398;
    this.lng = 133.775136;
    this.zoom = 4;
  }

  /**
   * initialize the map data
   */
  ngOnInit() {
    // load real data from db service
    this.reloadData(0);
  }

  /**
   * reload data from CouchDB
   * @param sid
   */
  reloadData(sid) {
    // alert('Button Clicked');
    // this.dbService.loadDBData();
    this.markers = this.dbService.loadMarkerData();
    // console.log(this.markers);
  }

  /**
   * The event handler of map clicks
   * @param {MouseEvent} $event
   */
  mapClicked($event: MouseEvent) {
    // cancel selection
    this.selectedCity = '';
    for (const x of this.markers) {
      x.selected = false;
    }
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng
    // });
  }

  /**
   * The event handler of map marker clicks.
   * @param {string} label
   * @param {number} index
   */
  markerClicked(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`);
    const cmarker = this.markers[index];
    console.log(cmarker);
    for (let i = 0; i < this.markers.length; i++) {
      if (i !== index) {
        this.markers[i].selected = false;
      } else {
        this.markers[i].selected = true;
      }
    }
    // Set camera a little higher to show the info window
    if (this.markers[index].type === 'city') {
      this.lat = cmarker.lat + 0.7;
      this.lng = cmarker.lng;
    } else {
      this.lat = cmarker.lat;
      this.lng = cmarker.lng;
    }
    if (cmarker.type === 'city') {
      this.zoom = 6;
      this.selectedCity = cmarker.city;
      console.log(this.selectedCity);
    } else {
      this.zoom = 10;
    }
  }

  /**
   * Open the about dialog
   */
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      maxWidth: '400px'
    });
  }

  /**
   * reset map to view whole Australia
   */
  resetMap() {
    this.lat = -25.274398;
    this.lng = 133.775136;
    this.zoom = 4;
  }

  /**
   * zoom in one level
   */
  zoomin() {
    this.zoom++;
  }

  /**
   * zoom out one level
   */
  zoomout() {
    this.zoom--;
  }
}

/**
 * the controller of the about dialog. Necessary
 */
@Component({
  selector: 'app-dialog',
  templateUrl: 'about.html',
})
export class DialogComponent {
  ok() {

  }
}
