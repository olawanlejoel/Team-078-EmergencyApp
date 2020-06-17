import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/user/auth.service';
import * as firebase from 'firebase';
import { Geolocation } from '@capacitor/core';
declare var google;
@Component({
  selector: 'app-admin-add-danger',
  templateUrl: './admin-add-danger.page.html',
  styleUrls: ['./admin-add-danger.page.scss'],
})

export class AdminAddDangerPage implements OnInit , OnDestroy {
  
  addDangerForm: FormGroup;
  @ViewChild(GoogleMapComponent, { static: false })
  map: GoogleMapComponent;
  private latitude: number;
  private longitude: number;
  public loading: HTMLIonLoadingElement;
  data: any;
  markerlatlong = {
    lat: 0,
    lng: 0
  };
  dangerInfo = {
    dangerType: '',
    description: '',
    latLong: this.markerlatlong,
  };

  

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private _auth: AuthService
  ) { }
  private routeSub:any; 
  ngOnInit() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.map.init().then(
          res => {
            this.setLocation();
          },
          err => {
            console.log(err);
          }
        );
      }
    });
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // save your data
        this.map.disableMap();
      }
    });
  }

 
  @HostListener('unloaded')
  ngOnDestroy() {
    this.map.disableMap();
  }

  async adminAddDanger(): Promise<void> {
    if (this.dangerInfo.dangerType !== '' &&
      this.dangerInfo.description !== '') {
      const latLong = this.map.marker.position;
      this.markerlatlong.lat = latLong.lat();
      this.markerlatlong.lng = latLong.lng();
      this.dangerInfo.latLong = this.markerlatlong;

      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      this._auth.addDanger(
        this.dangerInfo.dangerType,
        this.dangerInfo.description,
        this.dangerInfo.latLong.lng,
        this.dangerInfo.latLong.lat,
      ).then(() => {
        this.loading.dismiss().then(() => {
          this.alertCtrl
            .create({
              header: 'Location	set!',
              message: 'Danger Added',
              buttons: [{ text: 'Ok' }]
            })
            .then(alert => {
              alert.present();
              this.dangerInfo.dangerType = '';
              this.dangerInfo.description = '';
            });
        });

      }, error => {
        this.loading.dismiss().then(async () => {
          const alert = await this.alertCtrl.create({ message: error.message, buttons: [{ text: 'Ok', role: 'cancel' }] });
          await alert.present();
        });
      });

    } else {
      this.alertCtrl
        .create({
          header: 'Error!',
          message: 'All fields are required',
          buttons: [{ text: 'Ok' }]
        }).then(alert => {
          alert.present();
        });
    }
  }

  setLocation(): void {
    this.loadingCtrl
      .create({
        message: 'Setting current location...'
      })
      .then(overlay => {
        overlay.present();
        Geolocation.getCurrentPosition().then(
          position => {
            overlay.dismiss();
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.map.changeMarkerWithoutAni(this.latitude, this.longitude);
            const data = {
              latitude: this.latitude,
              longitude: this.longitude
            };
            this.markerlatlong.lat = this.latitude;
            this.markerlatlong.lng = this.longitude;
            this.dangerInfo.latLong = this.markerlatlong;
            this.alertCtrl
              .create({
                header: 'Map set!',
                message: 'Select Location',
                buttons: [{ text: 'Ok' }]
              })
              .then(alert => {
                alert.present();
              });
          },
          err => {
            console.log(err);
            overlay.dismiss();
          }
        );

        google.maps.event.addListener(this.map.map, 'dragend', () => {
          const center = this.map.map.getCenter();
          this.map.changeMarkerWithoutAni(center.lat(), center.lng());
        });

      });
  }

}
