import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { urls, data } from '../../../global';
import { Router } from '@angular/router';
import { NbLayoutScrollService } from '@nebular/theme';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl, UntypedFormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ngx-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss']
})
export class AddQuestionComponent implements OnInit {

  data: any;
  public categoryData: any;
  colSpan: number = 6;
  public submitted: boolean = false;
  selectedItemFormControl = new UntypedFormControl();
  public categoryId: number;
  public addAnswerCount: number = 2;
  public imgUrl: any;
  public formData = new FormData();
  public options: any = [];
  public optionLength: number = 1;
  public questionImage: any;
  ratio: any;
  img_width: any;
  img_height: any;
  displayURL: any;
  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private layoutScrollService: NbLayoutScrollService,
    private formBuilder: UntypedFormBuilder,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getCategoryList();
    this.data = this.formBuilder.group({
      question_title: ['', [Validators.required, Validators.maxLength(100)]],
      category_id: ['', Validators.required],
      image_url: ['', Validators.required],
      question_type: [1, Validators.required],
      options: this.formBuilder.array([this.createItem(this.optionLength)]),
    });
    if (this.optionLength == 1) {
      this.optionLength++;
      this.companyProponentDataContent.push(this.createItem(this.optionLength));
    }
  }

  get companyProponentDataContent() {
    return this.data.get('options') as UntypedFormArray;
  }

  createItem(i): UntypedFormGroup {
    return this.formBuilder.group({
      option: new UntypedFormControl(i),
      name: new UntypedFormControl(''),
    });
  }

  addItem(i): void {
    this.optionLength++;
    if (this.optionLength < 9) {
      this.companyProponentDataContent.push(this.createItem(this.optionLength));
    } else {
      this.appService.showToast('danger', 'Error', "You can not add answer more than 8");
    }
  }
  getCategoryList() {
    this.appService.get(urls.categoryList)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.categoryData = response.result;
            // this.categoryData = this.categoryData.filter( x => x.category_name == data.wtCategoryName );
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
  }

  changeCategory(event) {
    this.categoryId = event;
  }

  addQuestion() {
    this.submitted = true;
    if (this.data.valid) {
      if (this.data.getRawValue().options[0].name && this.data.getRawValue().options[1].name) {
        this.formData = new FormData();
        this.formData.append('question_title', this.data.getRawValue().question_title);
        this.formData.append('question_type', this.data.getRawValue().question_type);
        this.formData.append('category_id', this.categoryData[0] ? this.categoryData[0].category_id : '');
        this.formData.append('options', JSON.stringify(this.data.getRawValue().options));
        this.formData.append('image', this.questionImage, 'image.png');
        this.formData.append('height', this.img_height);
        this.formData.append('width', this.img_width);
        this.formData.append('ratio', this.ratio);
        this.appService.post(urls.addQuestion, this.formData).subscribe(
          (response: any) => {
            if (response && response.response_code == 200) {
              this.appService.showToast('success', 'Success', response.message);
              this.router.navigate(["/question-management"]);
            }
          },
          (error) => { }
        );
      } else {
        this.appService.showToast('danger', 'Error', "Answer Can't be empty");
      }
    }
  }

  // onFileChanged(event) {
  //   let imageType = event.target.files[0].type.split("/")
  //   if (imageType[0] == "image") {
  //     if (event.target.files[0].size < "5242880" && imageType[0] == "image") {       
  //      this.questionImage = event.target.files[0];   
  //     } else {
  //       this.appService.showToast('danger', 'Error', "You can not upload image more than 5 MB");
  //     }
  //   } else {
  //     this.appService.showToast('danger', 'Error', "You can only upload image");
  //   }
  // }

  onFileChanged(fileInput: any) {
    let imageType = fileInput.target.files[0].type.split("/")
    if (imageType[0] == "image") {
      if (fileInput.target.files[0].size < "5242880" && imageType[0] == "image") {
        this.questionImage = fileInput.target.files[0];
      } else {
        this.appService.showToast('danger', 'Error', "You can not upload image more than 5 MB");
      }
    } else {
      this.appService.showToast('danger', 'Error', "You can only upload image");
    }
    if (fileInput.target.files && fileInput.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          this.img_height = rs.currentTarget['height'];
          this.img_width = rs.currentTarget['width'];
          this.ratio = this.img_height / this.img_width;
        };
      };

      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  // onVideoSelect(event) {
  //   this.displayURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(event.target.files[0]));
  // }

  deleteOption(id) {
    const index = this.companyProponentDataContent.controls.findIndex(x => x.value == id)
    this.companyProponentDataContent.removeAt(index);
  }

}
