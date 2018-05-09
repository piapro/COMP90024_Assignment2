import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import * as file from 'file-system';
import * as filesys from 'fs';
import * as Nano from 'nano';

import {LatLngLiteral} from '@agm/core';

const nano: Nano.ServerScope = <Nano.ServerScope> Nano('http://115.146.86.141:5985');


/**
 * Hashmaps of data. Will be filled with data later.
 * @type {}
 */
const DB_DATA = {};
const AGE_DATA = {};
const INCOME_DATA = {};

/**
 * The handler of all data
 * @author Xinda Yu
 */
@Injectable()
export class DBService {

  suburbDetail = [];
  gmapcount = 0;
  /**
   * initialize the service.
   * @param {HttpClient} http
   */
  constructor(private http: HttpClient) {
    this.loadAgeData();
    this.loadIncomeData();
    this.loadDBData();
  }

  /**
   * load twitter data from database.
   */
  loadDBData() {
    const cloud_db = nano.db.use('twitter_db');
    // load db data
    cloud_db.view('scenario1', 'test', {
      'group_level': 3,
      // 'include_docs': true
    }, function (err, body) {
      if (!err) {
        console.log(body.rows);
        body.rows.forEach(function (row) {
          if (!DB_DATA[row.key[0]]) {
            DB_DATA[row.key[0]] = {};
          }
          if (!DB_DATA[row.key[0]][row.key[1]]) {
            DB_DATA[row.key[0]][row.key[1]] = {};
          }
          DB_DATA[row.key[0]][row.key[1]][row.key[2]] = row.value;
        });
        console.log(DB_DATA);
      } else {
        console.log(err);
      }
    });
  }

  // load data and fill markers on map.
  loadMarkerData(): Array<Marker> {
    console.log('loading suburb data...');
    for (const city of Object.keys(DB_DATA)) {
      const cityData = {
        Positive: 0,
        Negative: 0,
        Neutral: 0,
        Related: 0,
        'Not related': 0
      };
      for (const suburb of Object.keys(DB_DATA[city])) {
        this.loadSuburbMap(city, suburb);
        for (const x of ['Positive', 'Negative', 'Neutral', 'Related', 'Not related']) {
          if (!DB_DATA[city][suburb][x]) {
            DB_DATA[city][suburb][x] = 0;
          }
          cityData[x] += DB_DATA[city][suburb][x];
        }
      }
      this.loadCityMap(city, cityData);
    }
    return this.suburbDetail;
  }

  /**
   * retrieve suburb info from google maps. Uses all the info needed to create a marker.
   * @param city
   * @param sub
   */
  loadSuburbMap(city, sub) {
    this.http.get('https://maps.googleapis.com/maps/api/geocode/json?' +
      'address=' + sub + city + '+Austrilia&key=AIzaSyDfnD1_7ok9l6GdHUWU21uxdQvOMpMOty4&language=en&region=au').subscribe(data => {
      // console.log(JSON.stringify(data));
      this.gmapcount++;
      if (data['results'][0]) {
        if (data['results'][0]['geometry']) {
          const bounds = data['results'][0]['geometry']['bounds'];
          const lat = data['results'][0]['geometry']['location'].lat;
          const lng = data['results'][0]['geometry']['location'].lng;
          if (!DB_DATA[city][sub]['Related']) {
            DB_DATA[city][sub]['Related'] = 0;
          }
          const suburbMarker: Marker = {
            name: sub,
            lat: lat,
            lng: lng,
            paths: this.parsePolygon(bounds),
            city: city,
            positive: DB_DATA[city][sub]['Positive'],
            negative: DB_DATA[city][sub]['Negative'],
            neutral: DB_DATA[city][sub]['Neutral'],
            gameRelated: DB_DATA[city][sub]['Related'],
            gameUnrelated: DB_DATA[city][sub]['Not related'],
            gameData: [DB_DATA[city][sub]['Related'], DB_DATA[city][sub]['Not related']],
            selected: false,
            zIndex: 1
          };
          if (!suburbMarker.gameRelated) {
            suburbMarker.gameRelated = 0;
          }
          this.suburbDetail.push(suburbMarker);
        } else {
          // console.log(city, sub);
        }
      } else {
        console.log(city, sub, 'not found');
      }
    });
  }

