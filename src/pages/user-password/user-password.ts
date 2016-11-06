import {Component} from '@angular/core';
import {NavController, ViewController} from 'ionic-angular';
import {User} from '../../providers/user';
import {IonicUtil} from '../../providers/ionic-util';

interface IPassword {
    password: string
}

@Component({
    selector   : 'page-user-password',
    templateUrl: 'user-password.html'
})
export class UserPassword {

    submitted: boolean = false;
    form: any          = {
        password       : '',
        changepassword : '',
        confirmpassword: '',
    };

    constructor(private viewCtrl: ViewController,
                private ionicUtil: IonicUtil,
                private provider: User,
    ) {

    }

    save(form) {
        this.submitted = true;
        if (form.valid) {
            this.ionicUtil.onLoading();
            this.provider.changePassword(this.form.password).then(user => {
                this.dismiss();
                this.ionicUtil.endLoading();
            });
        }
    }


    dismiss() {
        this.viewCtrl.dismiss();
    }
}
