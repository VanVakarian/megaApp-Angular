import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserLogin } from '../../shared/interfaces';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  loginForm: FormGroup
  submitted = false

  constructor(
    public auth: AuthService,
    private router: Router,
    public route: ActivatedRoute,
  ) {
    this.loginForm = new FormGroup({
      // email: new FormControl(null, [Validators.required, Validators.email]),
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });

  }

  ngOnInit() {
  }

  clear() {
    this.loginForm.reset();
  }

  submit() {
    if (this.loginForm.invalid) {
      console.log('Form is invalid')
      return
    }

    this.submitted = true

    const user: UserLogin = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }

    this.auth.login(user).subscribe({
      next: () => {
        this.loginForm.reset();
        this.router.navigate(['/kcals']);
        this.submitted = false;
      },
      error: (error) => {
        console.log(error);
        this.submitted = false;
      }
    })
  }
}