  /**
   * Retrieve City data from Google maps, sum all suburbs, and use all these data to create a marker.
   * @param city
   * @param cityData
   */
  loadCityMap(city, cityData) {
    this.http.get('https://maps.googleapis.com/maps/api/geocode/json?' +
      'address=' + city + '+Austrilia&key=AIzaSyDfnD1_7ok9l6GdHUWU21uxdQvOMpMOty4&language=en&region=au').subscribe(data => {
      const result = data['results'][0];
      this.gmapcount++;
      const bounds = result['geometry']['bounds'];
      const lat = result['geometry']['location'].lat;
      const lng = result['geometry']['location'].lng;
      if (!cityData['Related']) {
        cityData['Related'] = 0;
      }
      const cityMarker: Marker = {
        name: city,
        type: 'city',
        city: city,
        lat: lat,
        lng: lng,
        paths: this.parsePolygon(bounds),
        positive: cityData['Positive'],
        negative: cityData['Negative'],
        neutral: cityData['Neutral'],
        gameRelated: cityData['Related'],
        gameUnrelated: cityData['Not related'],
        gameData: [cityData['Related'], cityData['Not related']],
        selected: false,
        ageBarData: [{
          data: [
            AGE_DATA[city]['age_0_19'],
            AGE_DATA[city]['age_19_30'],
            AGE_DATA[city]['age_30_40'],
            AGE_DATA[city]['age_40_55'],
            AGE_DATA[city]['age_50_above']
          ], label: 'Age Group'
        }],
        incomePieData: [
          INCOME_DATA[city]['Negative'],
          INCOME_DATA[city]['0'],
          INCOME_DATA[city]['1_499'],
          INCOME_DATA[city]['500_999'],
          INCOME_DATA[city]['1000_1999'],
          INCOME_DATA[city]['2000_2999'],
          INCOME_DATA[city]['Over_3K']
        ],
        zIndex: 1000
      };
      this.suburbDetail.push(cityMarker);
    });
  }

  /**
   * load aurin age data from the database. MapReduce is used in the CouchDB to do this.
   */
  loadAgeData() {
    const aurin_age = nano.db.use('new_aurin_age');
    aurin_age.view('aurinage', 'all', {}, function (err, body) {
      if (!err) {
        // console.log(body.rows);
        body.rows.forEach(function (row) {
          if (!AGE_DATA[row.key[0]]) {
            AGE_DATA[row.key[0]] = {};
          }
          AGE_DATA[row.key[0]][row.key[1]] = row.value;
        });
        console.log(AGE_DATA);
      } else {
        console.log(err);
      }
    });
  }

  /**
   * load aurin income data from the database. MapReduce is used in the CouchDB to do this.
   */
  loadIncomeData() {
    const aurin_age = nano.db.use('new_aurin_income');
    aurin_age.view('aurinincome', 'all', {}, function (err, body) {
      if (!err) {
        // console.log(body.rows);
        body.rows.forEach(function (row) {
          if (!INCOME_DATA[row.key[0]]) {
            INCOME_DATA[row.key[0]] = {};
          }
          INCOME_DATA[row.key[0]][row.key[1]] = row.value;
        });
        console.log(INCOME_DATA);
      } else {
        console.log(err);
      }
    });
  }

  /**
   * The GoogleMaps data includes crude geo NE and SW bounds. Utilize that to draw a rectangle on map canvas.
   * @param bounds
   * @returns {Array<LatLngLiteral>}
   */
  parsePolygon(bounds): Array<LatLngLiteral> {
    const res: Array<LatLngLiteral> = [];
    if (!bounds) {
      return [];
    }
    res.push(bounds['northeast']);
    res.push({lat: bounds['northeast'].lat, lng: bounds['southwest'].lng});
    res.push(bounds['southwest']);
    res.push({lat: bounds['southwest'].lat, lng: bounds['northeast'].lng});
    return res;
  }
}

/**
 * The Marker class. Includes all needed fields and is used for both city and suburb. N
 */
export interface Marker {
  lat: number;
  lng: number;
  city?: string;
  paths?: Array<LatLngLiteral>;
  positive: number;
  negative: number;
  neutral: number;
  selected: boolean;
  postcode?: number;
  name?: string;
  gameData?: number[];
  gameRelated?: number;
  gameUnrelated?: number;
  zIndex?: number;
  agePieData?: number[];
  ageBarData?: any[];
  type?: string;
  incomePieData?: number[];
  // aveAge?: number;
  // totalTweets: number;
}
