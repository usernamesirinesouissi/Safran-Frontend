import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { ERole } from '../../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as ERole[];
    const user = this.tokenService.getUser();

    if (!user?.roles || !requiredRoles.some(role => user.roles.includes(role))) {
      this.router.navigate(['/forbidden']);
      return false;
    }
    return true;
  }
}