import {Injectable} from '@angular/core';

declare var Parse: any;

@Injectable()
export class UserData {

    private _fields = [
        'followingsTotal',
        'followersTotal',
        'commentsTotal',
        'galleriesTotal',
        'albumTotal',
        'photo',
        'status',
        'name',
        'username',
        'user',
    ];

    private _ParseObject: any = Parse.Object.extend('UserData', {});
    public current: any;

    constructor() {
        this.current = Parse.User.current();
        this._fields.map(field => {
            Object.defineProperty(this._ParseObject.prototype, field, {
                get: function () {return this.get(field)},
                set: function (value) { this.set(field, value)}
            });
        });

        // This is a GeoPoint Object
        Object.defineProperty(this._ParseObject.prototype, 'location', {
            get: function () {return this.get('location');},
            set: function (val) {
                this.set('location', new Parse.GeoPoint({
                    latitude : val.latitude,
                    longitude: val.longitude
                }));
            }
        });
    }

    profile(username) {
        return Parse.Cloud.run('profile', {username: username})
    }
}
