import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenStorageService } from '../../services/token-storage.service'; // Importez le service de stockage

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenStorageService, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
 /* onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: (data) => {
        this.isLoading = false;
        
        console.log('Token reçu:', data.accessToken);
        
        this.tokenService.saveToken(data.accessToken);
        this.tokenService.saveUser(data);
        
        this.router.navigate(['/dashboard/sales']).catch(err => {
          console.error('Échec de la redirection:', err);
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.error.message || 'Échec de la connexion';
        console.error('Erreur de connexion:', err);
      }
    });
  }*/

    onSubmit(): void {
      if (this.loginForm.invalid) return;
    
      this.isLoading = true;
      this.errorMessage = '';
    
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: (data) => {
          console.log('Réponse complète:', data); 
          
          if (!data?.accessToken) {
            throw new Error('Token absent dans la réponse');
          }
    
          this.tokenService.saveToken(data.accessToken);
          this.tokenService.saveUser(data);
    
          this.router.navigateByUrl('/dashboard/sales', { replaceUrl: true })
            .then(success => {
              if (!success) {
                console.error('Échec de la navigation vers /dashboard/sales');
              }
            })
            .catch(err => {
              console.error('Erreur de navigation:', err);
            });
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.message || 'Identifiants incorrects';
          console.error('Détails de l\'erreur:', err); 
        },
        complete: () => {
          this.isLoading = false; 
        }
      });
    }
}