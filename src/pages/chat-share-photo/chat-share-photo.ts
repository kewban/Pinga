import {Component, ViewChild} from "@angular/core";
import {NavController, Content, ViewController, App, NavParams} from "ionic-angular";
import {ChatChannelProvider} from "../../providers/chat-channel";
import {ChatMessagePage} from "../chat-message/chat-message";

@Component({
    selector   : 'page-chat-share-photo',
    templateUrl: 'chat-share-photo.html'
})
export class ChatSharePhotoPage {

    @ViewChild('Content') content: Content;

    image: any;
    errorIcon: string      = 'chatbubbles';
    errorText: string      = '';
    data                   = [];
    loading: boolean       = true;
    showEmptyView: boolean = false;
    showErrorView: boolean = false;
    moreItem: boolean      = false;


    constructor(public navCtrl: NavController,
                private provider: ChatChannelProvider,
                private viewCtrl: ViewController,
                private app: App,
                private params: NavParams
    ) {
    }

    ionViewDidLoad() {
        console.log('Hello ChatChannelPage Page');

        this.image = this.params.get('image');

        console.log(this.image);

        this.findCache();
    }

    onPageMessage(item) {
        this.dismiss();
        this.app.getRootNav().push(ChatMessagePage, {channel: item.id, image: this.image});
        //this.navCtrl.push(ChatMessagePage, {channel: item.id, photo: this.photo});
    }


    findCache() {
        return new Promise((resolve, reject) => {
            this.loading = true;
            this.provider.findCache().then(data => {
                console.log(data);
                if (data) {
                    this.data          = data;
                    this.showEmptyView = false;
                    this.showErrorView = false;
                } else {
                    this.moreItem = false;
                }

                if (this.data.length < 1) {
                    this.showEmptyView = true;
                }

                this.loading = false;
                resolve(data);
            }, error => {
                this.showErrorView = true;
                reject(error);
            });
        });
    }

    find() {
        return new Promise((resolve, reject) => {
            this.loading = true;
            this.provider.find().then(data => {
                console.log(data);
                if (data) {
                    this.data          = data;
                    this.showEmptyView = false;
                    this.showErrorView = false;
                } else {
                    this.moreItem = false;
                }

                if (this.data.length < 1) {
                    this.showEmptyView = true;
                }

                this.loading = false;
                resolve(data);
            }, error => {
                this.showErrorView = true;
                reject(error);
            });
        });
    }


    public scrollTop() {
        this.content.scrollToTop();
    }


    public doRefresh(event?) {
        this.find().then(() => event.complete());
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
