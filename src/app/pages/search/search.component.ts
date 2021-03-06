import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ItemState } from 'src/app/state/products/item.state';
import { Observable } from 'rxjs';
import { ChangePage, AddItem, GetNextItemBatch } from 'src/app/state/products/item.actions';
import { Message } from 'src/app/state/products/item.model';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { map, first, filter } from 'rxjs/operators';

export interface MessageId extends Message {
  id: string;
}
@Component({
  selector: 'app-search',
  templateUrl: 'search.component.html',
  styleUrls: [ 'search.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Select(ItemState.getItems) stateItems$: Observable<Message[]>;
  @Select(ItemState.noMorePages) isLastPage$: Observable<boolean>;
  pageNumber: number;
  message: string = 'sumthing';
  private messageCollection: AngularFirestoreCollection<Message>;

  constructor(private store: Store, private afs: AngularFirestore) {}
  ngOnInit() {
    this.scrollToBottom();
    this.stateItems$.pipe(filter((list) => list.length > 0), first()).subscribe((list) => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
  next(page: number) {
    this.store.dispatch(new ChangePage('next'));
  }
  previous(page: number) {
    this.store.dispatch(new ChangePage('previous'));
  }

  sendMessage() {
    this.store.dispatch(
      new AddItem({
        message: this.message,
        uid: this.afs.createId(),
        dateCreated: firebase.firestore.Timestamp.now(),
      }),
    );
  }
  scrollHandler(e) {
    if (e === 'top') {
      console.log(e);

      this.store.dispatch(new GetNextItemBatch());
    }
  }
  trackByUid(i, item) {
    return item.uid;
  }
}
