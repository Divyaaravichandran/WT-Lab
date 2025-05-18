import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']  // ✅ use style**Urls** (plural)
})
export class AppComponent implements OnInit {
  title = 'form-validation';

  personalForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.personalForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['',[Validators.required,Validators.minLength(8),Validators.maxLength(32),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')]] 
   });
  }

  onSubmit() {
    if (this.personalForm.valid) {
      console.log('Form Data:', this.personalForm.value);
      alert('Form submitted successfully!'); 
      this.personalForm.reset();
    } else {
      console.log('Form is invalid');
    }
  }
}
