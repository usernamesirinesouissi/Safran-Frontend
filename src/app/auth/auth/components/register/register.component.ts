import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSuccessful = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ROLE_USER', [Validators.required]] // Valeur par défaut ROLE_USER
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
  
    this.isLoading = true;
    this.errorMessage = '';
  
    const { username, email, password, role } = this.registerForm.value;
    
    // Envoyer le rôle comme tableau (comme dans Postman)
    const roles = [role]; // Convertir en tableau
    
    this.authService.register(username, email, password, roles).subscribe({
      next: () => {
        this.isSuccessful = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur:', err);
        
        if (err.status === 0) {
          this.errorMessage = 'Erreur de connexion au serveur';
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Erreur lors de l\'inscription';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}