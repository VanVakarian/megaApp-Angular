import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserLogin } from '../../shared/interfaces';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    public auth: AuthService,
    private router: Router // private route: ActivatedRoute
  ) {
    this.registerForm = new FormGroup({
      // username: new FormControl(null, [Validators.required, Validators.username]),
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    });
  }

  ngOnInit() {}

  submit() {
    if (this.registerForm.invalid) {
      // console.log('Form is invalid')
      return;
    }

    this.submitted = true;

    const user: UserLogin = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
    };

    this.auth.register(user).subscribe({
      next: () => {
        this.registerForm.reset();
        // this.router.navigate(['/login'], { queryParams: { 'registered-successfully': true }});  // TODO: переделать
        this.submitted = false;
      },
      error: (error) => {
        console.log(error);
        this.submitted = false;
      },
    });
  }
}
