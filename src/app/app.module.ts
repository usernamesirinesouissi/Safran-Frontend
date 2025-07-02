﻿import { NgModule } from '@angular/core';
import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig
} from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
  NgbModule,
  NgbCarouselConfig,
  NgbModalConfig
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AuthGuard } from './auth/auth/guards/auth.guard';
import { AlertComponent } from './_helpers/alert.component';
import { AlertService } from './_services/alert.service';
import { AuthService } from './_services/auth.service';
import { ChartApiService } from './_services/chart.api';
import { TableApiService } from './_services/table-api.service';
import { ApplicationApiService } from './_services/application-api.service';
import { QuillInitializeServiceService } from './_services/quill-initialize-service.service';

// Routing
import { routing } from './app.routing';
// Components
import { AppComponent } from './app.component';
import { SettingsModule } from './_layout/settings/settings.module';
import { ThemeSettingsConfig } from './_layout/settings/theme-settings.config';
import { MenuSettingsConfig } from './_layout/settings/menu-settings.config';
import { HeaderComponent } from './_layout/header/header.component';
import { VerticalComponent as HeaderVerticalComponent } from './_layout/header/vertical/vertical.component';
import { HorizontalComponent as HeaderHorizontalComponent } from './_layout/header/horizontal/horizontal.component';
import { FullLayoutNavbarComponent } from './_layout/header/full-layout-navbar/full-layout-navbar.component';
import { FooterComponent } from './_layout/footer/footer.component';
import { NavigationComponent as AppNavigationComponent } from './_layout/navigation/navigation.component';
import { PublicLayoutComponent } from './_layout/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './_layout/private-layout/private-layout.component';
import { RegisterComponent } from '../app/auth/auth/components/register/register.component';
//import { SocialSigninComponent } from '../app/auth/auth/components/';
import { LoginComponent } from './../app/auth/auth/components/login/login.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { NavbarService } from './_services/navbar.service';
import { VerticalnavComponent } from './_layout/navigation/verticalnav/verticalnav.component';
import { HorizontalnavComponent } from './_layout/navigation/horizontalnav/horizontalnav.component';
// perfect scroll bar
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// spinner
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { RouterModule } from '@angular/router';
//import { CustomizerComponent } from './_layout/customizer/customizer.component';
import { ChartsModule } from 'ng2-charts';
import { PartialsModule } from './content/partials/partials.module';
import { BreadcrumbModule } from './_layout/breadcrumb/breadcrumb.module';
import { HorizontalCustomizerComponent } from './_layout/customizer/horizontal-customizer/horizontal-customizer.component';
import { BlockTemplateComponent } from './_layout/blockui/block-template.component';
import { BlockUIModule } from 'ng-block-ui';
import { MatchHeightModule } from './content/partials/general/match-height/match-height.module';
import { FullLayoutComponent } from './_layout/full-layout/full-layout.component';
import { ToastrModule } from 'ngx-toastr';
import { UserService } from './_api/user/user.service';
//import { PrivacyPolicyComponent } from './login/privacy-policy/privacy-policy.component';
//import { TermsConditionComponent } from './login/terms-condition/terms-condition.component';
import { TestComponent } from './content/applications/test/test.component';;
import { TestcompComponent } from './content/testcomp/testcomp.component'
;
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ValidationModalComponent } from './_components/validation-modal/validation-modal.component'
;
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WorkflowDesignerComponent } from './_components/workflow-designer/workflow-designer.component';;
import { WorkflowInstanceManagementComponent } from './_components/workflow-instance-management/workflow-instance-management.component'
;
import { WorkflowManagementComponent } from './_components/workflow-management/workflow-management.component';
import { AuthInterceptor } from './auth/shared/interceptors/auth.interceptor';
import { JwtInterceptor } from './cors/interceptors/jwt.interceptor';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
    imports: [

        MatMenuModule,
        BrowserModule,
        PartialsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ChartsModule,
        BrowserAnimationsModule,
        MatchHeightModule,
        BreadcrumbModule,
        NgbModule,
        FormsModule,
        DragDropModule,
        NzButtonModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule, // imports firebase/firestore, only needed for database features
        AngularFireAuthModule, // imports firebase/auth, only needed for auth features
         routing,
        // Settings modules
        SettingsModule.forRoot(ThemeSettingsConfig, MenuSettingsConfig),
        PerfectScrollbarModule,
        ToastrModule.forRoot(),
        NgxSpinnerModule,
        DeviceDetectorModule.forRoot(),
        LoadingBarRouterModule,
        BlockUIModule.forRoot({
          template: BlockTemplateComponent
        })
    ],
    declarations: [
        AppComponent,
        PublicLayoutComponent,
        PrivateLayoutComponent,
        HeaderComponent,
        FullLayoutNavbarComponent,
        HeaderHorizontalComponent,
        HeaderVerticalComponent,
        FooterComponent,
        AppNavigationComponent,
        AlertComponent,
        RegisterComponent,
        //SocialSigninComponent,
        LoginComponent,
        ChangelogComponent,
        VerticalnavComponent ,
        HorizontalnavComponent ,
        //CustomizerComponent,
        HorizontalCustomizerComponent,
        BlockTemplateComponent,
        FullLayoutComponent,
        //PrivacyPolicyComponent,
        //TermsConditionComponent,
        TestComponent
,
        TestcompComponent ,
        ValidationModalComponent ,
        WorkflowDesignerComponent ,
        WorkflowInstanceManagementComponent ,
       WorkflowManagementComponent ,

                    ],
    providers: [
        AuthGuard,
        ChartApiService,
        AlertService,
        NavbarService,
        TableApiService,
        ApplicationApiService,
        QuillInitializeServiceService,
        AuthService,
        UserService,
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: HammerGestureConfig
        },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { 
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true // Permet d'avoir plusieurs intercepteurs
        },
        NgbCarouselConfig,
        NgbModalConfig,
    ],
    bootstrap: [AppComponent],
    exports: [RouterModule]
})
export class AppModule {}
