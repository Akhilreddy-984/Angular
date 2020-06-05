import { Component, OnInit ,Input,ViewChild,Inject} from '@angular/core';
import {Dish} from '../shared/dish';
//import{DISHES} from '../shared/dishes';

import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { switchMap } from 'rxjs/operators';

import { Comment} from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})




export class DishdetailComponent implements OnInit {

  commentForm: FormGroup;//formmodel
  comment: Comment;//datamodel
  @ViewChild('fform') commentFormDirective;
   
  dish : Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  dishcopy: Dish;
  visibility = 'shown';

  constructor(private fb: FormBuilder,private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();
     }
     formErrors = {
      'comment': '',
      'author': '',
      
      
    };
    validationMessages = {
      'comment': {
        'required':      'comment is required.',
        'minlength':     'comment must be at least 2 characters long.',
      },
      'author': {
        'required':      'Author Name is required.',
        'minlength':     'Author Name must be at least 2 characters long.',
        'maxlength':     'Author Name cannot be more than 25 characters long.'
      },
      
    };


     createForm() {

      this.commentForm = this.fb.group({
        comment: ['', [Validators.required],Validators.minLength(2)],
        rating: 0,
        author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      });
      this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

    }
    onValueChanged(data?: any) {
      if (!this.commentForm) { return; }
      const form = this.commentForm;
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }


    onSubmit() {
      this.commentForm.value.date=new Date().toISOString();
      this.comment = this.commentForm.value;
      this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; //this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
      this.commentForm.reset({
        author: '',
        comment: '',
        rating:5,
      });
      
    }
    


    







  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    
    
    this.route.params.pipe(switchMap((params: Params) =>{this.visibility = 'hidden'; return this.dishservice.getDish((+params['id']).toString()); }))
    .subscribe(dish => { this.dish = dish;this.dishcopy=dish; this.setPrevNext(dish.id);this.visibility = 'shown'; }
    ,errmess => this.errMess = <any>errmess);
  }
  goBack(): void {
    this.location.back();
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }


}
