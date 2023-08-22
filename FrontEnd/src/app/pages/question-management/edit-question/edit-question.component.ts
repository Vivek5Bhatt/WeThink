import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { urls, data } from '../../../global';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NbLayoutScrollService } from '@nebular/theme';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl, UntypedFormArray } from '@angular/forms';
@Component({
  selector: 'ngx-edit-question',
  templateUrl: './edit-question.component.html',
  styleUrls: ['./edit-question.component.scss']
})
export class EditQuestionComponent implements OnInit {

  public data: any;
  public categoryData: any;
  public questionData: any;
  public submitted: boolean = false;
  public selectedItemFormControl = new UntypedFormControl();
  public categoryId: number;
  public addAnswerCount: number = 2;
  public imgUrl: any;
  public formData = new FormData();
  public options: any = [];
  public questionId: string = '';
  public optionLength: number = 1
  public finalRequest: any;
  public questionImage: any;
  ratio: any;
  img_width: any;
  img_height: any;
  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private layoutScrollService: NbLayoutScrollService,
    private formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.questionId = params['question_id'];
      this.getQuestionDetail(this.questionId);
    });
  }

  ngOnInit() {
    this.getCategoryList();
    this.data = this.formBuilder.group({
      question_title: ['', [Validators.required, Validators.maxLength(100)]],
      category_id: ['', Validators.required],
      image_url: [''],
      options: this.formBuilder.array([this.createItem(this.optionLength)]),
    });
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

  getQuestionDetail(questionId) {
    this.appService.get(urls.questionDetail + '?question_id=' + questionId)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.questionData = response.result;
            this.data.patchValue({
              question_title: this.questionData.question_data.question_title,
              category_id: this.questionData.question_data.category_id
            });
            this.imgUrl = this.questionData.question_data.image_url
            let count = 0;
            this.questionData.options.forEach(obj => {
              if (count > 0) {
                this.addItem(count);
              }
              this.companyProponentDataContent.at(count).patchValue({
                option: obj.option,
                name: obj.name
              });
              count++;
            });
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
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
    this.optionLength++;
    if (this.optionLength < 9) {
      this.companyProponentDataContent.push(this.createItem(this.optionLength));
    } else {
      this.appService.showToast('danger', 'Error', "You can not add answer more than 8");
    }
  }
  updateQuestion() {
    this.submitted = true;
    if (this.data.valid) {
      this.formData = new FormData();
      this.formData.append('question_title', this.data.getRawValue().question_title);
      this.formData.append('category_id', this.categoryData[0] ? this.categoryData[0].category_id : '');
      this.formData.append('options', JSON.stringify(this.data.getRawValue().options));
      if (this.questionImage) {
        this.formData.append('image', this.questionImage, 'image.png');
      }
      this.formData.append('question_id', this.questionId);
      this.formData.append('question_type ', '1');
      this.formData.append('image_url', this.imgUrl);
      this.formData.append('height', this.img_height);
      this.formData.append('width', this.img_width);
      this.formData.append('ratio', this.ratio);
      this.appService.put(urls.updateQuestion, this.formData).subscribe(
        (response: any) => {
          if (response && response.response_code == 200) {
            this.appService.showToast('success', 'Success', response.message);
            this.router.navigate(["/question-management"]);
          }
        },
        (error) => { }
      );
    }
  }

  onFileChanged(fileInput) {
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

  deleteOption(id) {
    const index = this.companyProponentDataContent.controls.findIndex(x => x.value == id)
    this.companyProponentDataContent.removeAt(index);
  }
}
