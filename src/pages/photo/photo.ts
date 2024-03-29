import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {GalleryProvider} from "../../providers/gallery";


@Component({
    selector   : 'page-photo',
    templateUrl: 'photo.html'
})
export class PhotoPage {

    item: any;
    _id: any;
    _loading: boolean = false;

    constructor(private navParams: NavParams,
                private provider: GalleryProvider
    ) {
        this.item = this.navParams.get('item');
        this._id   = this.navParams.get('id');

        if (!this.item) {
            this._loading = true;
            this.provider.get(this._id).then(gallery => {
                this.item    = gallery;
                this._loading = false;
            });
        }
    }

}
