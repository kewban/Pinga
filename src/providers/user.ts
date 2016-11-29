import {Injectable} from "@angular/core";
import {ParsePushProvider} from "./parse-push";
import {IonicUtilProvider} from "./ionic-util";
import {IUserFollow} from "../models/user.model";
import * as PouchDB from "pouchdb";
//import _ from "underscore";
declare var Parse: any;

@Injectable()
export class UserProvider {
    db: any;
    dbFollowing: any;
    dbFolllowers: any;

    data: any[]          = [];
    dataFollowers: any[] = [];
    dataFollowing: any[] = [];

    private _fields          = [
        'name',
        'username',
        'status',
        'gender',
        'email',
        'photo',
        'photoThumb',
        'roleName',
    ];
    private _ParseObject     = Parse.User.extend({});
            cordova: boolean = false;

    constructor(private ParsePush: ParsePushProvider, private util: IonicUtilProvider) {
        this.cordova = this.util.cordova;

        // Start
        this.db           = new PouchDB('User');
        this.dbFollowing  = new PouchDB('UserFollowing');
        this.dbFolllowers = new PouchDB('UserFollowers');

        this._fields.map(field => {
            Object.defineProperty(this._ParseObject.prototype, field, {
                get: function () { return this.get(field) },
                set: function (value) { this.set(field, value) }
            });
        });

        // This is a GeoPoint Object
        Object.defineProperty(this._ParseObject.prototype, 'location', {
            get: function () { return this.get('location'); },
            set: function (val) {
                this.set('location', new Parse.GeoPoint({
                    latitude : val.latitude,
                    longitude: val.longitude
                }));
            }
        });
    }

    current(): any {
        return new Parse.User.current();
    }

    fetch() {
        return new Promise((resolve, reject) => {
            if (Parse.User.current()) {
                Parse.User.current().fetch().then(resolve, reject);
            } else {
                reject();
            }
        });
    }


    update(form) {
        return Parse.User.current().save(form);
    }

    updatePhoto(parseFile) {
        let user = Parse.User.current();
        user.set('photo', parseFile);
        return user.save();
    }

    recoverPassword(email: string) {
        return Parse.User.requestPasswordReset(email);
    }

    profile(username: string) {
        return Parse.Cloud.run('profile', {username: username})
    }

    logout(): void {
        Parse.User.logOut();
    }

    updateWithFacebookData() {
        return Parse.Cloud.run('saveFacebookPicture');
    }

    facebookSyncProfile(fbData: any) {
        return new Promise((resolve, reject) => {
            let currentUser = Parse.User.current();

            if (!currentUser.get('facebook') && fbData.id) {
                currentUser.set('facebook', fbData.id);
            }

            if (!currentUser.get('email') && fbData.email) {
                currentUser.set('email', fbData.email);
            }

            if (!currentUser.get('name') && fbData.name) {
                currentUser.set('name', fbData.name);
            }

            if (!currentUser.get('gender') && fbData.gender) {
                currentUser.set('gender', fbData.gender);
            }

            if (!currentUser.get('birthdate') && fbData.birthday) {
                currentUser.set('birthdate', new Date(fbData.birthday));
            }

            currentUser.save(null).then(() => {
                if (!currentUser.get('photo')) {
                    this.updateWithFacebookData().then(resolve);
                } else {
                    resolve();
                }
            });
        });
    }

    signUp(data) {
        let user = new Parse.User();
        user.set('name', data.name);
        user.set('username', data.username);
        user.set('email', data.email)
        user.set('password', data.password)
        user.set('roleName', 'UserProvider')
        return user.signUp(null);

    }

    signIn(obj) {
        return new Promise((resolve, reject) => {
            Parse.User.logIn(obj.username, obj.password).then(currentUser => {

                if (this.cordova) {
                    // Parse Push
                    this.ParsePush.init();
                }
                resolve(currentUser);

            }, reject);
        });
    }

    changePassword(password: string) {
        return Parse.Cloud.run('changePassword', {password: password});
    }

    destroy(data) {
        return Parse.Cloud.run('destroyUser', data);
    }

    validateEmail(input: string) {
        return Parse.Cloud.run('validateEmail', {email: input});
    }

    validateUsername(input: string) {
        return Parse.Cloud.run('validateUsername', {username: input});
    }

    all(params: any) {
        return Parse.Cloud.run('getUsers', params);
    }

    follow(params: IUserFollow) {
        return Parse.Cloud.run('followUser', params);
    }

    findByEmail(email: string) {
        return Parse.Cloud.run('findUserByEmail', {email: email});
    }

    findUserFacebook(facebookId: string) {
        return Parse.Cloud.run('findUserFacebookId', {facebookId: facebookId});
    }

    list(params: any) {
        return Parse.Cloud.run('listUsers', params)
    }

    getLikers(galleryId: string) {
        return Parse.Cloud.run('getLikers', {galleryId: galleryId})
    }

    getFollowers(username: string): Promise<any> {
        return Parse.Cloud.run('getFollowers', {username: username})
    }

    getFollowing(username: string, force: boolean = false): Promise<any> {
        return new Promise(resolve => {
            if (!force) {
                if (this.dataFollowing) {
                    resolve(this.dataFollowing);
                } else {
                    this.getFollowingCache().then(resolve)
                }
            } else {
                Parse.Cloud.run('getFollowing', {username: username}).then(data => {
                    if (data) {
                        let promises = [];
                        data.map(item => promises.push(this.dbFollowing.put(item)));
                        Promise.all(promises)
                               .then(this.getFollowingCache)
                               .then(resolve);
                    }
                })
            }
        });
    }

    getFollowingCache(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.dbFollowing.allDocs({include_docs: true}).then(result => {
                if (result.total_rows) {
                    this.dataFollowing = [];
                    result.rows.map(row => this.dataFollowing.push(row.doc));
                    resolve(this.dataFollowing)
                }
            })
        });
    }

}
