import { bootstrapApplication } from '@angular/platform-browser';
import { UserDashboardComponent } from './app/components/user-dashboard/user-dashboard';
import { appConfig } from './app/app.config';

bootstrapApplication(UserDashboardComponent, appConfig)
  .catch((err) => console.error(err));
